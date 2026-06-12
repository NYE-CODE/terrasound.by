import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required,
  optional,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm mb-1">
        {label}
        {required && (
          <span className="text-red-400" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {optional && !required && (
          <span className="text-[var(--muted-foreground)] font-normal"> (необязательно)</span>
        )}
      </label>
      {hint && <p className="text-xs text-[var(--muted-foreground)] mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export function FormRequiredNote({ className }: { className?: string }) {
  return (
    <p className={`text-sm text-[var(--muted-foreground)] ${className ?? ""}`}>
      Поля со звёздочкой (
      <span className="text-red-400" aria-hidden="true">
        *
      </span>
      ) обязательны для заполнения.
    </p>
  );
}
