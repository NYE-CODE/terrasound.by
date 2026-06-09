import { Link } from "react-router";
import { Button } from "../components/atoms/Button";
import { usePageMeta } from "../hooks/usePageMeta";
import { ADDRESS, COMPANY_NAME, CONTACT_PHONE, SITE_NAME } from "../lib/site";

export function DeliveryPage() {
  usePageMeta({
    title: "Доставка и оплата",
    description: "Бесплатная доставка по Гродно. Доставка автозвукового оборудования по Беларуси. Условия оплаты TerraSound.",
    path: "/delivery",
  });

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-heading text-4xl sm:text-5xl mb-8">Доставка и оплата</h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Гродно</h2>
            <p>
              Доставка по городу Гродно — <strong className="text-foreground">бесплатно</strong> при заказе
              от 100 BYN. При меньшей сумме стоимость доставки согласовывается с менеджером.
            </p>
            <p className="mt-3">
              Самовывоз из мастерской {SITE_NAME} ({ADDRESS}) — бесплатно. Режим работы: Пн–Сб, 10:00–19:00.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">По Беларуси</h2>
            <p>
              Доставка в другие города Республики Беларусь осуществляется через службы доставки
              (Европочта, СДЭК, курьерские службы). Стоимость и сроки рассчитываются индивидуально
              в зависимости от веса заказа и адреса.
            </p>
            <ul className="mt-4 space-y-2 list-disc list-inside">
              <li>Минск, Брест, Витебск, Могилёв, Барановичи — от 1–3 рабочих дней</li>
              <li>Другие населённые пункты — от 2–5 рабочих дней</li>
              <li>Точную стоимость сообщим после оформления заказа</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Оплата</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Наличными при получении (Гродно)</li>
              <li>Банковской картой в магазине или мастерской</li>
              <li>Безналичный расчёт для юридических лиц ({COMPANY_NAME})</li>
              <li>Онлайн-оплата — по запросу, уточняйте у менеджера</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Установка</h2>
            <p>
              Оборудование можно заказать с профессиональной установкой в нашей мастерской.
              Стоимость монтажа зависит от сложности работ и типа автомобиля.
            </p>
            <Link to="/installation" className="block w-full sm:w-auto mt-4">
              <Button variant="ghost" className="w-full sm:w-auto">
                Записаться на установку
              </Button>
            </Link>
          </section>

          <section className="bg-card border border-card-border rounded p-6">
            <h2 className="font-heading text-xl text-foreground mb-3">Вопросы по доставке?</h2>
            <p>Звоните {CONTACT_PHONE} или оформите заказ — менеджер свяжется с вами.</p>
            <Link to="/contact" className="block w-full sm:w-auto mt-4">
              <Button variant="primary" className="w-full sm:w-auto">
                Контакты
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
