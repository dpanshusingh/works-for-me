"use client";

import { useWatch } from "react-hook-form";
import {
  CheckboxChips,
  ChoiceCards,
  DateField,
  ErrorText,
  FormSection,
  SelectField,
  TextAreaField,
  useFieldError,
} from "@/components/forms/fields";
import {
  AddressFields,
  ContactFields,
  NameField,
  patientDefaults,
} from "@/components/forms/patient-sections";
import { RequestForm } from "@/components/forms/request-form";
import {
  EQUIPMENT_GROUPS,
  EQUIPMENT_REQUIREMENT_TYPES,
  FLOOR_LEVELS,
  RENTAL_PERIODS,
  YES_NO,
} from "@/lib/options";

export function MedicalEquipmentForm() {
  return (
    <RequestForm
      kind="medical_equipment"
      submitLabel="Request Equipment"
      defaultValues={{
        ...patientDefaults,
        equipment: [],
        requirementType: "rental",
        rentalPeriod: "monthly",
        installationRequired: "yes",
        floorLevel: "",
        requiredBy: "",
        notes: "",
      }}
    >
      <EquipmentPicker />

      <FormSection step={2} title="Requirement Type">
        <ChoiceCards name="requirementType" label="Rent or buy?" required options={EQUIPMENT_REQUIREMENT_TYPES} />
        <RentalPeriod />
        <DateField name="requiredBy" label="Needed By" required />
      </FormSection>

      <FormSection
        step={3}
        title="Delivery & Installation"
        description="Floor and lift details help us plan delivery of heavy items like hospital beds."
      >
        <ChoiceCards name="installationRequired" label="Need technician installation at home?" required options={YES_NO} />
        <SelectField name="floorLevel" label="Floor Level" options={FLOOR_LEVELS} />
        <SelectField name="elevatorAvailable" label="Lift / Elevator Available?" options={YES_NO} />
      </FormSection>

      <FormSection step={4} title="Contact Details">
        <NameField label="Full Name" />
        <ContactFields />
      </FormSection>

      <FormSection step={5} title="Delivery Address (Goa)">
        <AddressFields />
        <TextAreaField
          name="notes"
          label="Additional Requirements"
          placeholder="e.g. Patient weight, room size, need for oxygen cylinder backup"
          className="sm:col-span-2"
        />
      </FormSection>
    </RequestForm>
  );
}

function EquipmentPicker() {
  const error = useFieldError("equipment")?.message;
  return (
    <FormSection step={1} title="Equipment Category" description="Select everything you need — you can pick more than one.">
      <div className="space-y-4 sm:col-span-2">
        {EQUIPMENT_GROUPS.map((group) => (
          <div key={group.group}>
            <p className="mb-2 text-[13px] font-bold tracking-wider text-slate-500 uppercase">{group.group}</p>
            <CheckboxChips name="equipment" options={group.items} />
          </div>
        ))}
        <ErrorText message={error} />
      </div>
    </FormSection>
  );
}

function RentalPeriod() {
  const type = useWatch({ name: "requirementType" });
  if (type !== "rental") return <div className="hidden sm:block" />;
  return <ChoiceCards name="rentalPeriod" label="Rental Period" required options={RENTAL_PERIODS} className="sm:col-span-1" />;
}
