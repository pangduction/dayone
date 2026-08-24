/**
 * Shared sizing for a PDF page (matches `PdfPagePreview.tsx`'s own card
 * size) and the filename helper for a generated export. The PDF's actual
 * bytes are built in `buildPdf.ts`.
 */
export const PAGE_WIDTH = 390;
export const PAGE_HEIGHT = 844;

/** "Dayone-260806-260813.pdf" — Figma's own filename shape (node 3201:6537), 'YYMMDD' with no leading "20". */
export function buildExportFilename(startDate: string, endDate: string): string {
  const compact = (date: string) => date.slice(2).replace(/-/g, '');
  return `Dayone-${compact(startDate)}-${compact(endDate)}.pdf`;
}
