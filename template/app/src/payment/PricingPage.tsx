import { CheckCircle, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "wasp/client/auth";
import {
  generateCheckoutSession,
  getCustomerPortalUrl,
  useQuery,
} from "wasp/client/operations";
import { Alert, AlertDescription } from "../client/components/ui/alert";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "../client/components/ui/card";
import { cn } from "../client/utils";
import {
  PaymentPlanId,
  paymentPlans,
  prettyPaymentPlanName,
  SubscriptionStatus,
} from "./plans";

const bestDealPaymentPlanId: PaymentPlanId = PaymentPlanId.Pro;

interface PaymentPlanCard {
  name: string;
  monthlyPrice: number;
  annualPrice: number; // 2 months free
  description: string;
  features: string[];
  cta: string;
  badge?: string;
}

export const paymentPlanCards: Record<PaymentPlanId, PaymentPlanCard> = {
  [PaymentPlanId.Free]: {
    name: prettyPaymentPlanName(PaymentPlanId.Free),
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Essential security scanning for individual developers and open source projects",
    features: [
      "50 scans per day",
      "Basic dependency scanning",
      "Compositional risk alerts",
      "Community hash verification",
      "GitHub Action integration",
    ],
    cta: "Get Started Free",
  },
  [PaymentPlanId.Pro]: {
    name: prettyPaymentPlanName(PaymentPlanId.Pro),
    monthlyPrice: 29,
    annualPrice: 290, // 2 months free ($29 * 10)
    description: "Advanced detection for teams shipping secure code",
    features: [
      "500 scans per day",
      "Vulnerability class disclosure (RCE, SSRF, etc.)",
      "Sanitized POC snippets",
      "Private package scanning",
      "Zombie package warnings",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    badge: "Most Popular",
  },
  [PaymentPlanId.Business]: {
    name: prettyPaymentPlanName(PaymentPlanId.Business),
    monthlyPrice: 199,
    annualPrice: 1990, // 2 months free ($199 * 10)
    description: "Full exploit intelligence for security teams",
    features: [
      "Unlimited scans",
      "Full working POC exploits",
      "Virtual patching artifacts",
      "Generated WAF rules",
      "SBOM/SARIF/VEX export",
      "Dedicated support",
      "NDA required",
    ],
    cta: "Contact Sales",
    badge: "Enterprise",
  },
};

const PricingPage = () => {
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState<boolean>(false);

  const { data: user } = useAuth();
  const isUserSubscribed =
    !!user &&
    !!user.subscriptionStatus &&
    user.subscriptionStatus !== SubscriptionStatus.Deleted;

  const {
    data: customerPortalUrl,
    isLoading: isCustomerPortalUrlLoading,
    error: customerPortalUrlError,
  } = useQuery(getCustomerPortalUrl, { enabled: isUserSubscribed });

  const navigate = useNavigate();

  async function handleBuyNowClick(paymentPlanId: PaymentPlanId) {
    if (!user) {
      navigate("/login");
      return;
    }

    // Free tier - just redirect to dashboard
    if (paymentPlanId === PaymentPlanId.Free) {
      navigate("/demo-app");
      return;
    }

    // Business tier - contact sales
    if (paymentPlanId === PaymentPlanId.Business) {
      window.open("mailto:sales@depaxiom.com?subject=Business%20Tier%20Inquiry", "_blank");
      return;
    }

    try {
      setIsPaymentLoading(true);

      const checkoutResults = await generateCheckoutSession(paymentPlanId);

      if (checkoutResults?.sessionUrl) {
        window.open(checkoutResults.sessionUrl, "_self");
      } else {
        throw new Error("Error generating checkout session URL");
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Error processing payment. Please try again later.");
      }
      setIsPaymentLoading(false);
    }
  }

  const handleCustomerPortalClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (customerPortalUrlError) {
      setErrorMessage("Error fetching Customer Portal URL");
      return;
    }

    if (!customerPortalUrl) {
      setErrorMessage(`Customer Portal does not exist for user ${user.id}`);
      return;
    }

    window.open(customerPortalUrl, "_blank");
  };

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div id="pricing" className="mx-auto max-w-4xl text-center">
          <h2 className="text-foreground mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Security intelligence at <span className="text-primary">every scale</span>
          </h2>
        </div>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-lg leading-8">
          From individual developers to enterprise security teams. Start free and scale as your security needs grow.
        </p>

        {/* Billing toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
            Monthly
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isAnnual ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                isAnnual ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
          <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>
            Annual
          </span>
          {isAnnual && (
            <span className="bg-success/10 text-success rounded-full px-2.5 py-0.5 text-xs font-medium">
              2 months free
            </span>
          )}
        </div>
        {errorMessage && (
          <Alert variant="destructive" className="mt-8">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {Object.values(PaymentPlanId).map((planId) => (
            <Card
              key={planId}
              className={cn(
                "relative flex grow flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg",
                {
                  "ring-primary bg-transparent! ring-2":
                    planId === bestDealPaymentPlanId,
                  "ring-border ring-1 lg:my-8":
                    planId !== bestDealPaymentPlanId,
                },
              )}
            >
              {planId === bestDealPaymentPlanId && (
                <div
                  className="absolute right-0 top-0 -z-10 h-full w-full transform-gpu blur-3xl"
                  aria-hidden="true"
                >
                  <div
                    className="from-primary/40 via-primary/20 to-primary/10 absolute h-full w-full bg-linear-to-br opacity-30"
                    style={{
                      clipPath: "circle(670% at 50% 50%)",
                    }}
                  />
                </div>
              )}
              {paymentPlanCards[planId].badge && (
                <div className="absolute right-4 top-4">
                  <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold">
                    {paymentPlanCards[planId].badge}
                  </span>
                </div>
              )}
              <CardContent className="h-full justify-between p-8 xl:p-10">
                <div className="flex items-center justify-between gap-x-4">
                  <CardTitle
                    id={planId}
                    className="text-foreground text-lg font-semibold leading-8"
                  >
                    {paymentPlanCards[planId].name}
                  </CardTitle>
                </div>
                <p className="text-muted-foreground mt-4 text-sm leading-6">
                  {paymentPlanCards[planId].description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-foreground text-4xl font-bold tracking-tight">
                    ${isAnnual ? paymentPlanCards[planId].annualPrice : paymentPlanCards[planId].monthlyPrice}
                  </span>
                  {paymentPlanCards[planId].monthlyPrice > 0 && (
                    <span className="text-muted-foreground text-sm font-semibold leading-6">
                      /{isAnnual ? "year" : "month"}
                    </span>
                  )}
                </p>
                <ul
                  role="list"
                  className="text-muted-foreground mt-8 space-y-3 text-sm leading-6"
                >
                  {paymentPlanCards[planId].features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      {feature.includes("NDA") ? (
                        <Lock
                          className="text-primary h-5 w-5 flex-none"
                          aria-hidden="true"
                        />
                      ) : (
                        <CheckCircle
                          className="text-primary h-5 w-5 flex-none"
                          aria-hidden="true"
                        />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex-col">
                {isUserSubscribed ? (
                  <Button
                    onClick={handleCustomerPortalClick}
                    disabled={isCustomerPortalUrlLoading}
                    aria-describedby="manage-subscription"
                    variant={
                      planId === bestDealPaymentPlanId ? "default" : "outline"
                    }
                    className="w-full"
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => handleBuyNowClick(planId)}
                      aria-describedby={planId}
                      variant={
                        planId === bestDealPaymentPlanId ? "default" : "outline"
                      }
                      className="w-full"
                      disabled={isPaymentLoading}
                    >
                      {!!user ? paymentPlanCards[planId].cta : "Log in to get started"}
                    </Button>
                    {planId === PaymentPlanId.Pro && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        14-day free trial. No credit card required.
                      </p>
                    )}
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Comparison note */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            All plans include GitHub Action integration, API access, and basic support.
            <br />
            Business tier requires signing an NDA for access to full exploit details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
