import { FilterCombobox } from "../molecules/FilterCombobox";
import { BrandMultiSelect } from "../molecules/BrandMultiSelect";
import type { Category } from "../../lib/api";

interface CatalogueFiltersPanelProps {
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  priceRange: number[];
  onPriceRangeChange: (range: number[]) => void;
}

export function CatalogueFiltersPanel({
  categories,
  brands,
  selectedCategory,
  onCategoryChange,
  selectedBrands,
  onBrandsChange,
  priceRange,
  onPriceRangeChange,
}: CatalogueFiltersPanelProps) {
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

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

      <div className="pt-6 border-t border-border">
        <h3 className="font-heading text-sm uppercase tracking-wider mb-4">Ценовой диапазон</h3>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="2000"
            value={priceRange[1]}
            onChange={(e) => {
              const max = parseInt(e.target.value, 10);
              onPriceRangeChange([priceRange[0], Number.isFinite(max) ? max : 2000]);
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
  priceRange: number[],
) {
  let count = 0;
  if (selectedCategory !== "all") count += 1;
  if (selectedBrands.length > 0) count += 1;
  if (priceRange[1] < 2000) count += 1;
  return count;
}
