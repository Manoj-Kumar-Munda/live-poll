import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  className?: string;
};

const variants = {
  primary:
    "bg-electric text-white shadow-[0_0_24px_-4px_var(--electric-glow)] hover:brightness-110",
  secondary:
    "bg-surface-raised border border-border text-text-primary hover:border-electric/50",
  ghost: "text-text-secondary hover:text-text-primary",
};

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`pressable inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-[filter,border-color,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
