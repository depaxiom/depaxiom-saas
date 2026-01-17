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
                <div className="text-muted-foreground text-sm font-medium">
                  Credits
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

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError("Please enter a name for the API key");
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

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }

    try {
      await revokeApiKey({ id });
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke API key");
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
          <div className="mb-6 rounded-lg border border-yellow-500 bg-yellow-500/10 p-4">
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
          <p className="text-muted-foreground text-sm">Loading API keys...</p>
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
                    onClick={() => handleRevokeKey(key.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No API keys yet. Create one to get started.
          </p>
        )}
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
