import { Link } from "react-router";
import { Button } from "../components/atoms/Button";
import { AddressLink } from "../components/atoms/AddressLink";
import { usePageMeta } from "../hooks/usePageMeta";
import { useSiteContact } from "../context/SiteContactContext";
import { pageContentPy, pageTopOffsetClass } from "../lib/pageLayout";
import { SITE_NAME } from "../lib/site";

export function DeliveryPage() {
  const contact = useSiteContact();
  usePageMeta({
    title: "Доставка и оплата",
    description: `Бесплатная доставка по Гродно. Доставка автозвукового оборудования по Беларуси. Условия оплаты ${SITE_NAME}.`,
    path: "/delivery",
  });

  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      <div className={`max-w-3xl mx-auto px-6 ${pageContentPy}`}>
        <h1 className="font-heading text-4xl sm:text-5xl mb-8">Доставка и оплата</h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Гродно</h2>
            <p>
              Доставка по городу Гродно — <strong className="text-foreground">бесплатно</strong> при заказе от 100 BYN.
            </p>
            <p className="mt-3">
              Самовывоз по адресу:{" "}
              <AddressLink
                address={contact.address}
                mapsUrl={contact.addressMapsUrl}
                className="hover:text-accent transition-colors"
              />
              .
            </p>
            {contact.workingHours.trim() ? (
              <p className="mt-3">Режим работы: {contact.workingHours}.</p>
            ) : null}
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">По Беларуси</h2>
            <p>
              Доставка в другие города Республики Беларусь осуществляется Европочтой. Стоимость и сроки
              рассчитываются индивидуально в зависимости от веса заказа и адреса.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Оплата</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Наличными при получении</li>
              <li>Банковской картой в интернет-магазине или точке самовывоза</li>
              <li>Безналичный расчёт для юридических лиц</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Установка</h2>
            <p>
              Скидка 5% на установку оборудования при приобретении товаров в нашем магазине.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to={{ pathname: "/installation", hash: "#consultation" }} className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto">
                  Записаться на установку
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto">
                  Контакты
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
