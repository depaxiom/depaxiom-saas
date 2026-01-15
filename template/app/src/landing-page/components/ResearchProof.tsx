import { AlertTriangle, FileCode, Shield, Skull } from "lucide-react";
import { Card, CardContent } from "../../client/components/ui/card";
import SectionTitle from "./SectionTitle";

interface ProofPoint {
  icon: React.ReactNode;
  stat: string;
  label: string;
  detail: string;
}

const proofPoints: ProofPoint[] = [
  {
    icon: <AlertTriangle className="h-8 w-8" />,
    stat: "20+",
    label: "CVE Bypass Chains",
    detail: "Discovered in lodash, EJS, Angular, and other major packages",
  },
  {
    icon: <Skull className="h-8 w-8" />,
    stat: "25+",
    label: "Skeleton Key Exploits",
    detail: "Universal gadgets that work against any pollution source",
  },
  {
    icon: <FileCode className="h-8 w-8" />,
    stat: "500M+",
    label: "Weekly Downloads Scanned",
    detail: "Coverage across the npm ecosystem's most-used packages",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    stat: "<5%",
    label: "False Positive Rate",
    detail: "V8-instrumented execution means we only report real issues",
  },
];

export default function ResearchProof() {
  return (
    <div className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
      <SectionTitle
        title="Research Track Record"
        description="Verifiable results from our security research."
      />

      <div className="mt-10 grid grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-0 lg:grid-cols-4">
        {proofPoints.map((point, idx) => (
          <Card key={idx} className="text-center">
            <CardContent className="p-6">
              <div className="text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {point.icon}
              </div>
              <div className="text-foreground text-3xl font-bold">{point.stat}</div>
              <div className="text-foreground mt-1 font-medium">{point.label}</div>
              <div className="text-muted-foreground mt-2 text-sm">{point.detail}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Affected packages - verifiable */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground text-sm">
          Vulnerabilities discovered in packages you probably use:
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          {["lodash", "ejs", "pug", "handlebars", "execa", "cross-spawn", "got", "axios"].map((pkg) => (
            <span
              key={pkg}
              className="bg-muted text-muted-foreground rounded-full px-4 py-1.5 font-mono text-sm"
            >
              {pkg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
