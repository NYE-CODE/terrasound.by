import { useMemo } from "react";
import { parseLegalSections, splitLegalParagraphs } from "../../lib/legalContent";
import { pageContentPy, pageTopOffsetClass } from "../../lib/pageLayout";

interface LegalPageContentProps {
  title: string;
  content: string;
}

export function LegalPageContent({ title, content }: LegalPageContentProps) {
  const sections = useMemo(() => parseLegalSections(content), [content]);

  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      <div className={`max-w-3xl mx-auto px-6 ${pageContentPy}`}>
        <h1 className="font-heading text-5xl mb-8">{title}</h1>

        <div className="space-y-6 text-muted-foreground">
          {sections.map((section, index) => (
            <section key={`${section.heading}-${index}`}>
              {section.heading ? (
                <h2 className="font-heading text-2xl text-foreground mb-4">{section.heading}</h2>
              ) : null}
              {splitLegalParagraphs(section.body).map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className={paragraphIndex > 0 ? "mt-4" : undefined}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
