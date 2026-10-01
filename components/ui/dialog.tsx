"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

type DialogContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  /** "center" for modals, "right" for a slide-in sheet. */
  side?: "center" | "right";
  children: ReactNode;
  hideClose?: boolean;
};

export function DialogContent({
  className,
  children,
  side = "center",
  hideClose,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-white shadow-2xl focus:outline-none",
          side === "center" &&
            "inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl data-[state=open]:animate-[fade-up_0.22s_ease-out_both] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
          side === "right" &&
            "inset-y-0 right-0 h-dvh w-[86%] max-w-sm overflow-y-auto data-[state=open]:animate-slide-in",
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            className="absolute top-3.5 right-3.5 inline-flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
            aria-label="Close"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
