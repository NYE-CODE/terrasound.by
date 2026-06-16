# Performance baseline — terrasound.by

Замеры без расширений Chrome (инкогнито или PageSpeed Insights). Расширения вроде Quillbot/React DevTools сильно завышают TBT и long tasks.

## Как перезамерить

1. **PageSpeed Insights (рекомендуется):** https://pagespeed.web.dev/analysis?url=https://terrasound.by/
2. **Chrome DevTools → Lighthouse:** режим инкогнито, без расширений, Mobile, Slow 4G.
3. **Проверка HTTP/2:** DevTools → Network → Protocol должен быть `h2` для статики на 443.

## Baseline до оптимизаций (локальный Lighthouse с расширениями — искажён)

| Метрика | Значение | Примечание |
|---------|----------|------------|
| Performance | 43 | TBT завышен расширениями |
| LCP | ~5.4 s | hero не в начальном HTML, HTTP/1.1 |
| FCP | ~2.1 s | |
| TBT | ~5.8 s | в основном chrome-extension:// |
| CLS | 0 | |
| TTFB | ~28 ms | |

## Baseline после деплоя (заполнить вручную через PSI)

PSI API недоступен без ключа (quota). Замер: https://pagespeed.web.dev/analysis?url=https://terrasound.by/

Текущий прод (до деплоя этих изменений, 2026-06-16): HTTP/1.1, HSTS без `preload`, CSP нет.

Дата: ___________

| Метрика | PSI mobile | Инкогнито Lighthouse |
|---------|------------|----------------------|
| Performance | | |
| LCP | | |
| FCP | | |
| TBT | | |
| Speed Index | | |

Коммит / деплой: ___________

## Внедрённые изменения

- HTTP/2 на 443 (`listen 443 ssl http2`)
- Preload LCP hero с `imagesrcset` (post-build в prerender, хеш из `dist/assets/`)
- Responsive hero: `hero-section-mobile.webp` (~600px) + `srcset`
- CSP: `Content-Security-Policy-Report-Only` (см. `deploy/nginx/includes/security-headers.conf`)
- HSTS: `preload` — подача на https://hstspreload.org/ после проверки всех поддоменов по HTTPS

## HSTS preload checklist

- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` на terrasound.by и www
- [ ] То же на admin.terrasound.by (тот же include)
- [ ] Редирект HTTP → HTTPS для всех хостов
- [ ] Нет смешанного контента на поддоменах
- [ ] Подача домена на https://hstspreload.org/
