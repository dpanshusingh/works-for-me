"use client";

import { AlertCircle, Check, Minus, Plus } from "lucide-react";
import {
  useId,
  useSyncExternalStore,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import {
  get,
  useController,
  useFormContext,
  type FieldError,
  type RegisterOptions,
} from "react-hook-form";
import { Input, Select, Textarea } from "@/components/ui/input";
import { todayISO } from "@/lib/dates";
import type { Option } from "@/lib/options";
import { cn } from "@/lib/utils";
import { normalizeIndianPhone } from "@/schemas/healthcare";

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function FormSection({
  step,
  title,
  description,
  children,
  className,
}: {
  step?: number;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0 border-t border-line pt-6 first:border-t-0 first:pt-0", className)}>
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-start gap-3">
        {step !== undefined && (
          <span
            aria-hidden
            className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-tint font-heading text-sm font-bold text-primary"
          >
            {step}
          </span>
        )}
        <div>
          <h3 className="text-base font-bold sm:text-lg">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Field shell                                                         */
/* ------------------------------------------------------------------ */

export function useFieldError(name: string) {
  const {
    formState: { errors },
  } = useFormContext();
  return get(errors, name) as FieldError | undefined;
}

export function ErrorText({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-red-600">
      <AlertCircle aria-hidden className="mt-0.5 size-3.5 shrink-0" />
      {message}
    </p>
  );
}

type ShellProps = {
  id: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function FieldShell({ id, label, required, hint, error, className, children }: ShellProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-500" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-slate-400">(optional)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-slate-500">
          {hint}
        </p>
      )}
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type BaseFieldProps = {
  name: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

export function TextField({
  name,
  label,
  required,
  hint,
  className,
  rules,
  ...inputProps
}: BaseFieldProps & {
  rules?: RegisterOptions;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  const id = useId();
  const { register } = useFormContext();
  const error = useFieldError(name)?.message;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={describedBy(id, error, hint)}
        {...inputProps}
        {...register(name, rules)}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  required,
  hint,
  className,
  ...props
}: BaseFieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const id = useId();
  const { register } = useFormContext();
  const error = useFieldError(name)?.message;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <Textarea
        id={id}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
        {...register(name)}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  required,
  hint,
  className,
  options,
  placeholder = "Select…",
  groups,
}: BaseFieldProps & {
  options?: readonly Option[];
  groups?: Record<string, readonly string[]>;
  placeholder?: string;
}) {
  const id = useId();
  const { register } = useFormContext();
  const error = useFieldError(name)?.message;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <Select
        id={id}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={describedBy(id, error, hint)}
        defaultValue=""
        {...register(name)}
      >
        <option value="" disabled={required}>
          {placeholder}
        </option>
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {groups &&
          Object.entries(groups).map(([group, values]) => (
            <optgroup key={group} label={group}>
              {values.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </optgroup>
          ))}
      </Select>
    </FieldShell>
  );
}

const noopSubscribe = () => () => {};

/** `min` comes from the browser's calendar only, so server and visitor time zones can't disagree. */
export function DateField(props: BaseFieldProps) {
  const min = useSyncExternalStore(noopSubscribe, todayISO, () => undefined);
  return <TextField type="date" min={min} {...props} />;
}

export function PhoneField({
  name,
  label,
  required,
  hint,
  className,
}: BaseFieldProps) {
  const id = useId();
  const { register } = useFormContext();
  const error = useFieldError(name)?.message;
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-line pr-3 pl-3.5 text-[15px] font-medium text-slate-500">
          +91
        </span>
        <Input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete={required ? "tel-national" : "off"}
          placeholder="98765 43210"
          className="pl-16"
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={describedBy(id, error, hint)}
          {...register(name, {
            setValueAs: (v: unknown) => (typeof v === "string" ? normalizeIndianPhone(v) : v),
          })}
        />
      </div>
    </FieldShell>
  );
}

/* ------------------------------------------------------------------ */
/* Choice cards (radio) and chips (checkbox list)                      */
/* ------------------------------------------------------------------ */

export function ChoiceCards({
  name,
  label,
  required,
  hint,
  options,
  columns = 2,
  className,
}: BaseFieldProps & { options: readonly Option[]; columns?: 1 | 2 | 3 | 4 }) {
  const id = useId();
  const { register } = useFormContext();
  const error = useFieldError(name)?.message;
  return (
    <div role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={describedBy(id, error, hint)} className={cn("min-w-0 sm:col-span-2", className)}>
      <p id={`${id}-label`} className="mb-2 text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden>
            *
          </span>
        )}
      </p>
      <div
        className={cn(
          "grid gap-2.5",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-3",
          columns === 4 && "grid-cols-2 lg:grid-cols-4",
        )}
      >
        {options.map((o) => (
          <label
            key={o.value}
            className="group relative flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-3.5 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary-tint has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/15"
          >
            <input type="radio" value={o.value} className="peer sr-only" {...register(name)} />
            <span
              aria-hidden
              className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 border-slate-300 transition-colors group-has-[:checked]:border-primary"
            >
              <span className="size-2 rounded-full bg-primary opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-slate-500">
          {hint}
        </p>
      )}
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  );
}

export function CheckboxChips({
  name,
  options,
  className,
  onToggle,
}: {
  name: string;
  options: readonly Option[];
  className?: string;
  onToggle?: (value: string, checked: boolean) => void;
}) {
  const { register } = useFormContext();
  const registration = register(name, {
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      onToggle?.(e.target.value, e.target.checked),
  });
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => (
        <label
          key={o.value}
          className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white py-2 pr-4 pl-3 text-sm font-medium text-slate-700 transition-colors select-none hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20"
        >
          <input type="checkbox" value={o.value} className="sr-only" {...registration} />
          <span
            aria-hidden
            className="flex size-4 items-center justify-center rounded-full border border-slate-300 bg-white text-primary group-has-[:checked]:border-white"
          >
            <Check className="size-3 opacity-0 group-has-[:checked]:opacity-100" strokeWidth={3} />
          </span>
          {o.label}
        </label>
      ))}
    </div>
  );
}

export function CheckboxField({
  name,
  label,
  description,
  className,
}: {
  name: string;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  const id = useId();
  const { register } = useFormContext();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-[18px] shrink-0 cursor-pointer rounded accent-primary"
        {...register(name)}
      />
      <label htmlFor={id} className="cursor-pointer text-sm leading-snug text-slate-700">
        <span className="font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-slate-500">{description}</span>}
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quantity stepper                                                    */
/* ------------------------------------------------------------------ */

export function QuantityStepper({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();
  const {
    field: { value, onChange, onBlur, ref },
  } = useController({ name, control });
  const qty = Number.isFinite(value) ? Number(value) : 1;
  const set = (n: number) => onChange(Math.max(1, Math.min(99, n)));
  return (
    <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-line bg-white">
      <button
        type="button"
        onClick={() => set(qty - 1)}
        disabled={qty <= 1}
        className="flex w-10 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-primary disabled:opacity-40"
        aria-label={`Decrease ${label}`}
      >
        <Minus className="size-4" />
      </button>
      <input
        ref={ref}
        type="number"
        inputMode="numeric"
        min={1}
        max={99}
        aria-label={label}
        value={qty}
        onBlur={onBlur}
        onChange={(e) => set(Number(e.target.value) || 1)}
        className="w-12 [appearance:textfield] border-x border-line text-center text-[15px] font-semibold focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => set(qty + 1)}
        disabled={qty >= 99}
        className="flex w-10 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-primary disabled:opacity-40"
        aria-label={`Increase ${label}`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
