import { useSiteContact } from "../context/SiteContactContext";
import { COMPANY_NAME } from "../lib/site";
import { pageContentPy } from "../lib/pageLayout";

export function PrivacyPage() {
  const contact = useSiteContact();

  return (
    <div className="pt-20 min-h-screen">
      <div className={`max-w-3xl mx-auto px-6 ${pageContentPy}`}>
        <h1 className="font-heading text-5xl mb-8">Политика конфиденциальности</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Какие данные мы собираем</h2>
            <p>
              Мы собираем информацию, которую вы предоставляете напрямую при оформлении заказа,
              создании аккаунта, записи на установку или обращении в службу поддержки.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Как мы используем ваши данные</h2>
            <p>
              Мы используем собранную информацию для обработки заказов, связи с вами по поводу
              записи на установку и улучшения наших услуг.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Безопасность данных</h2>
            <p>
              Мы применяем надлежащие меры безопасности для защиты ваших персональных данных от
              несанкционированного доступа, изменения или раскрытия.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-4">Контакты</h2>
            <p>
              По вопросам политики конфиденциальности обращайтесь в {COMPANY_NAME}:{" "}
              <a href={`mailto:${contact.email}`} className="hover:text-accent transition-colors">
                {contact.email}
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
