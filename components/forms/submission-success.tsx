"use client";

import { CheckCircle2, ClipboardCopy, Copy, MessageCircle, Paperclip, Phone, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { site, whatsappUrl } from "@/lib/site";
import { copyText } from "@/lib/submit-request";
import type { RequestSummary } from "@/lib/summaries";
import { cn } from "@/lib/utils";

export type SubmissionResult = {
  summary: RequestSummary;
  text: string;
  copied: boolean;
  forwarded: boolean;
};

export function SubmissionSuccess({
  result,
  onReset,
  title = "Your request is ready",
}: {
  result: SubmissionResult;
  onReset: () => void;
  title?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(result.copied);
  const { summary, text, forwarded } = result;

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const copy = async () => {
    const ok = await copyText(text);
    setCopied(ok);
    if (ok) toast.success("Summary copied", { description: "Paste it into WhatsApp, SMS or email." });
    else toast.error("Couldn't copy automatically — please use the WhatsApp button.");
  };

  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-live="polite"
      className="animate-fade-up scroll-mt-28 rounded-2xl border border-secondary/30 bg-gradient-to-b from-secondary-tint to-white p-5 focus:outline-none sm:p-8"
    >
      <div className="flex flex-col items-center text-center">
        <span className="flex size-16 animate-pop items-center justify-center rounded-full bg-secondary-strong text-white shadow-lg shadow-secondary/30">
          <CheckCircle2 className="size-9" />
        </span>
        <h3 className="mt-4 text-xl font-bold sm:text-2xl">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">
          Reference{" "}
          <span className="rounded-md bg-white px-2 py-0.5 font-mono font-semibold tracking-wider text-primary ring-1 ring-line">
            {summary.reference}
          </span>
        </p>
        <p className="mt-3 max-w-md text-[15px] text-slate-600">
          {forwarded
            ? `We've received it and our care team will call you to confirm. For the fastest confirmation, also send it on WhatsApp.`
            : `Send it to us on WhatsApp — the message is already written for you. Our team confirms between ${site.hours.display}.`}
        </p>

        <div className="mt-6 flex w-full flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
          <a
            href={whatsappUrl(text)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "whatsapp", size: "lg" }), "w-full sm:w-auto")}
          >
            <MessageCircle /> Send via WhatsApp to {site.phone.compact}
          </a>
          <Button variant="outline" size="lg" onClick={copy} className="w-full sm:w-auto">
            {copied ? <ClipboardCopy /> : <Copy />}
            {copied ? "Summary copied" : "Copy summary"}
          </Button>
        </div>

        {summary.notes.length > 0 && (
          <p className="mt-4 flex max-w-md items-start gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-left text-[13px] text-amber-900 ring-1 ring-amber-200">
            <Paperclip className="mt-0.5 size-4 shrink-0" />
            <span>
              Files can&apos;t be sent automatically — please attach them in the WhatsApp chat after the
              message opens.
            </span>
          </p>
        )}
      </div>

      <details className="group mt-7 rounded-xl border border-line bg-white" open>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
          Review your request
          <span className="text-xs font-medium text-primary group-open:hidden">Show</span>
          <span className="hidden text-xs font-medium text-primary group-open:inline">Hide</span>
        </summary>
        <div className="grid gap-x-6 gap-y-5 border-t border-line px-4 py-4 sm:grid-cols-2">
          {summary.sections.map((section) => (
            <div key={section.title} className="min-w-0">
              <h4 className="mb-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
                {section.title}
              </h4>
              <dl className="space-y-1 text-sm">
                {section.rows.map(([label, value]) => (
                  <div key={`${label}-${value}`} className="flex gap-2">
                    <dt className="shrink-0 text-slate-500">{label}</dt>
                    <dd className="min-w-0 font-medium break-words text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </details>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
        <a href={site.phone.tel} className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
          <Phone className="size-4" /> Prefer to talk? Call {site.phone.display}
        </a>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw /> Submit another request
        </Button>
      </div>
    </div>
  );
}
