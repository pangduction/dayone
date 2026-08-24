/**
 * Builds a PDF's raw bytes directly from already-captured page images — one
 * full-bleed JPEG per page, no HTML/CSS/WebView rendering step involved at
 * all.
 *
 * The previous approach handed a captured screenshot to `expo-print`'s
 * `printToFileAsync`, which renders through a platform WebView. Across
 * several rounds of fixes (a `<meta viewport>` tag, explicit centering,
 * pinning the capture's own pixel dimensions) that WebView never reliably
 * placed the page's image exactly where the capture already had it — every
 * fix narrowed the gap, but the renderer producing the actual file stayed a
 * black box this app didn't control. Writing the PDF's bytes here removes
 * that renderer entirely: a page's `/MediaBox` is exactly its image's own
 * size, and the image is drawn with a transform that fills the `/MediaBox`
 * exactly — there is no layout engine left to disagree with the capture.
 *
 * This writes just enough of the PDF 1.4 spec to be valid: a Catalog, a
 * Pages tree, and per page a Page object, an Image XObject
 * (`/Filter /DCTDecode` — the raw JPEG bytestream embeds directly, no
 * re-encoding), and a one-line content stream drawing that image across the
 * whole page.
 */

export type PdfImagePage = {
  /** Raw JPEG bytes (already-encoded JFIF data — nothing decodes or re-encodes it). */
  jpegBytes: Uint8Array;
  width: number;
  height: number;
};

const encoder = new TextEncoder();

/** Every string built here is plain ASCII (PDF syntax, decimal numbers), so UTF-8 encoding is byte-for-byte identical to ASCII. */
function ascii(text: string): Uint8Array {
  return encoder.encode(text);
}

function concatBytes(chunks: Uint8Array[], totalLength: number): Uint8Array {
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Every xref entry must be exactly 20 bytes: a 10-digit offset, a 5-digit generation, a type flag, and padding — the PDF spec's fixed-width format. */
function xrefEntry(offset: number): string {
  return `${offset.toString().padStart(10, '0')} 00000 n \n`;
}

export function buildPdfFromJpegPages(pages: PdfImagePage[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;

  const push = (bytes: Uint8Array) => {
    chunks.push(bytes);
    length += bytes.length;
  };
  const pushObject = (objectNumber: number, bytes: Uint8Array) => {
    offsets[objectNumber - 1] = length;
    push(bytes);
  };

  push(ascii('%PDF-1.4\n'));

  // Object numbers: 1 = Catalog, 2 = Pages tree; then three objects per page
  // (Page, Image XObject, Content stream), numbered sequentially from 3.
  const pageObjectNumbers = pages.map((_, index) => 3 + index * 3);

  pushObject(1, ascii('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'));
  pushObject(
    2,
    ascii(
      `2 0 obj\n<< /Type /Pages /Kids [${pageObjectNumbers.map((n) => `${n} 0 R`).join(' ')}] /Count ${pages.length} >>\nendobj\n`,
    ),
  );

  pages.forEach((page, index) => {
    const pageObj = pageObjectNumbers[index];
    const imageObj = pageObj + 1;
    const contentObj = pageObj + 2;

    pushObject(
      pageObj,
      ascii(
        `${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width} ${page.height}] ` +
          `/Resources << /XObject << /Im0 ${imageObj} 0 R >> >> /Contents ${contentObj} 0 R >>\nendobj\n`,
      ),
    );

    // The image stream's raw bytes are spliced in directly between its
    // dictionary and `endstream` — /Length only counts those bytes, not the
    // single trailing newline before `endstream`.
    offsets[imageObj - 1] = length;
    push(
      ascii(
        `${imageObj} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} ` +
          `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpegBytes.length} >>\nstream\n`,
      ),
    );
    push(page.jpegBytes);
    push(ascii('\nendstream\nendobj\n'));

    // A PDF Image XObject occupies the unit square by convention; scaling it
    // to exactly the page's own width/height with no translation fills the
    // entire MediaBox, top-aligned and centered by construction — there's no
    // "extra canvas" for it to be pinned to one side of.
    const contentStream = `q ${page.width} 0 0 ${page.height} 0 0 cm /Im0 Do Q`;
    pushObject(
      contentObj,
      ascii(
        `${contentObj} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
      ),
    );
  });

  const objectCount = offsets.length;
  const xrefOffset = length;
  let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) xref += xrefEntry(offset);
  push(ascii(xref));
  push(ascii(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));

  return concatBytes(chunks, length);
}
