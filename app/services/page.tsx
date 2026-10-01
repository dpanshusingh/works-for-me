import type { Metadata } from "next";
import { CtaStrip } from "@/components/home/cta-strip";
import { HowItWorks } from "@/components/home/how-it-works";
import { ServicesGrid } from "@/components/home/services-grid";

export const metadata: Metadata = {
  title: "All Services",
  description:
    "Doctor consultation, nursing & elder care, trained attendants, physiotherapy, lab tests, medicine delivery, nutrition, counselling, yoga, medical equipment, dental and diabetic care — at home across Goa.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <ServicesGrid
        headingAs="h1"
        title="Our Services"
        description="Every service below can be booked online, on WhatsApp or with one phone call — our care team will confirm the details with you."
        className="bg-gradient-to-b from-primary-tint/70 via-white to-white"
      />
      <HowItWorks />
      <CtaStrip />
    </>
  );
}
