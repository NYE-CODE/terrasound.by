import { useSiteContact } from "../context/SiteContactContext";
import { COMPANY_NAME } from "../lib/site";
import { pageContentPy } from "../lib/pageLayout";

export function TermsPage() {
  const contact = useSiteContact();

  return (
    <div className="pt-20 min-h-screen">
      <div className={`max-w-3xl mx-auto px-6 ${pageContentPy}`}>
        <h1 className="font-heading text-5xl mb-8">Условия использования</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Продажа товаров</h2>
            <p>
              На все товары распространяется гарантия производителя. На услуги установки
              предоставляется 2 года гарантии на выполненные работы.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Услуги установки</h2>
            <p>
              Мы работаем только по записи. Отмена должна быть произведена не менее чем за 48 часов,
              иначе взимается плата за отмену.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Возврат и возмещение</h2>
            <p>
              Не вскрытые товары можно вернуть в течение 14 дней с момента покупки. Установленное
              оборудование возврату не подлежит, за исключением случаев брака.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Контакты</h2>
            <p>
              Вопросы по условиям? Свяжитесь с {COMPANY_NAME}:{" "}
              <a href={`mailto:${contact.email}`} className="hover:text-accent transition-colors">
                {contact.email}
              </a>{" "}
              или{" "}
              <a href={`tel:${contact.phoneTel}`} className="hover:text-accent transition-colors">
                {contact.phone}
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
