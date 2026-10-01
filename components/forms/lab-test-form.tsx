"use client";

import { AlarmClock, Droplets, UtensilsCrossed } from "lucide-react";
import { useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import {
  CheckboxChips,
  ChoiceCards,
  DateField,
  ErrorText,
  FormSection,
  TextAreaField,
  useFieldError,
} from "@/components/forms/fields";
import { FileDropzone } from "@/components/forms/file-dropzone";
import {
  AddressFields,
  ContactFields,
  PatientBasics,
  patientDefaults,
} from "@/components/forms/patient-sections";
import { RequestForm } from "@/components/forms/request-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FASTING_HOURS, LAB_TESTS, LAB_TIME_SLOTS } from "@/lib/options";

const fastingTests = new Set<string>(LAB_TESTS.filter((t) => t.fasting).map((t) => t.value));

export function LabTestForm() {
  return (
    <RequestForm
      kind="lab_test"
      submitLabel="Book Home Sample Collection"
      defaultValues={{
        ...patientDefaults,
        tests: [],
        requisitionFile: null,
        collectionDate: "",
        timeSlot: "",
        notes: "",
      }}
    >
      <TestSelection />

      <FormSection step={2} title="Patient Information">
        <PatientBasics />
        <ContactFields />
      </FormSection>

      <FormSection step={3} title="Appointment Scheduling">
        <DateField name="collectionDate" label="Preferred Date" required />
        <div className="hidden sm:block" />
        <ChoiceCards name="timeSlot" label="Preferred Time Slot" required options={LAB_TIME_SLOTS} />
        <FastingNotice />
      </FormSection>

      <FormSection step={4} title="Collection Address & Contact">
        <AddressFields />
        <TextAreaField
          name="notes"
          label="Notes for the phlebotomist"
          placeholder="e.g. Patient is diabetic, please come before 7 AM"
          className="sm:col-span-2"
        />
      </FormSection>
    </RequestForm>
  );
}

function TestSelection() {
  const [warningOpen, setWarningOpen] = useState(false);
  const warned = useRef(false);
  const error = useFieldError("tests")?.message;

  return (
    <FormSection
      step={1}
      title="Test Selection"
      description="Choose one or more tests, or upload the test slip your doctor gave you."
    >
      <div className="sm:col-span-2">
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Tests <span className="text-red-500">*</span>
        </p>
        <CheckboxChips
          name="tests"
          options={LAB_TESTS}
          onToggle={(value, checked) => {
            if (checked && fastingTests.has(value) && !warned.current) {
              warned.current = true;
              setWarningOpen(true);
            }
          }}
        />
        <ErrorText message={error} />
      </div>
      <FileDropzone
        name="requisitionFile"
        label="Upload Doctor's Test Requisition Slip"
        helper="Optional — we'll book exactly the tests your doctor prescribed."
      />

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby="fasting-desc">
          <div className="p-6 sm:p-7">
            <span className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <UtensilsCrossed className="size-6" />
            </span>
            <DialogTitle className="mt-4 font-heading text-lg font-bold">Fasting required</DialogTitle>
            <DialogDescription id="fasting-desc" className="mt-2 text-[15px] text-slate-600">
              The selected test requires <strong>{FASTING_HOURS} hours fasting</strong>. Please
              schedule an early-morning slot (06:30 – 08:00 AM) and have only plain water before the
              sample is collected.
            </DialogDescription>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <AlarmClock className="size-4 text-primary" /> Early-morning collection recommended
              </li>
              <li className="flex items-center gap-2">
                <Droplets className="size-4 text-primary" /> Plain water is allowed
              </li>
            </ul>
            <DialogClose asChild>
              <Button className="mt-6 w-full">Got it</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </FormSection>
  );
}

function FastingNotice() {
  const tests = useWatch({ name: "tests" }) as string[] | undefined;
  if (!tests?.some((t) => fastingTests.has(t))) return null;
  return (
    <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-900 ring-1 ring-amber-200 sm:col-span-2">
      <UtensilsCrossed className="mt-0.5 size-4 shrink-0" />
      Your selection includes a fasting test ({FASTING_HOURS} hours). The 06:30 – 08:00 AM slot works
      best.
    </p>
  );
}
