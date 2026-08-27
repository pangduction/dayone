/**
 * Shared sizing for a PDF page (matches `PdfPagePreview.tsx`'s own card
 * size) and the filename helper for a generated export. The PDF's actual
 * bytes are built in `buildPdf.ts`.
 */
export const PAGE_WIDTH = 390;
export const PAGE_HEIGHT = 844;

/**
 * "DayOne-260806-260813.pdf" — 'YYMMDD' with no leading "20", matching
 * Figma's own filename shape (node 3201:6537) apart from casing: Figma's mock
 * spells the brand "Dayone", corrected here to "DayOne" (capital O) to match
 * the wordmark used everywhere else in the app.
 */
export function buildExportFilename(startDate: string, endDate: string): string {
  const compact = (date: string) => date.slice(2).replace(/-/g, '');
  return `DayOne-${compact(startDate)}-${compact(endDate)}.pdf`;
}
