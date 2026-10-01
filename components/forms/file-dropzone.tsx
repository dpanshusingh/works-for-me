"use client";

import { FileText, ImageIcon, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { useController, useFormContext } from "react-hook-form";
import { ErrorText, useFieldError } from "@/components/forms/fields";
import { cn, formatBytes } from "@/lib/utils";
import {
  ACCEPTED_UPLOAD_EXTENSIONS,
  ACCEPTED_UPLOAD_TYPES,
  isAcceptedUpload,
  MAX_UPLOAD_BYTES,
} from "@/schemas/healthcare";

const ACCEPT = [...ACCEPTED_UPLOAD_TYPES, ...ACCEPTED_UPLOAD_EXTENSIONS].join(",");

function validate(file: File) {
  if (!isAcceptedUpload(file)) return "Only PDF, JPG or PNG files are allowed";
  if (file.size > MAX_UPLOAD_BYTES) return "File must be 10 MB or smaller";
  return null;
}

/**
 * Drag & drop uploader (PDF / JPG / PNG, ≤ 10 MB) with image preview,
 * Replace and Remove. Stores the `File` in the form field `name`.
 */
export function FileDropzone({
  name,
  label,
  description,
  helper,
}: {
  name: string;
  label: string;
  description?: string;
  helper?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { control } = useFormContext();
  const {
    field: { value, onChange, ref },
  } = useController({ name, control });
  const fieldError = useFieldError(name)?.message;
  const error = localError ?? fieldError;
  const file = value instanceof File ? value : null;

  // Object URL for image previews, created when a file is picked and
  // revoked when it is replaced, removed or the component unmounts.
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const liveUrl = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (liveUrl.current) URL.revokeObjectURL(liveUrl.current);
    },
    [],
  );
  const previewUrl = preview && preview.file === file ? preview.url : null;

  const setFile = (next: File | null) => {
    if (liveUrl.current) URL.revokeObjectURL(liveUrl.current);
    const nextPreview = next?.type.startsWith("image/")
      ? { file: next, url: URL.createObjectURL(next) }
      : null;
    liveUrl.current = nextPreview?.url ?? null;
    setPreview(nextPreview);
    onChange(next);
  };

  const accept = (candidate: File | undefined) => {
    if (!candidate) return;
    const problem = validate(candidate);
    setLocalError(problem);
    if (!problem) setFile(candidate);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files?.[0]);
  };

  const browse = () => inputRef.current?.click();

  return (
    <div className="sm:col-span-2">
      <p id={`${id}-label`} className="mb-1.5 text-sm font-semibold text-slate-700">
        {label}
      </p>
      {description && <p className="-mt-1 mb-2.5 text-[13px] text-slate-500">{description}</p>}

      <input
        ref={(el) => {
          inputRef.current = el;
          ref(el);
        }}
        id={id}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {file ? (
        <div className="flex items-center gap-4 rounded-xl border border-secondary/40 bg-secondary-tint/60 p-3 sm:p-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-line bg-white sm:size-24">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img src={previewUrl} alt="Prescription preview" className="size-full object-cover" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 text-red-600">
                <FileText className="size-8" />
                <span className="text-[11px] font-bold tracking-wide">PDF</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink" title={file.name}>
              {file.name}
            </p>
            <p className="mt-0.5 text-[13px] text-slate-500">
              {formatBytes(file.size)} · ready to send
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={browse}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-[13px] font-semibold text-slate-700 hover:border-primary/40 hover:text-primary"
              >
                <RefreshCw className="size-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setLocalError(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-[13px] font-semibold text-red-600 hover:border-red-300 hover:bg-red-50"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={browse}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              browse();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          aria-labelledby={`${id}-label`}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
            dragging
              ? "border-primary bg-primary-tint"
              : error
                ? "border-red-300 bg-red-50/50"
                : "border-slate-300 bg-canvas hover:border-primary/50 hover:bg-primary-tint/50",
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <UploadCloud className="size-6" />
          </span>
          <p className="mt-3 text-sm font-semibold text-ink">
            <span className="text-primary">Click to upload</span> or drag & drop
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-500">
            <ImageIcon className="size-3.5" /> JPG, PNG or PDF · up to 10 MB
          </p>
        </div>
      )}

      {helper && !error && <p className="mt-2 text-[13px] text-slate-500">{helper}</p>}
      <ErrorText id={`${id}-error`} message={error ?? undefined} />
    </div>
  );
}
