import { Clock, Mail, MapPin, PhoneCall } from "lucide-react";
import { site } from "@/lib/site";

const items = [
  { icon: PhoneCall, label: "Call For Appointment", value: site.phone.compact, href: site.phone.tel },
  { icon: Mail, label: "Send us a Mail", value: site.email, href: `mailto:${site.email}` },
  { icon: MapPin, label: "Our Location", value: site.location.label, href: site.location.mapLink, external: true },
  { icon: Clock, label: "Working Hours", value: site.hours.display },
] as const;

export function TopBar() {
  return (
    <div className="border-b border-line bg-white text-ink">
      {/* desktop / tablet */}
      <div className="mx-auto hidden max-w-6xl grid-cols-4 gap-6 px-4 py-3 md:grid lg:px-6">
        {items.map((item) => {
          const Icon = item.icon;
          const body = (
            <>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon className="size-[18px]" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[13px] font-semibold text-slate-800">{item.label}</span>
                <span className="mt-0.5 block truncate text-[13px] text-slate-500">{item.value}</span>
              </span>
            </>
          );
          return "href" in item ? (
            <a
              key={item.label}
              href={item.href}
              {...("external" in item ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex min-w-0 items-center gap-3"
            >
              {body}
            </a>
          ) : (
            <div key={item.label} className="group flex min-w-0 items-center gap-3">
              {body}
            </div>
          );
        })}
      </div>

      {/* mobile: compact, swipeable, tap-to-call first */}
      <div className="no-scrollbar flex items-center gap-4 overflow-x-auto px-4 py-2 text-[13px] whitespace-nowrap md:hidden">
        <a href={site.phone.tel} className="inline-flex items-center gap-1.5 font-semibold text-primary">
          <PhoneCall className="size-3.5" /> {site.phone.display}
        </a>
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <Clock className="size-3.5 text-primary" /> {site.hours.display}
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <MapPin className="size-3.5 text-primary" /> {site.location.label}
        </span>
        <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 text-slate-600">
          <Mail className="size-3.5 text-primary" /> {site.email}
        </a>
      </div>
    </div>
  );
}
