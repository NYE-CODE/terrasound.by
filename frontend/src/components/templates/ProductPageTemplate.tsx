import { ReactNode } from "react";
import { pageContentPy } from "../../lib/pageLayout";

export interface ProductPageTemplateProps {
  gallery: ReactNode;
  info: ReactNode;
  details?: ReactNode;
}

export function ProductPageTemplate({ gallery, info, details }: ProductPageTemplateProps) {
  return (
    <div className="pt-20 min-h-screen">
      <div className={`max-w-[1400px] mx-auto px-6 ${pageContentPy}`}>
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="lg:sticky lg:top-32 h-fit">{gallery}</div>
          <div>{info}</div>
        </div>
        {details}
      </div>
    </div>
  );
}
