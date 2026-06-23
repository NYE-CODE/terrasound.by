import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "../../atoms/Button";
import { acceptCookieConsent, readCookieConsent } from "../../../lib/cookieConsent";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!readCookieConsent());
  }, []);

  if (!open) return null;

  const handleAccept = () => {
    acceptCookieConsent();
    setOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[74] bg-background/60" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        className="fixed inset-x-0 bottom-0 z-[75] border-t border-border bg-card p-4 sm:p-6 shadow-lg"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0 space-y-1">
            <p id="cookie-consent-title" className="font-heading text-sm uppercase tracking-wider">
              Мы используем cookie
            </p>
            <p id="cookie-consent-description" className="text-sm text-muted-foreground leading-relaxed">
              Сайт применяет файлы cookie и похожие технологии для корректной работы, сохранения
              настроек (например, корзины) и анализа посещаемости в маркетинговых целях. Подробнее — в{" "}
              <Link to="/privacy" className="text-accent hover:underline">
                Политике конфиденциальности
              </Link>
              .
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            className="w-full sm:w-auto shrink-0"
            onClick={handleAccept}
          >
            Хорошо
          </Button>
        </div>
      </div>
    </>
  );
}
