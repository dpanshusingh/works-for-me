"use client";

import { CalendarPlus, Menu, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useBookingStore } from "@/lib/booking-store";
import { defaultWhatsappGreeting, site, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/services/medicine-delivery", label: "Medicine Delivery", badge: "Express" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact Us" },
] as const;

const ownLinkPages = new Set<string>(links.map((l) => l.href));

function isActive(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  if (href === "/") return path === "/";
  // "Services" covers every service page except those with their own menu link.
  if (href === "/services") return path.startsWith(href) && (path === href || !ownLinkPages.has(path));
  return path.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const openBooking = useBookingStore((s) => s.openBooking);
  const linkClass = (active: boolean) =>
    cn(
      "relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-medium transition-colors hover:text-primary",
      active ? "text-primary" : "text-slate-700",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 lg:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} className={linkClass(active)} aria-current={active ? "page" : undefined}>
                {link.label}
                {"badge" in link && (
                  <span className="rounded-full bg-secondary-tint px-2 py-0.5 text-[11px] font-bold tracking-wide text-secondary-strong ring-1 ring-secondary/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button onClick={() => openBooking()} className="hidden sm:inline-flex">
            <CalendarPlus /> Quick Book
          </Button>
          <MobileMenu pathname={pathname} />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const openBooking = useBookingStore((s) => s.openBooking);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-lg text-ink hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-6" />
      </button>
      <DialogContent side="right" aria-describedby={undefined}>
        <div className="flex h-full flex-col">
          <div className="border-b border-line px-5 py-4">
            <DialogTitle className="font-heading text-base font-bold">Menu</DialogTitle>
            <DialogDescription className="sr-only">Site navigation</DialogDescription>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-3">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-3 text-[15px] font-semibold",
                    active ? "bg-primary-tint text-primary" : "text-ink hover:bg-slate-50",
                  )}
                >
                  {link.label}
                  {"badge" in link && (
                    <span className="rounded-full bg-secondary-tint px-2 py-0.5 text-[11px] font-bold text-secondary-strong">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-2 border-t border-line p-4">
            <Button
              className="w-full"
              onClick={() => {
                close();
                openBooking();
              }}
            >
              <CalendarPlus /> Quick Book
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <a href={site.phone.tel} className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Phone /> Call
              </a>
              <a
                href={whatsappUrl(defaultWhatsappGreeting)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <MessageCircle /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
