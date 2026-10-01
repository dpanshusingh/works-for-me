"use client";

import {
  CheckboxField,
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
import { VISIT_TIME_SLOTS } from "@/lib/options";
import { services } from "@/lib/services";
import type { ServiceType } from "@/schemas/healthcare";

const serviceOptions = services.map((s) => ({ value: s.type, label: s.title }));

/**
 * General appointment form (physiotherapy, nutrition, counseling, yoga,
 * dental) and the universal Quick Book modal (`chooseService`).
 */
export function AppointmentForm({
  serviceType,
  chooseService = false,
  requirementLabel = "Symptoms or Requirements",
  requirementPlaceholder = "Briefly describe what you need help with",
}: {
  serviceType?: ServiceType;
  chooseService?: boolean;
  requirementLabel?: string;
  requirementPlaceholder?: string;
}) {
  return (
    <RequestForm
      kind="appointment"
      submitLabel="Book Appointment"
      defaultValues={{
        ...patientDefaults,
        serviceType,
        appointmentDate: "",
        preferredTime: "",
        symptomsOrRequirements: "",
        isUrgent: false,
      }}
    >
      <FormSection step={1} title={chooseService ? "Service & Schedule" : "Preferred Schedule"}>
        {chooseService && (
          <SelectField
            name="serviceType"
            label="Service Required"
            required
            options={serviceOptions}
            placeholder="Choose a service"
            className="sm:col-span-2"
          />
        )}
        <DateField name="appointmentDate" label="Preferred Date" required />
        <SelectField name="preferredTime" label="Time Window" required options={VISIT_TIME_SLOTS} placeholder="Choose a time window" />
        <TextAreaField
          name="symptomsOrRequirements"
          label={requirementLabel}
          required
          placeholder={requirementPlaceholder}
          className="sm:col-span-2"
        />
        <CheckboxField
          name="isUrgent"
          label="This is urgent"
          description="We'll prioritise your request and call back as soon as possible."
          className="sm:col-span-2"
        />
      </FormSection>

      <FormSection step={2} title="Patient Details">
        <PatientBasics />
        <ContactFields />
      </FormSection>

      <FormSection step={3} title="Visit Address">
        <AddressFields />
      </FormSection>
    </RequestForm>
  );
}
