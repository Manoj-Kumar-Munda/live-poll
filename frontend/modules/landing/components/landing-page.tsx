import { LandingNav } from "./nav";
import { Hero } from "./hero";
import { Features } from "./features";
import { HowItWorks } from "./how-it-works";
import { CtaSection } from "./cta-section";
import { LandingFooter } from "./footer";

export function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
