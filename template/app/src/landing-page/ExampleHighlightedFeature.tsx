import HighlightedFeature from "./components/HighlightedFeature";

export default function KillerDemo() {
  return (
    <HighlightedFeature
      name="The Killer Demo"
      description="Your application passes npm audit with zero issues. But depaxiom finds a prototype pollution chain that leads to RCE—because two 'safe' packages combine into a weapon."
      highlightedComponent={<DemoExample />}
      direction="row-reverse"
    />
  );
}

const DemoExample = () => {
  return (
    <div className="w-full space-y-4">
      {/* npm audit output */}
      <div className="bg-muted/50 rounded-lg border p-4 font-mono text-sm">
        <div className="text-muted-foreground mb-2">$ npm audit</div>
        <div className="text-green-500">found 0 vulnerabilities</div>
      </div>

      {/* depaxiom output */}
      <div className="bg-muted/50 rounded-lg border p-4 font-mono text-sm">
        <div className="text-muted-foreground mb-2">$ depaxiom scan</div>
        <div className="text-red-500 font-semibold">CRITICAL: RCE Chain Detected</div>
        <div className="text-muted-foreground mt-2 text-xs">
          <div>Source: lodash.merge (prototype pollution)</div>
          <div>Sink: execa (child_process.spawn)</div>
          <div>Vector: __proto__.env.NODE_OPTIONS</div>
        </div>
        <div className="text-primary mt-3 text-xs">
          → Full POC available (Business tier)
        </div>
      </div>

      {/* Explanation */}
      <div className="text-muted-foreground text-center text-xs">
        Same dependencies. Different conclusions.
      </div>
    </div>
  );
};
