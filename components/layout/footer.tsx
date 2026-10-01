import { Clock, Mail, MapPin, MessageCircle, PhoneCall, Siren } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { revealDelay } from "@/lib/reveal";
import { services } from "@/lib/services";
import { defaultWhatsappGreeting, site, whatsappUrl } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-[#0f1b2d] text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-14 pb-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.6fr_1fr] lg:px-6">
        <div className="reveal">
          <div className="inline-block rounded-xl bg-white px-3 py-2.5">
            <Logo />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">{site.description}</p>
          <p className="mt-5 flex max-w-sm items-start gap-2.5 rounded-lg bg-red-500/10 px-3.5 py-3 text-[13px] text-red-200 ring-1 ring-red-400/20">
            <Siren className="mt-0.5 size-4 shrink-0 text-red-300" />
            <span>
              In a medical emergency, call <strong className="text-white">{site.emergencyNumber}</strong> for an
              ambulance or go to the nearest hospital.
            </span>
          </p>
        </div>

        <div className="reveal" style={revealDelay(1)}>
          <h2 className="font-heading text-sm font-bold tracking-wider text-white uppercase">Our Services</h2>
          <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="transition-colors hover:text-white">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal" style={revealDelay(2)}>
          <h2 className="font-heading text-sm font-bold tracking-wider text-white uppercase">Get in Touch</h2>
          <ul className="mt-4 space-y-3.5 text-sm">
            <li>
              <a href={site.phone.tel} className="flex items-start gap-3 hover:text-white">
                <PhoneCall className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                {site.phone.display}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl(defaultWhatsappGreeting)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-white"
              >
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                WhatsApp us
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-start gap-3 break-all hover:text-white">
                <Mail className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              {site.location.label} — home visits & delivery across Goa
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              {site.hours.long}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[13px] text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <p>
            © {new Date().getFullYear()} {site.name}. {site.motto}
          </p>
          <nav aria-label="Footer" className="flex gap-5">
            <Link href="/services" className="hover:text-white">
              Services
            </Link>
            <Link href="/reviews" className="hover:text-white">
              Reviews
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
