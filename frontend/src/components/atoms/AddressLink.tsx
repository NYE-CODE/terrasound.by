import { externalUrl } from "../../lib/contactHelpers";

interface AddressLinkProps {
  address: string;
  mapsUrl: string;
  className?: string;
}

export function AddressLink({
  address,
  mapsUrl,
  className = "hover:text-accent transition-colors",
}: AddressLinkProps) {
  const href = externalUrl(mapsUrl);
  if (!address.trim()) return null;
  if (!href) return <span className={className}>{address}</span>;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {address}
    </a>
  );
}
