import type { CartContextItem } from "@terrasound/shared";

export const MAX_CART_QUANTITY = 99;
export const MAX_REVIEW_TEXT_LENGTH = 2000;

export function clampQuantity(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1) return 1;
  return Math.min(quantity, MAX_CART_QUANTITY);
}

export function sanitizeCartItem(raw: unknown): CartContextItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id.trim() : "";
  const brand = typeof item.brand === "string" ? item.brand.trim() : "";
  const name = typeof item.name === "string" ? item.name.trim() : "";
  const image = typeof item.image === "string" ? item.image.trim() : "";
  const price = typeof item.price === "number" ? item.price : Number(item.price);
  const quantity = typeof item.quantity === "number" ? item.quantity : Number(item.quantity);
  const inStock = item.inStock === false ? false : true;

  if (!id || !brand || !name || !image) return null;
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) return null;
  if (!Number.isInteger(quantity) || quantity < 1) return null;

  return {
    id: id.slice(0, 64),
    brand: brand.slice(0, 100),
    name: name.slice(0, 255),
    image: image.slice(0, 2048),
    price,
    quantity: clampQuantity(quantity),
    inStock,
  };
}

export function loadSanitizedCart(raw: string | null): CartContextItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeCartItem)
      .filter((item): item is CartContextItem => item !== null);
  } catch {
    return [];
  }
}
