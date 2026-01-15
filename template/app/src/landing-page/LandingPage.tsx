import FAQ from "./components/FAQ";
import FeaturesGrid from "./components/FeaturesGrid";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ResearchProof from "./components/ResearchProof";
import {
  faqs,
  features,
  footerNavigation,
} from "./contentSections";
import KillerDemo from "./ExampleHighlightedFeature";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <main className="isolate">
        <Hero />
        <KillerDemo />
        <FeaturesGrid features={features} />
        <ResearchProof />
        <FAQ faqs={faqs} />
      </main>
      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}
