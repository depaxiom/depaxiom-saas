import { DocsUrl } from "../shared/common";
import type { GridFeature } from "./components/FeaturesGrid";

export const features: GridFeature[] = [
  // Lead with user benefits
  {
    name: "Compositional Detection",
    description: "Analyzes package combinations, not just individual packages. Finds vulnerabilities atomic scanners miss.",
    emoji: "🔗",
    href: DocsUrl,
    size: "large",
  },
  {
    name: "Reachability Analysis",
    description: "Determines exploitability in your context. Transforms alert fatigue into prioritized findings.",
    emoji: "🎯",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "GitHub Action",
    description: "Drop into any CI/CD pipeline. Get findings as PR comments with zero configuration.",
    emoji: "⚡",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Zombie Package Detection",
    description: "Identifies abandoned packages with single maintainers. Supply chain risk before it becomes a CVE.",
    emoji: "🧟",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Hash Verification",
    description: "Crowdsourced package integrity. Detect tampered packages before they compromise your build.",
    emoji: "🔐",
    href: DocsUrl,
    size: "small",
  },
  // Technical credibility
  {
    name: "Universal Skeleton Keys",
    description: "20+ universal gadgets (env, shell, code, helpers). Any pollution source + vulnerable sink = exploit.",
    emoji: "🔑",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Semantic Fidelity",
    description: "Instrumented V8 execution, not static analysis. If we report it, it actually executes.",
    emoji: "✓",
    href: DocsUrl,
    size: "small",
  },
  // Business tier upsell
  {
    name: "Virtual Patching",
    description: "Business tier includes WAF rules and patching artifacts. Mitigate before upstream fixes.",
    emoji: "🛡️",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Chain Discovery Engine",
    description: "Automatically discovers new attack paths as our research expands. Your coverage grows with our catalog.",
    emoji: "📊",
    href: DocsUrl,
    size: "medium",
  },
];

// Testimonials removed - using ResearchProof component with verifiable claims instead

export const faqs = [
  {
    id: 1,
    question: "How is depaxiom different from npm audit or Snyk?",
    answer: "Traditional scanners evaluate packages atomically—they check if a utility library has a CVE. Depaxiom analyzes combinations: when your object utility plus your config parser plus your templating engine create an exploitable chain that no individual CVE covers.",
    href: "/docs/compositional-analysis",
  },
  {
    id: 2,
    question: "What vulnerability types do you detect?",
    answer: "We detect RCE (Remote Code Execution), SSRF (Server-Side Request Forgery), path traversal, XSS, prototype pollution chains, and more. Our focus is on compositional vulnerabilities—where the danger emerges from package interactions.",
  },
  {
    id: 3,
    question: "What's a 'skeleton key' vulnerability?",
    answer: "A skeleton key is a universal exploit primitive—like polluting 'env' or 'shell' properties—that works against any package using child_process, regardless of the specific pollution source. One key, many doors.",
    href: "/docs/skeleton-keys",
  },
  {
    id: 4,
    question: "Is my dependency data stored?",
    answer: "We process your package.json and lockfile to identify vulnerabilities, but we don't store your source code. Dependency lists are retained only for scan history and can be deleted on request. Enterprise plans include data retention controls and on-premise options.",
  },
  {
    id: 5,
    question: "How often is your vulnerability database updated?",
    answer: "Our research engine continuously discovers new chains. The database updates daily with new findings, and critical discoveries are pushed immediately. You're not waiting for CVE assignments—we find issues before they're public. We also regularly test existing CVE patches for bypasses and frequently discover incomplete fixes that leave applications vulnerable.",
  },
  {
    id: 6,
    question: "What if I find a false positive?",
    answer: "Report it through the dashboard or API response. We investigate every report—our <5% false positive rate exists because we take these seriously. Confirmed false positives are suppressed within 24 hours.",
  },
  {
    id: 7,
    question: "Do you support monorepos?",
    answer: "Yes. Point the GitHub Action at your repo root and we'll detect all package.json files. Each workspace is scanned independently, and findings are grouped by package for easy triage.",
  },
  {
    id: 8,
    question: "Why does Business tier require an NDA?",
    answer: "Business tier includes full working exploit POCs. These are real weapons that could cause harm if misused. The NDA ensures responsible use for defensive purposes only—patching your systems, not attacking others.",
  },
  {
    id: 9,
    question: "How do I integrate depaxiom into my CI/CD?",
    answer: "Add our GitHub Action to your workflow with your API key. Scans run automatically on PRs, and findings appear as comments. Zero configuration beyond the API key.",
    href: "https://github.com/depaxiom/scan-action",
  },
];

export const footerNavigation = {
  app: [
    { name: "Documentation", href: DocsUrl },
    { name: "Pricing", href: "/pricing" },
    { name: "GitHub Action", href: "https://github.com/depaxiom/scan-action" },
  ],
  company: [
    { name: "About", href: "https://depaxiom.com/about" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

// Removed examples carousel - not relevant for security product
export const examples: never[] = [];
