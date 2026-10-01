import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { QuickBookDialog } from "@/components/booking/quick-book-dialog";
import { Footer } from "@/components/layout/footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { Navbar } from "@/components/layout/navbar";
import { TopBar } from "@/components/layout/top-bar";
import { services } from "@/lib/services";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Doorstep Healthcare in Goa | ${site.motto}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "home healthcare Goa",
    "doctor home visit Porvorim",
    "nursing care at home Goa",
    "elder care Goa",
    "medicine delivery Goa",
    "lab test at home Goa",
    "physiotherapy at home Goa",
    "medical equipment rental Goa",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.name,
    title: `${site.name} — ${site.motto}`,
    description: site.description,
  },
  formatDetection: { telephone: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#1e56a0",
  width: "device-width",
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: site.name,
  slogan: site.motto,
  description: site.description,
  url: site.url,
  telephone: site.phone.compact,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Porvorim",
    addressRegion: "Goa",
    addressCountry: "IN",
  },
  areaServed: { "@type": "State", name: "Goa" },
  availableService: services.map((s) => ({
    "@type": "MedicalProcedure",
    name: s.title,
    description: s.tagline,
  })),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <TopBar />
        <Navbar />
        <main id="main">
          {children}
        </main>
        <div className="bg-[#0f1b2d] pb-[calc(62px+env(safe-area-inset-bottom))] md:pb-0">
          <Footer />
        </div>
        <MobileActionBar />
        <QuickBookDialog />
        <Toaster position="top-center" richColors closeButton />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
