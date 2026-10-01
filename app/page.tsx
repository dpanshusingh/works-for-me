import { CtaStrip } from "@/components/home/cta-strip";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <CtaStrip />
    </>
  );
}
