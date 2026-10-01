"use client";

import { MessageCircle } from "lucide-react";
import { useBookingStore } from "@/lib/booking-store";
import { defaultWhatsappGreeting, site, whatsappUrl } from "@/lib/site";

/**
 * "BOOK AN APPOINTMENT ON …" strip. Dials the number on phones and
 * opens the Quick Book modal on desktop.
 */
export function CtaStrip() {
  const openBooking = useBookingStore((s) => s.openBooking);
  return (
    <section className="relative overflow-clip bg-gradient-to-br from-[#f1f5f9] via-primary-tint to-[#f1f5f9] py-14 sm:py-16">
      <svg aria-hidden className="absolute -top-10 -left-10 size-52 text-primary/5" viewBox="0 0 100 100">
        <path d="M38 0h24v38h38v24H62v38H38V62H0V38h38z" fill="currentColor" />
      </svg>
      <svg aria-hidden className="absolute -right-8 -bottom-12 size-56 text-secondary/10" viewBox="0 0 100 100">
        <path d="M38 0h24v38h38v24H62v38H38V62H0V38h38z" fill="currentColor" />
      </svg>
      <div className="reveal-zoom relative mx-auto max-w-4xl px-4 text-center">
        <a
          href={site.phone.tel}
          onClick={(e) => {
            const isPhone = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
            if (!isPhone) {
              e.preventDefault();
              openBooking();
            }
          }}
          className="group inline-block rounded-lg font-heading text-xl font-extrabold tracking-wide text-primary uppercase transition-colors hover:text-primary-hover sm:text-[28px]"
        >
          Book an appointment on <span className="whitespace-nowrap">{site.phone.compact}</span>
          <span aria-hidden className="mx-auto mt-4 flex h-1.5 w-20 overflow-hidden rounded-full transition-all duration-300 group-hover:w-28">
            <span className="h-full flex-1 bg-primary" />
            <span className="h-full flex-1 bg-secondary" />
          </span>
        </a>
        <p className="mt-5 text-[15px] text-slate-600">
          {site.hours.long} ·{" "}
          <a
            href={whatsappUrl(defaultWhatsappGreeting)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-secondary-strong hover:underline"
          >
            <MessageCircle className="size-4" /> or message us on WhatsApp
          </a>
        </p>
      </div>
    </section>
  );
}
