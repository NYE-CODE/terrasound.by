import { Link } from "react-router";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import { AddressLink } from "../../atoms/AddressLink";
import { TikTokIcon } from "../../icons/TikTokIcon";
import { TelegramIcon } from "../../icons/TelegramIcon";
import { externalUrl } from "../../../lib/contactHelpers";
import { COMPANY_NAME, SITE_NAME, TAGLINE } from "../../../lib/site";
import { useSiteContact } from "../../../context/SiteContactContext";
import logo from "../../../assets/logo.png";
import { LOGO_HEIGHT, LOGO_WIDTH } from "../../../lib/brandAssets";

const footerNavColumns = [
  [
    { path: "/catalogue", label: "Каталог" },
    { path: "/installation", label: "Услуги" },
  ],
  [
    { path: "/brands", label: "Бренды" },
    { path: "/blog", label: "Блог" },
  ],
  [
    { path: "/about", label: "О нас" },
    { path: "/delivery", label: "Доставка" },
  ],
  [{ path: "/contact", label: "Контакты" }],
] as const;

const footerNavMobileColumns = [
  [...footerNavColumns[0], ...footerNavColumns[1]],
  [...footerNavColumns[2], ...footerNavColumns[3]],
] as const;

const footerNavLinkClass =
  "block w-fit font-heading text-sm uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-300";

const footerContactRowClass =
  "flex items-center gap-3 text-sm text-muted-foreground hover:text-accent transition-colors duration-300";

const footerSocialIconClass =
  "inline-flex items-center justify-center text-muted-foreground hover:text-accent transition-colors duration-300";

function FooterNavLink({ path, label }: { path: string; label: string }) {
  return (
    <li>
      <Link to={path} className={footerNavLinkClass}>
        {label}
      </Link>
    </li>
  );
}

function FooterNavList({ links }: { links: readonly { path: string; label: string }[] }) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <FooterNavLink key={link.path} {...link} />
      ))}
    </ul>
  );
}

export function Footer() {
  const contact = useSiteContact();

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <h2 className="sr-only">Контакты и навигация</h2>

        <div className="mb-12 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-16 lg:gap-x-24 md:items-start">
          <div className="max-w-md">
            <Link to="/" className="inline-flex mb-4" aria-label={SITE_NAME}>
              <img src={logo} alt={SITE_NAME} width={LOGO_WIDTH} height={LOGO_HEIGHT} className="h-14 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground mb-2">{COMPANY_NAME}</p>
            <p className="text-sm text-muted-foreground mb-6">{TAGLINE}</p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin size={16} className="shrink-0" />
                <AddressLink
                  address={contact.address}
                  mapsUrl={contact.addressMapsUrl}
                  className="hover:text-accent transition-colors duration-300"
                />
              </div>
              <a href={`tel:${contact.phoneTel}`} className={footerContactRowClass}>
                <Phone size={16} className="shrink-0" />
                <span>{contact.phone}</span>
              </a>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${contact.email}`}
                className={footerSocialIconClass}
                aria-label={`Написать на ${contact.email}`}
              >
                <Mail size={18} />
              </a>
              {contact.instagramUrl.trim() && (
                <a
                  href={externalUrl(contact.instagramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerSocialIconClass}
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              )}
              {contact.tiktokUrl.trim() && (
                <a
                  href={externalUrl(contact.tiktokUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerSocialIconClass}
                  aria-label="TikTok"
                >
                  <TikTokIcon size={18} />
                </a>
              )}
              {contact.telegramUrl.trim() && (
                <a
                  href={externalUrl(contact.telegramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerSocialIconClass}
                  aria-label="Telegram"
                >
                  <TelegramIcon size={18} />
                </a>
              )}
            </div>
          </div>

          <nav
            aria-label="Навигация в подвале"
            className="hidden md:grid md:grid-cols-4 md:gap-x-12 lg:gap-x-16 md:mt-[4.5rem]"
          >
            {footerNavColumns.map((links) => (
              <FooterNavList key={links[0].path} links={links} />
            ))}
          </nav>

          <nav aria-label="Навигация в подвале" className="mt-10 md:hidden">
            <div className="grid grid-cols-2 gap-x-8">
              {footerNavMobileColumns.map((links) => (
                <FooterNavList key={links[0].path} links={links} />
              ))}
            </div>
          </nav>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {COMPANY_NAME}
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-accent transition-colors duration-300">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="hover:text-accent transition-colors duration-300">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
