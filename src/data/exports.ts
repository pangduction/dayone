import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

/**
 * Local metadata for a generated Export-to-PDF file (Figma "Setting-Export to
 * PDF-2", node 3201:5947 — the "Files" section's rows). Export to PDF is a
 * real device feature (explicit product requirement), so this is a genuine
 * file on disk, not a mock row: `saveExportFile` writes the PDF's own bytes
 * (`buildPdf.ts` — no `expo-print` or WebView rendering involved) into a
 * stable, named home in `documentDirectory` (the cache isn't guaranteed to
 * survive), and every read here prunes anything past its "Valid until" date
 * — deleting the row *and* the bytes, per the product decision that expiry
 * is real deletion rather than a stale label.
 */
export type ExportFile = {
  id: string;
  /** e.g. "Dayone-260806-260813.pdf" — also the file's real on-disk name. */
  filename: string;
  /** Real `file://` URI of the generated PDF. */
  uri: string;
  /**
   * Real `file://` URIs of each page's own JPEG, one per post, in the same
   * order they were captured and embedded into the PDF. `PdfPreviewScreen`
   * shows *these* directly rather than re-rendering the posts live — the
   * exact bytes the PDF was built from, not a second, separately-rendered
   * copy that can (and did) drift from what the file really contains.
   */
  pageUris: string[];
  /** The export's date range, 'YYYY-MM-DD'. */
  startDate: string;
  endDate: string;
  createdAt: string;
  /** createdAt + 7 days — the product's chosen "Valid until" window, kept short to minimize on-device storage. */
  expiresAt: string;
};

// Bumped from v1 to drop every export written during the expo-print-era
// debugging (base64 PNGs, HTML-rendered pages) — those rows point at a
// storage shape and file layout this module no longer produces. The old
// files are simply orphaned under documentDirectory/exports/ rather than
// explicitly swept, since this only ever matters for dev/test data.
const STORAGE_KEY = 'dayone.exports.v2';
// Short on purpose: a generated PDF (plus one JPEG per page) is real,
// uncompressed storage sitting in documentDirectory, and the product wants
// that footprint minimized rather than accumulating for a month per file.
const VALIDITY_DAYS = 7;
const EXPORTS_DIR_NAME = 'exports';

function exportsDirectory(): Directory {
  return new Directory(Paths.document, EXPORTS_DIR_NAME);
}

async function readAll(): Promise<ExportFile[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // `pageUris` was added after the first exports were written; default
    // those to an empty list rather than letting the preview screen read
    // undefined.
    return parsed.map((file) => ({ ...file, pageUris: file.pageUris ?? [] }) as ExportFile);
  } catch {
    return [];
  }
}

async function writeAll(files: ExportFile[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

/** Deletes a file's bytes. A file already gone (or never written) isn't an error. */
function deleteFileBytes(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // Nothing left to clean up.
  }
}

/** Drops every row whose `expiresAt` has passed, deleting its PDF and page images too. */
function pruneExpired(files: ExportFile[]): ExportFile[] {
  const now = Date.now();
  const alive: ExportFile[] = [];
  for (const file of files) {
    if (new Date(file.expiresAt).getTime() <= now) {
      deleteFileBytes(file.uri);
      file.pageUris.forEach(deleteFileBytes);
    } else {
      alive.push(file);
    }
  }
  return alive;
}

/** Every export still valid, newest first (Figma's Files section reads as a fresh-first list, like every other list in the app). */
export async function getExportFiles(): Promise<ExportFile[]> {
  const files = await readAll();
  const alive = pruneExpired(files);
  if (alive.length !== files.length) await writeAll(alive);
  return [...alive].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getExportFile(id: string): Promise<ExportFile | null> {
  const files = await getExportFiles();
  return files.find((file) => file.id === id) ?? null;
}

/**
 * Writes the PDF's own bytes (`buildPdfFromJpegPages`) into
 * `documentDirectory/exports/` under its real filename, moves each page's
 * own captured JPEG (`react-native-view-shot`'s real temp file, one per
 * post) alongside it, and records the whole thing's metadata with a 7-day
 * expiry from now.
 */
export async function saveExportFile(input: {
  pdfBytes: Uint8Array;
  /** Real temp-file URIs from `captureRef({ result: 'tmpfile' })`, one per page, in print order. */
  pageSourceUris: string[];
  filename: string;
  startDate: string;
  endDate: string;
}): Promise<ExportFile> {
  const dir = exportsDirectory();
  if (!dir.exists) dir.create({ intermediates: true });

  const destination = new File(dir, input.filename);
  if (destination.exists) destination.delete();
  destination.write(input.pdfBytes);

  const baseName = input.filename.replace(/\.pdf$/i, '');
  const pageUris: string[] = [];
  for (let index = 0; index < input.pageSourceUris.length; index += 1) {
    const pageFile = new File(dir, `${baseName}-page-${index + 1}.jpg`);
    if (pageFile.exists) pageFile.delete();
    await new File(input.pageSourceUris[index]).move(pageFile);
    pageUris.push(pageFile.uri);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + VALIDITY_DAYS * 24 * 60 * 60 * 1000);
  const created: ExportFile = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    filename: input.filename,
    uri: destination.uri,
    pageUris,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const files = await readAll();
  await writeAll([...files, created]);
  return created;
}

/** Removes an export before its natural expiry — not currently reachable from any screen, kept for symmetry with `deletePost`. */
export async function deleteExportFile(id: string): Promise<void> {
  const files = await readAll();
  const target = files.find((file) => file.id === id);
  if (!target) return;
  deleteFileBytes(target.uri);
  target.pageUris.forEach(deleteFileBytes);
  await writeAll(files.filter((file) => file.id !== id));
}
