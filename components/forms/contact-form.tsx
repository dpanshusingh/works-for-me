"use client";

import { FormSection, PhoneField, TextAreaField, TextField } from "@/components/forms/fields";
import { NameField } from "@/components/forms/patient-sections";
import { RequestForm } from "@/components/forms/request-form";

export function ContactForm() {
  return (
    <RequestForm
      kind="contact"
      submitLabel="Send Message"
      defaultValues={{ fullName: "", phone: "", email: "", message: "" }}
    >
      <FormSection title="Send us a message">
        <NameField label="Your Name" />
        <PhoneField name="phone" label="Mobile Number" required />
        <TextField name="email" type="email" label="Email Address" autoComplete="email" placeholder="you@example.com" />
        <TextAreaField
          name="message"
          label="How can we help?"
          required
          rows={5}
          placeholder="Tell us about the care or service you're looking for"
          className="sm:col-span-2"
        />
      </FormSection>
    </RequestForm>
  );
}
