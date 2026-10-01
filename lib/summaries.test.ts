import { describe, expect, it } from "vitest";
import { MedicineOrderFormSchema } from "@/schemas/healthcare";
import { buildSummary, createReference, formatIndianPhone, summaryToText } from "./summaries";

describe("createReference", () => {
  it("creates short unambiguous references", () => {
    const refs = new Set(Array.from({ length: 200 }, createReference));
    expect(refs.size).toBe(200);
    for (const ref of refs) expect(ref).toMatch(/^HHH-[A-HJ-NP-Z2-9]{6}$/);
  });
});

describe("formatIndianPhone", () => {
  it("groups a 10-digit mobile with the country code", () => {
    expect(formatIndianPhone("9923120649")).toBe("+91 99231 20649");
    expect(formatIndianPhone("")).toBe("");
  });
});

describe("medicine order summary", () => {
  const order = MedicineOrderFormSchema.parse({
    fullName: "Maria Fernandes",
    phone: "9923120649",
    alternatePhone: "",
    email: "",
    addressLine: "Flat 204, Sunrise Residency",
    landmark: "",
    locality: "Porvorim",
    pincode: "403521",
    hasPrescription: true,
    prescriptionFile: { name: "rx.jpg", size: 1000, type: "image/jpeg" },
    manualMedicines: [{ name: "Insulin Glargine", dosage: "injection", quantity: 3, allowGeneric: false }],
    deliveryUrgency: "express",
    paymentMode: "online_payment_link",
    specialInstructions: "Keep insulin cold",
  });
  const summary = buildSummary("medicine_order", order, "HHH-ABC234");
  const text = summaryToText(summary);

  it("drops empty rows and sections", () => {
    const rows = summary.sections.flatMap((s) => s.rows.map(([label]) => label));
    expect(rows).not.toContain("Email");
    expect(rows).not.toContain("Landmark");
    expect(rows).not.toContain("Date");
  });

  it("produces a readable WhatsApp message", () => {
    expect(text).toContain("*Home Health Healer — Medicine Delivery Order*");
    expect(text).toContain("Ref: HHH-ABC234");
    expect(text).toContain("1. Insulin Glargine (Injection) × 3 — brand only");
    expect(text).toContain("• Mobile: +91 99231 20649");
    expect(text).toContain("• Delivery: Express Urgent Delivery (Within 90–120 minutes)");
    expect(text).toContain("• Instructions: Keep insulin cold");
    expect(text).toContain("I will share my prescription (rx.jpg) in this chat.");
  });
});

describe("review summary", () => {
  it("shows the rating as stars and the publishing choice", async () => {
    const { ReviewFormSchema } = await import("@/schemas/healthcare");
    const review = ReviewFormSchema.parse({
      fullName: "Maria Fernandes",
      phone: "9923120649",
      locality: "Porvorim",
      serviceType: "nursing_elder_care",
      rating: "4",
      review: "The nurse was punctual and very caring with my mother.",
      consentToPublish: false,
    });
    const text = summaryToText(buildSummary("review", review, "HHH-REV234"));
    expect(text).toContain("• Rating: ★★★★☆ (4/5)");
    expect(text).toContain("• Service: Nursing/Elder Care");
    expect(text).toContain("• Publish on website: No — private feedback");
  });
});
