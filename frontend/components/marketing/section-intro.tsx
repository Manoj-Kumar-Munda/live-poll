import { cn } from "@/lib/utils";

type SectionIntroProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionIntro({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionIntroProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold tracking-wide text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-[2rem] lg:leading-tight"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
    </div>
  );
}
