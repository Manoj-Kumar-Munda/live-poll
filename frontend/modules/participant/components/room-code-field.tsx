import type { UseFormRegisterReturn } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type RoomCodeFieldProps = {
  id?: string;
  error?: { message?: string };
  registration: UseFormRegisterReturn;
};

export function RoomCodeField({
  id = "room-code",
  error,
  registration,
}: RoomCodeFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>Room code</FieldLabel>
      <Input
        id={id}
        placeholder="ABCDEF"
        autoComplete="off"
        className="h-10 text-center font-mono text-lg uppercase tracking-[0.35em] text-text-primary"
        maxLength={6}
        aria-invalid={!!error}
        {...registration}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}
