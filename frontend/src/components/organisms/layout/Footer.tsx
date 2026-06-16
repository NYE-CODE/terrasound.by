import { Link } from "react-router";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import { AddressLink } from "../../atoms/AddressLink";
import { TikTokIcon } from "../../icons/TikTokIcon";
import { TelegramIcon } from "../../icons/TelegramIcon";
import { externalUrl, socialHandle } from "../../../lib/contactHelpers";
import { COMPANY_NAME, SITE_NAME, TAGLINE } from "../../../lib/site";
import { useSiteContact } from "../../../context/SiteContactContext";
import logo from "../../../assets/logo.png";
import { LOGO_HEIGHT, LOGO_WIDTH } from "../../../lib/brandAssets";

const footerNavLinks = [
  { path: "/catalogue", label: "Каталог" },
  { path: "/installation", label: "Услуги" },
  { path: "/brands", label: "Бренды" },
  { path: "/blog", label: "Блог" },
  { path: "/about", label: "О нас" },
  { path: "/delivery", label: "Доставка" },
  { path: "/contact", label: "Контакты" },
] as const;

const footerNavMobileColumn1 = footerNavLinks.slice(0, 4);
const footerNavMobileColumn2 = footerNavLinks.slice(4);

const footerNavLinkClass =
  "block w-fit font-heading text-sm uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors duration-300";

function FooterNavLink({ path, label }: { path: string; label: string }) {
  return (
    <li>
      <Link to={path} className={footerNavLinkClass}>
        {label}
      </Link>
    </li>
  );
}

export function Footer() {
  const contact = useSiteContact();

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <h2 className="sr-only">Контакты и навигация</h2>

        <div className="mb-12">
          <div className="max-w-md">
            <Link to="/" className="inline-flex mb-4" aria-label={SITE_NAME}>
              <img src={logo} alt={SITE_NAME} width={LOGO_WIDTH} height={LOGO_HEIGHT} className="h-14 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground mb-2">{COMPANY_NAME}</p>
            <p className="text-sm text-muted-foreground mb-6">{TAGLINE}</p>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${contact.phoneTel}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
              >
                <Phone size={16} />
                <span>{contact.phone}</span>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
              >
                <Mail size={16} />
                <span>{contact.email}</span>
              </a>
              {contact.instagramUrl.trim() && (
                <a
                  href={externalUrl(contact.instagramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
                >
                  <Instagram size={16} />
                  <span>{socialHandle(contact.instagramUrl)}</span>
                </a>
              )}
              {contact.tiktokUrl.trim() && (
                <a
                  href={externalUrl(contact.tiktokUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
                >
                  <TikTokIcon size={16} />
                  <span>{socialHandle(contact.tiktokUrl)}</span>
                </a>
              )}
              {contact.telegramUrl.trim() && (
                <a
                  href={externalUrl(contact.telegramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
                >
                  <TelegramIcon size={16} />
                  <span>{socialHandle(contact.telegramUrl)}</span>
                </a>
              )}
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin size={16} />
                <AddressLink
                  address={contact.address}
                  mapsUrl={contact.addressMapsUrl}
                  className="hover:text-accent transition-colors duration-300"
                />
              </div>
            </div>
          </div>

          <nav aria-label="Навигация в подвале" className="mt-10">
            <div className="grid grid-cols-2 gap-x-8 md:hidden">
              <ul className="space-y-3">
                {footerNavMobileColumn1.map((link) => (
                  <FooterNavLink key={link.path} {...link} />
                ))}
              </ul>
              <ul className="space-y-3">
                {footerNavMobileColumn2.map((link) => (
                  <FooterNavLink key={link.path} {...link} />
                ))}
              </ul>
            </div>

            <ul className="hidden md:flex md:w-full md:justify-between md:items-center md:gap-4">
              {footerNavLinks.map((link) => (
                <FooterNavLink key={link.path} {...link} />
              ))}
            </ul>
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
