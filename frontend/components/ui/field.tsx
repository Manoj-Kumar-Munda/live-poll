"use client"

import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex w-full flex-col gap-5", className)}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "group/field flex w-full gap-2 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full",
        horizontal: "flex-row items-center",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn("w-fit leading-snug", className)}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function flattenFieldErrors(
  errors?: Array<{ message?: string } | undefined> | { message?: string } | undefined,
): Array<{ message?: string } | undefined> {
  if (!errors) {
    return [];
  }

  if (Array.isArray(errors)) {
    return errors.flatMap((error) => {
      if (Array.isArray(error)) {
        return error;
      }

      if (error && typeof error === "object" && "message" in error) {
        return [error];
      }

      return [];
    });
  }

  if (typeof errors === "object" && "message" in errors && errors.message) {
    return [errors];
  }

  return Object.values(errors).flatMap((error) =>
    flattenFieldErrors(error as { message?: string } | undefined),
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined> | { message?: string };
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    const flatErrors = flattenFieldErrors(errors);
    if (!flatErrors.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(flatErrors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors.length === 1) {
      return uniqueErrors[0]?.message;
    }

    return uniqueErrors
      .map((error) => error?.message)
      .filter(Boolean)
      .join(" ");
  }, [children, errors]);

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
}
