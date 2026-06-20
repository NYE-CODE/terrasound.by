import { useEffect, useState } from "react";
import { LegalPageContent } from "../components/organisms/LegalPageContent";
import { usePageMeta } from "../hooks/usePageMeta";
import { api, type SiteLegalPage } from "../lib/api";
import { SITE_NAME, STATIC_PAGE_DESCRIPTIONS } from "../lib/site";
import { pageTopOffsetClass } from "../lib/pageLayout";

export function TermsPage() {
  const [page, setPage] = useState<SiteLegalPage | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .getLegalPage("terms")
      .then(setPage)
      .catch(() => setError(true));
  }, []);

  usePageMeta({
    title: page?.title ?? "Условия использования",
    description: page
      ? `${page.title} ${SITE_NAME} (terrasound.by).`
      : STATIC_PAGE_DESCRIPTIONS.terms,
    path: "/terms",
  });

  if (error) {
    return (
      <div className={`${pageTopOffsetClass} min-h-screen flex items-center justify-center text-muted-foreground`}>
        Не удалось загрузить страницу
      </div>
    );
  }

  if (!page) {
    return (
      <div className={`${pageTopOffsetClass} min-h-screen flex items-center justify-center text-muted-foreground`}>
        Загрузка...
      </div>
    );
  }

  return <LegalPageContent title={page.title} content={page.content} />;
}
