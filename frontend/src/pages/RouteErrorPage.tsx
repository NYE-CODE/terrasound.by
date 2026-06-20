import { Link, useRouteError } from "react-router";
import { Button } from "../components/atoms/Button";
import { usePageMeta } from "../hooks/usePageMeta";
import { isChunkLoadError } from "../lib/lazyRoute";
import { pageTopOffsetClass } from "../lib/pageLayout";

export function RouteErrorPage() {
  const error = useRouteError();
  const chunkLoadFailed = isChunkLoadError(error);

  usePageMeta({
    title: "Ошибка загрузки",
    description: "Не удалось загрузить страницу.",
    indexable: false,
  });

  return (
    <div className={`${pageTopOffsetClass} min-h-screen flex items-center justify-center`}>
      <div className="text-center max-w-md px-6">
        <h1 className="font-heading text-4xl mb-4">
          {chunkLoadFailed ? "Страница устарела" : "Что-то пошло не так"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {chunkLoadFailed
            ? "Сайт мог обновиться, пока вкладка была открыта. Обновите страницу — обычно этого достаточно."
            : "Не удалось загрузить страницу. Попробуйте обновить или вернитесь на главную."}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button variant="primary" type="button" onClick={() => window.location.reload()}>
            Обновить страницу
          </Button>
          <Link to="/">
            <Button variant="ghost">На главную</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
