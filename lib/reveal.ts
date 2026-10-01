import type { CSSProperties } from "react";

/** Staggers scroll-reveal siblings (see `.reveal` in globals.css). */
export function revealDelay(index: number, step = 40): CSSProperties {
  return { "--reveal-delay": `${index * step}px` } as CSSProperties;
}
