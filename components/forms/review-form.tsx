"use client";

import { Star } from "lucide-react";
import { useId } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  CheckboxField,
  ErrorText,
  FormSection,
  PhoneField,
  SelectField,
  TextAreaField,
  TextField,
  useFieldError,
} from "@/components/forms/fields";
import { NameField } from "@/components/forms/patient-sections";
import { RequestForm } from "@/components/forms/request-form";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

const serviceOptions = services.map((s) => ({ value: s.type, label: s.title }));
const ratingWords = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export function ReviewForm() {
  return (
    <RequestForm
      kind="review"
      submitLabel="Submit Review"
      successTitle="Thank you for your review!"
      defaultValues={{ fullName: "", phone: "", locality: "", review: "", consentToPublish: true }}
    >
      <FormSection title="Your experience">
        <StarRating />
        <SelectField
          name="serviceType"
          label="Service you used"
          required
          options={serviceOptions}
          placeholder="Choose a service"
          className="sm:col-span-2"
        />
        <TextAreaField
          name="review"
          label="Your review"
          required
          rows={5}
          maxLength={1000}
          placeholder="How was the visit, delivery or care? What stood out?"
          className="sm:col-span-2"
        />
      </FormSection>

      <FormSection title="About you" description="Your phone number is only used to verify the review — it is never published.">
        <NameField label="Your Name" />
        <PhoneField name="phone" label="Mobile Number" required />
        <TextField name="locality" label="Area / Locality" placeholder="e.g. Porvorim" />
        <CheckboxField
          name="consentToPublish"
          label="You may show my first name, area and review on this website"
          description="Untick to send it as private feedback only."
          className="sm:col-span-2"
        />
      </FormSection>
    </RequestForm>
  );
}

function StarRating() {
  const id = useId();
  const { register } = useFormContext();
  const value = Number(useWatch({ name: "rating" })) || 0;
  const error = useFieldError("rating")?.message;
  return (
    <div className="sm:col-span-2">
      <p id={`${id}-label`} className="mb-2 text-sm font-semibold text-slate-700">
        Your rating <span className="text-red-500">*</span>
      </p>
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="cursor-pointer rounded-md p-0.5 transition-transform hover:scale-110 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
          >
            <input type="radio" value={n} className="sr-only" {...register("rating")} />
            <span className="sr-only">
              {n} star{n > 1 ? "s" : ""} — {ratingWords[n]}
            </span>
            <Star
              aria-hidden
              className={cn(
                "size-9 transition-colors",
                n <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300",
              )}
            />
          </label>
        ))}
        <span className="ml-2 text-sm font-medium text-slate-600">{ratingWords[value]}</span>
      </div>
      <ErrorText message={error} />
    </div>
  );
}
