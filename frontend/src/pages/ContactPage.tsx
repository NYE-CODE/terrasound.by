import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { ADDRESS, COMPANY_NAME, CONTACT_EMAIL, CONTACT_PHONE, WORKING_HOURS } from "../lib/site";

export function ContactPage() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <h1 className="font-heading text-5xl mb-12">Контакты</h1>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <p className="text-muted-foreground mb-6">{COMPANY_NAME}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Phone size={20} className="text-accent" />
                <h3 className="font-heading text-xl">Телефон</h3>
              </div>
              <p className="text-muted-foreground">{CONTACT_PHONE}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Mail size={20} className="text-accent" />
                <h3 className="font-heading text-xl">Email</h3>
              </div>
              <p className="text-muted-foreground">{CONTACT_EMAIL}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <MapPin size={20} className="text-accent" />
                <h3 className="font-heading text-xl">Адрес</h3>
              </div>
              <p className="text-muted-foreground">{ADDRESS}</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Clock size={20} className="text-accent" />
                <h3 className="font-heading text-xl">Режим работы</h3>
              </div>
              <p className="text-muted-foreground">{WORKING_HOURS}</p>
            </div>
          </div>

          <div className="aspect-video bg-secondary/30 rounded overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80"
              alt="Расположение студии"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
