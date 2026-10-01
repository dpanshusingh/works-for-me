import { SectionHeading } from "@/components/home/section-heading";
import { ServiceCard } from "@/components/services/service-card";
import { services, type Service } from "@/lib/services";
import { revealDelay } from "@/lib/reveal";
import { cn } from "@/lib/utils";

export function ServicesGrid({
  items = services,
  title = "Our Services",
  description = "Twelve kinds of care, one phone call away. Choose a service to book a visit, or call us and we'll guide you.",
  headingAs = "h2",
  className = "bg-white",
}: {
  items?: Service[];
  title?: string;
  description?: string;
  headingAs?: "h1" | "h2";
  className?: string;
}) {
  return (
    <section className={cn("py-16 sm:py-20", className)} aria-labelledby="services-heading">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <SectionHeading id="services-heading" title={title} description={description} as={headingAs} />
        <div className="mt-8 grid grid-cols-1 gap-3 md:mt-12 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {items.map((service, i) => (
            <ServiceCard key={service.slug} service={service} style={revealDelay(i % 3)} />
          ))}
        </div>
      </div>
    </section>
  );
}
