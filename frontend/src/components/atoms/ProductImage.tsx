export interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductImage({
  src,
  alt,
  className = "w-full h-full object-cover",
}: ProductImageProps) {
  return <img src={src} alt={alt} className={className} />;
}
