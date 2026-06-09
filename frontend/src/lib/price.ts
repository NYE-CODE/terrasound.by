export function getEffectivePrice(price: number, salePrice?: number | null): number {
  if (salePrice != null && salePrice > 0 && salePrice < price) {
    return salePrice;
  }
  return price;
}

export function isOnSale(price: number, salePrice?: number | null): boolean {
  return salePrice != null && salePrice > 0 && salePrice < price;
}
