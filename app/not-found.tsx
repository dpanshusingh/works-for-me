import { Home, Phone } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-heading text-6xl font-extrabold text-primary-tint">404</p>
      <h1 className="mt-2 text-2xl font-bold">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-slate-600">
        The page may have moved. Head back home, or call us and we&apos;ll help you directly.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonVariants()}>
          <Home /> Back to home
        </Link>
        <a href={site.phone.tel} className={buttonVariants({ variant: "outline" })}>
          <Phone /> {site.phone.display}
        </a>
      </div>
    </section>
  );
}
