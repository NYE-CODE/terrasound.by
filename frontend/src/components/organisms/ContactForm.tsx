import { FormField } from "../molecules/FormField";
import { PHONE_INPUT_PLACEHOLDER } from "@terrasound/shared";

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
}

export interface ContactFormProps {
  heading?: string;
  values: ContactFormData;
  errors: Partial<Record<keyof ContactFormData, string>>;
  onChange: (field: keyof ContactFormData, value: string) => void;
}

export function ContactForm({ heading, values, errors, onChange }: ContactFormProps) {
  return (
    <section className="bg-card border border-card-border rounded p-6">
      {heading && <h2 className="font-heading text-xl mb-6">{heading}</h2>}
      <div className="space-y-4">
        <FormField
          label="Имя"
          markRequired
          type="text"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          error={errors.name}
          placeholder="Введите ваше имя"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            label="Телефон"
            markRequired
            type="tel"
            value={values.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            error={errors.phone}
            placeholder={PHONE_INPUT_PLACEHOLDER}
          />

          <FormField
            label="Email"
            markRequired
            type="email"
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
            error={errors.email}
            placeholder="ваш@email.com"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            label="Город"
            type="text"
            value={values.city}
            onChange={(e) => onChange("city", e.target.value)}
          />

          <FormField
            label="Адрес доставки"
            markRequired
            type="text"
            value={values.address}
            onChange={(e) => onChange("address", e.target.value)}
            error={errors.address}
            placeholder="ул. Советская 15, кв. 42"
          />
        </div>
      </div>
    </section>
  );
}
