import { FormField } from "./FormField";

export interface CarInfoFieldsProps {
  make: string;
  model: string;
  year: string;
  errors?: {
    make?: string;
    model?: string;
    year?: string;
  };
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

export function CarInfoFields({
  make,
  model,
  year,
  errors,
  onMakeChange,
  onModelChange,
  onYearChange,
}: CarInfoFieldsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-4 min-w-0 [&>*]:min-w-0">
      <FormField
        label="Марка"
        type="text"
        value={make}
        onChange={(e) => onMakeChange(e.target.value)}
        error={errors?.make}
        placeholder="BMW"
      />

      <FormField
        label="Модель"
        type="text"
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        error={errors?.model}
        placeholder="5 Series"
      />

      <FormField
        label="Год"
        type="text"
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        placeholder="2020"
      />
    </div>
  );
}
