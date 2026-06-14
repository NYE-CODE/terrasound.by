import { useEffect, useState } from "react";
import { api, type Brand } from "../lib/api";
import { reportLoadError } from "../lib/loadError";
import { pageContentPy, pageTopOffsetClass } from "../lib/pageLayout";

export function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    api.getBrands().then(setBrands).catch(reportLoadError);
  }, []);

  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      <div className={`max-w-[1400px] mx-auto px-6 ${pageContentPy}`}>
        <div className="mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl mb-4">Наши бренды</h1>
          <p className="text-muted-foreground text-lg">
            Мы сотрудничаем с ведущими мировыми производителями автозвука
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="surface-card-interactive p-8"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-heading text-3xl">{brand.name}</h2>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{brand.country}</div>
                  <div>с {brand.since}</div>
                </div>
              </div>
              <p className="text-muted-foreground">{brand.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
