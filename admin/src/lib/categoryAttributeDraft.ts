import { api, type AttributeDef, type CategoryAttributeLink, type CategoryAttributeSyncItem } from "./api";
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
  required: boolean;
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
    required: link.required,
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
    required: false,
    sortOrder,
  };
}

function draftToSyncItem(draft: CategoryAttributeDraft, sortOrder: number): CategoryAttributeSyncItem {
  return {
    id: draft.id,
    attributeId: draft.attributeId,
    showInForm: draft.showInForm,
    showInFilters: draft.showInFilters,
    showOnCard: draft.showOnCard,
    filterType: draft.filterType ?? null,
    filterMin: draft.filterMin ?? null,
    filterMax: draft.filterMax ?? null,
    groupLabel: draft.groupLabel?.trim() || null,
    required: draft.required,
    sortOrder,
  };
}

export async function syncCategoryAttributes(
  token: string,
  categoryId: string,
  draft: CategoryAttributeDraft[],
) {
  const seen = new Set<string>();
  for (const item of draft) {
    if (seen.has(item.attributeId)) {
      throw new Error(`Характеристика «${item.attributeLabel}» добавлена дважды.`);
    }
    seen.add(item.attributeId);
  }

  const items = draft.map((item, index) => draftToSyncItem(item, index));
  await api.syncCategoryAttributes(token, categoryId, items);
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

export function reorderDraft(
  links: CategoryAttributeDraft[],
  fromClientId: string,
  toClientId: string,
): CategoryAttributeDraft[] {
  const fromIndex = links.findIndex((link) => link.clientId === fromClientId);
  const toIndex = links.findIndex((link) => link.clientId === toClientId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return links;

  const next = [...links];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((item, index) => ({ ...item, sortOrder: index }));
}
