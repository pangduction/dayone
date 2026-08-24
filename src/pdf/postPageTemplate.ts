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
 * HTML `printToFileAsync` prints — one image per page, in the same order
 * they were captured (oldest post first): one post per PDF page.
 *
 * Each image is placed at its own natural size — centered horizontally,
 * pinned to the top rather than stretched to fill the page — instead of a
 * `width:100%; height:100%` stretch-fill. Every page's capture is already
 * pinned to `PAGE_WIDTH`x`PAGE_HEIGHT` (`ExportToPdfScreen.tsx`'s
 * `captureRef` call), so a stretch-fill *should* be a no-op, but explicit
 * top-anchored centering doesn't depend on that holding exactly and reads
 * the same way Figma's own "PDF Image" pages do.
 *
 * The `<meta name="viewport">` tag matters more than it looks: without it,
 * `printToFileAsync`'s WebView laid the document out against its own default
 * layout-viewport width (wider than our declared `PAGE_WIDTH` (390) pages,
 * the usual mobile-WebView default), so each `.page` div rendered pinned to
 * the *left edge* of that wider canvas rather than filling it — and then got
 * scaled down as a whole into the actual PDF page size, carrying that
 * left-alignment with it. Pinning the viewport width to `PAGE_WIDTH` makes
 * our CSS page width the *actual* rendering width, not a box floating inside
 * a wider one.
 */
export function buildImagePagesHtml(pageDataUris: string[]): string {
  const pages = pageDataUris
    .map((uri) => `<div class="page"><img src="${uri}" /></div>`)
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=${PAGE_WIDTH}, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    width: ${PAGE_WIDTH}px;
  }
  .page {
    width: ${PAGE_WIDTH}px;
    height: ${PAGE_HEIGHT}px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    page-break-after: always;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }
  .page img {
    display: block;
    width: ${PAGE_WIDTH}px;
    height: ${PAGE_HEIGHT}px;
  }
</style>
</head>
<body>
${pages}
</body>
</html>`;
}
