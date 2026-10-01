# Home Health Healer

**You call. We heal.** — at-home healthcare portal for Porvorim and the rest of Goa.

Doctor consultations, nursing & elder care, trained attendants, physiotherapy, lab tests, medicine
delivery, nutrition, counselling, yoga, medical equipment, dental and diabetic care — each with its
own validated booking form and a one-click WhatsApp hand-off to **+91 99231 20649**.

## Tech stack

- **Next.js 16** (App Router, TypeScript, static pages + one API route)
- **Tailwind CSS 4** with the brand tokens in `app/globals.css`
- **Radix UI** primitives (dialog, dropdown menu) with shadcn-style components, **lucide-react** icons
- **react-hook-form** + **zod 4** — the same schemas validate in the browser and on the server
- **zustand** for the site-wide "Quick Book" modal
- **Vitest** unit tests for the schemas and WhatsApp summaries

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                     |
| ------------------- | -------------------------------- |
| `npm run dev`       | Development server               |
| `npm run build`     | Production build                 |
| `npm start`         | Serve the production build       |
| `npm run lint`      | ESLint (Next.js core-web-vitals) |
| `npm run typecheck` | TypeScript, no emit              |
| `npm test`          | Vitest unit tests                |

### Environment variables

Copy `.env.example` to `.env.local`.

| Variable               | Purpose                                                                                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BOOKING_WEBHOOK_URL`  | Optional. Every validated booking is POSTed here as JSON (Zapier, Make, n8n, Google Apps Script, a CRM…). Without it the server only logs the reference number and WhatsApp is the confirmation channel. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used for metadata, `sitemap.xml` and `robots.txt`. Defaults to `https://homehealthhealer.com`.                                                                                              |

## Pages

| Route                | Contents                                                                         |
| -------------------- | -------------------------------------------------------------------------------- |
| `/`                  | Hero (with email, call and location), how it works, "Book an appointment on…" strip |
| `/services`          | All 12 services as cards — the "Services" menu item opens this page             |
| `/services/[slug]`   | Service details + the matching booking form (12 static pages)                    |
| `/reviews`           | Published patient reviews (from `lib/reviews.ts`) and a "Share your experience" form |
| `/contact`           | Contact channels, map, enquiry form                                              |
| `POST /api/requests` | Re-validates a submission with its zod schema and forwards it to the webhook     |

Every page shares the sticky navbar (with Quick Book), a fade-in transition between pages, the footer
and — on phones — a fixed bottom bar with **Call Now**, **WhatsApp Order** and **Book Home Visit**.

## Forms

| Form                                    | Used by                                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| Prescription & Medicine Delivery        | Medicine delivery                                             |
| At-Home Lab Test Booking                | Lab test                                                      |
| Doctor Consultation & Home Visit        | Doctor consultation                                           |
| Equipment Rental & Purchase             | Medical equipment                                             |
| Nursing / Care Attendant Enquiry        | Nursing/Elder care, Trained attendants                        |
| Diabetic Care Plan                      | Diabetic care                                                 |
| General appointment                     | Physiotherapy, Nutrition, Counseling, Yoga, Dental            |
| Universal Quick Book modal              | "Quick Book", hero, mobile bar and CTA strip on every page    |
| Contact enquiry                         | Contact page                                                  |
| Patient review (star rating)            | Reviews page                                                  |

What happens on submit (`components/forms/request-form.tsx`):

1. The form is validated with its schema from `schemas/healthcare.ts`.
2. A reference such as `HHH-7K2P9Q` and a readable summary are built (`lib/summaries.ts`).
3. The summary is copied to the clipboard and posted to `/api/requests`.
4. The visitor sees a confirmation panel with **Send via WhatsApp to +919923120649** — a `wa.me`
   link pre-filled with the summary — plus "Copy summary" and the phone number.

Uploaded prescriptions and test slips (JPG/PNG/PDF, max 10 MB) stay in the browser: their names are
included in the message and the visitor is reminded to attach the file in the WhatsApp chat.

## Customising

- **Contact details, hours, location** — `lib/site.ts`
- **Services** (names, copy, inclusions, form used) — `lib/services.ts`
- **Reviews shown on /reviews** — `lib/reviews.ts` (starts empty: add only real reviews that patients
  agreed to publish, e.g. ones received through the review form)
- **Dropdown options** (Goa localities, tests, equipment, time slots…) — `lib/options.ts`
- **Validation rules** — `schemas/healthcare.ts`
- **Brand colours and fonts** — `@theme` block in `app/globals.css`, fonts in `app/layout.tsx`

### Service photos

Cards and service pages ship with illustrated artwork so the site works without stock photos. To use
real photography, add a 4:3 image to `public/images/services/` and set `photo` on the service in
`lib/services.ts`, e.g. `photo: "/images/services/lab-test.webp"`. Each service has a `photoBrief`
describing the shot to look for (also used as the image's alt text).

## Deployment

Any Node.js host that runs Next.js works; on Vercel, import the repository and set the environment
variables above.

### GitHub Pages (static preview)

```bash
npm run build:pages   # static site in out/, served from /works-for-me
```

Publish the contents of `out/` to the `gh-pages` branch and set **Settings → Pages → Build and
deployment → Deploy from a branch → `gh-pages` / root**. The site is then at
`https://dpanshusingh.github.io/works-for-me/`. Set `PAGES_BASE_PATH` if the repository is renamed.

GitHub Pages only serves static files, so `POST /api/requests` (and the webhook) is left out of
this build: forms validate as usual and go straight to the WhatsApp hand-off.
