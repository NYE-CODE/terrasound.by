import { useProductHighlights } from "../../context/ProductHighlightsContext";

export function ProductHighlightsList() {
  const highlights = useProductHighlights();

  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="text-sm text-muted-foreground space-y-2">
      {highlights.map((line, index) => (
        <div key={`${index}-${line}`}>• {line}</div>
      ))}
    </div>
  );
}
