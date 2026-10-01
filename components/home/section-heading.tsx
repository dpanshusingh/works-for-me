import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  id,
  title,
  description,
  className,
  as: Tag = "h2",
}: {
  id?: string;
  title: string;
  description?: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("reveal mx-auto max-w-2xl text-center", className)}>
      <Tag id={id} className="font-heading text-2xl font-bold tracking-wide uppercase sm:text-[28px]">{title}</Tag>
      <span aria-hidden className="mx-auto mt-3 block h-1 w-12 rounded-full bg-primary" />
      {description && <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">{description}</p>}
    </div>
  );
}
