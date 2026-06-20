import { RadioOption } from "../atoms/RadioOption";

export interface PaymentMethodOption {
  value: string;
  label: string;
  description: string;
}

export interface PaymentMethodProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: PaymentMethodOption[];
}

export function PaymentMethod({ name, value, onChange, options }: PaymentMethodProps) {
  return (
    <div className="space-y-4 min-w-0">
      {options.map((option) => (
        <RadioOption
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={(e) => onChange(e.target.value)}
          label={option.label}
          description={option.description}
        />
      ))}
    </div>
  );
}
