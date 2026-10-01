import { ArrowRight, BadgeCheck, CalendarPlus, Home, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { OpenBookingButton } from "@/components/booking/open-booking-button";
import { HeroBackdrop } from "@/components/home/hero-backdrop";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const contacts = [
  { icon: Mail, label: "Send us a Mail", value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: "Call Us Directly", value: site.phone.display, href: site.phone.tel, primary: true },
  {
    icon: MapPin,
    label: "Our Location",
    value: site.location.label,
    href: site.location.mapLink,
    external: true,
  },
];

const assurances = [
  { icon: BadgeCheck, label: "Expert & trained partners" },
  { icon: Home, label: "Care at your doorstep" },
  { icon: MessageCircle, label: "Instant WhatsApp confirmation" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-granite">
      <HeroBackdrop className="absolute inset-0 -z-20 size-full" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[rgba(15,23,42,0.65)]" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[rgba(15,23,42,0.55)] to-transparent"
      />

      <div className="mx-auto flex min-h-[540px] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center sm:min-h-[600px] lg:min-h-[660px] lg:py-28">
        <h1 className="animate-fade-up font-heading text-[2.15rem] leading-[1.08] font-extrabold tracking-tight text-white uppercase [animation-delay:80ms] sm:text-5xl lg:text-[3.6rem]">
          Medical services that you can trust
        </h1>

        <p className="animate-fade-up mt-5 max-w-3xl text-base leading-relaxed text-slate-200 [animation-delay:160ms] sm:text-lg">
          With our expert and trained service partners, we provide a range of medical services from doctor
          consultation, nursing care, physiotherapy, and lab tests to name a few at your doorstep on one phone call.
        </p>

        <div className="animate-fade-up mt-9 flex w-full flex-col items-stretch justify-center gap-3 [animation-delay:240ms] sm:w-auto sm:flex-row sm:items-center">
          <OpenBookingButton size="lg" className="h-[52px] px-7 shadow-lg shadow-primary/30">
            <CalendarPlus /> Book Doorstep Service
          </OpenBookingButton>
          <Link
            href="/services/medicine-delivery#book"
            className={cn(buttonVariants({ variant: "outline-white", size: "lg" }), "h-[52px] px-7")}
          >
            Order Prescription Medicines <ArrowRight />
          </Link>
        </div>

        <ul className="animate-fade-up mt-9 flex flex-col items-center gap-4 [animation-delay:320ms] md:flex-row md:gap-12">
          {contacts.map(({ icon: Icon, label, value, href, external, primary }) => (
            <li key={label} className={cn("flex justify-center", primary && "order-first md:order-none")}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group inline-flex min-w-0 items-center gap-3 text-white"
              >
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full shadow-lg transition-transform group-hover:scale-105",
                    primary
                      ? "size-12 bg-secondary-strong ring-4 ring-emerald-400/20"
                      : "size-10 bg-white/10 ring-1 ring-white/25 backdrop-blur-sm",
                  )}
                >
                  <Icon className={primary ? "size-5" : "size-[18px]"} />
                </span>
                <span className="min-w-0 text-left leading-tight">
                  <span className="block text-[13px] text-slate-300">{label}</span>
                  <span
                    className={cn(
                      "block font-semibold break-all sm:break-normal",
                      primary ? "font-heading text-lg font-bold tracking-wide" : "text-[15px] group-hover:underline",
                    )}
                  >
                    {value}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <ul className="animate-fade-up mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-slate-300 [animation-delay:400ms]">
          {assurances.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1.5">
              <Icon className="size-4 text-emerald-300" /> {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
