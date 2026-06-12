import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import { TikTokIcon } from "../../icons/TikTokIcon";
import { api, type Category } from "../../../lib/api";
import { reportLoadError } from "../../../lib/loadError";
import { externalUrl, socialHandle } from "../../../lib/contactHelpers";
import { COMPANY_NAME, SITE_NAME, TAGLINE } from "../../../lib/site";
import { useSiteContact } from "../../../context/SiteContactContext";
import logo from "../../../assets/logo.png";

export function Footer() {
  const contact = useSiteContact();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(reportLoadError);
  }, []);

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <Link to="/" className="inline-flex mb-4" aria-label={SITE_NAME}>
              <img src={logo} alt={SITE_NAME} className="h-14 w-auto" />
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
              <a
                href={contact.addressMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors duration-300"
              >
                <MapPin size={16} />
                <span>{contact.address}</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Каталог</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  to={`/catalogue?category=${category.id}`}
                  className="block w-fit hover:text-accent transition-colors duration-300"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Услуги</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link to="/installation" className="block w-fit hover:text-accent transition-colors duration-300">
                Установка
              </Link>
              <Link to="/installation" className="block w-fit hover:text-accent transition-colors duration-300">
                Акустическая калибровка
              </Link>
              <Link to="/installation" className="block w-fit hover:text-accent transition-colors duration-300">
                Шумоизоляция
              </Link>
              <Link to="/installation" className="block w-fit hover:text-accent transition-colors duration-300">
                Консультация
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Компания</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link to="/about" className="block w-fit hover:text-accent transition-colors duration-300">
                О нас
              </Link>
              <Link to="/blog" className="block w-fit hover:text-accent transition-colors duration-300">
                Блог
              </Link>
              <Link to="/brands" className="block w-fit hover:text-accent transition-colors duration-300">
                Бренды
              </Link>
              <Link to="/delivery" className="block w-fit hover:text-accent transition-colors duration-300">
                Доставка
              </Link>
              <Link to="/contact" className="block w-fit hover:text-accent transition-colors duration-300">
                Контакты
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2026 {COMPANY_NAME}
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
