import Link from "next/link";
import { LivePreview } from "@/modules/landing/components/live-preview";

type AuthShellProps = {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelSubtitle?: string;
  children: React.ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  panelTitle,
  panelSubtitle,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-svh bg-stage lg:grid-cols-2">
      <section className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Back to home
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-[2.15rem]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-primary px-10 py-12 lg:flex lg:flex-col lg:justify-center">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_50%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-lg">
          <h2 className="font-display text-3xl font-bold leading-tight text-white xl:text-4xl">
            {panelTitle}
          </h2>
          {panelSubtitle ? (
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
              {panelSubtitle}
            </p>
          ) : null}
          <div className="mt-10 scale-[0.92] origin-top-left">
            <LivePreview />
          </div>
        </div>
      </aside>
    </div>
  );
}
