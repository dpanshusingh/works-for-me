import { describe, expect, it } from "vitest";
import { toISODate } from "@/lib/dates";
import {
  AppointmentFormSchema,
  LabTestFormSchema,
  MedicalEquipmentFormSchema,
  MedicineOrderFormSchema,
  normalizeIndianPhone,
  PatientInfoSchema,
} from "./healthcare";

const patient = {
  fullName: "Maria Fernandes",
  phone: "9923120649",
  alternatePhone: "",
  email: "",
  addressLine: "Flat 204, Sunrise Residency",
  locality: "Porvorim",
  pincode: "403521",
  landmark: "",
};

const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

const pathsOf = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((i) => i.path.join(".")) ?? [];

describe("normalizeIndianPhone", () => {
  it.each([
    ["+91 99231 20649", "9923120649"],
    ["099231-20649", "9923120649"],
    ["9923120649", "9923120649"],
    ["91 9923120649", "9923120649"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeIndianPhone(input)).toBe(expected);
  });
});

describe("PatientInfoSchema", () => {
  it("accepts a complete Goa address", () => {
    expect(PatientInfoSchema.safeParse(patient).success).toBe(true);
  });

  it("rejects phone numbers that are not Indian mobiles", () => {
    expect(PatientInfoSchema.safeParse({ ...patient, phone: "1234567890" }).success).toBe(false);
    expect(PatientInfoSchema.safeParse({ ...patient, phone: "99231" }).success).toBe(false);
  });

  it("requires a 6-digit PIN code", () => {
    expect(pathsOf(PatientInfoSchema.safeParse({ ...patient, pincode: "40352" }))).toEqual(["pincode"]);
  });
});

describe("MedicineOrderFormSchema", () => {
  const order = { ...patient, hasPrescription: true, deliveryUrgency: "standard", paymentMode: "cod_upi" };

  it("needs a prescription or at least one medicine", () => {
    expect(pathsOf(MedicineOrderFormSchema.safeParse(order))).toEqual(["prescriptionFile"]);
  });

  it("accepts a prescription upload alone", () => {
    const file = { name: "rx.jpg", size: 200_000, type: "image/jpeg" };
    expect(MedicineOrderFormSchema.safeParse({ ...order, prescriptionFile: file }).success).toBe(true);
  });

  it("accepts a manual medicine list without a prescription file", () => {
    const result = MedicineOrderFormSchema.safeParse({
      ...order,
      manualMedicines: [{ name: "Paracetamol 650mg", quantity: 2 }],
    });
    expect(result.success).toBe(true);
    expect(result.data?.manualMedicines?.[0]).toMatchObject({ quantity: 2, allowGeneric: true });
  });

  it("accepts a tele-consultation request with nothing to upload", () => {
    expect(MedicineOrderFormSchema.safeParse({ ...order, hasPrescription: false }).success).toBe(true);
  });

  it("rejects files over 10 MB and unsupported types", () => {
    const big = { name: "rx.pdf", size: 11 * 1024 * 1024, type: "application/pdf" };
    const gif = { name: "rx.gif", size: 1000, type: "image/gif" };
    expect(pathsOf(MedicineOrderFormSchema.safeParse({ ...order, prescriptionFile: big }))).toContain("prescriptionFile");
    expect(pathsOf(MedicineOrderFormSchema.safeParse({ ...order, prescriptionFile: gif }))).toContain("prescriptionFile");
  });

  it("requires date and slot for scheduled delivery", () => {
    const scheduled = { ...order, hasPrescription: false, deliveryUrgency: "scheduled" };
    expect(pathsOf(MedicineOrderFormSchema.safeParse(scheduled)).sort()).toEqual([
      "preferredTimeSlot",
      "scheduledDate",
    ]);
    expect(
      MedicineOrderFormSchema.safeParse({ ...scheduled, scheduledDate: inDays(1), preferredTimeSlot: "09:00-11:00" })
        .success,
    ).toBe(true);
  });

  it("reports cross-field problems alongside field errors on the first submit", () => {
    const paths = pathsOf(MedicineOrderFormSchema.safeParse({ ...order, fullName: "" }));
    expect(paths).toEqual(expect.arrayContaining(["fullName", "prescriptionFile"]));
  });
});

describe("LabTestFormSchema", () => {
  const booking = {
    ...patient,
    patientAge: "64",
    patientGender: "female",
    collectionDate: inDays(1),
    timeSlot: "06:30-08:00",
  };

  it("needs a test or a requisition slip", () => {
    expect(pathsOf(LabTestFormSchema.safeParse({ ...booking, tests: [] }))).toEqual(["tests"]);
    expect(LabTestFormSchema.safeParse({ ...booking, tests: ["lipid_profile"] }).success).toBe(true);
    expect(
      LabTestFormSchema.safeParse({
        ...booking,
        requisitionFile: { name: "slip.pdf", size: 5000, type: "application/pdf" },
      }).success,
    ).toBe(true);
  });

  it("rejects collection dates in the past", () => {
    expect(pathsOf(LabTestFormSchema.safeParse({ ...booking, tests: ["cbc"], collectionDate: inDays(-1) }))).toEqual([
      "collectionDate",
    ]);
  });

  it("coerces age typed into a text field", () => {
    expect(LabTestFormSchema.parse({ ...booking, tests: ["cbc"] }).patientAge).toBe(64);
  });
});

describe("MedicalEquipmentFormSchema", () => {
  const request = { ...patient, equipment: ["bed_motorized_3f"], requiredBy: inDays(2), elevatorAvailable: "" };

  it("asks for a rental period when renting", () => {
    expect(pathsOf(MedicalEquipmentFormSchema.safeParse({ ...request, requirementType: "rental" }))).toEqual([
      "rentalPeriod",
    ]);
    expect(MedicalEquipmentFormSchema.safeParse({ ...request, requirementType: "purchase" }).success).toBe(true);
  });
});

describe("AppointmentFormSchema", () => {
  it("validates the universal quick-book payload", () => {
    const result = AppointmentFormSchema.safeParse({
      ...patient,
      serviceType: "physiotherapy",
      patientAge: "70",
      patientGender: "male",
      appointmentDate: inDays(0),
      preferredTime: "09:00-11:00",
      symptomsOrRequirements: "Knee pain after surgery",
    });
    expect(result.success).toBe(true);
    expect(result.data?.isUrgent).toBe(false);
  });

  it("rejects unknown services", () => {
    expect(pathsOf(AppointmentFormSchema.safeParse({ ...patient, serviceType: "surgery" }))).toContain("serviceType");
  });
});

describe("ReviewFormSchema", () => {
  it("requires a 1–5 star rating and a real review", async () => {
    const { ReviewFormSchema } = await import("./healthcare");
    const base = { fullName: "Asha", phone: "9876543210", serviceType: "lab_test", review: "Quick and painless sample collection." };
    expect(ReviewFormSchema.safeParse({ ...base, rating: "5" }).success).toBe(true);
    expect(pathsOf(ReviewFormSchema.safeParse({ ...base, rating: "" }))).toEqual(["rating"]);
    expect(pathsOf(ReviewFormSchema.safeParse({ ...base, rating: "6" }))).toEqual(["rating"]);
    expect(pathsOf(ReviewFormSchema.safeParse({ ...base, rating: "3", review: "ok" }))).toEqual(["review"]);
  });
});
