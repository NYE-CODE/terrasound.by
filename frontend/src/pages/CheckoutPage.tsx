import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useCart } from "../context/CartContext";
import { Button } from "../components/atoms/Button";
import { CarInfoFields } from "../components/molecules/CarInfoFields";
import { PaymentMethod } from "../components/molecules/PaymentMethod";
import { ContactForm } from "../components/organisms/ContactForm";
import { OrderSummary } from "../components/organisms/OrderSummary";
import { CheckoutTemplate } from "../components/templates/CheckoutTemplate";
import { api } from "../lib/api";
import { clampQuantity } from "../lib/cart";
import { getEffectivePrice } from "../lib/price";
import { CONTACT_PHONE } from "../lib/site";
import { toast } from "sonner";

const paymentOptions = [
  {
    value: "cash",
    label: "Наличными при получении",
    description: "Оплата при получении товара",
  },
  {
    value: "card",
    label: "Оплата картой",
    description: "Счет будет выслан на указанный email",
  },
  {
    value: "bank",
    label: "Безналичный расчет для юрлиц",
    description: "Счет будет выслан на указанный email",
  },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, replaceItems, clearCart } = useCart();
  const [syncing, setSyncing] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "Гродно",
    address: "",
    carMake: "",
    carModel: "",
    carYear: "",
    carComment: "",
    paymentMethod: "cash",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (items.length === 0) {
      setSyncing(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setSyncing(true);
      const results = await Promise.allSettled(items.map((item) => api.getProduct(item.id)));
      const reconciled = [];
      let changed = false;

      for (let index = 0; index < items.length; index += 1) {
        const cartItem = items[index];
        const result = results[index];

        if (result.status !== "fulfilled") {
          changed = true;
          continue;
        }

        const product = result.value;
        if (!product.inStock) {
          changed = true;
          continue;
        }

        const primaryImage = product.images[0]?.trim() ?? "";
        if (!primaryImage) {
          changed = true;
          continue;
        }

        const serverPrice = getEffectivePrice(product.price, product.salePrice);
        const quantity = clampQuantity(cartItem.quantity);

        if (
          serverPrice !== cartItem.price ||
          product.brand !== cartItem.brand ||
          product.name !== cartItem.name ||
          primaryImage !== cartItem.image ||
          quantity !== cartItem.quantity
        ) {
          changed = true;
        }

        reconciled.push({
          id: product.id,
          brand: product.brand,
          name: product.name,
          image: primaryImage,
          price: serverPrice,
          quantity,
        });
      }

      if (cancelled) return;

      if (reconciled.length === 0) {
        replaceItems([]);
        toast.error("Товары в корзине недоступны. Добавьте позиции заново.");
      } else {
        replaceItems(reconciled);
        if (changed) {
          toast.info("Корзина обновлена по актуальным ценам и наличию");
        }
      }

      setSyncing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- синхронизация при входе на страницу

  const serverTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Укажите имя";
    if (!formData.phone.trim()) newErrors.phone = "Укажите телефон";
    if (!formData.email.trim()) newErrors.email = "Укажите email";
    if (!formData.address.trim()) newErrors.address = "Укажите адрес доставки";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Неверный формат email";
    }

    const phoneRegex = /^\+375[\s-]?\d{2}[\s-]?\d{3}[\s-]?(?:\d{4}|\d{2}[\s-]?\d{2})$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = `Формат: ${CONTACT_PHONE}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (syncing) return;
    if (!validateForm()) return;

    try {
      const order = await api.createOrder({
        contact: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          address: formData.address,
        },
        car: {
          make: formData.carMake,
          model: formData.carModel,
          year: formData.carYear,
          comment: formData.carComment || undefined,
        },
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        paymentMethod: formData.paymentMethod,
      });

      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch {
      toast.error("Не удалось оформить заказ. Попробуйте ещё раз.");
    }
  };

  if (!syncing && items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="font-heading text-4xl mb-4">Корзина пуста</h1>
          <p className="text-muted-foreground mb-8">
            Добавьте товары в корзину перед оформлением заказа
          </p>
          <Link to="/catalogue">
            <Button variant="primary">Перейти в каталог</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center text-muted-foreground">
        Проверяем актуальные цены и наличие...
      </div>
    );
  }

  return (
    <CheckoutTemplate
      title="Оформление заказа"
      onSubmit={handleSubmit}
      form={
        <>
          <ContactForm
            heading="Контактные данные"
            values={{
              name: formData.name,
              phone: formData.phone,
              email: formData.email,
              city: formData.city,
              address: formData.address,
            }}
            errors={errors}
            onChange={(field, value) => setFormData({ ...formData, [field]: value })}
          />

          <section className="bg-card border border-card-border rounded p-6">
            <h2 className="font-heading text-xl mb-6">Информация об автомобиле</h2>
            <CarInfoFields
              make={formData.carMake}
              model={formData.carModel}
              year={formData.carYear}
              onMakeChange={(value) => setFormData({ ...formData, carMake: value })}
              onModelChange={(value) => setFormData({ ...formData, carModel: value })}
              onYearChange={(value) => setFormData({ ...formData, carYear: value })}
            />

            <div className="mt-4">
              <label className="block font-heading text-sm uppercase tracking-wider mb-2">
                Комментарий
              </label>
              <textarea
                value={formData.carComment}
                onChange={(e) => setFormData({ ...formData, carComment: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-input border border-border rounded text-foreground focus:border-accent focus:outline-none transition-all duration-300 resize-none"
                placeholder="Дополнительная информация об автомобиле"
              />
            </div>
          </section>

          <section className="bg-card border border-card-border rounded p-6">
            <h2 className="font-heading text-xl mb-6">Способ оплаты</h2>
            <PaymentMethod
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              options={paymentOptions}
            />
          </section>
        </>
      }
      summary={
        <OrderSummary
          title="Ваш заказ"
          items={items}
          subtotal={serverTotal}
          total={serverTotal}
          variant="checkout"
        />
      }
    />
  );
}
