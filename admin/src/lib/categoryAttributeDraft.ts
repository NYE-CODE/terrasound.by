import { api, type AttributeDef, type CategoryAttributeInput, type CategoryAttributeLink } from "./api";
import { defaultFilterType } from "./filterTypes";

export type CategoryAttributeDraft = {
  clientId: string;
  id?: number;
  attributeId: string;
  attributeLabel: string;
  valueType: string;
  unit?: string | null;
  filterType?: string | null;
  options: AttributeDef["options"];
  showInForm: boolean;
  showInFilters: boolean;
  showOnCard: boolean;
  filterMin?: number | null;
  filterMax?: number | null;
  groupLabel?: string | null;
  sortOrder: number;
};

export function linkToDraft(link: CategoryAttributeLink): CategoryAttributeDraft {
  return {
    clientId: String(link.id),
    id: link.id,
    attributeId: link.attributeId,
    attributeLabel: link.attributeLabel,
    valueType: link.valueType,
    unit: link.unit,
    filterType: link.filterType,
    options: link.options,
    showInForm: link.showInForm,
    showInFilters: link.showInFilters,
    showOnCard: link.showOnCard,
    filterMin: link.filterMin,
    filterMax: link.filterMax,
    groupLabel: link.groupLabel,
    sortOrder: link.sortOrder,
  };
}

export function attributeToDraft(attr: AttributeDef, sortOrder: number): CategoryAttributeDraft {
  const canFilter = defaultFilterType(attr.valueType, attr.options.length) !== null;
  return {
    clientId: `new-${attr.id}-${Date.now()}`,
    attributeId: attr.id,
    attributeLabel: attr.label,
    valueType: attr.valueType,
    unit: attr.unit,
    filterType: attr.filterType ?? defaultFilterType(attr.valueType, attr.options.length),
    options: attr.options,
    showInForm: true,
    showInFilters: canFilter,
    showOnCard: false,
    filterMin: null,
    filterMax: null,
    groupLabel: null,
    sortOrder,
  };
}

function draftToInput(draft: CategoryAttributeDraft, sortOrder: number): CategoryAttributeInput {
  return {
    attributeId: draft.attributeId,
    showInForm: draft.showInForm,
    showInFilters: draft.showInFilters,
    showOnCard: draft.showOnCard,
    filterMin: draft.filterMin ?? null,
    filterMax: draft.filterMax ?? null,
    groupLabel: draft.groupLabel?.trim() || null,
    sortOrder,
  };
}

export async function syncCategoryAttributes(
  token: string,
  categoryId: string,
  initial: CategoryAttributeLink[],
  draft: CategoryAttributeDraft[],
) {
  const seen = new Set<string>();
  for (const item of draft) {
    if (seen.has(item.attributeId)) {
      throw new Error(`Характеристика «${item.attributeLabel}» добавлена дважды.`);
    }
    seen.add(item.attributeId);
  }

  const draftWithOrder = draft.map((item, index) => ({ ...item, sortOrder: index }));
  const draftIds = new Set(draftWithOrder.filter((item) => item.id).map((item) => item.id!));

  for (const link of initial) {
    if (!draftIds.has(link.id)) {
      await api.deleteCategoryAttribute(token, categoryId, link.id);
    }
  }

  for (const item of draftWithOrder) {
    const payload = draftToInput(item, item.sortOrder);
    if (item.id) {
      await api.updateCategoryAttribute(token, categoryId, item.id, payload);
    } else {
      await api.createCategoryAttribute(token, categoryId, payload);
    }
  }
}

export function patchDraft(
  links: CategoryAttributeDraft[],
  clientId: string,
  patch: Partial<CategoryAttributeDraft>,
): CategoryAttributeDraft[] {
  return links.map((link) => (link.clientId === clientId ? { ...link, ...patch } : link));
}

export function removeDraft(links: CategoryAttributeDraft[], clientId: string): CategoryAttributeDraft[] {
  return links.filter((link) => link.clientId !== clientId);
}
