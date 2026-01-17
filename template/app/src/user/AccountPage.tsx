import { Info, KeyRound } from "lucide-react";
import { useState } from "react";
import {
  createApiKey,
  getApiKeys,
  getCustomerPortalUrl,
  revokeApiKey,
  useQuery,
} from "wasp/client/operations";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import type { User } from "wasp/entities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../client/components/ui/alert-dialog";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../client/components/ui/card";
import { Input } from "../client/components/ui/input";
import { Separator } from "../client/components/ui/separator";
import { Skeleton } from "../client/components/ui/skeleton";
import {
  PaymentPlanId,
  SubscriptionStatus,
  parsePaymentPlanId,
  prettyPaymentPlanName,
} from "../payment/plans";

export default function AccountPage({ user }: { user: User }) {
  return (
    <div className="mt-10 px-6">
      <Card className="mb-4 lg:m-8">
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold leading-6">
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {!!user.email && (
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                  <div className="text-muted-foreground text-sm font-medium">
                    Email address
                  </div>
                  <div className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                    {user.email}
                  </div>
                </div>
              </div>
            )}
            {!!user.username && (
              <>
                <Separator />
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                    <div className="text-muted-foreground text-sm font-medium">
                      Username
                    </div>
                    <div className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                      {user.username}
                    </div>
                  </div>
                </div>
              </>
            )}
            <Separator />
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                <div className="text-muted-foreground text-sm font-medium">
                  Your Plan
                </div>
                <UserCurrentSubscriptionPlan
                  subscriptionPlan={user.subscriptionPlan}
                  subscriptionStatus={user.subscriptionStatus}
                  datePaid={user.datePaid}
                />
              </div>
            </div>
            <Separator />
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                <div className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
                  Credits
                  <span title="Credits are used for each security scan. Free users get 50 credits daily. Pro users get 500 credits daily. Credits reset at midnight UTC.">
                    <Info className="h-3.5 w-3.5 cursor-help" />
                  </span>
                </div>
                <div className="text-foreground mt-1 text-sm sm:col-span-1 sm:mt-0">
                  {user.credits} credits
                </div>
                <div className="ml-auto mt-4 sm:mt-0">
                  <BuyMoreButton subscriptionStatus={user.subscriptionStatus} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ApiKeysSection />
    </div>
  );
}

function ApiKeysSection() {
  const { data: apiKeys, isLoading, refetch } = useQuery(getApiKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<{ id: string; name: string } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleCreateKey = async () => {
    const trimmedName = newKeyName.trim();

    if (!trimmedName) {
      setError("Please enter a name for the API key");
      return;
    }

    if (trimmedName.length > 50) {
      setError("API key name must be 50 characters or less");
      return;
    }

    if (!/^[\w\s-]+$/.test(trimmedName)) {
      setError("API key name can only contain letters, numbers, spaces, hyphens, and underscores");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const result = await createApiKey({ name: newKeyName.trim() });
      setNewlyCreatedKey(result.key);
      setNewKeyName("");
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!keyToRevoke) return;

    setIsRevoking(true);
    try {
      await revokeApiKey({ id: keyToRevoke.id });
      refetch();
      setKeyToRevoke(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke API key");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopyKey = async () => {
    if (newlyCreatedKey) {
      await navigator.clipboard.writeText(newlyCreatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDismissNewKey = () => {
    setNewlyCreatedKey(null);
    setCopied(false);
  };

  return (
    <Card className="mb-4 lg:m-8">
      <CardHeader>
        <CardTitle className="text-foreground text-base font-semibold leading-6">
          API Keys
        </CardTitle>
        <CardDescription>
          Create and manage API keys to access the Depaxiom API programmatically.
          Use keys in GitHub Actions, CI/CD pipelines, or direct API calls.{" "}
          <a href="/docs/api" className="text-primary hover:underline">
            View API Documentation →
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* New key creation form */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="API key name (e.g., CI/CD Pipeline)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
              className="flex-1"
              disabled={isCreating}
              maxLength={50}
            />
            <Button onClick={handleCreateKey} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Key"}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Newly created key display */}
        {newlyCreatedKey && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-lg border border-yellow-500 bg-yellow-500/10 p-4"
          >
            <p className="mb-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Save this API key now. You won't be able to see it again!
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted p-2 text-sm font-mono break-all">
                {newlyCreatedKey}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyKey}>
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismissNewKey}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* API keys list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : apiKeys && apiKeys.length > 0 ? (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  key.isRevoked ? "opacity-50" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{key.name}</span>
                    {key.isRevoked && (
                      <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs text-red-500">
                        Revoked
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {key.keyPrefix}...
                    </code>
                    <span>
                      Created {new Date(key.createdAt).toLocaleString()}
                    </span>
                    {key.lastUsedAt && (
                      <span>
                        Last used {new Date(key.lastUsedAt).toLocaleString()}
                      </span>
                    )}
                    {key.expiresAt && (
                      <span>
                        Expires {new Date(key.expiresAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {!key.isRevoked && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setKeyToRevoke({ id: key.id, name: key.name })}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <KeyRound className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">
              No API keys yet. Create one to get started.
            </p>
          </div>
        )}

        {/* Revoke confirmation dialog */}
        <AlertDialog open={!!keyToRevoke} onOpenChange={(open) => !open && setKeyToRevoke(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to revoke the API key "{keyToRevoke?.name}"?
                This action cannot be undone and any applications using this key will
                immediately lose access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevokeKey}
                disabled={isRevoking}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isRevoking ? "Revoking..." : "Revoke Key"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

function UserCurrentSubscriptionPlan({
  subscriptionPlan,
  subscriptionStatus,
  datePaid,
}: Pick<User, "subscriptionPlan" | "subscriptionStatus" | "datePaid">) {
  let subscriptionPlanMessage = "Free Plan";
  if (
    subscriptionPlan !== null &&
    subscriptionStatus !== null &&
    datePaid !== null
  ) {
    subscriptionPlanMessage = formatSubscriptionStatusMessage(
      parsePaymentPlanId(subscriptionPlan),
      datePaid,
      subscriptionStatus as SubscriptionStatus,
    );
  }

  return (
    <>
      <div className="text-foreground mt-1 text-sm sm:col-span-1 sm:mt-0">
        {subscriptionPlanMessage}
      </div>
      <div className="ml-auto mt-4 sm:mt-0">
        <CustomerPortalButton />
      </div>
    </>
  );
}

function formatSubscriptionStatusMessage(
  subscriptionPlan: PaymentPlanId,
  datePaid: Date,
  subscriptionStatus: SubscriptionStatus,
): string {
  const paymentPlanName = prettyPaymentPlanName(subscriptionPlan);
  const statusToMessage: Record<SubscriptionStatus, string> = {
    active: `${paymentPlanName}`,
    past_due: `Payment for your ${paymentPlanName} plan is past due! Please update your subscription payment information.`,
    cancel_at_period_end: `Your ${paymentPlanName} plan subscription has been canceled, but remains active until the end of the current billing period: ${prettyPrintEndOfBillingPeriod(
      datePaid,
    )}`,
    deleted: `Your previous subscription has been canceled and is no longer active.`,
  };

  if (!statusToMessage[subscriptionStatus]) {
    throw new Error(`Invalid subscription status: ${subscriptionStatus}`);
  }

  return statusToMessage[subscriptionStatus];
}

function prettyPrintEndOfBillingPeriod(date: Date) {
  const oneMonthFromNow = new Date(date);
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  return oneMonthFromNow.toLocaleDateString();
}

function CustomerPortalButton() {
  const { data: customerPortalUrl, isLoading: isCustomerPortalUrlLoading } =
    useQuery(getCustomerPortalUrl);

  if (!customerPortalUrl) {
    return null;
  }

  return (
    <a href={customerPortalUrl} target="_blank" rel="noopener noreferrer">
      <Button disabled={isCustomerPortalUrlLoading} variant="link">
        Manage Payment Details
      </Button>
    </a>
  );
}

function BuyMoreButton({
  subscriptionStatus,
}: Pick<User, "subscriptionStatus">) {
  if (
    subscriptionStatus === SubscriptionStatus.Active ||
    subscriptionStatus === SubscriptionStatus.CancelAtPeriodEnd
  ) {
    return null;
  }

  return (
    <WaspRouterLink
      to={routes.PricingPageRoute.to}
      className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
    >
      <Button variant="link">Buy More Credits</Button>
    </WaspRouterLink>
  );
}
