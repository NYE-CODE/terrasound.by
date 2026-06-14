import { AddressLink } from "../components/atoms/AddressLink";
import { MapEmbed } from "../components/molecules/MapEmbed";
import { usePageMeta } from "../hooks/usePageMeta";
import { pageContentPy, pageTopOffsetClass } from "../lib/pageLayout";
import { useSiteContact } from "../context/SiteContactContext";
import { SITE_NAME } from "../lib/site";

export function AboutPage() {
  const contact = useSiteContact();
  usePageMeta({
    title: "О нас",
    description: `О компании ${SITE_NAME} — премиальный автозвук и профессиональная установка в Гродно.`,
    path: "/about",
  });

  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
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
            <MapEmbed
              embedUrl={contact.mapEmbedUrl}
              openUrl={contact.addressMapsUrl}
              address={contact.address}
              title={`Расположение студии TerraSound: ${contact.address}`}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
