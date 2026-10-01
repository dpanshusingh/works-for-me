"use client";

import { AppointmentForm } from "@/components/forms/appointment-form";
import { DiabeticCareForm } from "@/components/forms/diabetic-care-form";
import { DoctorConsultationForm } from "@/components/forms/doctor-consultation-form";
import { LabTestForm } from "@/components/forms/lab-test-form";
import { MedicalEquipmentForm } from "@/components/forms/medical-equipment-form";
import { MedicineDeliveryForm } from "@/components/forms/medicine-delivery-form";
import { NursingCareForm } from "@/components/forms/nursing-care-form";
import { getService } from "@/lib/services";
import type { ServiceType } from "@/schemas/healthcare";

const requirementCopy: Partial<Record<ServiceType, { label: string; placeholder: string }>> = {
  physiotherapy: {
    label: "Condition / Area of Pain",
    placeholder: "e.g. Lower back pain for 2 months, knee replacement 3 weeks ago",
  },
  nutrition_diet: {
    label: "Health Goals & Conditions",
    placeholder: "e.g. Weight loss, diabetic diet, high cholesterol",
  },
  counseling: {
    label: "What would you like support with?",
    placeholder: "Share as much or as little as you're comfortable with — it stays confidential",
  },
  fitness_yoga: {
    label: "Fitness Goals & Health Conditions",
    placeholder: "e.g. Flexibility, back pain, senior-friendly yoga, 3 sessions a week",
  },
  dental_consultation: {
    label: "Dental Concern",
    placeholder: "e.g. Tooth pain, bleeding gums, denture check for a senior",
  },
};

/** Renders the booking form that matches a service. */
export function ServiceForm({ slug }: { slug: string }) {
  const service = getService(slug);
  if (!service) return null;

  switch (service.formType) {
    case "medicine":
      return <MedicineDeliveryForm />;
    case "lab":
      return <LabTestForm />;
    case "doctor":
      return <DoctorConsultationForm />;
    case "equipment":
      return <MedicalEquipmentForm />;
    case "diabetic":
      return <DiabeticCareForm />;
    case "care":
      return (
        <NursingCareForm
          defaultCareType={service.type === "trained_attendants" ? "elderly_attendant" : undefined}
        />
      );
    case "general": {
      const copy = requirementCopy[service.type];
      return (
        <AppointmentForm
          serviceType={service.type}
          requirementLabel={copy?.label}
          requirementPlaceholder={copy?.placeholder}
        />
      );
    }
  }
}
