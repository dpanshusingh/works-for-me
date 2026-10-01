import { CtaStrip } from "@/components/home/cta-strip";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { ServicesGrid } from "@/components/home/services-grid";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <HowItWorks />
      <CtaStrip />
    </>
  );
}
