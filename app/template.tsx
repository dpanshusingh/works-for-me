import type { ReactNode } from "react";

/**
 * Templates re-mount on every navigation, so each page fades and rises
 * in as you move around the site (disabled for reduced-motion users by
 * the global rule in globals.css).
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
