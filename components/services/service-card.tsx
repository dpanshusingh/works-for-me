import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ServiceArt } from "@/components/services/service-art";
import { buttonVariants } from "@/components/ui/button";
import type { CSSProperties } from "react";
import type { Service } from "@/lib/services";
import { cn } from "@/lib/utils";

export function ServiceCard({ service, style }: { service: Service; style?: CSSProperties }) {
  const href = `/services/${service.slug}`;
  return (
    <article style={style} className="reveal group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-card-hover">
      <Link href={href} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-t-xl">
        <ServiceArt service={service} />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[17px] font-bold">
          <Link href={href} className="transition-colors hover:text-primary">
            {service.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{service.tagline}</p>
        <div className="mt-5 flex gap-2">
          <Link
            href={`${href}#book`}
            className={cn(buttonVariants({ size: "sm" }), "flex-1")}
            aria-label={`Book ${service.title}`}
          >
            Book Now
          </Link>
          <Link
            href={href}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
            aria-label={`Learn more about ${service.title}`}
          >
            Learn More <ArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
}
