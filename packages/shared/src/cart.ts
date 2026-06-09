import { Product } from "./product";

export interface CartItem {
  product: Product;
  quantity: number;
}

/** Flat cart line used by CartContext (matches current UI state shape). */
export interface CartContextItem {
  id: string;
  brand: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export function toCartItem(line: CartContextItem): CartItem {
  return {
    product: {
      id: line.id,
      name: line.name,
      brand: line.brand,
      price: line.price,
      category: "",
      imageUrl: line.image,
      inStock: true,
    },
    quantity: line.quantity,
  };
}

export function toCartItems(lines: CartContextItem[]): CartItem[] {
  return lines.map(toCartItem);
}
