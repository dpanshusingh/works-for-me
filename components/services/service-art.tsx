import { BadgeCheck, Clock3 } from "lucide-react";
import Image from "next/image";
import { ServiceIcon } from "@/components/services/service-icon";
import type { Service } from "@/lib/services";
import { cn } from "@/lib/utils";

const tones: Record<Service["tone"], { from: string; to: string; ink: string }> = {
  blue: { from: "#1e56a0", to: "#4f8fe0", ink: "#1e56a0" },
  emerald: { from: "#047857", to: "#34d399", ink: "#047857" },
  sky: { from: "#0369a1", to: "#56c1f0", ink: "#0369a1" },
  teal: { from: "#0f766e", to: "#3fd8c2", ink: "#0f766e" },
  indigo: { from: "#3a3fa8", to: "#7c83f0", ink: "#3a3fa8" },
  cyan: { from: "#0e7490", to: "#3fd3ea", ink: "#0e7490" },
};

/**
 * 4:3 artwork for a service. Uses `service.photo` when provided,
 * otherwise an illustrated composition in the service's tone.
 */
export function ServiceArt({
  service,
  size = "card",
  priority,
  className,
}: {
  service: Service;
  size?: "card" | "hero";
  priority?: boolean;
  className?: string;
}) {
  const tone = tones[service.tone];
  const hero = size === "hero";

  if (service.photo) {
    return (
      <div className={cn("relative aspect-[4/3] overflow-hidden bg-slate-100", className)}>
        <Image
          src={service.photo}
          alt={service.photoBrief}
          fill
          priority={priority}
          sizes={hero ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${service.title} illustration`}
      className={cn("relative aspect-[4/3] overflow-hidden", className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${tone.from} 0%, ${tone.to} 100%)` }}
    >
      <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
        {/* soft shapes */}
        <svg aria-hidden className="absolute inset-0 size-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id={`dots-${service.slug}`} width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="white" fillOpacity="0.28" />
            </pattern>
            <radialGradient id={`glow-${service.slug}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.35" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="352" cy="38" r="96" fill="white" fillOpacity="0.09" />
          <circle cx="40" cy="282" r="110" fill="white" fillOpacity="0.07" />
          <rect x="18" y="18" width="96" height="70" fill={`url(#dots-${service.slug})`} />
          <rect x="296" y="214" width="90" height="70" fill={`url(#dots-${service.slug})`} />
          <circle cx="200" cy="150" r="118" fill={`url(#glow-${service.slug})`} />
          <circle cx="200" cy="150" r="86" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="4 7" />
          {/* medical plus marks */}
          <path d="M330 120h14M337 113v14" stroke="white" strokeOpacity="0.45" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M62 132h10M67 127v10" stroke="white" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
        </svg>

        {/* icon tile */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "flex items-center justify-center rounded-[28%] bg-white shadow-[0_18px_40px_-12px_rgb(15_23_42/0.45)]",
              hero ? "size-36 sm:size-44" : "aspect-square w-[27%] min-w-20",
            )}
          >
            <ServiceIcon name={service.icon} className="size-1/2" style={{ color: tone.ink }} strokeWidth={1.6} />
          </div>
        </div>

        {/* floating chips */}
        <span
          className={cn(
            "absolute top-[11%] left-[6%] inline-flex items-center gap-1.5 rounded-full bg-white/95 font-semibold text-slate-700 shadow-md",
            hero ? "px-3.5 py-2 text-sm" : "px-2.5 py-1 text-[11px]",
          )}
        >
          <BadgeCheck className={hero ? "size-4" : "size-3.5"} style={{ color: tone.ink }} />
          {service.artChips[0]}
        </span>
        <span
          className={cn(
            "absolute right-[6%] bottom-[11%] inline-flex items-center gap-1.5 rounded-full bg-white/95 font-semibold text-slate-700 shadow-md",
            hero ? "px-3.5 py-2 text-sm" : "px-2.5 py-1 text-[11px]",
          )}
        >
          <Clock3 className={hero ? "size-4" : "size-3.5"} style={{ color: tone.ink }} />
          {service.artChips[1]}
        </span>
      </div>
    </div>
  );
}
