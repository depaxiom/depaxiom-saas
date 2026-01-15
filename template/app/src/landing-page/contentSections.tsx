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

export const testimonials = [
  {
    name: "Security Engineer",
    role: "Fortune 500 Company",
    avatarSrc: "",
    socialUrl: "",
    quote: "Found 3 exploitable chains in our dependency tree that Snyk and npm audit both missed. One was a direct path to RCE.",
  },
  {
    name: "Lead Developer",
    role: "Fintech Startup",
    avatarSrc: "",
    socialUrl: "",
    quote: "The compositional analysis is game-changing. We had no idea that two 'safe' packages could combine into a vulnerability.",
  },
  {
    name: "DevSecOps Lead",
    role: "SaaS Platform",
    avatarSrc: "",
    socialUrl: "",
    quote: "Integrated into our CI in 5 minutes. The false positive rate is incredibly low compared to other tools we've tried.",
  },
];

export const faqs = [
  {
    id: 1,
    question: "How is depaxiom different from npm audit or Snyk?",
    answer: "Traditional scanners evaluate packages atomically—they check if lodash has a CVE. Depaxiom analyzes combinations: when your lodash version plus your yaml parser plus your templating engine create an exploitable chain that no individual CVE covers.",
    href: DocsUrl,
  },
  {
    id: 2,
    question: "What vulnerability types do you detect?",
    answer: "We detect RCE (Remote Code Execution), SSRF (Server-Side Request Forgery), path traversal, XSS, prototype pollution chains, and more. Our focus is on compositional vulnerabilities—where the danger emerges from package interactions.",
    href: DocsUrl,
  },
  {
    id: 3,
    question: "Why does Business tier require an NDA?",
    answer: "Business tier includes full working exploit POCs. These are real weapons that could cause harm if misused. The NDA ensures responsible use for defensive purposes only—patching your systems, not attacking others.",
    href: DocsUrl,
  },
  {
    id: 4,
    question: "How do I integrate depaxiom into my CI/CD?",
    answer: "Add our GitHub Action to your workflow with your API key. Scans run automatically on PRs, and findings appear as comments. Zero configuration beyond the API key.",
    href: DocsUrl,
  },
  {
    id: 5,
    question: "What's a 'skeleton key' vulnerability?",
    answer: "A skeleton key is a universal exploit primitive—like polluting 'env' or 'shell' properties—that works against any package using child_process, regardless of the specific pollution source. One key, many doors.",
    href: DocsUrl,
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
