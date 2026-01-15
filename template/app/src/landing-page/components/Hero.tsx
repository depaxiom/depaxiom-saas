import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "../../client/components/ui/button";

export default function Hero() {
  return (
    <div className="relative w-full pt-14">
      <TopGradient />
      <BottomGradient />
      <div className="md:p-24">
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <div className="lg:mb-18 mx-auto max-w-3xl text-center">
            <h1 className="text-foreground text-5xl font-bold sm:text-6xl">
              Find vulnerabilities that{" "}
              <span className="text-gradient-primary">npm audit misses</span>
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8">
              Depaxiom detects exploitable chains across package boundaries.
              When individually safe packages combine to create RCE, SSRF, or path traversal—we find it.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="outline" asChild>
                <WaspRouterLink to={routes.PricingPageRoute.to}>
                  View Pricing
                </WaspRouterLink>
              </Button>
              <Button size="lg" variant="default" asChild>
                <WaspRouterLink to={routes.SignupRoute.to}>
                  Start Scanning <span aria-hidden="true">→</span>
                </WaspRouterLink>
              </Button>
            </div>
          </div>

          {/* Stats/Social Proof */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard number="100+" label="Vulnerabilities Found" />
            <StatCard number="20+" label="CVE Bypasses" />
            <StatCard number="<5%" label="False Positive Rate" />
            <StatCard number="20+" label="Universal Exploit Chains" />
          </div>

          {/* Code Example */}
          <div className="mt-14 flow-root sm:mt-14">
            <div className="bg-muted/50 mx-auto max-w-3xl rounded-xl border p-6 font-mono text-sm">
              <div className="text-muted-foreground mb-2"># Add to your GitHub workflow</div>
              <div className="text-foreground">
                <span className="text-primary">-</span> uses: depaxiom/scan-action@v1
              </div>
              <div className="text-foreground pl-4">
                with:
              </div>
              <div className="text-foreground pl-6">
                api-key: <span className="text-muted-foreground">$&#123;&#123; secrets.DEPAXIOM_API_KEY &#125;&#125;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-primary text-3xl font-bold">{number}</div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </div>
  );
}

function TopGradient() {
  return (
    <div
      className="absolute right-0 top-0 -z-10 w-full transform-gpu overflow-hidden blur-3xl sm:top-0"
      aria-hidden="true"
    >
      <div
        className="aspect-1020/880 w-280 flex-none bg-linear-to-tr from-amber-400 to-purple-300 opacity-10 sm:right-1/4 sm:translate-x-1/2 dark:hidden"
        style={{
          clipPath:
            "polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)",
        }}
      />
    </div>
  );
}

function BottomGradient() {
  return (
    <div
      className="absolute inset-x-0 top-[calc(100%-40rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-65rem)]"
      aria-hidden="true"
    >
      <div
        className="relative aspect-1020/880 w-360 bg-linear-to-br from-amber-400 to-purple-300 opacity-10 sm:-left-3/4 sm:translate-x-1/4 dark:hidden"
        style={{
          clipPath: "ellipse(80% 30% at 80% 50%)",
        }}
      />
    </div>
  );
}
