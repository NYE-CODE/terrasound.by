import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartContextItem } from "@terrasound/shared";
import { clampQuantity, loadSanitizedCart } from "../lib/cart";

const CART_STORAGE_KEY = "terrasound-cart";

interface CartContextType {
  items: CartContextItem[];
  addItem: (item: Omit<CartContextItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  replaceItems: (items: CartContextItem[]) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartContextItem[]>(() =>
    loadSanitizedCart(localStorage.getItem(CART_STORAGE_KEY)),
  );

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartContextItem, "quantity">) => {
    if (!Number.isFinite(item.price) || item.price <= 0) return;

    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.id === item.id);
      if (existingItem) {
        return currentItems.map((i) =>
          i.id === item.id
            ? { ...i, quantity: clampQuantity(i.quantity + 1) }
            : i,
        );
      }
      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const safeQuantity = clampQuantity(quantity);
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity: safeQuantity } : item)),
    );
  };

  const replaceItems = (nextItems: CartContextItem[]) => {
    setItems(
      nextItems
        .map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }))
        .filter((item) => item.price > 0),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, replaceItems, clearCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart должен использоваться внутри CartProvider");
  }
  return context;
}
