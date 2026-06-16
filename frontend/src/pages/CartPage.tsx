import { Link } from "react-router";
import { Button } from "../components/atoms/Button";
import { OrderItem } from "../components/molecules/OrderItem";
import { OrderSummary } from "../components/organisms/OrderSummary";
import { useCart } from "../context/CartContext";
import { usePageMeta } from "../hooks/usePageMeta";
import { pageContentPy, pageTopOffsetClass } from "../lib/pageLayout";

export function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  usePageMeta({
    title: "Корзина",
    description: "Корзина покупок TerraSound.",
    path: "/cart",
    indexable: false,
  });

  if (items.length === 0) {
    return (
      <div className={`${pageTopOffsetClass} min-h-screen flex items-center justify-center`}>
        <div className="text-center max-w-md px-6">
          <h1 className="font-heading text-4xl mb-4">Корзина пуста</h1>
          <p className="text-muted-foreground mb-8">
            Перейдите в каталог, чтобы найти идеальное автозвуковое оборудование
          </p>
          <Link to="/catalogue">
            <Button variant="primary">Перейти в каталог</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      <div className={`max-w-[1400px] mx-auto px-6 ${pageContentPy}`}>
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl">Корзина</h1>
          <button
            onClick={clearCart}
            className="text-sm text-muted-foreground hover:text-accent transition-colors duration-300"
          >
            Очистить корзину
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-card-border rounded p-6 flex gap-6"
              >
                <OrderItem
                  brand={item.brand}
                  name={item.name}
                  image={item.image}
                  quantity={item.quantity}
                  unitPrice={item.price}
                  inStock={item.inStock}
                  variant="cart"
                  onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                  onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                  onRemove={() => removeItem(item.id)}
                />
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              title="Ваш заказ"
              items={items}
              subtotal={totalPrice}
              total={totalPrice}
              variant="cart"
              actions={
                <>
                  <Link to="/checkout">
                    <Button variant="primary" className="w-full mb-4">
                      Оформить заказ
                    </Button>
                  </Link>

                  <Link to="/catalogue">
                    <Button variant="ghost" className="w-full">
                      Продолжить покупки
                    </Button>
                  </Link>
                </>
              }
              footer={
                <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground space-y-2">
                  <div>
                    • Бесплатная доставка по Гродно.{" "}
                    <Link
                      to="/delivery"
                      className="text-accent hover:underline underline-offset-2 transition-colors"
                    >
                      Подробнее о доставке
                    </Link>
                  </div>
                  <div>• Гарантия 2 года на всё оборудование</div>
                  <div>• Доступна профессиональная установка</div>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
