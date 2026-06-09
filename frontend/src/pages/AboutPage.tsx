import { ADDRESS, COMPANY_NAME, SITE_NAME, SITE_URL } from "../lib/site";

export function AboutPage() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <h1 className="font-heading text-5xl mb-8">О {SITE_NAME}</h1>

        <div className="max-w-3xl space-y-6 text-muted-foreground">
          <p className="text-xl text-foreground">
            {COMPANY_NAME} — {SITE_NAME} ({SITE_URL}): премиальный автозвук и профессиональная установка в Гродно.
          </p>

          <p>
            Мы не просто магазин — мы мастерская, созданная энтузиастами автозвука для таких же энтузиастов. Наша команда обладает глубокой экспертизой в акустике, электронике и монтаже.
          </p>

          <p>
            Каждая система, которую мы собираем, — уникальный проект. Мы учитываем ваши музыкальные предпочтения, акустику автомобиля и бюджет, чтобы создать решение с исключительным качеством звука.
          </p>

          <p>
            Наша мастерская в {ADDRESS} оснащена профессиональным инструментом и оборудованием для акустических измерений. Мы работаем только по записи, чтобы каждая установка получала должное внимание.
          </p>
        </div>
      </div>
    </div>
  );
}
