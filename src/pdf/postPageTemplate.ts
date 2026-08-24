/**
 * The real Export-to-PDF file (Figma "PDF Image", node 3267:6263) is built
 * from real screenshots of the exact same `PdfPagePreview` component the
 * in-app preview screen shows (`ExportToPdfScreen.tsx` captures one page per
 * post via `react-native-view-shot`, off-screen) — not a hand-authored HTML
 * reconstruction of each post's layout. That guarantees the printed file and
 * the preview are pixel-identical by construction, rather than two things
 * that have to be kept in sync by hand. This file only wraps the resulting
 * page images into the HTML `expo-print`'s `printToFileAsync` turns into the
 * actual multi-page PDF, one image per page.
 */
export const PAGE_WIDTH = 390;
export const PAGE_HEIGHT = 844;

/** "Dayone-260806-260813.pdf" — Figma's own filename shape (node 3201:6537), 'YYMMDD' with no leading "20". */
export function buildExportFilename(startDate: string, endDate: string): string {
  const compact = (date: string) => date.slice(2).replace(/-/g, '');
  return `Dayone-${compact(startDate)}-${compact(endDate)}.pdf`;
}

/**
 * Wraps pre-captured page screenshots (data URIs from `captureRef`) into the
 * HTML `printToFileAsync` prints — a full-bleed image per page, in the same
 * order they were captured (oldest post first).
 */
export function buildImagePagesHtml(pageDataUris: string[]): string {
  const pages = pageDataUris
    .map((uri) => `<div class="page"><img src="${uri}" /></div>`)
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  .page {
    width: ${PAGE_WIDTH}px;
    height: ${PAGE_HEIGHT}px;
    page-break-after: always;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }
  .page img {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
</head>
<body>
${pages}
</body>
</html>`;
}
