import type { ServiceType } from "@/schemas/healthcare";

/** Which booking form a service page renders. */
export type ServiceFormType =
  | "medicine"
  | "lab"
  | "doctor"
  | "equipment"
  | "care"
  | "diabetic"
  | "general";

export type ServiceIconName =
  | "stethoscope"
  | "heart-handshake"
  | "user-check"
  | "activity"
  | "flask"
  | "pill"
  | "salad"
  | "message-heart"
  | "flower"
  | "bed"
  | "smile"
  | "droplet";

export type Service = {
  slug: string;
  type: ServiceType;
  title: string;
  /** One-sentence value proposition shown on cards. */
  tagline: string;
  /** Paragraph shown at the top of the service page. */
  description: string;
  /** What is included — shown as a checklist on the service page. */
  includes: string[];
  /** Who typically books it. */
  idealFor: string[];
  formType: ServiceFormType;
  formTitle: string;
  icon: ServiceIconName;
  /** Two short labels floated on the card artwork. */
  artChips: [string, string];
  /** Gradient used by the card artwork. */
  tone: "blue" | "emerald" | "sky" | "teal" | "indigo" | "cyan";
  /**
   * Optional photo in /public (e.g. "/images/services/lab-test.webp").
   * When set it replaces the illustrated artwork on cards and pages.
   */
  photo?: string;
  /** Art direction for a replacement photo. */
  photoBrief: string;
  featured?: boolean;
};

export const services: Service[] = [
  {
    slug: "doctor-consultation",
    type: "doctor_consultation",
    title: "Doctor Consultation",
    tagline: "Qualified doctors at your home or on a video call — no waiting rooms.",
    description:
      "Book a general physician or specialist for a home visit, or consult over video or audio when a visit isn't needed. Ideal for fevers, chronic-condition reviews, post-hospital follow-ups and patients who find travelling difficult.",
    includes: [
      "Home visits by general physicians and specialists",
      "Tele-consultation over video or audio call",
      "Geriatric, diabetic, pediatric, orthopedic and skin specialists",
      "Digital prescription and follow-up advice",
      "Coordination of lab tests and medicine delivery",
    ],
    idealFor: ["Senior citizens", "Bedridden patients", "Busy families", "Post-surgery follow-up"],
    formType: "doctor",
    formTitle: "Doctor Consultation & Home Visit",
    icon: "stethoscope",
    artChips: ["Home visit", "Tele-consult"],
    tone: "blue",
    photoBrief:
      "Compassionate doctor in white coat with stethoscope consulting a family at home.",
    featured: true,
  },
  {
    slug: "nursing-elder-care",
    type: "nursing_elder_care",
    title: "Nursing/Elder Care",
    tagline: "Skilled nurses for injections, dressings, ICU care and daily elder support.",
    description:
      "From a single wound dressing to round-the-clock ICU-level nursing, our trained nursing partners bring hospital-grade care into the comfort of home — with the patience and dignity elders deserve.",
    includes: [
      "Critical ICU nursing by registered nurses",
      "Injections, IV, catheter care and wound dressing",
      "Vital signs monitoring and medication management",
      "12-hour day / night shifts or 24-hour live-in care",
      "Short visits for single procedures",
    ],
    idealFor: ["Post-hospital recovery", "Elderly parents", "Chronic illness", "Palliative care"],
    formType: "care",
    formTitle: "Nursing & Elder Care Enquiry",
    icon: "heart-handshake",
    artChips: ["Registered nurses", "Day & night shifts"],
    tone: "emerald",
    photoBrief:
      "Nurse in scrubs gently assisting and monitoring a seated senior citizen.",
    featured: true,
  },
  {
    slug: "trained-attendants",
    type: "trained_attendants",
    title: "Trained Attendants",
    tagline: "Caring, verified attendants for bathing, mobility, feeding and companionship.",
    description:
      "Our trained healthcare attendants help with the daily activities that matter — personal hygiene, moving safely, meals and medicines on time — so families get peace of mind and patients keep their independence.",
    includes: [
      "Bathing, grooming and personal hygiene",
      "Mobility support and fall prevention",
      "Feeding assistance and medicine reminders",
      "Companionship for seniors living alone",
      "Day, night or live-in arrangements",
    ],
    idealFor: ["Seniors living alone", "Bedridden patients", "Dementia care", "Working families"],
    formType: "care",
    formTitle: "Care Attendant Booking",
    icon: "user-check",
    artChips: ["Verified staff", "Live-in available"],
    tone: "sky",
    photoBrief:
      "Team of professional, uniformed domestic healthcare attendants standing in a clinical hallway.",
  },
  {
    slug: "physiotherapy",
    type: "physiotherapy",
    title: "Physiotherapy",
    tagline: "Licensed physiotherapists for pain relief and rehab, right at home.",
    description:
      "Recover faster with one-to-one physiotherapy sessions at home. Our physiotherapists plan exercises around your condition — back and neck pain, post-surgery rehab, stroke recovery and age-related stiffness.",
    includes: [
      "Back, neck, knee and shoulder pain management",
      "Post-operative and orthopedic rehabilitation",
      "Neuro rehab for stroke and Parkinson's",
      "Geriatric mobility and balance training",
      "Home exercise programmes",
    ],
    idealFor: ["Joint & back pain", "Post-surgery", "Stroke recovery", "Sports injuries"],
    formType: "general",
    formTitle: "Book a Physiotherapy Session",
    icon: "activity",
    artChips: ["Rehab plans", "1-to-1 sessions"],
    tone: "teal",
    photoBrief:
      "Licensed physiotherapist guiding a patient through lower back and spinal rehabilitation exercises.",
  },
  {
    slug: "lab-test",
    type: "lab_test",
    title: "Lab Test",
    tagline: "Blood and diagnostic samples collected from home by trained phlebotomists.",
    description:
      "Skip the queue at the lab. A trained phlebotomist visits at your chosen slot — early morning for fasting tests — collects samples hygienically and your reports are shared digitally.",
    includes: [
      "Home sample collection, including early-morning slots",
      "CBC, HbA1c, lipid, liver, kidney and thyroid profiles",
      "Senior citizen comprehensive health package",
      "Tests as per your doctor's requisition slip",
      "Digital reports on WhatsApp / email",
    ],
    idealFor: ["Routine check-ups", "Diabetes monitoring", "Senior citizens", "Doctor-advised tests"],
    formType: "lab",
    formTitle: "Book At-Home Sample Collection",
    icon: "flask",
    artChips: ["Home collection", "Digital reports"],
    tone: "indigo",
    photoBrief:
      "Lab specialist in safety gear handling blood sample test tubes and diagnostics.",
    featured: true,
  },
  {
    slug: "medicine-delivery",
    type: "medicine_delivery",
    title: "Medicine delivery",
    tagline: "Upload your prescription and get medicines delivered across Goa.",
    description:
      "Send us your prescription or a list of medicines and we deliver to your doorstep anywhere in Goa — same day as standard, express within two hours when it's urgent, or at a time you schedule.",
    includes: [
      "Prescription upload (photo or PDF)",
      "Express delivery within 90–120 minutes",
      "Same-day standard and scheduled delivery",
      "Quality generic alternatives on request",
      "Cash / UPI on delivery or online payment link",
    ],
    idealFor: ["Monthly refills", "Urgent medicines", "Seniors at home", "Post-discharge prescriptions"],
    formType: "medicine",
    formTitle: "Prescription & Medicine Delivery",
    icon: "pill",
    artChips: ["Express 90–120 min", "Rx upload"],
    tone: "cyan",
    photoBrief:
      "Assorted blister packs of tablets, capsules and a syrup bottle laid out for dispatch.",
    featured: true,
  },
  {
    slug: "nutrition-diet",
    type: "nutrition_diet",
    title: "Nutrition And Diet Consultation",
    tagline: "Personalised diet plans from clinical nutritionists for your health goals.",
    description:
      "Eat well for your condition. Our clinical nutritionists build practical, Goan-kitchen-friendly diet plans for diabetes, heart health, weight management, pregnancy and recovery after illness.",
    includes: [
      "Detailed diet and lifestyle assessment",
      "Personalised meal plans",
      "Diabetic, cardiac and renal diets",
      "Weight management programmes",
      "Regular follow-ups and plan adjustments",
    ],
    idealFor: ["Diabetes", "Weight loss", "Heart health", "Pregnancy nutrition"],
    formType: "general",
    formTitle: "Book a Nutrition Consultation",
    icon: "salad",
    artChips: ["Custom meal plans", "Follow-ups"],
    tone: "emerald",
    photoBrief:
      "Clinical nutritionist consulting with a laptop and a bowl of fresh fruits and balanced diet items.",
  },
  {
    slug: "counseling",
    type: "counseling",
    title: "Counseling",
    tagline: "Confidential, empathetic counselling for stress, anxiety and life changes.",
    description:
      "Talk to a qualified counsellor in a safe, private space — at home or online. Support for stress, anxiety, grief, caregiver burnout, relationship concerns and adjusting to illness.",
    includes: [
      "Individual counselling sessions",
      "Stress, anxiety and grief support",
      "Caregiver burnout support",
      "Family and relationship counselling",
      "Home or online sessions — fully confidential",
    ],
    idealFor: ["Stress & anxiety", "Caregivers", "Grief", "Life transitions"],
    formType: "general",
    formTitle: "Book a Counselling Session",
    icon: "message-heart",
    artChips: ["Confidential", "Home or online"],
    tone: "sky",
    photoBrief:
      "Warm, empathetic mental health counsellor listening attentively to an individual.",
  },
  {
    slug: "fitness-yoga",
    type: "fitness_yoga",
    title: "Yoga/Physical fitness trainer",
    tagline: "Certified yoga and fitness trainers for strength, flexibility and wellbeing.",
    description:
      "Build strength, flexibility and calm with a certified trainer who comes to you. Sessions are tailored to your age, fitness level and any medical conditions.",
    includes: [
      "Therapeutic and general yoga",
      "Senior-friendly fitness and balance",
      "Strength and flexibility training",
      "Breathing and relaxation techniques",
      "Home, terrace or garden sessions",
    ],
    idealFor: ["Seniors", "Back pain", "Stress relief", "General fitness"],
    formType: "general",
    formTitle: "Book a Yoga / Fitness Trainer",
    icon: "flower",
    artChips: ["Certified trainers", "Senior-friendly"],
    tone: "teal",
    photoBrief:
      "Certified yoga instructor demonstrating an outdoor therapeutic stretch pose in lush greenery.",
  },
  {
    slug: "medical-equipment",
    type: "medical_equipment",
    title: "Medical Equipment",
    tagline: "Hospital beds, oxygen, wheelchairs and more — on rent or to buy.",
    description:
      "Set up a safe recovery room at home. Rent or buy hospital beds, oxygen concentrators, BiPAP/CPAP machines, wheelchairs and other equipment — delivered and installed by technicians.",
    includes: [
      "Manual and motorized hospital beds",
      "Oxygen concentrators (5L / 10L)",
      "BiPAP / CPAP machines and suction apparatus",
      "Wheelchairs, walkers and anti-bedsore air mattresses",
      "Weekly / monthly rental or outright purchase",
    ],
    idealFor: ["Home ICU setup", "Post-surgery recovery", "Respiratory care", "Mobility support"],
    formType: "equipment",
    formTitle: "Equipment Rental & Purchase",
    icon: "bed",
    artChips: ["Rent or buy", "Installed at home"],
    tone: "indigo",
    photoBrief:
      "Fully equipped home patient room with a hospital bed, oxygen concentrator and wheelchair.",
  },
  {
    slug: "dental-consultation",
    type: "dental_consultation",
    title: "Dental Consultation",
    tagline: "Dental check-ups and advice for the whole family, including seniors at home.",
    description:
      "Get expert dental advice without the trip. Our dentists assess tooth pain, gum problems and denture issues, guide you on treatment and arrange clinic procedures when needed.",
    includes: [
      "Dental check-up and oral health assessment",
      "Tooth pain and gum problem consultation",
      "Denture care and fitting advice for seniors",
      "Children's dental guidance",
      "Referral for clinic procedures when required",
    ],
    idealFor: ["Tooth pain", "Seniors with dentures", "Children", "Routine check-ups"],
    formType: "general",
    formTitle: "Book a Dental Consultation",
    icon: "smile",
    artChips: ["Family dentistry", "Senior care"],
    tone: "cyan",
    photoBrief: "Gloved dentist holding dental care tools, checking oral health.",
  },
  {
    slug: "diabetic-care",
    type: "diabetic_care",
    title: "Diabetic Care",
    tagline: "Sugar monitoring, insulin support and diabetologist care, all at home.",
    description:
      "Keep diabetes in control with a care plan built around you — home blood-sugar checks, HbA1c tests, insulin support, diabetologist reviews, diet plans and foot care, as one-time visits or a monthly plan.",
    includes: [
      "Home blood sugar monitoring",
      "HbA1c and sugar tests with home collection",
      "Diabetologist consultations",
      "Insulin administration support",
      "Diabetic diet plans and foot care",
    ],
    idealFor: ["Type 1 & Type 2 diabetes", "Insulin users", "Seniors", "Newly diagnosed"],
    formType: "diabetic",
    formTitle: "Diabetic Care Plan",
    icon: "droplet",
    artChips: ["Sugar monitoring", "Monthly plans"],
    tone: "blue",
    photoBrief: "Blood glucose meter reading a blood sugar drop on a patient's finger.",
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getServiceByType(type: ServiceType) {
  return services.find((s) => s.type === type);
}

export const serviceTitleByType = Object.fromEntries(
  services.map((s) => [s.type, s.title]),
) as Record<ServiceType, string>;
