import { useEffect, useRef, useState } from "react";
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
import { formSelectTriggerClass } from "../lib/formControlStyles";
import { siteSelectContentClass } from "../lib/selectControlStyles";
import { ChevronsDown, Info } from "lucide-react";
import { toast } from "sonner";
import {
  PHONE_INPUT_PLACEHOLDER,
  validateCarModel,
  validatePersonName,
  validatePhone,
} from "@terrasound/shared";
import { api, messageFromApiError, type InstallationService } from "../lib/api";
import { usePageMeta } from "../hooks/usePageMeta";
import { reportLoadError } from "../lib/loadError";
import { scrollToHash } from "../lib/scrollToHash";
import {
  minHScreenBelowHeaderClass,
  pageContentPy,
  pageSectionPy,
  pageTopOffsetClass,
  scrollMtBelowHeaderClass,
} from "../lib/pageLayout";
import installationHero from "../assets/installation-hero.webp";
import { SITE_NAME, STATIC_PAGE_DESCRIPTIONS } from "../lib/site";

const timeline = [
  {
    number: "01",
    title: "Консультация",
    description:
      "Обсуждаем ваши цели и желания, чтобы подобрать и спроектировать идеальную систему для Вас.",
  },
  {
    number: "02",
    title: "Подбор компонентов",
    description: "Подбираем оборудование в соответствии с вашими вкусовыми предпочтениями.",
  },
  {
    number: "03",
    title: "Установка",
    description:
      "Профессиональная установка в нашей студии с вниманием к деталям и заботой о вашем автомобиле.",
  },
  {
    number: "04",
    title: "Настройка",
    description:
      "Точная акустическая настройка для создания звуковой сцены и правильного звучания в вашем автомобиле.",
  },
];

export function InstallationPage() {
  const { pathname, hash } = useLocation();
  const [services, setServices] = useState<InstallationService[]>([]);

  usePageMeta({
    title: "Услуги",
    description: STATIC_PAGE_DESCRIPTIONS.installation,
    path: "/installation",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    carModel: "",
    service: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceSelectKey, setServiceSelectKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    api.getServices().then(setServices).catch(reportLoadError);
  }, []);

  useEffect(() => {
    if (hash !== "#consultation") return;
    return scrollToHash(hash);
  }, [pathname, hash, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submittingRef.current) return;

    const nextErrors: Record<string, string> = {};
    const nameResult = validatePersonName(formData.name);
    const phoneResult = validatePhone(formData.phone);
    const carModelResult = validateCarModel(formData.carModel);

    if (!nameResult.ok) nextErrors.name = nameResult.error;
    if (!phoneResult.ok) nextErrors.phone = phoneResult.error;
    if (!carModelResult.ok) nextErrors.carModel = carModelResult.error;
    if (!formData.email.trim()) nextErrors.email = "Укажите email";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      nextErrors.email = "Неверный формат email";
    }
    if (!formData.service.trim()) nextErrors.service = "Выберите услугу";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (!nameResult.ok || !phoneResult.ok || !carModelResult.ok) return;

    submittingRef.current = true;
    setSubmitting(true);

    try {
      await api.createInstallationRequest({
        name: nameResult.value,
        phone: phoneResult.value,
        email: formData.email.trim(),
        carModel: carModelResult.value,
        service: formData.service,
      });
      toast.success("Заявка отправлена! Подтверждение придёт на email.");
      setFormData({ name: "", phone: "", email: "", carModel: "", service: "" });
      setServiceSelectKey((key) => key + 1);
      setErrors({});
    } catch (error) {
      toast.error(messageFromApiError(error, "Не удалось отправить заявку"));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      {/* Hero Header */}
      <section className={`relative isolate ${minHScreenBelowHeaderClass} flex items-center justify-center overflow-hidden`}>
        <img
          src={installationHero}
          alt={`Студия ${SITE_NAME}`}
          className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/50 via-background/70 to-background pointer-events-none" />
        <div className="relative z-[2] flex flex-col items-center text-center max-w-3xl px-6">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl mb-6">Профессиональная установка</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Подбор, установка и настройка акустических систем
          </p>
          <button
            type="button"
            onClick={() => scrollToHash("#services")}
            aria-label="Перейти к разделу «Наши услуги»"
            className="mt-20 p-2 text-accent transition-colors hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full"
          >
            <ChevronsDown size={44} strokeWidth={1.75} className="animate-pulse" aria-hidden />
          </button>
        </div>
      </section>

      {/* Services */}
      <section id="services" className={`${pageSectionPy} bg-background ${scrollMtBelowHeaderClass}`}>
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
            Получите подробную консультацию по возможным вариантам акустических систем для вашего автомобиля
          </p>
          <form onSubmit={handleSubmit} className="bg-card border border-card-border rounded p-8 space-y-6">
            <FormField
              label="Ваше имя"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="Введите ваше имя"
            />
            <FormField
              label="Телефон"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              placeholder={PHONE_INPUT_PLACEHOLDER}
            />
            <FormField
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="example@mail.com"
            />
            <FormField
              label="Модель автомобиля"
              type="text"
              required
              value={formData.carModel}
              onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
              error={errors.carModel}
              placeholder="WV Passat 2020"
            />
            <div>
              <label className="block font-heading text-sm uppercase tracking-wider mb-2">
                Интересующая услуга
              </label>
              <Select
                key={serviceSelectKey}
                value={formData.service || undefined}
                onValueChange={(value) => setFormData({ ...formData, service: value })}
              >
                <SelectTrigger
                  size="lg"
                  className={cn(
                    formSelectTriggerClass,
                    "!h-12 !min-h-12 !max-h-12 !py-0",
                    errors.service && "border-destructive",
                  )}
                >
                  <SelectValue placeholder="Выберите услугу" />
                </SelectTrigger>
                <SelectContent className={siteSelectContentClass}>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.title}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.service && (
                <p className="text-xs leading-tight text-destructive mt-1">{errors.service}</p>
              )}
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? "Отправка..." : "Запросить консультацию"}
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
