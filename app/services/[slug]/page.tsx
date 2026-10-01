import { CalendarPlus, Check, ChevronRight, Clock, MessageCircle, Phone, ShieldCheck, Siren } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaStrip } from "@/components/home/cta-strip";
import { ServiceForm } from "@/components/forms/service-form";
import { ServiceArt } from "@/components/services/service-art";
import { ServiceCard } from "@/components/services/service-card";
import { buttonVariants } from "@/components/ui/button";
import { revealDelay } from "@/lib/reveal";
import { getService, services } from "@/lib/services";
import { site, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return {
    title: `${service.title} at Home in Goa`,
    description: `${service.tagline} ${service.description}`.slice(0, 300),
    alternates: { canonical: `/services/${service.slug}` },
  };
}

const nextSteps = [
  "You'll get a reference number and a ready-made WhatsApp message.",
  "Our care team calls you back to confirm the details and timing.",
  "A trained professional visits, or your order is delivered.",
];

export default async function ServicePage({ params }: Props) {
  const service = getService((await params).slug);
  if (!service) notFound();

  const related = services
    .filter((s) => s.slug !== service.slug)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .slice(0, 3);

  return (
    <>
      {/* Header */}
      <section className="relative overflow-clip bg-gradient-to-b from-primary-tint/70 to-white">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-14 lg:px-6 lg:pb-20">
          <nav aria-label="Breadcrumb" className="mb-8 text-[13px] text-slate-500">
            <ol className="flex flex-wrap items-center gap-1">
              <li className="flex items-center gap-1">
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
                <ChevronRight className="size-3.5" aria-hidden />
              </li>
              <li className="flex items-center gap-1">
                <Link href="/services" className="hover:text-primary">
                  Services
                </Link>
                <ChevronRight className="size-3.5" aria-hidden />
              </li>
              <li aria-current="page" className="font-medium text-ink">
                {service.title}
              </li>
            </ol>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div className="reveal-left">
              <p className="text-[13px] font-bold tracking-widest text-secondary-strong uppercase">
                At-home service · Goa
              </p>
              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                {service.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-[17px]">{service.description}</p>

              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[15px] text-slate-700">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary-tint text-secondary-strong">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {service.idealFor.map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-slate-600 ring-1 ring-line">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#book" className={cn(buttonVariants({ size: "lg" }))}>
                  <CalendarPlus /> Book Now
                </a>
                <a href={site.phone.tel} className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                  <Phone /> {site.phone.display}
                </a>
              </div>
            </div>

            <ServiceArt service={service} size="hero" priority className="reveal-right rounded-2xl shadow-2xl shadow-primary/20" />
          </div>
        </div>
      </section>

      {/* Booking form */}
      <section id="book" className="overflow-x-clip border-t border-line bg-canvas py-14 sm:py-20" aria-labelledby="form-heading">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6">
          <div className="reveal rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
            <h2 id="form-heading" className="text-2xl font-bold">
              {service.formTitle}
            </h2>
            <p className="mt-1.5 mb-8 text-[15px] text-slate-600">
              Fill in the details below — fields marked <span className="text-red-500">*</span> are required.
            </p>
            <ServiceForm slug={service.slug} />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="reveal-right rounded-2xl bg-primary p-6 text-white shadow-lg shadow-primary/25">
              <h3 className="font-heading text-lg font-bold text-white">Need help booking?</h3>
              <p className="mt-1.5 text-sm text-blue-100">Talk to our care team — we&apos;ll fill it in for you.</p>
              <div className="mt-5 space-y-2.5">
                <a href={site.phone.tel} className={cn(buttonVariants({ variant: "white" }), "w-full")}>
                  <Phone /> {site.phone.display}
                </a>
                <a
                  href={whatsappUrl(`Hello Home Health Healer, I'd like to book: ${service.title}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline-white" }), "w-full")}
                >
                  <MessageCircle /> WhatsApp us
                </a>
              </div>
              <p className="mt-4 flex items-center gap-2 text-[13px] text-blue-100">
                <Clock className="size-4" /> {site.hours.long}
              </p>
            </div>

            <div style={revealDelay(1)} className="reveal-right rounded-2xl border border-line bg-white p-6">
              <h3 className="flex items-center gap-2 text-base font-bold">
                <ShieldCheck className="size-5 text-secondary-strong" /> What happens next
              </h3>
              <ol className="mt-4 space-y-3.5">
                {nextSteps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-slate-600">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-tint text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <p style={revealDelay(2)} className="reveal-right flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-[13px] text-red-800 ring-1 ring-red-200">
              <Siren className="mt-0.5 size-4 shrink-0 text-red-600" />
              Medical emergency? Call {site.emergencyNumber} for an ambulance or go to the nearest hospital.
            </p>
          </aside>
        </div>
      </section>

      {/* Related */}
      <section className="py-16 sm:py-20" aria-labelledby="related-heading">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="reveal flex items-end justify-between gap-4">
            <h2 id="related-heading" className="text-2xl font-bold">
              Other services
            </h2>
            <Link href="/services" className="text-sm font-semibold text-primary hover:underline">
              View all 12 services →
            </Link>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((s, i) => (
              <ServiceCard key={s.slug} service={s} style={revealDelay(i)} />
            ))}
          </div>
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
