/** Округление денежной суммы до копеек (избегает 2.989999999 и т.п.). */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Парсинг значения из поля ввода цены. */
export function parseMoneyInput(raw: string): number {
  const text = raw.replace(",", ".").trim();
  if (!text) return 0;
  const numeric = Number(text);
  if (!Number.isFinite(numeric)) return 0;
  return roundMoney(numeric);
}

export function formatMoney(value: number): string {
  return roundMoney(value).toFixed(2).replace(/\.00$/, "");
}

export function isOnSale(price: number, salePrice: number | null | undefined): boolean {
  return salePrice != null && salePrice > 0 && salePrice < price;
}

export function effectivePrice(price: number, salePrice: number | null | undefined): number {
  if (isOnSale(price, salePrice)) return salePrice!;
  return price;
}
