export interface LegalSection {
  heading: string;
  body: string;
}

/** Разбирает текст страницы: секции начинаются с строки `## Заголовок`. */
export function parseLegalSections(content: string): LegalSection[] {
  const sections: LegalSection[] = [];
  const blocks = content.split(/\n(?=## )/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      const newlineIndex = trimmed.indexOf("\n");
      if (newlineIndex === -1) {
        sections.push({ heading: trimmed.slice(3).trim(), body: "" });
        continue;
      }

      sections.push({
        heading: trimmed.slice(3, newlineIndex).trim(),
        body: trimmed.slice(newlineIndex + 1).trim(),
      });
      continue;
    }

    sections.push({ heading: "", body: trimmed });
  }

  return sections;
}

export function splitLegalParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .flatMap((chunk) => chunk.split("\n"))
    .map((line) => line.trim())
    .filter(Boolean);
}
