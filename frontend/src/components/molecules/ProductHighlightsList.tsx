import { ProductHighlightsProvider, useProductHighlights } from "../../context/ProductHighlightsContext";

function ProductHighlightsListContent() {
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

export function ProductHighlightsList() {
  return (
    <ProductHighlightsProvider>
      <ProductHighlightsListContent />
    </ProductHighlightsProvider>
  );
}
