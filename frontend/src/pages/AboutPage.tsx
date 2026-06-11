import { usePageMeta } from "../hooks/usePageMeta";
import { pageContentPy } from "../lib/pageLayout";
import { ADDRESS, CONTACT_PHONE, SITE_NAME, WORKING_HOURS } from "../lib/site";

export function AboutPage() {
  usePageMeta({
    title: "О нас",
    description: `О компании ${SITE_NAME} — премиальный автозвук и профессиональная установка в Гродно.`,
    path: "/about",
  });

  return (
    <div className="pt-20 min-h-screen">
      <div className={`max-w-[1400px] mx-auto px-6 ${pageContentPy}`}>
        <section>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl mb-6">Наша студия</h1>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Студия в Гродно оснащена профессиональным инструментом и оборудованием для установки акустических систем.
                </p>
                <p>Мы работаем только по записи, чтобы каждая установка получала должное внимание.</p>
                <div className="pt-6 space-y-2">
                  <div>
                    <span className="text-foreground font-heading">Адрес:</span> {ADDRESS}
                  </div>
                  <div>
                    <span className="text-foreground font-heading">Режим работы:</span> {WORKING_HOURS}
                  </div>
                  <div>
                    <span className="text-foreground font-heading">Телефон:</span> {CONTACT_PHONE}
                  </div>
                </div>
              </div>
            </div>
            <div className="aspect-video bg-secondary/30 rounded overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80"
                alt="Интерьер студии"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
