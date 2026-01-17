import { createHash } from "crypto";
import type { ValidateApiKey } from "wasp/server/api";

/**
 * Hashes an API key using SHA-256 for lookup.
 */
function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * API endpoint to validate an API key.
 *
 * Usage: GET /api/validate-key
 * Headers: Authorization: Bearer dpx_...
 *
 * Returns user info if valid, 401 if invalid.
 */
export const validateApiKey: ValidateApiKey = async (req, res, context) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid Authorization header. Expected: Bearer <api_key>",
    });
  }

  const apiKey = authHeader.slice(7); // Remove "Bearer " prefix

  if (!apiKey.startsWith("dpx_")) {
    return res.status(401).json({
      error: "Invalid API key format. Keys should start with 'dpx_'",
    });
  }

  const keyHash = hashApiKey(apiKey);

  // Look up the API key by its hash
  const foundKey = await context.entities.ApiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  });

  if (!foundKey) {
    return res.status(401).json({
      error: "Invalid API key",
    });
  }

  if (foundKey.isRevoked) {
    return res.status(401).json({
      error: "API key has been revoked",
    });
  }

  if (foundKey.expiresAt && foundKey.expiresAt < new Date()) {
    return res.status(401).json({
      error: "API key has expired",
    });
  }

  // Update last used timestamp
  await context.entities.ApiKey.update({
    where: { id: foundKey.id },
    data: { lastUsedAt: new Date() },
  });

  // Return success with user info
  return res.status(200).json({
    valid: true,
    keyName: foundKey.name,
    keyPrefix: foundKey.keyPrefix,
    user: {
      id: foundKey.user.id,
      email: foundKey.user.email,
      username: foundKey.user.username,
    },
  });
};
