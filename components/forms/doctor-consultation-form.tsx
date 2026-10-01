"use client";

import { Siren } from "lucide-react";
import { useWatch } from "react-hook-form";
import {
  ChoiceCards,
  DateField,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/fields";
import {
  AddressFields,
  ContactFields,
  PatientBasics,
  patientDefaults,
} from "@/components/forms/patient-sections";
import { RequestForm } from "@/components/forms/request-form";
import {
  CAREGIVER_PREFERENCES,
  CONSULTATION_MODES,
  LANGUAGES,
  MOBILITY_STATUSES,
  SPECIALTIES,
  VISIT_TIME_SLOTS,
} from "@/lib/options";
import { site } from "@/lib/site";

export function DoctorConsultationForm() {
  return (
    <RequestForm
      kind="doctor_consultation"
      submitLabel="Request Doctor Consultation"
      defaultValues={{
        ...patientDefaults,
        consultationMode: "home_visit",
        doctorPreference: "no_preference",
        preferredLanguage: "english",
        symptoms: "",
        currentMedications: "",
        allergies: "",
        preferredDate: "",
        preferredTime: "",
      }}
    >
      <FormSection step={1} title="Consultation Mode">
        <ChoiceCards name="consultationMode" label="How would you like to consult?" required options={CONSULTATION_MODES} />
        <SelectField name="specialty" label="Specialty Required" required options={SPECIALTIES} placeholder="Choose a specialty" />
        <SelectField name="preferredLanguage" label="Preferred Language" required options={LANGUAGES} />
      </FormSection>

      <FormSection step={2} title="Patient Age & Mobility">
        <PatientBasics />
        <ChoiceCards name="mobilityStatus" label="Mobility Status" required options={MOBILITY_STATUSES} columns={4} />
        <CriticalWarning />
      </FormSection>

      <FormSection step={3} title="Symptoms & Medical History">
        <TextAreaField
          name="symptoms"
          label="Primary Complaints"
          required
          rows={4}
          placeholder="e.g. Fever since 3 days, body ache, mild cough"
          className="sm:col-span-2"
        />
        <TextAreaField
          name="currentMedications"
          label="Current Medications"
          rows={2}
          placeholder="Medicines the patient takes regularly"
        />
        <TextField name="allergies" label="Allergies" placeholder="e.g. Penicillin, none known" />
      </FormSection>

      <FormSection step={4} title="Preferred Slot & Doctor Preference">
        <DateField name="preferredDate" label="Preferred Date" required />
        <SelectField name="preferredTime" label="Time Window" required options={VISIT_TIME_SLOTS} placeholder="Choose a time window" />
        <SelectField name="doctorPreference" label="Doctor Preference" required options={CAREGIVER_PREFERENCES} />
      </FormSection>

      <FormSection step={5} title="Contact Details">
        <ContactFields />
      </FormSection>

      <AddressSection />
    </RequestForm>
  );
}

function AddressSection() {
  const mode = useWatch({ name: "consultationMode" });
  return (
    <FormSection
      step={6}
      title={mode === "tele_consultation" ? "Address (for prescriptions & medicine delivery)" : "Visit Address"}
    >
      <AddressFields />
    </FormSection>
  );
}

function CriticalWarning() {
  const mobility = useWatch({ name: "mobilityStatus" });
  if (mobility !== "critical") return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200 sm:col-span-2"
    >
      <Siren className="mt-0.5 size-5 shrink-0 text-red-600" />
      <p>
        <strong>If this is a medical emergency, call {site.emergencyNumber} (ambulance) immediately</strong> or go
        to the nearest hospital. You can also call us on{" "}
        <a href={site.phone.tel} className="font-semibold underline">
          {site.phone.display}
        </a>
        .
      </p>
    </div>
  );
}
