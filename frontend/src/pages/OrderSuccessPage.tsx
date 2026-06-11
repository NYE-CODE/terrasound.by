import { Link, useParams } from "react-router";
import { Button } from "../components/atoms/Button";
import { Check, Mail, Phone } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from "../lib/site";
import { pageContentPy } from "../lib/pageLayout";

export function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <div className="pt-20 min-h-screen">
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
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Check size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <span>Мы свяжемся с вами в течение 24 часов для подтверждения заказа</span>
              </div>
              <div className="flex gap-3">
                <Check size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <span>Если выбрана оплата картой или безналичный расчет — счет будет выслан на указанный email</span>
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded p-6 mb-8">
            <h3 className="font-heading text-sm uppercase tracking-wider mb-4">Контакты для связи</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Phone size={16} />
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="hover:text-accent transition-colors duration-300">
                  {CONTACT_PHONE}
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail size={16} />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-accent transition-colors duration-300">
                  {CONTACT_EMAIL}
                </a>
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
