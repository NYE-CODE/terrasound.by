import { AddressLink } from "../components/atoms/AddressLink";
import { MapEmbed } from "../components/molecules/MapEmbed";
import { usePageMeta } from "../hooks/usePageMeta";
import { pageContentPy, pageTopOffsetClass } from "../lib/pageLayout";
import { useSiteContact } from "../context/SiteContactContext";
import { SITE_NAME, STATIC_PAGE_DESCRIPTIONS } from "../lib/site";
import vorotaImage from "../assets/vorota.webp";

export function AboutPage() {
  const contact = useSiteContact();
  usePageMeta({
    title: "О нас",
    description: STATIC_PAGE_DESCRIPTIONS.about,
    path: "/about",
  });

  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      <div className={`max-w-[1400px] mx-auto px-6 ${pageContentPy}`}>
        <section>
          <div className="grid gap-8 items-start md:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)_minmax(0,0.85fr)] md:items-stretch md:gap-10 lg:gap-12">
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl mb-6">Наша студия</h1>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Студия в Гродно оснащена профессиональным инструментом и оборудованием для установки и настройки акустических систем.
                </p>
                <p>
                  Нам важно чтобы каждый клиент остался доволен подобранной акустической системой и настройкой.
                </p>
                <div className="pt-6 space-y-2">
                  <div>
                    <span className="text-foreground font-heading">Адрес:</span>{" "}
                    <AddressLink
                      address={contact.address}
                      mapsUrl={contact.addressMapsUrl}
                      className="text-muted-foreground hover:text-accent transition-colors"
                    />
                  </div>
                  {contact.workingHours.trim() ? (
                    <div>
                      <span className="text-foreground font-heading">Режим работы:</span> {contact.workingHours}
                    </div>
                  ) : null}
                  <div>
                    <span className="text-foreground font-heading">Телефон:</span>{" "}
                    <a
                      href={`tel:${contact.phoneTel || contact.phone.replace(/\D/g, "")}`}
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[360px] md:mx-0 md:max-w-none md:h-full md:min-h-0">
              <img
                src={vorotaImage}
                alt={`Вход в студию ${SITE_NAME}`}
                className="aspect-[4/3] h-full w-full rounded object-cover md:aspect-auto"
              />
            </div>

            <MapEmbed
              embedUrl={contact.mapEmbedUrl}
              openUrl={contact.addressMapsUrl}
              address={contact.address}
              title={`Расположение студии ${SITE_NAME}: ${contact.address}`}
              className="mx-auto aspect-[4/3] h-full w-full max-w-[360px] min-h-0 md:mx-0 md:max-w-none md:aspect-auto"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
