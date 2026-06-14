import { externalUrl, mapEmbedUrl } from "../../lib/contactHelpers";

interface MapEmbedProps {
  mapsUrl: string;
  address: string;
  title?: string;
  className?: string;
}

export function MapEmbed({ mapsUrl, address, title, className = "" }: MapEmbedProps) {
  const embedSrc = mapEmbedUrl(mapsUrl, address);
  const openUrl = externalUrl(mapsUrl);

  if (!embedSrc) return null;

  return (
    <div className={`relative aspect-video bg-secondary/30 rounded overflow-hidden ${className}`.trim()}>
      <iframe
        src={embedSrc}
        title={title ?? `Карта: ${address}`}
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {openUrl ? (
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 px-3 py-1.5 text-xs rounded bg-background/90 border border-border text-muted-foreground hover:text-accent transition-colors"
        >
          Открыть в картах
        </a>
      ) : null}
    </div>
  );
}
