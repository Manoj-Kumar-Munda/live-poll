import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  href?: string;
};

export function BrandLogo({ className, href = "/" }: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-text-primary",
        className,
      )}
    >
      <span
        className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--electric-glow)]"
        aria-hidden="true"
      >
        <span className="absolute h-3 w-3 rounded-full bg-white/90" />
        <span className="absolute h-5 w-5 rounded-full border-2 border-white/40" />
        <span className="absolute h-7 w-7 rounded-full border border-white/25" />
      </span>
      LivePoll
    </Link>
  );
}
