type TelegramIconProps = {
  size?: number;
  className?: string;
};

export function TelegramIcon({ size = 16, className }: TelegramIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M21.94 4.57a1.5 1.5 0 0 0-1.53-.25L2.89 12.41a1.5 1.5 0 0 0 .18 2.82l4.47 1.47 1.71 5.19a1.5 1.5 0 0 0 2.84.08l2.42-5.01 5.03 3.72a1.5 1.5 0 0 0 2.32-.95l3.18-14.16a1.5 1.5 0 0 0-.6-1.6zM9.18 14.24l-.08 3.05 1.05-3.17 6.15-5.58-7.12 5.7z" />
    </svg>
  );
}
