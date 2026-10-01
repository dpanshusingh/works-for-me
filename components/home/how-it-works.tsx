import { HeartPulse, MessageCircle, PhoneCall } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { revealDelay } from "@/lib/reveal";

const steps = [
  {
    icon: PhoneCall,
    title: "Call or book online",
    body: "Call us, WhatsApp us or fill a short form — upload a prescription if you have one.",
  },
  {
    icon: MessageCircle,
    title: "We confirm on WhatsApp",
    body: "Our care team gets back to you to confirm the details and a convenient time.",
  },
  {
    icon: HeartPulse,
    title: "Care at your doorstep",
    body: "A trained professional arrives at home, or your medicines and equipment are delivered.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-canvas py-16 sm:py-20" aria-labelledby="how-heading">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <SectionHeading id="how-heading" title="How It Works" description="Healthcare at home in three simple steps." />
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} style={revealDelay(i)} className="reveal relative rounded-2xl border border-line bg-white p-6 shadow-card">
                <span className="absolute top-5 right-6 font-heading text-5xl font-extrabold text-primary-tint select-none" aria-hidden>
                  0{i + 1}
                </span>
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/25">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
