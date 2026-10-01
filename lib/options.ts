/**
 * Option lists shared by the forms, the zod schemas and the
 * WhatsApp / webhook summaries. Keeping `value` stable matters:
 * it is what gets validated and sent; `label` is what people read.
 */

export type Option<V extends string = string> = {
  readonly value: V;
  readonly label: string;
  readonly hint?: string;
};

type Values<T extends readonly Option[]> = T[number]["value"];

/** Tuple of option values, in the shape `z.enum()` expects. */
export function optionValues<const T extends readonly Option[]>(options: T) {
  return options.map((o) => o.value) as unknown as [Values<T>, ...Values<T>[]];
}

export function labelOf(options: readonly Option[], value: string | undefined | null) {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}

/* ------------------------------------------------------------------ */
/* Goa localities                                                      */
/* ------------------------------------------------------------------ */

export const GOA_LOCALITIES = {
  "North Goa": [
    "Porvorim",
    "Panaji (Panjim)",
    "Mapusa",
    "Calangute",
    "Candolim",
    "Baga",
    "Arpora",
    "Anjuna",
    "Assagao",
    "Siolim",
    "Saligao",
    "Sangolda",
    "Guirim",
    "Parra",
    "Aldona",
    "Tivim",
    "Nerul",
    "Reis Magos",
    "Betim",
    "Merces",
    "Ribandar",
    "Old Goa",
    "Taleigao",
    "Dona Paula",
    "Caranzalem",
    "Miramar",
    "Santa Cruz",
    "Bambolim",
    "Morjim",
    "Arambol",
    "Pernem",
    "Bicholim",
    "Sanquelim",
    "Valpoi",
    "Other – North Goa",
  ],
  "South Goa": [
    "Margao (Madgaon)",
    "Fatorda",
    "Navelim",
    "Benaulim",
    "Colva",
    "Majorda",
    "Varca",
    "Nuvem",
    "Verna",
    "Cortalim",
    "Dabolim",
    "Vasco da Gama",
    "Ponda",
    "Curchorem",
    "Quepem",
    "Sanguem",
    "Cuncolim",
    "Chinchinim",
    "Canacona",
    "Other – South Goa",
  ],
} as const;

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const satisfies readonly Option[];

export const CAREGIVER_PREFERENCES = [
  { value: "no_preference", label: "No preference" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
] as const satisfies readonly Option[];

export const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "konkani", label: "Konkani" },
  { value: "hindi", label: "Hindi" },
  { value: "marathi", label: "Marathi" },
] as const satisfies readonly Option[];

/* ------------------------------------------------------------------ */
/* Time slots                                                          */
/* ------------------------------------------------------------------ */

/** Visits during operating hours (09:00 AM – 05:00 PM). */
export const VISIT_TIME_SLOTS = [
  { value: "09:00-11:00", label: "09:00 AM – 11:00 AM" },
  { value: "11:00-13:00", label: "11:00 AM – 01:00 PM" },
  { value: "13:00-15:00", label: "01:00 PM – 03:00 PM" },
  { value: "15:00-17:00", label: "03:00 PM – 05:00 PM" },
] as const satisfies readonly Option[];

export const LAB_TIME_SLOTS = [
  { value: "06:30-08:00", label: "06:30 AM – 08:00 AM", hint: "Best for fasting tests" },
  { value: "08:00-10:00", label: "08:00 AM – 10:00 AM" },
  { value: "10:00-12:00", label: "10:00 AM – 12:00 PM" },
  { value: "afternoon", label: "Afternoon (12:00 PM – 04:00 PM)" },
] as const satisfies readonly Option[];

/* ------------------------------------------------------------------ */
/* Medicine delivery                                                   */
/* ------------------------------------------------------------------ */

export const MEDICINE_FORMS = [
  { value: "tablet", label: "Tablet / Pill" },
  { value: "capsule", label: "Capsule" },
  { value: "syrup", label: "Syrup" },
  { value: "ointment", label: "Ointment / Cream" },
  { value: "injection", label: "Injection" },
  { value: "drops", label: "Drops" },
  { value: "inhaler", label: "Inhaler" },
  { value: "other", label: "Other" },
] as const satisfies readonly Option[];

export const MEDICINE_SUGGESTIONS = [
  "Paracetamol 650mg",
  "Paracetamol 500mg",
  "Telmisartan 40mg",
  "Amlodipine 5mg",
  "Metformin 500mg",
  "Metformin 1000mg SR",
  "Glimepiride 1mg",
  "Atorvastatin 10mg",
  "Rosuvastatin 10mg",
  "Pantoprazole 40mg",
  "Levothyroxine 50mcg",
  "Aspirin 75mg",
  "Clopidogrel 75mg",
  "Cetirizine 10mg",
  "Montelukast 10mg",
  "Vitamin D3 60000 IU",
  "Calcium + Vitamin D3",
  "ORS Sachet",
  "Insulin Glargine",
  "Azithromycin 500mg",
] as const;

export const DELIVERY_URGENCY = [
  {
    value: "standard",
    label: "Standard Delivery",
    hint: "Same day, within 4–6 hours",
  },
  {
    value: "express",
    label: "Express Urgent Delivery",
    hint: "Within 90–120 minutes",
  },
  {
    value: "scheduled",
    label: "Scheduled Delivery",
    hint: "Pick a date & time slot",
  },
] as const satisfies readonly Option[];

export const PAYMENT_MODES = [
  {
    value: "cod_upi",
    label: "Cash / UPI on Delivery",
    hint: "Pay at your doorstep",
  },
  {
    value: "online_payment_link",
    label: "Online Payment Link",
    hint: "Sent on WhatsApp / SMS after invoice confirmation",
  },
] as const satisfies readonly Option[];

/* ------------------------------------------------------------------ */
/* Lab tests                                                           */
/* ------------------------------------------------------------------ */

export const LAB_TESTS = [
  { value: "cbc", label: "Complete Blood Count (CBC)", fasting: false },
  { value: "hba1c_fbs", label: "HbA1c & Fasting Blood Sugar", fasting: true },
  { value: "lipid_profile", label: "Lipid Profile", fasting: true },
  { value: "lft", label: "Liver Function Test (LFT)", fasting: false },
  { value: "kft", label: "Kidney Function Test (KFT)", fasting: false },
  { value: "thyroid", label: "Thyroid Profile (T3, T4, TSH)", fasting: false },
  {
    value: "senior_package",
    label: "Senior Citizen Comprehensive Package",
    fasting: true,
  },
] as const satisfies readonly (Option & { fasting: boolean })[];

export const FASTING_HOURS = "10–12";

/* ------------------------------------------------------------------ */
/* Doctor consultation                                                 */
/* ------------------------------------------------------------------ */

export const CONSULTATION_MODES = [
  {
    value: "home_visit",
    label: "Doctor Home Visit",
    hint: "A doctor visits you at your doorstep",
  },
  {
    value: "tele_consultation",
    label: "Tele-Consultation",
    hint: "Video or audio call with a doctor",
  },
] as const satisfies readonly Option[];

export const SPECIALTIES = [
  { value: "general_physician", label: "General Physician" },
  { value: "geriatric", label: "Geriatric Specialist" },
  { value: "diabetologist", label: "Diabetologist" },
  { value: "pediatrician", label: "Pediatrician" },
  { value: "orthopedic", label: "Orthopedic" },
  { value: "dermatologist", label: "Dermatologist" },
] as const satisfies readonly Option[];

export const MOBILITY_STATUSES = [
  { value: "mobile", label: "Mobile", hint: "Walks without help" },
  { value: "wheelchair", label: "Wheelchair", hint: "Needs a wheelchair or support" },
  { value: "bedridden", label: "Bedridden", hint: "Mostly confined to bed" },
  { value: "critical", label: "Critical", hint: "Serious or rapidly worsening" },
] as const satisfies readonly Option[];

/* ------------------------------------------------------------------ */
/* Medical equipment                                                   */
/* ------------------------------------------------------------------ */

export const EQUIPMENT_GROUPS = [
  {
    group: "Hospital Bed",
    items: [
      { value: "bed_manual", label: "Manual" },
      { value: "bed_motorized_2f", label: "Motorized 2-Function" },
      { value: "bed_motorized_3f", label: "Motorized 3-Function" },
    ],
  },
  {
    group: "Oxygen Concentrator",
    items: [
      { value: "oxygen_5l", label: "5 Litre" },
      { value: "oxygen_10l", label: "10 Litre" },
    ],
  },
  {
    group: "BiPAP / CPAP Machine",
    items: [
      { value: "bipap", label: "BiPAP" },
      { value: "cpap", label: "CPAP" },
    ],
  },
  {
    group: "Wheelchair",
    items: [
      { value: "wheelchair_standard", label: "Standard" },
      { value: "wheelchair_commode", label: "Commode" },
      { value: "wheelchair_motorized", label: "Motorized" },
    ],
  },
  {
    group: "Other Equipment",
    items: [
      { value: "suction", label: "Suction Apparatus" },
      { value: "air_mattress", label: "Air Mattress (Anti-Bedsore)" },
      { value: "walker", label: "Walker" },
      { value: "crutches", label: "Crutches" },
    ],
  },
] as const;

type EquipmentValue = (typeof EQUIPMENT_GROUPS)[number]["items"][number]["value"];

export const EQUIPMENT_VALUES = EQUIPMENT_GROUPS.flatMap((g) =>
  g.items.map((i) => i.value),
) as [EquipmentValue, ...EquipmentValue[]];

export const EQUIPMENT_ITEMS: readonly Option[] = EQUIPMENT_GROUPS.flatMap((g) =>
  g.items.map((i) => ({
    value: i.value,
    label: g.group === "Other Equipment" ? i.label : `${g.group} – ${i.label}`,
  })),
);

export const EQUIPMENT_REQUIREMENT_TYPES = [
  { value: "rental", label: "Rental", hint: "Weekly or monthly rent" },
  { value: "purchase", label: "Outright Purchase", hint: "Buy and keep it" },
] as const satisfies readonly Option[];

export const RENTAL_PERIODS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const satisfies readonly Option[];

export const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const satisfies readonly Option[];

export const FLOOR_LEVELS = [
  { value: "ground", label: "Ground floor" },
  { value: "1", label: "1st floor" },
  { value: "2", label: "2nd floor" },
  { value: "3", label: "3rd floor" },
  { value: "4_plus", label: "4th floor or above" },
] as const satisfies readonly Option[];

/* ------------------------------------------------------------------ */
/* Nursing / attendants                                                */
/* ------------------------------------------------------------------ */

export const CARE_TYPES = [
  {
    value: "icu_nursing",
    label: "Critical ICU Nursing",
    hint: "Registered Nurse for ICU-level care at home",
  },
  {
    value: "general_nursing",
    label: "General Nursing",
    hint: "Injections, wound dressing, catheter, IV",
  },
  {
    value: "elderly_attendant",
    label: "Trained Elderly Attendant",
    hint: "Bathing, mobility and feeding assistance",
  },
] as const satisfies readonly Option[];

export const CARE_SHIFTS = [
  { value: "day_12h", label: "12-Hour Day Shift", hint: "08:00 AM – 08:00 PM" },
  { value: "night_12h", label: "12-Hour Night Shift", hint: "08:00 PM – 08:00 AM" },
  { value: "live_in_24h", label: "24-Hour Live-in Care", hint: "Round-the-clock" },
  {
    value: "short_visit",
    label: "Short Visit / Procedure Only",
    hint: "e.g. dressing or injection",
  },
] as const satisfies readonly Option[];

export const BEDRIDDEN_STATUSES = [
  { value: "mobile", label: "Mobile" },
  { value: "partially_mobile", label: "Partially mobile" },
  { value: "bedridden", label: "Bedridden" },
] as const satisfies readonly Option[];

export const CARE_DURATIONS = [
  { value: "one_time", label: "One-time visit" },
  { value: "under_week", label: "Less than a week" },
  { value: "one_to_four_weeks", label: "1 – 4 weeks" },
  { value: "over_month", label: "More than a month" },
  { value: "not_sure", label: "Not sure yet" },
] as const satisfies readonly Option[];

/* ------------------------------------------------------------------ */
/* Diabetic care                                                       */
/* ------------------------------------------------------------------ */

export const DIABETES_TYPES = [
  { value: "type_2", label: "Type 2" },
  { value: "type_1", label: "Type 1" },
  { value: "gestational", label: "Gestational" },
  { value: "prediabetes", label: "Pre-diabetes" },
  { value: "not_sure", label: "Not sure / not diagnosed" },
] as const satisfies readonly Option[];

export const DIABETIC_CARE_NEEDS = [
  { value: "glucose_monitoring", label: "Home blood sugar monitoring" },
  { value: "hba1c_test", label: "HbA1c & sugar lab tests" },
  { value: "diabetologist", label: "Diabetologist consultation" },
  { value: "insulin_support", label: "Insulin administration support" },
  { value: "diet_plan", label: "Diabetic diet plan" },
  { value: "foot_wound_care", label: "Foot care & wound dressing" },
] as const satisfies readonly Option[];

export const DIABETIC_PLAN_TYPES = [
  { value: "one_time", label: "One-time visit" },
  { value: "monthly", label: "Monthly care plan" },
] as const satisfies readonly Option[];
