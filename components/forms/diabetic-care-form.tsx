"use client";

import {
  CheckboxChips,
  ChoiceCards,
  DateField,
  ErrorText,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
  useFieldError,
} from "@/components/forms/fields";
import {
  AddressFields,
  ContactFields,
  PatientBasics,
  patientDefaults,
} from "@/components/forms/patient-sections";
import { RequestForm } from "@/components/forms/request-form";
import {
  DIABETES_TYPES,
  DIABETIC_CARE_NEEDS,
  DIABETIC_PLAN_TYPES,
  VISIT_TIME_SLOTS,
  YES_NO,
} from "@/lib/options";

export function DiabeticCareForm() {
  return (
    <RequestForm
      kind="diabetic_care"
      submitLabel="Request Diabetic Care Plan"
      defaultValues={{
        ...patientDefaults,
        careNeeds: [],
        planType: "one_time",
        latestReadings: "",
        preferredDate: "",
        preferredTime: "",
        notes: "",
      }}
    >
      <FormSection step={1} title="Diabetes Profile">
        <SelectField name="diabetesType" label="Type of Diabetes" required options={DIABETES_TYPES} />
        <TextField
          name="latestReadings"
          label="Latest Readings"
          placeholder="e.g. Fasting 145 mg/dL, HbA1c 7.8%"
        />
        <ChoiceCards name="onInsulin" label="Is the patient on insulin?" required options={YES_NO} />
      </FormSection>

      <CareNeeds />

      <FormSection step={3} title="Patient Information">
        <PatientBasics />
        <ContactFields />
      </FormSection>

      <FormSection step={4} title="Visit Address">
        <AddressFields />
        <TextAreaField
          name="notes"
          label="Other conditions or notes"
          placeholder="e.g. High BP, foot ulcer on left toe, uses glucometer at home"
          className="sm:col-span-2"
        />
      </FormSection>
    </RequestForm>
  );
}

function CareNeeds() {
  const error = useFieldError("careNeeds")?.message;
  return (
    <FormSection step={2} title="Care Plan">
      <div className="sm:col-span-2">
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Support needed <span className="text-red-500">*</span>
        </p>
        <CheckboxChips name="careNeeds" options={DIABETIC_CARE_NEEDS} />
        <ErrorText message={error} />
      </div>
      <ChoiceCards name="planType" label="Plan type" required options={DIABETIC_PLAN_TYPES} />
      <DateField name="preferredDate" label="Preferred Date" required />
      <SelectField name="preferredTime" label="Time Window" required options={VISIT_TIME_SLOTS} placeholder="Choose a time window" />
    </FormSection>
  );
}
