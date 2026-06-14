interface MapEmbedProps {
  embedUrl: string;
  openUrl: string;
  address: string;
  title?: string;
  className?: string;
}

export function MapEmbed({ embedUrl, openUrl, address, title, className = "" }: MapEmbedProps) {
  if (!embedUrl.trim()) return null;

  return (
    <div className={`relative aspect-video bg-secondary/30 rounded overflow-hidden ${className}`.trim()}>
      <iframe
        src={embedUrl}
        title={title ?? `Карта: ${address}`}
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {openUrl.trim() ? (
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 px-3 py-1.5 text-xs rounded bg-background/90 border border-border text-muted-foreground hover:text-accent transition-colors"
        >
          Открыть в Яндекс.Картах
        </a>
      ) : null}
    </div>
  );
}
