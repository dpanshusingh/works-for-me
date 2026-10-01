"use client";

import { CalendarCheck, Phone, X } from "lucide-react";
import { AppointmentForm } from "@/components/forms/appointment-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBookingStore } from "@/lib/booking-store";
import { site } from "@/lib/site";

/** Universal Quick Appointment modal, mounted once in the root layout. */
export function QuickBookDialog() {
  const { open, setOpen, serviceType } = useBookingStore();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl" hideClose>
        <div className="sticky top-0 z-10 border-b border-line bg-white/95 px-5 pt-5 pb-4 backdrop-blur sm:px-8 sm:pt-7">
          <DialogClose
            className="absolute top-3.5 right-3.5 inline-flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
            aria-label="Close"
          >
            <X className="size-5" />
          </DialogClose>
          <div className="flex items-center gap-3 pr-10">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary">
              <CalendarCheck className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-heading text-lg font-bold sm:text-xl">Quick Book a Home Visit</DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Takes about a minute. Prefer to talk?{" "}
                <a href={site.phone.tel} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                  <Phone className="size-3.5" />
                  {site.phone.display}
                </a>
              </DialogDescription>
            </div>
          </div>
        </div>
        <div className="px-5 py-6 sm:px-8">
          {/* keyed so reopening for another service starts a fresh form */}
          <AppointmentForm key={serviceType ?? "any"} serviceType={serviceType} chooseService />
        </div>
      </DialogContent>
    </Dialog>
  );
}
