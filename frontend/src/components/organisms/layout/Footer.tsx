import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import { api, type Category } from "../../../lib/api";
import { ADDRESS, COMPANY_NAME, CONTACT_EMAIL, CONTACT_PHONE, SITE_NAME, TAGLINE } from "../../../lib/site";

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-heading text-2xl mb-4">{SITE_NAME}</h3>
            <p className="text-sm text-muted-foreground mb-2">{COMPANY_NAME}</p>
            <p className="text-sm text-muted-foreground mb-6">{TAGLINE}</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone size={16} />
                <span>{CONTACT_PHONE}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail size={16} />
                <span>{CONTACT_EMAIL}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin size={16} />
                <span>{ADDRESS}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Каталог</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  to={`/catalogue?category=${category.id}`}
                  className="block hover:text-accent transition-colors duration-300"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Услуги</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link to="/installation" className="block hover:text-accent transition-colors duration-300">
                Установка
              </Link>
              <Link to="/installation" className="block hover:text-accent transition-colors duration-300">
                Акустическая калибровка
              </Link>
              <Link to="/installation" className="block hover:text-accent transition-colors duration-300">
                Шумоизоляция
              </Link>
              <Link to="/installation" className="block hover:text-accent transition-colors duration-300">
                Консультация
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Компания</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link to="/about" className="block hover:text-accent transition-colors duration-300">
                О нас
              </Link>
              <Link to="/blog" className="block hover:text-accent transition-colors duration-300">
                Блог
              </Link>
              <Link to="/brands" className="block hover:text-accent transition-colors duration-300">
                Бренды
              </Link>
              <Link to="/delivery" className="block hover:text-accent transition-colors duration-300">
                Доставка
              </Link>
              <Link to="/contact" className="block hover:text-accent transition-colors duration-300">
                Контакты
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2026 {COMPANY_NAME}. {SITE_NAME} — премиальный автозвук в Гродно.
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
