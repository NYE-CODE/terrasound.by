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
    <div className={`${pageTopOffsetClass} min-h-screen w-full max-w-full overflow-x-clip`}>
      <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 w-full min-w-0 ${pageContentPy}`}>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl mb-8 md:mb-12">{title}</h1>

        <form onSubmit={onSubmit} className="w-full min-w-0">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 w-full min-w-0">
            <div className="lg:col-span-2 space-y-6 lg:space-y-8 min-w-0">{form}</div>
            <div className="lg:col-span-1 min-w-0">{summary}</div>
          </div>
        </form>
      </div>
    </div>
  );
}
