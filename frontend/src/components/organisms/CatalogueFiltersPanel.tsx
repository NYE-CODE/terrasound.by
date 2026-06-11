import { FilterCombobox } from "../molecules/FilterCombobox";
import { BrandMultiSelect } from "../molecules/BrandMultiSelect";
import { AttributeFilters, countAttributeFilters, type AttributeFilterState } from "./AttributeFilters";
import type { Category, CategoryFilters } from "../../lib/api";

export type AvailabilityOption = "in_stock" | "preorder";

const AVAILABILITY_OPTIONS: { value: AvailabilityOption; label: string }[] = [
  { value: "in_stock", label: "В наличии" },
  { value: "preorder", label: "Под заказ" },
];

export function availabilityToQuery(values: AvailabilityOption[]): boolean[] | undefined {
  if (values.length === 0 || values.length === AVAILABILITY_OPTIONS.length) return undefined;
  return values.map((value) => value === "in_stock");
}

function isAvailabilityFilterActive(values: AvailabilityOption[]) {
  return values.length > 0 && values.length < AVAILABILITY_OPTIONS.length;
}

function StockAvailabilityFilter({
  selected,
  onChange,
}: {
  selected: AvailabilityOption[];
  onChange: (values: AvailabilityOption[]) => void;
}) {
  const toggle = (option: AvailabilityOption) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="pt-6 border-t border-border">
      <h3 className="font-heading text-sm uppercase tracking-wider mb-3">Наличие</h3>
      <div className="space-y-2">
        {AVAILABILITY_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="accent-accent"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

interface CatalogueFiltersPanelProps {
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  availability: AvailabilityOption[];
  onAvailabilityChange: (values: AvailabilityOption[]) => void;
  priceRange: number[];
  priceBounds: [number, number];
  onPriceRangeChange: (range: number[]) => void;
  categoryFilters: CategoryFilters | null;
  attributeFilters: AttributeFilterState;
  onAttributeFiltersChange: (values: AttributeFilterState) => void;
}

export function CatalogueFiltersPanel({
  categories,
  brands,
  selectedCategory,
  onCategoryChange,
  selectedBrands,
  onBrandsChange,
  availability,
  onAvailabilityChange,
  priceRange,
  priceBounds,
  onPriceRangeChange,
  categoryFilters,
  attributeFilters,
  onAttributeFiltersChange,
}: CatalogueFiltersPanelProps) {
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const [priceMin, priceMax] = priceBounds;

  return (
    <div className="space-y-6">
      <FilterCombobox
        label="Категория"
        placeholder="Все категории"
        options={categoryOptions}
        value={selectedCategory}
        onChange={onCategoryChange}
        allLabel="Все категории"
      />

      <div className="pt-6 border-t border-border">
        <BrandMultiSelect
          brands={brands}
          selected={selectedBrands}
          onChange={onBrandsChange}
        />
      </div>

      <AttributeFilters
        config={categoryFilters}
        values={attributeFilters}
        onChange={onAttributeFiltersChange}
      />

      <StockAvailabilityFilter selected={availability} onChange={onAvailabilityChange} />

      <div className="pt-6 border-t border-border">
        <h3 className="font-heading text-sm uppercase tracking-wider mb-4">Ценовой диапазон</h3>
        <div className="space-y-4">
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            value={priceRange[1]}
            onChange={(e) => {
              const max = parseInt(e.target.value, 10);
              onPriceRangeChange([priceRange[0], Number.isFinite(max) ? max : priceMax]);
            }}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>BYN {priceRange[0]}</span>
            <span>BYN {priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function countActiveFilters(
  selectedCategory: string,
  selectedBrands: string[],
  availability: AvailabilityOption[],
  priceRange: number[],
  priceMax: number,
  attributeFilters: AttributeFilterState,
) {
  let count = 0;
  if (selectedCategory !== "all") count += 1;
  if (selectedBrands.length > 0) count += 1;
  if (isAvailabilityFilterActive(availability)) count += 1;
  if (priceRange[1] < priceMax) count += 1;
  count += countAttributeFilters(attributeFilters);
  return count;
}
