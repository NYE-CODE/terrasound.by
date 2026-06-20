import { PAYMENT_METHODS_INFO } from "@terrasound/shared";

export function PaymentMethodsInfo() {
  return (
    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
      {PAYMENT_METHODS_INFO.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
