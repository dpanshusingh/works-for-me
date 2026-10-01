import { Clock, Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/home/section-heading";
import { defaultWhatsappGreeting, site, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Call ${site.phone.display}, WhatsApp or email ${site.email}. Home Health Healer, ${site.location.label} — ${site.hours.display}.`,
  alternates: { canonical: "/contact" },
};

type Channel = {
  icon: typeof PhoneCall;
  title: string;
  value: string;
  note: string;
  href?: string;
  external?: boolean;
};

const channels: Channel[] = [
  {
    icon: PhoneCall,
    title: "Call For Appointment",
    value: site.phone.display,
    href: site.phone.tel,
    note: "Fastest way to book",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: site.phone.display,
    href: whatsappUrl(defaultWhatsappGreeting),
    note: "Send prescriptions & reports",
    external: true,
  },
  {
    icon: Mail,
    title: "Send us a Mail",
    value: site.email,
    href: `mailto:${site.email}`,
    note: "For invoices & general queries",
  },
  {
    icon: MapPin,
    title: "Our Location",
    value: site.location.label,
    href: site.location.mapLink,
    note: "Home visits & delivery across Goa",
    external: true,
  },
  {
    icon: Clock,
    title: "Working Hours",
    value: site.hours.display,
    note: "Indian Standard Time",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-primary-tint/70 to-white pt-14 pb-10 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <SectionHeading
            as="h1"
            title="Contact Us"
            description="Questions about a service, pricing or availability in your area? We're one call or message away."
          />
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:px-6">
          <div className="space-y-6">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {channels.map((c) => {
                const Icon = c.icon;
                const body = (
                  <>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-slate-500">{c.title}</span>
                      <span className="block truncate font-semibold text-ink">{c.value}</span>
                      <span className="block text-[13px] text-slate-500">{c.note}</span>
                    </span>
                  </>
                );
                const cardClass =
                  "group flex h-full items-start gap-3.5 rounded-xl border border-line bg-white p-4 shadow-card transition";
                return (
                  <li key={c.title}>
                    {c.href ? (
                      <a
                        href={c.href}
                        {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={`${cardClass} hover:border-primary/30`}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className={cardClass}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="overflow-hidden rounded-2xl border border-line shadow-card">
              <iframe
                title={`Map of ${site.location.label}`}
                src={site.location.mapEmbed}
                className="block h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8 lg:self-start">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
