"use client";

import { Info, PillBottle, Plus, Stethoscope, Trash2 } from "lucide-react";
import { useId } from "react";
import { useController, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  ChoiceCards,
  DateField,
  ErrorText,
  FormSection,
  QuantityStepper,
  SelectField,
  TextAreaField,
  useFieldError,
} from "@/components/forms/fields";
import { FileDropzone } from "@/components/forms/file-dropzone";
import {
  AddressFields,
  ContactFields,
  NameField,
  patientDefaults,
} from "@/components/forms/patient-sections";
import { RequestForm } from "@/components/forms/request-form";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  DELIVERY_URGENCY,
  MEDICINE_FORMS,
  MEDICINE_SUGGESTIONS,
  PAYMENT_MODES,
  VISIT_TIME_SLOTS,
} from "@/lib/options";

export function MedicineDeliveryForm() {
  return (
    <RequestForm
      kind="medicine_order"
      submitLabel="Submit Medicine Order"
      defaultValues={{
        ...patientDefaults,
        hasPrescription: true,
        prescriptionFile: null,
        manualMedicines: [],
        deliveryUrgency: "standard",
        paymentMode: "cod_upi",
        preferredTimeSlot: "",
        scheduledDate: "",
        specialInstructions: "",
      }}
    >
      <FormSection
        step={1}
        title="Upload Prescription"
        description="A clear photo or PDF of your doctor's prescription is the fastest way to order."
      >
        <FileDropzone
          name="prescriptionFile"
          label="Doctor's prescription"
          helper="Upload a valid doctor's prescription for scheduled drugs (Schedule H & H1 compliant)."
        />
        <NoPrescriptionToggle />
      </FormSection>

      <FormSection
        step={2}
        title="Add Medicines Manually"
        description="Optional if you've uploaded a prescription — or list medicines you need without one."
      >
        <MedicineList />
      </FormSection>

      <FormSection step={3} title="Patient & Contact Details">
        <NameField />
        <ContactFields />
      </FormSection>

      <FormSection step={4} title="Delivery Address (Goa)">
        <AddressFields />
      </FormSection>

      <FormSection step={5} title="Delivery Urgency & Timing">
        <ChoiceCards
          name="deliveryUrgency"
          label="When do you need the medicines?"
          required
          options={DELIVERY_URGENCY}
          columns={3}
        />
        <ScheduledDeliveryFields />
      </FormSection>

      <FormSection step={6} title="Payment Preference">
        <ChoiceCards name="paymentMode" label="How would you like to pay?" required options={PAYMENT_MODES} />
      </FormSection>

      <FormSection step={7} title="Special Notes / Instructions">
        <TextAreaField
          name="specialInstructions"
          label="Instructions for our delivery partner"
          maxLength={300}
          placeholder='e.g. "Please ring bell twice", "Keep insulin cold"'
          className="sm:col-span-2"
          hint="Up to 300 characters"
        />
      </FormSection>
    </RequestForm>
  );
}

function NoPrescriptionToggle() {
  const id = useId();
  const { control } = useFormContext();
  const {
    field: { value, onChange },
  } = useController({ name: "hasPrescription", control });
  const needsDoctor = value === false;
  return (
    <div className="sm:col-span-2">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-3.5 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary-tint"
      >
        <input
          id={id}
          type="checkbox"
          checked={needsDoctor}
          onChange={(e) => onChange(!e.target.checked)}
          className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-primary"
        />
        <span className="text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-ink">
            <Stethoscope className="size-4 text-primary" /> I don&apos;t have a prescription yet
          </span>
          <span className="mt-0.5 block text-[13px] text-slate-500">
            Please connect me with a doctor for a tele-consultation first.
          </span>
        </span>
      </label>
    </div>
  );
}

function MedicineList() {
  const listId = useId();
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "manualMedicines" });
  const listError = useFieldError("manualMedicines")?.root?.message;

  return (
    <div className="space-y-3 sm:col-span-2">
      <datalist id={listId}>
        {MEDICINE_SUGGESTIONS.map((m) => (
          <option key={m} value={m} />
        ))}
      </datalist>

      {fields.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-canvas px-4 py-3.5 text-sm text-slate-500 ring-1 ring-line">
          <PillBottle className="size-5 shrink-0 text-slate-400" />
          No medicines added. Use the button below to list medicines by name.
        </div>
      )}

      {fields.map((field, index) => (
        <MedicineRow key={field.id} index={index} listId={listId} onRemove={() => remove(index)} register={register} />
      ))}

      <ErrorText message={listError} />

      <Button
        variant="outline-primary"
        onClick={() => append({ name: "", dosage: "tablet", quantity: 1, allowGeneric: true })}
      >
        <Plus /> {fields.length ? "Add Another Medicine" : "Add Medicine"}
      </Button>
    </div>
  );
}

function MedicineRow({
  index,
  listId,
  onRemove,
  register,
}: {
  index: number;
  listId: string;
  onRemove: () => void;
  register: ReturnType<typeof useFormContext>["register"];
}) {
  const nameId = useId();
  const formId = useId();
  const genericId = useId();
  const nameError = useFieldError(`manualMedicines.${index}.name`)?.message;
  const qtyError = useFieldError(`manualMedicines.${index}.quantity`)?.message;

  return (
    <div className="animate-fade-up rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          Medicine {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-semibold text-red-600 hover:bg-red-50"
          aria-label={`Remove medicine ${index + 1}`}
        >
          <Trash2 className="size-3.5" /> Remove
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_auto]">
        <div>
          <label htmlFor={nameId} className="mb-1 block text-[13px] font-semibold text-slate-600">
            Medicine Name <span className="text-red-500">*</span>
          </label>
          <Input
            id={nameId}
            list={listId}
            placeholder="e.g. Paracetamol 650mg"
            autoComplete="off"
            aria-invalid={!!nameError}
            {...register(`manualMedicines.${index}.name`)}
          />
          <ErrorText message={nameError} />
        </div>
        <div>
          <label htmlFor={formId} className="mb-1 block text-[13px] font-semibold text-slate-600">
            Dosage / Form
          </label>
          <Select id={formId} {...register(`manualMedicines.${index}.dosage`)}>
            {MEDICINE_FORMS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <span className="mb-1 block text-[13px] font-semibold text-slate-600">Quantity</span>
          <QuantityStepper name={`manualMedicines.${index}.quantity`} label={`Quantity of medicine ${index + 1}`} />
          <ErrorText message={qtyError} />
        </div>
      </div>
      <label htmlFor={genericId} className="mt-3 flex cursor-pointer items-start gap-2.5 text-[13px] text-slate-600">
        <input
          id={genericId}
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-secondary-strong"
          {...register(`manualMedicines.${index}.allowGeneric`)}
        />
        Allow high-quality generic alternative if brand is unavailable
      </label>
    </div>
  );
}

function ScheduledDeliveryFields() {
  const urgency = useWatch({ name: "deliveryUrgency" });
  if (urgency === "express") {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-primary-tint px-3.5 py-2.5 text-[13px] text-primary-hover sm:col-span-2">
        <Info className="mt-0.5 size-4 shrink-0" />
        Express delivery depends on stock and distance. We&apos;ll call to confirm the exact time.
      </p>
    );
  }
  if (urgency !== "scheduled") return null;
  return (
    <>
      <DateField name="scheduledDate" label="Delivery Date" required />
      <SelectField
        name="preferredTimeSlot"
        label="Delivery Time Slot"
        required
        options={VISIT_TIME_SLOTS}
        placeholder="Choose a slot"
      />
    </>
  );
}
