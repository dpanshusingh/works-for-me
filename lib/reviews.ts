import type { ServiceType } from "@/schemas/healthcare";

export type Review = {
  /** First name (and initial), as the patient agreed to show it. */
  name: string;
  locality?: string;
  service?: ServiceType;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** YYYY-MM */
  date: string;
};

/**
 * Published patient reviews, shown on /reviews.
 *
 * Only add reviews that real patients sent in (for example through the
 * "Share your experience" form) and agreed to publish. Newest first:
 *
 *   {
 *     name: "Maria F.",
 *     locality: "Porvorim",
 *     service: "nursing_elder_care",
 *     rating: 5,
 *     text: "What the patient wrote…",
 *     date: "2026-10",
 *   },
 */
export const reviews: Review[] = [];

export function averageRating(list: Review[] = reviews) {
  if (list.length === 0) return 0;
  return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
}
