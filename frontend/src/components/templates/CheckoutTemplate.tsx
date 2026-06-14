import { FormEvent, ReactNode } from "react";
import { pageContentPy, pageTopOffsetClass } from "../../lib/pageLayout";

export interface CheckoutTemplateProps {
  title: string;
  form: ReactNode;
  summary: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function CheckoutTemplate({ title, form, summary, onSubmit }: CheckoutTemplateProps) {
  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      <div className={`max-w-[1400px] mx-auto px-6 ${pageContentPy}`}>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl mb-8 md:mb-12">{title}</h1>

        <form onSubmit={onSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">{form}</div>
            <div className="lg:col-span-1">{summary}</div>
          </div>
        </form>
      </div>
    </div>
  );
}
