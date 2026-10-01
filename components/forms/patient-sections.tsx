"use client";

import { PhoneField, SelectField, TextField } from "@/components/forms/fields";
import { GENDERS, GOA_LOCALITIES } from "@/lib/options";

export function NameField({ label = "Patient's Full Name" }: { label?: string }) {
  return (
    <TextField
      name="fullName"
      label={label}
      required
      autoComplete="name"
      placeholder="e.g. Maria Fernandes"
      className="sm:col-span-2"
    />
  );
}

/** Name, age and gender of the person receiving care. */
export function PatientBasics() {
  return (
    <>
      <NameField />
      <TextField
        name="patientAge"
        label="Patient's Age"
        required
        type="number"
        inputMode="numeric"
        min={1}
        max={120}
        placeholder="e.g. 68"
      />
      <SelectField name="patientGender" label="Gender" required options={GENDERS} />
    </>
  );
}

export function ContactFields() {
  return (
    <>
      <PhoneField name="phone" label="Mobile Number" required hint="We'll confirm on this number & WhatsApp" />
      <PhoneField name="alternatePhone" label="Alternate / Caregiver Number" />
      <TextField
        name="email"
        type="email"
        label="Email Address"
        autoComplete="email"
        placeholder="you@example.com"
        hint="For invoices and reports"
        className="sm:col-span-2"
      />
    </>
  );
}

export function AddressFields() {
  return (
    <>
      <TextField
        name="addressLine"
        label="House / Flat No., Building, Street"
        required
        autoComplete="street-address"
        placeholder="e.g. Flat 204, Sunrise Residency, Alto Porvorim"
        className="sm:col-span-2"
      />
      <TextField name="landmark" label="Landmark" placeholder="e.g. Near Holy Family Church" />
      <SelectField
        name="locality"
        label="Town / City / Village"
        required
        placeholder="Select locality in Goa"
        groups={GOA_LOCALITIES}
      />
      <TextField
        name="pincode"
        label="PIN Code"
        required
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={6}
        placeholder="403521"
        hint="Goa PIN codes start with 403"
      />
    </>
  );
}

/** Shared defaults for every form built on PatientInfoSchema. */
export const patientDefaults = {
  fullName: "",
  phone: "",
  alternatePhone: "",
  email: "",
  addressLine: "",
  landmark: "",
  locality: "",
  pincode: "",
};
