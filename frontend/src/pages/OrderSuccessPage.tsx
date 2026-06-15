import { Link, useParams } from "react-router";
import { Button } from "../components/atoms/Button";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { AddressLink } from "../components/atoms/AddressLink";
import { useSiteContact } from "../context/SiteContactContext";
import { pageContentPy, pageTopOffsetClass } from "../lib/pageLayout";

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const contact = useSiteContact();

  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      <div className={`max-w-2xl mx-auto px-6 ${pageContentPy}`}>
        <div className="bg-card border border-card-border rounded p-8 text-center">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-accent" />
          </div>

          <h1 className="font-heading text-4xl mb-4">Заказ получен!</h1>

          <div className="text-muted-foreground mb-2">Номер заказа</div>
          <div className="font-heading text-3xl text-accent mb-8">#{orderId}</div>

          <div className="bg-background border border-border rounded p-6 mb-8 text-left">
            <h2 className="font-heading text-lg mb-4">Что дальше?</h2>
            <ul className="space-y-3 text-sm text-muted-foreground list-none">
              <li className="flex gap-3">
                <span className="text-accent mt-0.5 shrink-0" aria-hidden="true">
                  •
                </span>
                <span>Мы свяжемся с вами в течение 24 часов для подтверждения заказа</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent mt-0.5 shrink-0" aria-hidden="true">
                  •
                </span>
                <span>Если выбрана оплата картой или безналичный расчет — счет будет выслан на указанный email</span>
              </li>
            </ul>
          </div>

          <div className="bg-background border border-border rounded p-6 mb-8">
            <h3 className="font-heading text-sm uppercase tracking-wider mb-4">Контакты для связи</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Phone size={16} />
                <a href={`tel:${contact.phoneTel}`} className="hover:text-accent transition-colors duration-300">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail size={16} />
                <a href={`mailto:${contact.email}`} className="hover:text-accent transition-colors duration-300">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin size={16} />
                <AddressLink
                  address={contact.address}
                  mapsUrl={contact.addressMapsUrl}
                  className="hover:text-accent transition-colors duration-300"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/">
              <Button variant="primary">Вернуться на главную</Button>
            </Link>
            <Link to="/catalogue">
              <Button variant="ghost">Просмотреть каталог</Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Письмо с подтверждением отправлено на указанный email
          </p>
        </div>
      </div>
    </div>
  );
}
