export const site = {
  name: "Home Health Healer",
  shortName: "HHH",
  motto: "You call. We heal.",
  description:
    "Doctor consultation, nursing & elder care, physiotherapy, lab tests, medicine delivery and more — at your doorstep across Goa, on one phone call.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://homehealthhealer.com",
  phone: {
    display: "+91 99231 20649",
    compact: "+919923120649",
    tel: "tel:+919923120649",
    /** wa.me expects the number with country code and no "+" */
    whatsapp: "919923120649",
  },
  email: "contact@homehealthhealer.com",
  location: {
    label: "Porvorim, Goa",
    full: "Porvorim, Goa, India",
    mapEmbed: "https://www.google.com/maps?q=Porvorim,+Goa,+India&output=embed",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Porvorim%2C+Goa",
  },
  hours: {
    display: "09:00 AM - 05:00 PM",
    long: "09:00 AM – 05:00 PM (IST)",
  },
  emergencyNumber: "108",
} as const;

export function whatsappUrl(text?: string) {
  const base = `https://wa.me/${site.phone.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const defaultWhatsappGreeting =
  "Hello Home Health Healer, I would like to book a service / order medicines.";
