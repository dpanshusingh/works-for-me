import { formatDisplayDate } from "@/lib/dates";
import {
  BEDRIDDEN_STATUSES,
  CARE_DURATIONS,
  CARE_SHIFTS,
  CARE_TYPES,
  CAREGIVER_PREFERENCES,
  CONSULTATION_MODES,
  DELIVERY_URGENCY,
  DIABETES_TYPES,
  DIABETIC_CARE_NEEDS,
  DIABETIC_PLAN_TYPES,
  EQUIPMENT_ITEMS,
  EQUIPMENT_REQUIREMENT_TYPES,
  FLOOR_LEVELS,
  GENDERS,
  LAB_TESTS,
  LAB_TIME_SLOTS,
  LANGUAGES,
  labelOf,
  MEDICINE_FORMS,
  MOBILITY_STATUSES,
  PAYMENT_MODES,
  RENTAL_PERIODS,
  SPECIALTIES,
  VISIT_TIME_SLOTS,
  YES_NO,
} from "@/lib/options";
import { serviceTitleByType } from "@/lib/services";
import { site } from "@/lib/site";
import type { RequestData, RequestKind } from "@/schemas/healthcare";

export type SummaryRow = readonly [label: string, value: string | number | undefined | null];
export type SummarySection = { title: string; rows: SummaryRow[] };
export type RequestSummary = {
  heading: string;
  reference: string;
  sections: SummarySection[];
  /** Extra lines appended to the WhatsApp message (e.g. "attaching prescription"). */
  notes: string[];
  /** Last line of the message; defaults to asking for confirmation. */
  closing?: string;
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Short, unambiguous reference such as "HHH-7K2P9Q". */
export function createReference() {
  const bytes = new Uint8Array(6);
  globalThis.crypto.getRandomValues(bytes);
  return `HHH-${Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("")}`;
}

export function formatIndianPhone(phone: string | undefined) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

type PatientFields = {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  addressLine: string;
  landmark?: string;
  locality: string;
  pincode: string;
};

function contactSection(p: PatientFields, title = "Patient & Contact"): SummarySection {
  return {
    title,
    rows: [
      ["Name", p.fullName],
      ["Mobile", formatIndianPhone(p.phone)],
      ["Alternate / caregiver", formatIndianPhone(p.alternatePhone)],
      ["Email", p.email],
    ],
  };
}

function addressSection(p: PatientFields, title = "Address"): SummarySection {
  return {
    title,
    rows: [
      ["Address", p.addressLine],
      ["Landmark", p.landmark],
      ["Locality", p.locality],
      ["PIN code", p.pincode],
    ],
  };
}

function attachmentName(file: unknown) {
  return file && typeof file === "object" && "name" in file ? String(file.name) : "";
}

const date = (iso: string | undefined) => (iso ? formatDisplayDate(iso) : "");
const age = (years: number) => `${years} yrs`;

type Builders = { [K in RequestKind]: (data: RequestData<K>) => Omit<RequestSummary, "reference"> };

const builders: Builders = {
  medicine_order(d) {
    const file = attachmentName(d.prescriptionFile);
    const medicines = (d.manualMedicines ?? []).map((m, i) => {
      const form = m.dosage ? ` (${labelOf(MEDICINE_FORMS, m.dosage)})` : "";
      const generic = m.allowGeneric ? " — generic OK" : " — brand only";
      return [`${i + 1}.`, `${m.name}${form} × ${m.quantity}${generic}`] as const;
    });
    const urgency = DELIVERY_URGENCY.find((u) => u.value === d.deliveryUrgency);
    return {
      heading: "Medicine Delivery Order",
      sections: [
        {
          title: "Prescription",
          rows: [
            [
              "Prescription",
              !d.hasPrescription
                ? "No prescription yet — please connect me with a doctor for a tele-consultation first"
                : file
                  ? `Uploaded (${file})`
                  : "Not uploaded",
            ],
          ],
        },
        ...(medicines.length ? [{ title: "Medicines", rows: medicines }] : []),
        contactSection(d),
        addressSection(d, "Delivery Address"),
        {
          title: "Delivery & Payment",
          rows: [
            ["Delivery", urgency ? `${urgency.label} (${urgency.hint})` : d.deliveryUrgency],
            ["Date", d.deliveryUrgency === "scheduled" ? date(d.scheduledDate) : ""],
            [
              "Time slot",
              d.deliveryUrgency === "scheduled"
                ? labelOf(VISIT_TIME_SLOTS, d.preferredTimeSlot)
                : "",
            ],
            ["Payment", labelOf(PAYMENT_MODES, d.paymentMode)],
            ["Instructions", d.specialInstructions],
          ],
        },
      ],
      notes: file ? [`I will share my prescription (${file}) in this chat.`] : [],
    };
  },

  lab_test(d) {
    const file = attachmentName(d.requisitionFile);
    const fasting = d.tests.some((t) => LAB_TESTS.find((l) => l.value === t)?.fasting);
    return {
      heading: "At-Home Lab Test Booking",
      sections: [
        {
          title: "Tests",
          rows: [
            ["Tests", d.tests.map((t) => labelOf(LAB_TESTS, t)).join(", ") || "As per requisition slip"],
            ["Requisition slip", file ? `Uploaded (${file})` : ""],
            ["Fasting required", fasting ? "Yes" : ""],
          ],
        },
        {
          title: "Patient",
          rows: [
            ["Name", d.fullName],
            ["Age", age(d.patientAge)],
            ["Gender", labelOf(GENDERS, d.patientGender)],
            ["Mobile", formatIndianPhone(d.phone)],
            ["Alternate / caregiver", formatIndianPhone(d.alternatePhone)],
            ["Email", d.email],
          ],
        },
        {
          title: "Collection",
          rows: [
            ["Date", date(d.collectionDate)],
            ["Time slot", labelOf(LAB_TIME_SLOTS, d.timeSlot)],
            ["Notes", d.notes],
          ],
        },
        addressSection(d, "Collection Address"),
      ],
      notes: file ? [`I will share the requisition slip (${file}) in this chat.`] : [],
    };
  },

  doctor_consultation(d) {
    return {
      heading: "Doctor Consultation Request",
      sections: [
        {
          title: "Consultation",
          rows: [
            ["Mode", labelOf(CONSULTATION_MODES, d.consultationMode)],
            ["Specialty", labelOf(SPECIALTIES, d.specialty)],
            ["Preferred date", date(d.preferredDate)],
            ["Time window", labelOf(VISIT_TIME_SLOTS, d.preferredTime)],
            [
              "Doctor preference",
              d.doctorPreference === "no_preference"
                ? ""
                : `${labelOf(CAREGIVER_PREFERENCES, d.doctorPreference)} doctor`,
            ],
            ["Language", labelOf(LANGUAGES, d.preferredLanguage)],
          ],
        },
        {
          title: "Patient",
          rows: [
            ["Name", d.fullName],
            ["Age", age(d.patientAge)],
            ["Gender", labelOf(GENDERS, d.patientGender)],
            ["Mobility", labelOf(MOBILITY_STATUSES, d.mobilityStatus)],
            ["Symptoms", d.symptoms],
            ["Current medicines", d.currentMedications],
            ["Allergies", d.allergies],
          ],
        },
        contactSection(d, "Contact"),
        addressSection(d),
      ],
      notes: [],
    };
  },

  medical_equipment(d) {
    return {
      heading: "Medical Equipment Request",
      sections: [
        {
          title: "Equipment",
          rows: [
            ["Items", d.equipment.map((e) => labelOf(EQUIPMENT_ITEMS, e)).join(", ")],
            [
              "Requirement",
              d.requirementType === "rental" && d.rentalPeriod
                ? `Rental (${labelOf(RENTAL_PERIODS, d.rentalPeriod)})`
                : labelOf(EQUIPMENT_REQUIREMENT_TYPES, d.requirementType),
            ],
            ["Needed by", date(d.requiredBy)],
            ["Installation needed", labelOf(YES_NO, d.installationRequired)],
            ["Floor", labelOf(FLOOR_LEVELS, d.floorLevel)],
            ["Lift available", labelOf(YES_NO, d.elevatorAvailable)],
            ["Notes", d.notes],
          ],
        },
        contactSection(d, "Contact"),
        addressSection(d, "Delivery Address"),
      ],
      notes: [],
    };
  },

  nursing_care(d) {
    return {
      heading: "Nursing / Care Attendant Enquiry",
      sections: [
        {
          title: "Care Required",
          rows: [
            ["Service", labelOf(CARE_TYPES, d.careType)],
            ["Shift", labelOf(CARE_SHIFTS, d.shift)],
            ["Start date", date(d.startDate)],
            ["Duration", labelOf(CARE_DURATIONS, d.expectedDuration)],
            [
              "Caregiver preference",
              d.caregiverPreference === "no_preference"
                ? ""
                : labelOf(CAREGIVER_PREFERENCES, d.caregiverPreference),
            ],
          ],
        },
        {
          title: "Patient",
          rows: [
            ["Name", d.fullName],
            ["Age", age(d.patientAge)],
            ["Gender", labelOf(GENDERS, d.patientGender)],
            ["Diagnosis", d.diagnosis],
            ["Mobility", labelOf(BEDRIDDEN_STATUSES, d.mobilityStatus)],
            ["Notes", d.notes],
          ],
        },
        contactSection(d, "Contact"),
        addressSection(d),
      ],
      notes: [],
    };
  },

  diabetic_care(d) {
    return {
      heading: "Diabetic Care Plan Request",
      sections: [
        {
          title: "Diabetes Profile",
          rows: [
            ["Type", labelOf(DIABETES_TYPES, d.diabetesType)],
            ["On insulin", labelOf(YES_NO, d.onInsulin)],
            ["Latest readings", d.latestReadings],
          ],
        },
        {
          title: "Care Plan",
          rows: [
            ["Support needed", d.careNeeds.map((n) => labelOf(DIABETIC_CARE_NEEDS, n)).join(", ")],
            ["Plan", labelOf(DIABETIC_PLAN_TYPES, d.planType)],
            ["Preferred date", date(d.preferredDate)],
            ["Time window", labelOf(VISIT_TIME_SLOTS, d.preferredTime)],
            ["Notes", d.notes],
          ],
        },
        {
          title: "Patient",
          rows: [
            ["Name", d.fullName],
            ["Age", age(d.patientAge)],
            ["Gender", labelOf(GENDERS, d.patientGender)],
            ["Mobile", formatIndianPhone(d.phone)],
            ["Alternate / caregiver", formatIndianPhone(d.alternatePhone)],
            ["Email", d.email],
          ],
        },
        addressSection(d),
      ],
      notes: [],
    };
  },

  appointment(d) {
    return {
      heading: `${serviceTitleByType[d.serviceType]} Appointment`,
      sections: [
        {
          title: "Appointment",
          rows: [
            ["Service", serviceTitleByType[d.serviceType]],
            ["Date", date(d.appointmentDate)],
            ["Time window", labelOf(VISIT_TIME_SLOTS, d.preferredTime)],
            ["Urgent", d.isUrgent ? "Yes — please call back as soon as possible" : ""],
            ["Requirement", d.symptomsOrRequirements],
          ],
        },
        {
          title: "Patient",
          rows: [
            ["Name", d.fullName],
            ["Age", age(d.patientAge)],
            ["Gender", labelOf(GENDERS, d.patientGender)],
            ["Mobile", formatIndianPhone(d.phone)],
            ["Alternate / caregiver", formatIndianPhone(d.alternatePhone)],
            ["Email", d.email],
          ],
        },
        addressSection(d),
      ],
      notes: [],
    };
  },

  review(d) {
    return {
      heading: "Patient Review",
      sections: [
        {
          title: "Review",
          rows: [
            ["Rating", `${"★".repeat(d.rating)}${"☆".repeat(5 - d.rating)} (${d.rating}/5)`],
            ["Service", serviceTitleByType[d.serviceType]],
            ["Review", d.review],
          ],
        },
        {
          title: "From",
          rows: [
            ["Name", d.fullName],
            ["Locality", d.locality],
            ["Mobile", formatIndianPhone(d.phone)],
            [
              "Publish on website",
              d.consentToPublish ? "Yes — first name, locality and review" : "No — private feedback",
            ],
          ],
        },
      ],
      notes: [],
      closing: "Thank you!",
    };
  },

  contact(d) {
    return {
      heading: "Website Enquiry",
      sections: [
        {
          title: "Enquiry",
          rows: [
            ["Name", d.fullName],
            ["Mobile", formatIndianPhone(d.phone)],
            ["Email", d.email],
            ["Message", d.message],
          ],
        },
      ],
      notes: [],
    };
  },
};

export function buildSummary<K extends RequestKind>(
  kind: K,
  data: RequestData<K>,
  reference: string,
): RequestSummary {
  const built = (builders[kind] as (d: RequestData<K>) => Omit<RequestSummary, "reference">)(data);
  return {
    ...built,
    reference,
    // Drop rows nobody filled in, then sections left empty.
    sections: built.sections
      .map((s) => ({
        ...s,
        rows: s.rows.filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ""),
      }))
      .filter((s) => s.rows.length > 0),
  };
}

/** WhatsApp-flavoured text (*bold* headings) — also used for copy-to-clipboard. */
export function summaryToText(summary: RequestSummary) {
  const lines = [`*${site.name} — ${summary.heading}*`, `Ref: ${summary.reference}`];
  for (const section of summary.sections) {
    lines.push("", `*${section.title}*`);
    for (const [label, value] of section.rows) {
      lines.push(/^\d+\.$/.test(label) ? `${label} ${value}` : `• ${label}: ${value}`);
    }
  }
  if (summary.notes.length) lines.push("", ...summary.notes);
  lines.push("", summary.closing ?? "Please confirm my request. Thank you!");
  return lines.join("\n");
}
