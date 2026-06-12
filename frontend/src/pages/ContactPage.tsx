import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { TikTokIcon } from "../components/icons/TikTokIcon";
import { useSiteContact } from "../context/SiteContactContext";
import { externalUrl, socialHandle } from "../lib/contactHelpers";
import { pageContentPy } from "../lib/pageLayout";
import { COMPANY_NAME, WORKING_HOURS } from "../lib/site";

export function ContactPage() {
  const contact = useSiteContact();

  return (
    <div className="pt-20 min-h-screen">
      <div className={`max-w-[1400px] mx-auto px-6 ${pageContentPy}`}>
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
              <a href={`tel:${contact.phoneTel}`} className="text-muted-foreground hover:text-accent transition-colors">
                {contact.phone}
              </a>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Mail size={20} className="text-accent" />
                <h3 className="font-heading text-xl">Email</h3>
              </div>
              <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-accent transition-colors">
                {contact.email}
              </a>
            </div>

            {contact.instagramUrl.trim() && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Instagram size={20} className="text-accent" />
                  <h3 className="font-heading text-xl">Instagram</h3>
                </div>
                <a
                  href={externalUrl(contact.instagramUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {socialHandle(contact.instagramUrl)}
                </a>
              </div>
            )}

            {contact.tiktokUrl.trim() && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <TikTokIcon size={20} className="text-accent" />
                  <h3 className="font-heading text-xl">TikTok</h3>
                </div>
                <a
                  href={externalUrl(contact.tiktokUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  {socialHandle(contact.tiktokUrl)}
                </a>
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 mb-3">
                <MapPin size={20} className="text-accent" />
                <h3 className="font-heading text-xl">Адрес</h3>
              </div>
              <a
                href={contact.addressMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                {contact.address}
              </a>
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
