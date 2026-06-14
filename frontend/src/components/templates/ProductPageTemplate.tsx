import { ReactNode } from "react";
import { pageContentPy, pageTopOffsetClass } from "../../lib/pageLayout";

export interface ProductPageTemplateProps {
  gallery: ReactNode;
  info: ReactNode;
  details?: ReactNode;
}

export function ProductPageTemplate({ gallery, info, details }: ProductPageTemplateProps) {
  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      <div className={`max-w-[1400px] mx-auto px-6 ${pageContentPy}`}>
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="lg:sticky lg:top-[calc(var(--site-header-stack-height)+3rem)] h-fit">{gallery}</div>
          <div>{info}</div>
        </div>
        {details}
      </div>
    </div>
  );
}
