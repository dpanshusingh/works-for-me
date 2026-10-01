import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("size-11", className)}>
      {/* embracing emerald swoosh */}
      <path
        d="M5.5 21.5C5.5 34 14.6 43.5 26 43.5c7.6 0 13.6-3.8 16.8-10"
        fill="none"
        stroke="#10b981"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      {/* caring figure: head + raised arms */}
      <circle cx="24" cy="8.6" r="4.6" fill="#1e56a0" />
      <path
        d="M9.5 13.5 22.6 33.2c.7 1 2.2 1 2.9-.1L40.5 9"
        fill="none"
        stroke="#1e56a0"
        strokeWidth="5.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* medical cross */}
      <g transform="translate(36.2 25.6)">
        <rect x="-6.2" y="-6.2" width="12.4" height="12.4" rx="3.2" fill="white" />
        <path d="M0-4v8M-4 0h8" stroke="#059669" strokeWidth="3.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label={`${site.name} — home`}>
      <LogoMark className="shrink-0 transition-transform duration-300 group-hover:-rotate-6" />
      <span className="leading-none">
        <span
          className={cn(
            "block font-heading text-[17px] font-extrabold tracking-[0.01em] uppercase [word-spacing:0.12em] sm:text-lg",
            inverted ? "text-white" : "text-primary",
          )}
        >
          Home Health Healer
        </span>
        <span
          className={cn(
            "mt-1 block text-[12.5px] font-semibold",
            inverted ? "text-emerald-300" : "text-secondary-strong",
          )}
        >
          {site.motto}
        </span>
      </span>
    </Link>
  );
}
