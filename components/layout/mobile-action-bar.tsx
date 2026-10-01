"use client";

import { CalendarPlus, MessageCircle, Phone } from "lucide-react";
import { useBookingStore } from "@/lib/booking-store";
import { defaultWhatsappGreeting, site, whatsappUrl } from "@/lib/site";

/** Fixed bottom actions on small screens. */
export function MobileActionBar() {
  const openBooking = useBookingStore((s) => s.openBooking);
  const item =
    "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11.5px] font-semibold transition-colors";
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-10px_rgb(15_23_42/0.25)] backdrop-blur md:hidden"
    >
      <div className="flex">
        <a href={site.phone.tel} className={`${item} text-primary active:bg-primary-tint`}>
          <Phone className="size-5" /> Call Now
        </a>
        <a
          href={whatsappUrl(defaultWhatsappGreeting)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${item} border-x border-line text-secondary-strong active:bg-secondary-tint`}
        >
          <MessageCircle className="size-5" /> WhatsApp Order
        </a>
        <button type="button" onClick={() => openBooking()} className={`${item} bg-primary text-white active:bg-primary-hover`}>
          <CalendarPlus className="size-5" /> Book Home Visit
        </button>
      </div>
    </nav>
  );
}
