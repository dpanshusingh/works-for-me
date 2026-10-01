import { z } from "zod";
import { todayISO } from "@/lib/dates";
import {
  BEDRIDDEN_STATUSES,
  CARE_DURATIONS,
  CARE_SHIFTS,
  CARE_TYPES,
  CAREGIVER_PREFERENCES,
  CONSULTATION_MODES,
  DIABETES_TYPES,
  DIABETIC_CARE_NEEDS,
  DIABETIC_PLAN_TYPES,
  EQUIPMENT_REQUIREMENT_TYPES,
  EQUIPMENT_VALUES,
  GENDERS,
  LAB_TESTS,
  LANGUAGES,
  MOBILITY_STATUSES,
  optionValues,
  RENTAL_PERIODS,
  SPECIALTIES,
  YES_NO,
} from "@/lib/options";

/* ================================================================== */
/* Core schemas (as specified)                                         */
/* ================================================================== */

export const SERVICE_TYPES = [
  "doctor_consultation",
  "nursing_elder_care",
  "trained_attendants",
  "physiotherapy",
  "lab_test",
  "medicine_delivery",
  "nutrition_diet",
  "counseling",
  "fitness_yoga",
  "medical_equipment",
  "dental_consultation",
  "diabetic_care",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

// Base Patient Contact
export const PatientInfoSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  alternatePhone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  addressLine: z.string().trim().min(5, "Address must be detailed for doorstep visits"),
  locality: z.string().min(2, "City or locality in Goa is required (e.g., Porvorim)"),
  pincode: z.string().regex(/^\d{6}$/, "Must be a 6-digit PIN code"),
  landmark: z.string().optional(),
});

// Medicine Delivery Schema
export const MedicineDeliverySchema = PatientInfoSchema.extend({
  hasPrescription: z.boolean().default(true),
  prescriptionFile: z.any().optional(),
  manualMedicines: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Medicine name required"),
        dosage: z.string().optional(),
        quantity: z.number("Enter a quantity").min(1, "At least 1").default(1),
        allowGeneric: z.boolean().default(true),
      }),
    )
    .optional(),
  deliveryUrgency: z.enum(["express", "standard", "scheduled"]).default("standard"),
  preferredTimeSlot: z.string().optional(),
  paymentMode: z.enum(["cod_upi", "online_payment_link"]).default("cod_upi"),
  specialInstructions: z.string().max(300, "Keep it under 300 characters").optional(),
});

// Service Appointment Schema (Universal)
export const ServiceAppointmentSchema = PatientInfoSchema.extend({
  serviceType: z.enum(SERVICE_TYPES, { error: "Please choose a service" }),
  patientAge: z.coerce
    .number("Enter the patient's age")
    .min(1, "Enter the patient's age")
    .max(120, "Please enter a valid age"),
  patientGender: z.enum(["male", "female", "other"], { error: "Please select gender" }),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  preferredTime: z.string().min(1, "Preferred time slot is required"),
  symptomsOrRequirements: z.string().trim().min(5, "Please briefly describe your requirement"),
  isUrgent: z.boolean().default(false),
});

export type MedicineDeliveryPayload = z.infer<typeof MedicineDeliverySchema>;
export type ServiceAppointmentPayload = z.infer<typeof ServiceAppointmentSchema>;

/* ================================================================== */
/* Shared building blocks for the dedicated forms                      */
/* ================================================================== */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_UPLOAD_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const ACCEPTED_UPLOAD_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;

/** What survives JSON serialisation of a `File` — sent to the API. */
export type UploadedFileMeta = { name: string; size: number; type: string };

function isFileLike(value: unknown): value is UploadedFileMeta {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as UploadedFileMeta).name === "string" &&
    typeof (value as UploadedFileMeta).size === "number" &&
    typeof (value as UploadedFileMeta).type === "string"
  );
}

export function isAcceptedUpload(file: UploadedFileMeta) {
  const lower = file.name.toLowerCase();
  return (
    (ACCEPTED_UPLOAD_TYPES as readonly string[]).includes(file.type) ||
    ACCEPTED_UPLOAD_EXTENSIONS.some((ext) => lower.endsWith(ext))
  );
}

/**
 * Optional attachment. Accepts a browser `File` in the form and its
 * `{ name, size, type }` metadata on the server.
 */
export const AttachmentSchema = z
  .custom<File | UploadedFileMeta | null | undefined>(
    (value) => value == null || isFileLike(value),
    "Invalid file",
  )
  .refine((file) => !file || isAcceptedUpload(file), "Only PDF, JPG or PNG files are allowed")
  .refine((file) => !file || file.size <= MAX_UPLOAD_BYTES, "File must be 10 MB or smaller")
  .optional();

/** YYYY-MM-DD that is today or later (in the visitor's local calendar). */
export const upcomingDate = (requiredMessage: string) =>
  z
    .string()
    .min(1, requiredMessage)
    .refine((value) => !value || value >= todayISO(), "Please choose today or a later date");

const patientAge = z.coerce
  .number("Enter the patient's age")
  .int("Age must be a whole number")
  .min(1, "Enter the patient's age")
  .max(120, "Please enter a valid age");

const patientGender = z.enum(optionValues(GENDERS), { error: "Please select gender" });

const notes = z.string().max(500, "Keep it under 500 characters").optional();

/**
 * Cross-field checks run even while other fields are still invalid, so
 * every problem shows up on the first submit instead of one at a time.
 * Their callbacks therefore have to tolerate partially-invalid input.
 */
const alwaysRun = { when: () => true } as const;

const listOf = (value: unknown) => (Array.isArray(value) ? value : []);

/* ================================================================== */
/* Form schemas                                                        */
/* ================================================================== */

// FORM A — Prescription & Medicine Delivery
export const MedicineOrderFormSchema = MedicineDeliverySchema.extend({
  prescriptionFile: AttachmentSchema,
  scheduledDate: z.string().optional(),
}).superRefine((order, ctx) => {
  if (order.hasPrescription && !order.prescriptionFile && listOf(order.manualMedicines).length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["prescriptionFile"],
      message: "Upload your prescription or add at least one medicine below",
    });
  }
  if (order.deliveryUrgency === "scheduled") {
    if (!order.scheduledDate) {
      ctx.addIssue({ code: "custom", path: ["scheduledDate"], message: "Choose a delivery date" });
    } else if (order.scheduledDate < todayISO()) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledDate"],
        message: "Please choose today or a later date",
      });
    }
    if (!order.preferredTimeSlot) {
      ctx.addIssue({
        code: "custom",
        path: ["preferredTimeSlot"],
        message: "Choose a delivery time slot",
      });
    }
  }
}, alwaysRun);

// FORM B — At-Home Lab Test Booking
export const LabTestFormSchema = PatientInfoSchema.extend({
  tests: z.array(z.enum(optionValues(LAB_TESTS))).default([]),
  requisitionFile: AttachmentSchema,
  patientAge,
  patientGender,
  collectionDate: upcomingDate("Choose a collection date"),
  timeSlot: z.string().min(1, "Choose a collection time slot"),
  notes,
}).superRefine((booking, ctx) => {
  if (listOf(booking.tests).length === 0 && !booking.requisitionFile) {
    ctx.addIssue({
      code: "custom",
      path: ["tests"],
      message: "Select at least one test or upload your doctor's requisition slip",
    });
  }
}, alwaysRun);

// FORM C — Doctor Consultation & Home Visit
export const DoctorConsultationFormSchema = PatientInfoSchema.extend({
  consultationMode: z.enum(optionValues(CONSULTATION_MODES)).default("home_visit"),
  specialty: z.enum(optionValues(SPECIALTIES), { error: "Please choose a specialty" }),
  patientAge,
  patientGender,
  mobilityStatus: z.enum(optionValues(MOBILITY_STATUSES), {
    error: "Please select the patient's mobility",
  }),
  symptoms: z.string().trim().min(5, "Please describe the main complaints"),
  currentMedications: notes,
  allergies: z.string().max(300).optional(),
  preferredDate: upcomingDate("Choose a preferred date"),
  preferredTime: z.string().min(1, "Choose a preferred time window"),
  doctorPreference: z.enum(optionValues(CAREGIVER_PREFERENCES)).default("no_preference"),
  preferredLanguage: z.enum(optionValues(LANGUAGES)).default("english"),
});

// FORM D — Medical Equipment Rental & Purchase
export const MedicalEquipmentFormSchema = PatientInfoSchema.extend({
  equipment: z.array(z.enum(EQUIPMENT_VALUES)).min(1, "Select at least one item"),
  requirementType: z.enum(optionValues(EQUIPMENT_REQUIREMENT_TYPES)).default("rental"),
  rentalPeriod: z.enum(optionValues(RENTAL_PERIODS)).optional(),
  installationRequired: z.enum(optionValues(YES_NO)).default("yes"),
  floorLevel: z.string().optional(),
  elevatorAvailable: z.enum(optionValues(YES_NO)).optional().or(z.literal("")),
  requiredBy: upcomingDate("When do you need it?"),
  notes,
}).superRefine((request, ctx) => {
  if (request.requirementType === "rental" && !request.rentalPeriod) {
    ctx.addIssue({
      code: "custom",
      path: ["rentalPeriod"],
      message: "Choose weekly or monthly rental",
    });
  }
}, alwaysRun);

// FORM E — Nursing / Elder Care / Trained Attendant
export const NursingCareFormSchema = PatientInfoSchema.extend({
  careType: z.enum(optionValues(CARE_TYPES), { error: "Please choose the type of care" }),
  shift: z.enum(optionValues(CARE_SHIFTS), { error: "Please choose a shift" }),
  patientAge,
  patientGender,
  diagnosis: z.string().trim().min(3, "Briefly describe the diagnosis or condition"),
  mobilityStatus: z.enum(optionValues(BEDRIDDEN_STATUSES), {
    error: "Please select the patient's mobility",
  }),
  startDate: upcomingDate("Choose a start date"),
  expectedDuration: z.enum(optionValues(CARE_DURATIONS), {
    error: "Please choose an expected duration",
  }),
  caregiverPreference: z.enum(optionValues(CAREGIVER_PREFERENCES)).default("no_preference"),
  notes,
});

// FORM F — Diabetic Care Plan
export const DiabeticCareFormSchema = PatientInfoSchema.extend({
  patientAge,
  patientGender,
  diabetesType: z.enum(optionValues(DIABETES_TYPES), { error: "Please select a type" }),
  onInsulin: z.enum(optionValues(YES_NO), { error: "Please select yes or no" }),
  latestReadings: z.string().max(200).optional(),
  careNeeds: z
    .array(z.enum(optionValues(DIABETIC_CARE_NEEDS)))
    .min(1, "Select at least one kind of support"),
  planType: z.enum(optionValues(DIABETIC_PLAN_TYPES)).default("one_time"),
  preferredDate: upcomingDate("Choose a preferred date"),
  preferredTime: z.string().min(1, "Choose a preferred time window"),
  notes,
});

// General appointment (physiotherapy, nutrition, counseling, yoga, dental)
// and the universal Quick Book modal.
export const AppointmentFormSchema = ServiceAppointmentSchema.extend({
  appointmentDate: upcomingDate("Appointment date is required"),
});

// Contact page enquiry
export const ContactFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: PatientInfoSchema.shape.phone,
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please write a few words about how we can help"),
});

/* ================================================================== */
/* Request registry — shared by the forms and POST /api/requests       */
/* ================================================================== */

export const requestSchemas = {
  medicine_order: MedicineOrderFormSchema,
  lab_test: LabTestFormSchema,
  doctor_consultation: DoctorConsultationFormSchema,
  medical_equipment: MedicalEquipmentFormSchema,
  nursing_care: NursingCareFormSchema,
  diabetic_care: DiabeticCareFormSchema,
  appointment: AppointmentFormSchema,
  contact: ContactFormSchema,
} as const;

export type RequestKind = keyof typeof requestSchemas;
export const REQUEST_KINDS = Object.keys(requestSchemas) as RequestKind[];

export type RequestInput<K extends RequestKind> = z.input<(typeof requestSchemas)[K]>;
export type RequestData<K extends RequestKind> = z.output<(typeof requestSchemas)[K]>;

export type MedicineOrder = RequestData<"medicine_order">;
export type LabTestBooking = RequestData<"lab_test">;
export type DoctorConsultation = RequestData<"doctor_consultation">;
export type MedicalEquipmentRequest = RequestData<"medical_equipment">;
export type NursingCareRequest = RequestData<"nursing_care">;
export type DiabeticCareRequest = RequestData<"diabetic_care">;
export type AppointmentRequest = RequestData<"appointment">;
export type ContactRequest = RequestData<"contact">;

/* ================================================================== */
/* Helpers                                                             */
/* ================================================================== */

/**
 * Normalises what people actually type ("+91 99231 20649", "099231-20649")
 * to the bare 10-digit number the schemas expect.
 */
export function normalizeIndianPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}
