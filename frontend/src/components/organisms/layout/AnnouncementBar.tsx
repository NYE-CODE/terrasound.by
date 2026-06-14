interface AnnouncementBarProps {
  text: string;
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  const segment = (
    <>
      <span className="px-8 shrink-0">{text}</span>
      <span className="px-8 shrink-0" aria-hidden="true">
        •
      </span>
    </>
  );

  return (
    <div
      className="h-[var(--site-announcement-bar-height)] bg-accent text-accent-foreground overflow-hidden border-b border-border"
      role="region"
      aria-label="Объявление"
    >
      <div className="flex h-full items-center announcement-marquee-track">
        {segment}
        {segment}
        {segment}
        {segment}
        {segment}
        {segment}
        {segment}
        {segment}
      </div>
    </div>
  );
}
