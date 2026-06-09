import { Checkbox } from "../atoms/Checkbox";

export interface CheckoutInstallationProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
  description: string;
}

export function CheckoutInstallation({
  checked,
  onCheckedChange,
  title,
  description,
}: CheckoutInstallationProps) {
  const label = (
    <>
      <h3 className="font-heading text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </>
  );

  return (
    <section className="bg-card border border-card-border rounded p-6">
      <Checkbox
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        label={label}
      />
    </section>
  );
}
