import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ServiceArt } from "@/components/services/service-art";
import { buttonVariants } from "@/components/ui/button";
import type { Service } from "@/lib/services";
import { cn } from "@/lib/utils";

/**
 * Phones: a compact horizontal row (thumbnail + text + buttons) so more
 * services fit on screen. Tablets and up: the full vertical card.
 */
export function ServiceCard({ service, style }: { service: Service; style?: CSSProperties }) {
  const href = `/services/${service.slug}`;
  return (
    <article
      style={style}
      className="reveal group flex overflow-hidden rounded-xl border border-line bg-white shadow-card transition-all duration-300 hover:border-primary/20 hover:shadow-card-hover md:flex-col md:hover:-translate-y-1"
    >
      <Link href={href} tabIndex={-1} aria-hidden className="shrink-0 overflow-hidden p-3 pr-0 md:rounded-t-xl md:p-0">
        <ServiceArt service={service} size="thumb" className="size-[76px] rounded-xl md:hidden" />
        <ServiceArt service={service} className="hidden md:block" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-3 md:p-5">
        <h3 className="text-[15px] leading-snug font-bold md:text-[17px]">
          <Link href={href} className="transition-colors hover:text-primary">
            {service.title}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-2 flex-1 text-[13px] leading-snug text-slate-600 md:mt-1.5 md:line-clamp-none md:text-sm md:leading-relaxed">
          {service.tagline}
        </p>
        <div className="mt-2.5 flex gap-2 md:mt-5">
          <Link
            href={`${href}#book`}
            className={cn(buttonVariants({ size: "sm" }), "h-8 flex-1 px-3 text-[13px] md:h-9 md:text-sm")}
            aria-label={`Book ${service.title}`}
          >
            Book Now
          </Link>
          <Link
            href={href}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 flex-1 px-3 text-[13px] md:h-9 md:text-sm",
            )}
            aria-label={`Learn more about ${service.title}`}
          >
            Learn More <ArrowRight className="hidden sm:block" />
          </Link>
        </div>
      </div>
    </article>
  );
}
