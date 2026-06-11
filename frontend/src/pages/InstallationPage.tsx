import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Button } from "../components/atoms/Button";
import { FormField } from "../components/molecules/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { cn } from "../components/ui/utils";
import { formControlClass, formSelectTriggerClass } from "../lib/formControlStyles";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { api, type InstallationService } from "../lib/api";
import { CONTACT_PHONE } from "../lib/site";
import { scrollToHash } from "../lib/scrollToHash";
import { pageContentPy, pageSectionPy } from "../lib/pageLayout";

const timeline = [
  {
    number: "01",
    title: "Консультация",
    description: "Обсуждаем ваши цели, бюджет и особенности автомобиля, чтобы спроектировать идеальную систему.",
  },
  {
    number: "02",
    title: "Подбор компонентов",
    description: "Подбираем оборудование из нашего каталога или из каталога наших партнёров.",
  },
  {
    number: "03",
    title: "Установка",
    description: "Профессиональный монтаж в нашей студии с вниманием к деталям и заботой о вашем автомобиле.",
  },
  {
    number: "04",
    title: "Настройка",
    description: "Точная акустическая настройка для превосходного качества звука в вашем автомобиле.",
  },
];

export function InstallationPage() {
  const { pathname, hash } = useLocation();
  const [services, setServices] = useState<InstallationService[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    carModel: "",
    service: "",
  });

  useEffect(() => {
    api.getServices().then(setServices).catch(console.error);
  }, []);

  useEffect(() => {
    if (hash !== "#consultation") return;
    return scrollToHash(hash);
  }, [pathname, hash, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service.trim()) {
      toast.error("Выберите услугу");
      return;
    }
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
    <div className="pt-[var(--site-header-height)] min-h-screen">
      {/* Hero Header */}
      <section className="relative isolate h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1600&q=80"
          alt="Студия"
          className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/50 to-background pointer-events-none" />
        <div className="relative z-[2] text-center max-w-3xl px-6">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl mb-6">Профессиональная установка</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Экспертная установка и акустическая калибровка в нашей студии в Гродно
          </p>
        </div>
      </section>

      {/* Services */}
      <section className={`${pageSectionPy} bg-background`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="font-heading text-4xl mb-12">Наши услуги</h2>
          <div className="space-y-6">
            {services.map((service, index) => (
              <div key={service.id} className="bg-card border border-card-border rounded p-6">
                <div className="flex items-baseline gap-3 sm:gap-4 mb-2">
                  <span className="font-heading text-xl sm:text-2xl text-accent shrink-0">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="font-heading text-lg sm:text-xl">{service.title}</h3>
                </div>
                <p className="text-muted-foreground sm:ml-10 md:ml-14">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className={`${pageSectionPy} bg-card/50`}>
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

      {/* Booking Form */}
      <section id="consultation" className={`${pageSectionPy} bg-card/50 scroll-mt-20`}>
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
              <Select
                value={formData.service || undefined}
                onValueChange={(value) => setFormData({ ...formData, service: value })}
              >
                <SelectTrigger size="lg" className={cn(formControlClass, formSelectTriggerClass, "py-0 text-base dark:bg-input dark:hover:bg-input")}>
                  <SelectValue placeholder="Выберите услугу" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.title}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Запросить консультацию
            </Button>
            <div className="flex items-start gap-3 pt-4 text-sm text-muted-foreground">
              <Info size={16} className="text-accent mt-1 flex-shrink-0" />
              <span>Мы свяжемся с вами в течение 24 часов для записи на консультацию</span>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
