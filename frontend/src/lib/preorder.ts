export const PREORDER_NOTICE =
  "В заказе есть товары под заказ. Сроки поставки уточнит менеджер при подтверждении.";

export function hasPreorderItems(items: { inStock?: boolean }[]): boolean {
  return items.some((item) => item.inStock === false);
}
