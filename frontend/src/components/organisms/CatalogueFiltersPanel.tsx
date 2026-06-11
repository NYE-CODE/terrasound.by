import { FilterCombobox } from "../molecules/FilterCombobox";
import { BrandMultiSelect } from "../molecules/BrandMultiSelect";
import {
  StockAvailabilityFilter,
  type AvailabilityOption,
  isAvailabilityFilterActive,
} from "../molecules/StockAvailabilityFilter";
import { AvailabilityFilter, countAvailabilityFilter, type AvailabilityFilter as AvailabilityFilterValue } from "../molecules/AvailabilityFilter";
import { AttributeFilters, countAttributeFilters, type AttributeFilterState } from "./AttributeFilters";
import type { Category, CategoryFilters } from "../../lib/api";

interface CatalogueFiltersPanelProps {
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  priceRange: number[];
  priceBounds: [number, number];
  onPriceRangeChange: (range: number[]) => void;
  categoryFilters: CategoryFilters | null;
  attributeFilters: AttributeFilterState;
  onAttributeFiltersChange: (values: AttributeFilterState) => void;
  availabilityFilter: AvailabilityFilterValue;
  onAvailabilityFilterChange: (values: AvailabilityFilterValue) => void;
}

export function CatalogueFiltersPanel({
  categories,
  brands,
  selectedCategory,
  onCategoryChange,
  selectedBrands,
  onBrandsChange,
  priceRange,
  priceBounds,
  onPriceRangeChange,
  categoryFilters,
  attributeFilters,
  onAttributeFiltersChange,
  availabilityFilter,
  onAvailabilityFilterChange,
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

      <AvailabilityFilter selected={availabilityFilter} onChange={onAvailabilityFilterChange} />

      <div className="pt-6 border-t border-border">
        <BrandMultiSelect
          brands={brands}
          selected={selectedBrands}
          onChange={onBrandsChange}
        />
      </div>

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

      <AttributeFilters
        config={categoryFilters}
        values={attributeFilters}
        onChange={onAttributeFiltersChange}
      />
    </div>
  );
}

export function countActiveFilters(
  selectedCategory: string,
  selectedBrands: string[],
  priceRange: number[],
  priceMax: number,
  attributeFilters: AttributeFilterState,
) {
  let count = 0;
  if (selectedCategory !== "all") count += 1;
  if (selectedBrands.length > 0) count += 1;
  if (priceRange[1] < priceMax) count += 1;
  count += countAttributeFilters(attributeFilters);
  return count;
}
