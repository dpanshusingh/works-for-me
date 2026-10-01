"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Lock, Send } from "lucide-react";
import { useState, type ReactNode } from "react";
import { FormProvider, useForm, type DefaultValues, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { SubmissionSuccess, type SubmissionResult } from "@/components/forms/submission-success";
import { Button } from "@/components/ui/button";
import { copyText, postRequest } from "@/lib/submit-request";
import { buildSummary, createReference, summaryToText } from "@/lib/summaries";
import { cn } from "@/lib/utils";
import {
  requestSchemas,
  type RequestData,
  type RequestInput,
  type RequestKind,
} from "@/schemas/healthcare";

type RequestFormProps<K extends RequestKind> = {
  kind: K;
  defaultValues: DefaultValues<RequestInput<K>>;
  submitLabel: string;
  children: ReactNode;
  className?: string;
};

/**
 * Validates with the request's zod schema, then:
 * 1. builds a reference + readable summary,
 * 2. copies the summary to the clipboard,
 * 3. posts it to /api/requests,
 * 4. shows the WhatsApp hand-off panel.
 */
export function RequestForm<K extends RequestKind>({
  kind,
  defaultValues,
  submitLabel,
  children,
  className,
}: RequestFormProps<K>) {
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const methods = useForm<RequestInput<K>, unknown, RequestData<K>>({
    resolver: zodResolver(requestSchemas[kind] as never) as unknown as Resolver<
      RequestInput<K>,
      unknown,
      RequestData<K>
    >,
    defaultValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, submitCount },
  } = methods;

  const onValid = async (data: RequestData<K>) => {
    const reference = createReference();
    const summary = buildSummary(kind, data, reference);
    const text = summaryToText(summary);
    // Copy first, while the click still counts as a user gesture.
    const copied = await copyText(text);
    const { forwarded } = await postRequest(kind, reference, data);
    if (copied) toast.success("Request summary copied to clipboard");
    setResult({ summary, text, copied, forwarded });
  };

  if (result) {
    return (
      <SubmissionSuccess
        result={result}
        onReset={() => {
          reset(defaultValues);
          setResult(null);
        }}
      />
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleSubmit(onValid)} className={cn("space-y-8", className)}>
        {children}

        <div className="space-y-3 border-t border-line pt-6">
          {submitCount > 0 && errorCount > 0 && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200"
            >
              <AlertTriangle className="size-4 shrink-0" />
              Please check the {errorCount === 1 ? "field" : `${errorCount} fields`} highlighted above.
            </p>
          )}
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto sm:min-w-64">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
            {isSubmitting ? "Submitting…" : submitLabel}
          </Button>
          <p className="flex items-start gap-1.5 text-[13px] text-slate-500">
            <Lock className="mt-0.5 size-3.5 shrink-0" />
            Your details are used only to arrange your care. You&apos;ll get a ready-made WhatsApp
            message to confirm instantly.
          </p>
        </div>
      </form>
    </FormProvider>
  );
}
