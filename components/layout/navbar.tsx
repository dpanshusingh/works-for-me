"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowRight, CalendarPlus, ChevronDown, Menu, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { ServiceIcon } from "@/components/services/service-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useBookingStore } from "@/lib/booking-store";
import { services } from "@/lib/services";
import { defaultWhatsappGreeting, site, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/services/medicine-delivery", label: "Medicine Delivery", badge: "Express" },
  { href: "/services/lab-test", label: "Book Lab Test" },
  { href: "/contact", label: "Contact Us" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
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
          <Link href="/" className={linkClass(pathname === "/")} aria-current={pathname === "/" ? "page" : undefined}>
            Home
          </Link>
          <ServicesMenu active={pathname.startsWith("/services") && !links.some((l) => l.href !== "/" && pathname === l.href)} />
          {links.slice(1).map((link) => {
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

function ServicesMenu({ active }: { active: boolean }) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={cn(
          "group inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] font-medium outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary data-[state=open]:text-primary",
          active ? "text-primary" : "text-slate-700",
        )}
      >
        Services
        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="center"
          sideOffset={14}
          className="z-50 w-[640px] animate-fade-in rounded-2xl border border-line bg-white p-3 shadow-2xl shadow-slate-900/10"
        >
          <div className="grid grid-cols-2 gap-1">
            {services.map((service) => (
              <DropdownMenu.Item key={service.slug} asChild>
                <Link
                  href={`/services/${service.slug}`}
                  className="flex items-start gap-3 rounded-xl p-2.5 outline-none transition-colors hover:bg-primary-tint data-[highlighted]:bg-primary-tint"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
                    <ServiceIcon name={service.icon} className="size-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{service.title}</span>
                    <span className="line-clamp-1 text-[12.5px] text-slate-500">{service.tagline}</span>
                  </span>
                </Link>
              </DropdownMenu.Item>
            ))}
          </div>
          <DropdownMenu.Separator className="my-2 h-px bg-line" />
          <DropdownMenu.Item asChild>
            <Link
              href="/services"
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-primary outline-none hover:bg-primary-tint data-[highlighted]:bg-primary-tint"
            >
              View all services <ArrowRight className="size-4" />
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
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
            <details className="group mt-1" open={pathname.startsWith("/services")}>
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-3 text-[15px] font-semibold text-ink hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                All Services
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="ml-3 border-l border-line pl-2">
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                      pathname === `/services/${service.slug}` ? "font-semibold text-primary" : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    <ServiceIcon name={service.icon} className="size-4 text-primary" />
                    {service.title}
                  </Link>
                ))}
              </div>
            </details>
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
