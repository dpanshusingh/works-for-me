import { MessageCircle, MessageSquareHeart, Quote, Star } from "lucide-react";
import type { Metadata } from "next";
import { ReviewForm } from "@/components/forms/review-form";
import { CtaStrip } from "@/components/home/cta-strip";
import { SectionHeading } from "@/components/home/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { revealDelay } from "@/lib/reveal";
import { averageRating, reviews, type Review } from "@/lib/reviews";
import { serviceTitleByType } from "@/lib/services";
import { site, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Patient Reviews",
  description: `What patients and families say about ${site.name}'s doorstep healthcare in Goa — and share your own experience.`,
  alternates: { canonical: "/reviews" },
};

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={cn(
            "size-4",
            n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300",
          )}
        />
      ))}
    </span>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const month = new Date(`${review.date}-01T00:00:00`).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
  return (
    <figure
      style={revealDelay(index % 3)}
      className="reveal flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6"
    >
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        <Quote aria-hidden className="size-6 text-primary-tint" />
      </div>
      <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-700">“{review.text}”</blockquote>
      <figcaption className="mt-4 border-t border-line pt-3 text-sm">
        <span className="font-semibold text-ink">{review.name}</span>
        {review.locality && <span className="text-slate-500"> · {review.locality}</span>}
        <span className="mt-0.5 block text-[13px] text-slate-500">
          {review.service ? `${serviceTitleByType[review.service]} · ` : ""}
          {month}
        </span>
      </figcaption>
    </figure>
  );
}

export default function ReviewsPage() {
  const average = averageRating();

  return (
    <>
      <section className="bg-gradient-to-b from-primary-tint/70 to-white pt-14 pb-12 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <SectionHeading
            as="h1"
            title="Patient Reviews"
            description="Honest words from the patients and families we care for across Goa."
          />

          {reviews.length > 0 ? (
            <>
              <div className="reveal mx-auto mt-8 flex w-fit items-center gap-3 rounded-full bg-white px-5 py-2.5 shadow-card ring-1 ring-line">
                <span className="font-heading text-2xl font-extrabold text-ink">{average.toFixed(1)}</span>
                <Stars rating={average} className="[&_svg]:size-5" />
                <span className="text-sm text-slate-500">
                  {reviews.length} review{reviews.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {reviews.map((review, i) => (
                  <ReviewCard key={`${review.name}-${review.date}-${i}`} review={review} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="reveal mx-auto mt-10 max-w-xl rounded-2xl border border-dashed border-primary/30 bg-white p-8 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-tint text-primary">
                <MessageSquareHeart className="size-7" />
              </span>
              <h2 className="mt-4 text-lg font-bold">Reviews from our patients will appear here</h2>
              <p className="mt-2 text-[15px] text-slate-600">
                Had a home visit, a delivery or a lab test with us? Be one of the first to share your
                experience.
              </p>
              <a href="#write-review" className={cn(buttonVariants(), "mt-5")}>
                <Star /> Write a review
              </a>
            </div>
          )}
        </div>
      </section>

      <section id="write-review" className="border-t border-line bg-canvas py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6">
          <div className="reveal rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
            <h2 className="text-2xl font-bold">Share your experience</h2>
            <p className="mt-1.5 mb-8 text-[15px] text-slate-600">
              Your feedback helps other families choose care with confidence — and helps us improve.
            </p>
            <ReviewForm />
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="reveal rounded-2xl bg-primary p-6 text-white shadow-lg shadow-primary/25">
              <h3 className="font-heading text-lg font-bold text-white">Prefer to send a message?</h3>
              <p className="mt-1.5 text-sm text-blue-100">
                Send us a text or voice note on WhatsApp — we read every one.
              </p>
              <a
                href={whatsappUrl(`Hello ${site.name}, I'd like to share a review of your service: `)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "white" }), "mt-5 w-full")}
              >
                <MessageCircle /> Review on WhatsApp
              </a>
            </div>
            <p style={revealDelay(1)} className="reveal rounded-xl bg-white p-4 text-[13px] text-slate-600 ring-1 ring-line">
              We only publish reviews that patients agree to share, showing first names and areas — never
              phone numbers.
            </p>
          </aside>
        </div>
      </section>

      <CtaStrip />
    </>
  );
}
