import { FormEvent, useEffect, useState } from "react";
import { FormField, FormRequiredNote } from "../components/FormField";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formCardClass, inputClass } from "../lib/formStyles";
import { reportFormError, reportLoadError} from "../lib/formError";
import { api, type SiteContact, type SiteContactInput } from "../lib/api";

const defaultForm: SiteContactInput = {
  phone: "+375 33 917 7444",
  email: "info@terrasound.by",
  instagramUrl: "https://instagram.com/terrasound.by",
  tiktokUrl: "https://www.tiktok.com/@terrasound.by",
  telegramUrl: "https://t.me/terrasound_by",
  address: "г. Гродно, Озерское шоссе, 14",
  mapsUrl: "https://yandex.by/maps/?mode=routes&rtext=~53.648422,23.876194&rtt=auto",
  workingHours: "Пн–Пт, 10:00–18:00, обед 14:00–15:00",
};

function toForm(contact: SiteContact): SiteContactInput {
  return {
    phone: contact.phone,
    email: contact.email,
    instagramUrl: contact.instagramUrl,
    tiktokUrl: contact.tiktokUrl,
    telegramUrl: contact.telegramUrl,
    address: contact.address,
    mapsUrl: contact.mapsUrl,
    workingHours: contact.workingHours,
  };
}

export function SiteContactPage() {
  const { status } = useAuth();
  const [form, setForm] = useState<SiteContactInput>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    api
      .siteContact()
      .then((contact) => setForm(toForm(contact)))
      .catch(reportLoadError)
      .finally(() => setLoading(false));
  }, [status]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status !== "authenticated") return;
    setSubmitting(true);
    setSaved(false);
    try {
      const contact = await api.updateSiteContact(form);
      setForm(toForm(contact));
      setSaved(true);
    } catch (error) {
      reportFormError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-[var(--muted-foreground)]">Загрузка...</div>;
  }

  return (
    <div>
      <PageHeader title="Контакты сайта" />

      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-2xl">
        Телефон, email, соцсети и адрес отображаются в шапке, подвале, на странице контактов и в
        других разделах сайта. Поля Instagram, TikTok и Telegram можно оставить пустыми — ссылка не
        будет показана.
      </p>

      <form onSubmit={handleSubmit} className={`${formCardClass} max-w-xl space-y-4`}>
        <FormRequiredNote />

        <FormField label="Телефон" htmlFor="contact-phone" required hint="Как показывать на сайте, например: +375 33 917 7444">
          <input
            id="contact-phone"
            type="text"
            maxLength={64}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <FormField label="Email" htmlFor="contact-email" required>
          <input
            id="contact-email"
            type="email"
            maxLength={255}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <FormField
          label="Instagram"
          htmlFor="contact-instagram"
          optional
          hint="Полная ссылка, например: https://instagram.com/terrasound.by"
        >
          <input
            id="contact-instagram"
            type="url"
            maxLength={512}
            value={form.instagramUrl}
            onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
            className={inputClass}
            placeholder="https://instagram.com/..."
          />
        </FormField>

        <FormField
          label="TikTok"
          htmlFor="contact-tiktok"
          optional
          hint="Полная ссылка, например: https://www.tiktok.com/@terrasound.by"
        >
          <input
            id="contact-tiktok"
            type="url"
            maxLength={512}
            value={form.tiktokUrl}
            onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
            className={inputClass}
            placeholder="https://www.tiktok.com/@..."
          />
        </FormField>

        <FormField
          label="Telegram"
          htmlFor="contact-telegram"
          optional
          hint="Полная ссылка, например: https://t.me/terrasound_by"
        >
          <input
            id="contact-telegram"
            type="url"
            maxLength={512}
            value={form.telegramUrl}
            onChange={(e) => setForm({ ...form, telegramUrl: e.target.value })}
            className={inputClass}
            placeholder="https://t.me/..."
          />
        </FormField>

        <FormField label="Адрес" htmlFor="contact-address" required hint="Текст адреса на сайте">
          <input
            id="contact-address"
            type="text"
            maxLength={512}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={inputClass}
            required
          />
        </FormField>

        <FormField
          label="Ссылка Яндекс.Карт"
          htmlFor="contact-maps-url"
          required
          hint="Откройте вашу точку в Яндекс.Картах → «Поделиться» → скопируйте ссылку. По ней на сайте откроется маршрут; карта в рамке строится автоматически."
        >
          <input
            id="contact-maps-url"
            type="url"
            maxLength={1024}
            value={form.mapsUrl}
            onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
            className={inputClass}
            placeholder="https://yandex.by/maps/..."
            required
          />
        </FormField>

        <FormField
          label="Режим работы"
          htmlFor="contact-working-hours"
          optional
          hint='Например: Пн–Пт, 10:00–18:00, обед 14:00–15:00'
        >
          <input
            id="contact-working-hours"
            type="text"
            maxLength={256}
            value={form.workingHours}
            onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
            className={inputClass}
            placeholder="Пн–Пт, 10:00–18:00, обед 14:00–15:00"
          />
        </FormField>

        <button
          type="submit"
          disabled={submitting}
          className="h-11 px-6 bg-[var(--accent)] text-[#0e0e0f] font-medium rounded disabled:opacity-60"
        >
          {submitting ? "Сохранение..." : "Сохранить"}
        </button>

        {saved && <p className="text-sm text-[#86efac]">Контакты сохранены</p>}
      </form>
    </div>
  );
}
