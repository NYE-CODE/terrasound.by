import { FilterDropdown } from "./FilterDropdown";

const STOCK_FILTER_OPTIONS = [
  { value: "", label: "Все" },
  { value: "true", label: "В наличии" },
  { value: "false", label: "Под заказ" },
] as const;

export type StockFilterValue = (typeof STOCK_FILTER_OPTIONS)[number]["value"];

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  categories: Array<{ id: string; name: string }>;
}

export function CategoryFilter({ value, onChange, categories }: CategoryFilterProps) {
  const options = [
    { value: "", label: "Все категории" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  return (
    <FilterDropdown
      value={value}
      onChange={onChange}
      options={options}
      emptyLabel="Все категории"
      ariaLabel="Фильтр по категории"
    />
  );
}

interface BrandFilterProps {
  value: string;
  onChange: (value: string) => void;
  brands: Array<{ name: string }>;
}

export function BrandFilter({ value, onChange, brands }: BrandFilterProps) {
  const options = [
    { value: "", label: "Все бренды" },
    ...brands.map((brand) => ({
      value: brand.name,
      label: brand.name,
    })),
  ];

  return (
    <FilterDropdown
      value={value}
      onChange={onChange}
      options={options}
      emptyLabel="Все бренды"
      ariaLabel="Фильтр по бренду"
    />
  );
}

interface StockFilterProps {
  value: StockFilterValue;
  onChange: (value: StockFilterValue) => void;
}

export function StockFilter({ value, onChange }: StockFilterProps) {
  return (
    <FilterDropdown
      value={value}
      onChange={(next) => onChange(next as StockFilterValue)}
      options={[...STOCK_FILTER_OPTIONS]}
      emptyLabel="Все"
      ariaLabel="Фильтр по наличию"
    />
  );
}
