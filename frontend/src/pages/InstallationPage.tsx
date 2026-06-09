import { useEffect, useState } from "react";
import { Button } from "../components/atoms/Button";
import { FormField } from "../components/molecules/FormField";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { api, type InstallationService, type TeamMember } from "../lib/api";
import { ADDRESS, CONTACT_PHONE } from "../lib/site";

const timeline = [
  {
    number: "01",
    title: "Консультация",
    description: "Обсуждаем ваши цели, бюджет и особенности автомобиля, чтобы спроектировать идеальную систему.",
  },
  {
    number: "02",
    title: "Подбор",
    description: "Выбираем оборудование из нашего каталога или устанавливаем ваши компоненты.",
  },
  {
    number: "03",
    title: "Установка",
    description: "Профессиональный монтаж в нашей мастерской с вниманием к деталям и аккуратной проводкой.",
  },
  {
    number: "04",
    title: "Калибровка",
    description: "Точная акустическая настройка для оптимального качества звука в вашем автомобиле.",
  },
];

export function InstallationPage() {
  const [services, setServices] = useState<InstallationService[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    carModel: "",
    service: "",
  });

  useEffect(() => {
    api.getServices().then(setServices).catch(console.error);
    api.getTeam().then(setTeam).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createInstallationRequest({
        name: formData.name,
        phone: formData.phone,
        carModel: formData.carModel,
        service: formData.service,
      });
      toast.success("Заявка отправлена! Мы свяжемся с вами в течение 24 часов.");
      setFormData({ name: "", phone: "", carModel: "", service: "" });
    } catch {
      toast.error("Не удалось отправить заявку");
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Header */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background z-10" />
        <img
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1600&q=80"
          alt="Мастерская"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center max-w-3xl px-6">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl mb-6">Профессиональная установка</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Экспертная установка и акустическая калибровка в нашей мастерской в Гродно
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="font-heading text-4xl mb-12">Наши услуги</h2>
          <div className="space-y-6">
            {services.map((service, index) => (
              <div key={service.id} className="bg-card border border-card-border rounded p-6 hover:border-accent transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 sm:gap-4 mb-2">
                      <span className="font-heading text-xl sm:text-2xl text-accent shrink-0">{String(index + 1).padStart(2, '0')}</span>
                      <h3 className="font-heading text-lg sm:text-xl">{service.title}</h3>
                    </div>
                    <p className="text-muted-foreground sm:ml-10 md:ml-14">{service.description}</p>
                  </div>
                  <div className="sm:text-right flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-1">От</div>
                    <div className="font-heading text-xl">
                      <span className="text-xs text-muted-foreground align-baseline">BYN</span> {service.priceRange}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 bg-card/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="font-heading text-4xl mb-12">Как мы работаем</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {timeline.map((step, index) => (
              <div key={index} className="relative">
                {index < timeline.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-[2px] bg-border -translate-x-1/2" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-accent text-accent-foreground rounded flex items-center justify-center font-heading text-xl mb-4">
                    {step.number}
                  </div>
                  <h3 className="font-heading text-xl mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-background">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="font-heading text-4xl mb-12">Наша команда</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.id} className="bg-card border border-card-border rounded overflow-hidden hover:border-accent transition-all duration-300">
                <div className="aspect-square overflow-hidden">
                  <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl mb-1">{member.name}</h3>
                  <div className="text-sm text-accent">{member.specialty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 bg-card/50">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-heading text-4xl mb-4 text-center">Записаться на консультацию</h2>
          <p className="text-center text-muted-foreground mb-12">
            Получите экспертную консультацию и подробную смету по вашему проекту
          </p>
          <form onSubmit={handleSubmit} className="bg-card border border-card-border rounded p-8 space-y-6">
            <FormField
              label="Ваше имя"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите ваше имя"
            />
            <FormField
              label="Телефон"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={CONTACT_PHONE}
            />
            <FormField
              label="Модель автомобиля"
              type="text"
              required
              value={formData.carModel}
              onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
              placeholder="например, BMW 5 Series 2020"
            />
            <div>
              <label className="block font-heading text-sm uppercase tracking-wider mb-2">
                Интересующая услуга
              </label>
              <select
                required
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full h-12 px-4 bg-input border border-border rounded text-foreground focus:border-accent focus:outline-none transition-all duration-300"
              >
                <option value="">Выберите услугу</option>
                {services.map((service) => (
                  <option key={service.id} value={service.title}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Запросить консультацию
            </Button>
            <div className="flex items-start gap-3 pt-4 text-sm text-muted-foreground">
              <Check size={16} className="text-accent mt-1 flex-shrink-0" />
              <span>Мы свяжемся с вами в течение 24 часов для записи на консультацию</span>
            </div>
          </form>
        </div>
      </section>

      {/* Workshop Info */}
      <section className="py-20 bg-background border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-4xl mb-6">Наша мастерская</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Мастерская в Гродно оснащена профессиональным инструментом и оборудованием для акустических измерений.</p>
                <p>Мы работаем только по записи, чтобы каждая установка получала должное внимание.</p>
                <div className="pt-6 space-y-2">
                  <div><span className="text-foreground font-heading">Адрес:</span> {ADDRESS}</div>
                  <div><span className="text-foreground font-heading">Режим работы:</span> Пн–Сб, 10:00–19:00</div>
                  <div><span className="text-foreground font-heading">Телефон:</span> {CONTACT_PHONE}</div>
                </div>
              </div>
            </div>
            <div className="aspect-video bg-secondary/30 rounded overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80"
                alt="Интерьер мастерской"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
