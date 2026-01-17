import { createHash, randomBytes } from "crypto";
import type { ApiKey } from "wasp/entities";
import { HttpError } from "wasp/server";
import type {
  CreateApiKey,
  GetApiKeys,
  RevokeApiKey,
} from "wasp/server/operations";
import * as z from "zod";
import { ensureArgsSchemaOrThrowHttpError } from "../server/validation";

const API_KEY_PREFIX = "dpx";

/**
 * Generates a cryptographically secure API key.
 * Format: dpx_<32 random bytes as hex> = dpx_ + 64 chars = 68 chars total
 */
function generateApiKey(): string {
  const randomPart = randomBytes(32).toString("hex");
  return `${API_KEY_PREFIX}_${randomPart}`;
}

/**
 * Hashes an API key using SHA-256 for secure storage.
 */
function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Extracts the prefix (first 12 chars) from an API key for identification.
 */
function getKeyPrefix(key: string): string {
  return key.substring(0, 12);
}

// ============================================================================
// Query: Get all API keys for the current user
// ============================================================================

type GetApiKeysOutput = Pick<
  ApiKey,
  "id" | "name" | "keyPrefix" | "createdAt" | "lastUsedAt" | "expiresAt" | "isRevoked"
>[];

export const getApiKeys: GetApiKeys<void, GetApiKeysOutput> = async (
  _args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to view API keys");
  }

  const apiKeys = await context.entities.ApiKey.findMany({
    where: {
      userId: context.user.id,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
      isRevoked: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return apiKeys;
};

// ============================================================================
// Action: Create a new API key
// ============================================================================

const createApiKeyInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

type CreateApiKeyInput = z.infer<typeof createApiKeyInputSchema>;

type CreateApiKeyOutput = {
  id: string;
  name: string;
  keyPrefix: string;
  // The full key is ONLY returned on creation - never stored or returned again
  key: string;
  createdAt: Date;
  expiresAt: Date | null;
};

export const createApiKey: CreateApiKey<
  CreateApiKeyInput,
  CreateApiKeyOutput
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to create an API key");
  }

  const { name, expiresInDays } = ensureArgsSchemaOrThrowHttpError(
    createApiKeyInputSchema,
    rawArgs
  );

  // Free and Pro users limited to 1 active API key
  const existingKeyCount = await context.entities.ApiKey.count({
    where: {
      userId: context.user.id,
      isRevoked: false,
    },
  });

  if (existingKeyCount >= 1) {
    throw new HttpError(
      400,
      "You already have an active API key. Please revoke it before creating a new one."
    );
  }

  // Generate the actual API key
  const key = generateApiKey();
  const keyHash = hashApiKey(key);
  const keyPrefix = getKeyPrefix(key);

  // Calculate expiration date if specified
  let expiresAt: Date | null = null;
  if (expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // Store the key (only the hash, never the actual key)
  const apiKey = await context.entities.ApiKey.create({
    data: {
      userId: context.user.id,
      name,
      keyHash,
      keyPrefix,
      expiresAt,
    },
  });

  // Return the full key ONLY on creation
  return {
    id: apiKey.id,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    key, // This is the only time the full key is ever returned
    createdAt: apiKey.createdAt,
    expiresAt: apiKey.expiresAt,
  };
};

// ============================================================================
// Action: Revoke an API key
// ============================================================================

const revokeApiKeyInputSchema = z.object({
  id: z.string().uuid("Invalid API key ID"),
});

type RevokeApiKeyInput = z.infer<typeof revokeApiKeyInputSchema>;

export const revokeApiKey: RevokeApiKey<RevokeApiKeyInput, ApiKey> = async (
  rawArgs,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in to revoke an API key");
  }

  const { id } = ensureArgsSchemaOrThrowHttpError(
    revokeApiKeyInputSchema,
    rawArgs
  );

  // Find the key and verify ownership
  const existingKey = await context.entities.ApiKey.findUnique({
    where: { id },
  });

  if (!existingKey) {
    throw new HttpError(404, "API key not found");
  }

  if (existingKey.userId !== context.user.id) {
    throw new HttpError(403, "You can only revoke your own API keys");
  }

  if (existingKey.isRevoked) {
    throw new HttpError(400, "API key is already revoked");
  }

  // Revoke the key
  const revokedKey = await context.entities.ApiKey.update({
    where: { id },
    data: { isRevoked: true },
  });

  return revokedKey;
};
