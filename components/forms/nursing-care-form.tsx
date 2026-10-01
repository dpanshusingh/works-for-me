"use client";

import {
  ChoiceCards,
  DateField,
  FormSection,
  SelectField,
  TextAreaField,
} from "@/components/forms/fields";
import {
  AddressFields,
  ContactFields,
  PatientBasics,
  patientDefaults,
} from "@/components/forms/patient-sections";
import { RequestForm } from "@/components/forms/request-form";
import {
  BEDRIDDEN_STATUSES,
  CARE_DURATIONS,
  CARE_SHIFTS,
  CARE_TYPES,
  CAREGIVER_PREFERENCES,
} from "@/lib/options";
import type { NursingCareRequest } from "@/schemas/healthcare";

export function NursingCareForm({
  defaultCareType,
}: {
  defaultCareType?: NursingCareRequest["careType"];
}) {
  return (
    <RequestForm
      kind="nursing_care"
      submitLabel="Send Care Enquiry"
      defaultValues={{
        ...patientDefaults,
        careType: defaultCareType,
        caregiverPreference: "no_preference",
        diagnosis: "",
        startDate: "",
        notes: "",
      }}
    >
      <FormSection step={1} title="Service Type Needed">
        <ChoiceCards name="careType" label="What kind of care does the patient need?" required options={CARE_TYPES} columns={3} />
      </FormSection>

      <FormSection step={2} title="Shift Requirements">
        <ChoiceCards name="shift" label="Preferred shift" required options={CARE_SHIFTS} />
        <DateField name="startDate" label="Start Date" required />
        <SelectField name="expectedDuration" label="Expected Duration" required options={CARE_DURATIONS} />
        <SelectField name="caregiverPreference" label="Caregiver Preference" required options={CAREGIVER_PREFERENCES} />
      </FormSection>

      <FormSection step={3} title="Patient Diagnosis & Bedridden Status">
        <PatientBasics />
        <TextAreaField
          name="diagnosis"
          label="Diagnosis / Medical Condition"
          required
          placeholder="e.g. Post hip-replacement surgery, diabetic, needs daily dressing"
          className="sm:col-span-2"
        />
        <ChoiceCards name="mobilityStatus" label="Bedridden Status" required options={BEDRIDDEN_STATUSES} columns={3} />
      </FormSection>

      <FormSection step={4} title="Contact Details">
        <ContactFields />
      </FormSection>

      <FormSection step={5} title="Care Address">
        <AddressFields />
        <TextAreaField
          name="notes"
          label="Anything else we should know?"
          placeholder="e.g. Patient speaks Konkani, has a pet dog, needs help with physiotherapy exercises"
          className="sm:col-span-2"
        />
      </FormSection>
    </RequestForm>
  );
}
