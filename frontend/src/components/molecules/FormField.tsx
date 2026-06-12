import { ReactNode } from "react";
import { Input, InputProps } from "../atoms/Input";

export interface FormFieldProps extends InputProps {
  label: ReactNode;
  markRequired?: boolean;
  error?: string;
  endAdornment?: ReactNode;
}

export function FormField({
  label,
  markRequired = false,
  error,
  endAdornment,
  ...inputProps
}: FormFieldProps) {
  const input = <Input error={!!error} {...inputProps} />;

  return (
    <div>
      <label className="block font-heading text-sm uppercase tracking-wider mb-2">
        {label}
        {markRequired && <> <span className="text-accent">*</span></>}
      </label>
      {endAdornment ? <div className="relative">{input}{endAdornment}</div> : input}
      {error && <p className="text-xs leading-tight text-destructive mt-1">{error}</p>}
    </div>
  );
}
