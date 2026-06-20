import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const CHUNK_RELOAD_KEY = "terrasound-chunk-reload";

/** Ошибки загрузки code-split чанков после деплоя или при сбое сети. */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("importing a module script failed") ||
    message.includes("failed to load module script") ||
    message.includes("error loading dynamically imported module")
  );
}

type LazyModule<T extends ComponentType<unknown>> = { default: T };

/**
 * Обёртка над React.lazy: при ошибке загрузки чанка один раз перезагружает страницу
 * (типичный сценарий — пользователь остался на старой вкладке после деплоя).
 */
export function lazyRoute<T extends ComponentType<unknown>>(
  factory: () => Promise<LazyModule<T>>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const module = await factory();
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      return module;
    } catch (error) {
      if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
        window.location.reload();
        return new Promise<LazyModule<T>>(() => {});
      }

      throw error;
    }
  });
}
