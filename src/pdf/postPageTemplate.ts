import { File } from 'expo-file-system';
import { parseDateKey } from '../data/posts';
import type { Post } from '../data/posts';
import { formatDuration } from '../utils/duration';
import { BAR_COUNT, BAR_WIDTH, MIN_BAR, resample } from '../components/Waveform';
import { colors, radius, spacing, typography } from '../theme/tokens';

/**
 * Figma "PDF Image" (node 3267:6263, the 8 post-shape variants — Post-Only
 * Text, -Only Recording, -Text and Recording, -Only Photo-Fit/-Filled,
 * -Photo and Text, -Photo and Record, -All) mirrors the exact 390x844 mobile
 * frame `PostDetailScreen.tsx` renders live, right down to Post Detail
 * sitting at the same y-47 top inset even though no header is drawn on the
 * page. `buildExportHtml` reproduces that layout as static HTML for
 * `expo-print`'s `printToFileAsync`, one page per post.
 */
export const PAGE_WIDTH = 390;
export const PAGE_HEIGHT = 844;
const PAGE_TOP_INSET = 47;

/** "Dayone-260806-260813.pdf" — Figma's own filename shape (node 3201:6537), 'YYMMDD' with no leading "20". */
export function buildExportFilename(startDate: string, endDate: string): string {
  const compact = (date: string) => date.slice(2).replace(/-/g, '');
  return `Dayone-${compact(startDate)}-${compact(endDate)}.pdf`;
}

/**
 * `printToFileAsync` renders through the platform WebView, and on iOS that
 * WebView can't resolve local `file://` asset URLs (WKWebView limitation
 * documented on `Print.printAsync`) — so a post's photo has to be inlined as
 * a base64 data URI rather than referenced by path. A photo that can't be
 * read (moved or deleted outside the app) just drops its Image Section
 * rather than failing the whole export.
 */
async function photoDataUri(uri: string): Promise<string | null> {
  try {
    const file = new File(uri);
    if (!file.exists) return null;
    const base64 = await file.base64();
    return `data:${file.type || 'image/jpeg'};base64,${base64}`;
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderDateWritten(post: Post): string {
  const written = parseDateKey(post.date);
  // Same formatting PostDetailScreen uses for its own Date Written block.
  const dateLabel = written.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dayLabel = written.toLocaleDateString('en-US', { weekday: 'long' });
  return `<div class="date-written"><p class="date-label">${escapeHtml(dateLabel)}</p><p class="day-label">${escapeHtml(dayLabel)}</p></div>`;
}

function renderImageSection(dataUri: string, fitMode: Post['fitMode']): string {
  // Every one of the 8 "PDF Image" variants draws its Image Section as a
  // fixed 358x358 square, unlike the live post detail screen's PhotoSection
  // (which lets a landscape photo shrink the section below the square) — so
  // the printed page keeps the square and lets `object-fit` do fit-vs-filled.
  const objectFit = fitMode === 'fit' ? 'contain' : 'cover';
  return `<div class="image-section"><img src="${dataUri}" style="object-fit: ${objectFit};" /></div>`;
}

/**
 * The Record/View block (node 3267:6079 etc.) draws the exact same
 * Button/Secondary/Default play glyph the live, tappable row uses — Figma
 * doesn't have a "static" variant of the component, it's just a picture of
 * it — so the page reproduces that glyph too, as pure decoration (a PDF page
 * has no player to actually press).
 */
function renderRecordView(post: Post): string {
  const recording = post.recording;
  if (!recording) return '';
  const bars = resample(recording.samples, BAR_COUNT)
    .map((level) => Math.max(MIN_BAR, level * 14))
    .map((height) => `<div class="bar" style="width:${BAR_WIDTH}px;height:${height}px;"></div>`)
    .join('');
  return `<div class="record-view"><div class="play-button"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.2661 13.5162C20.258 12.7487 20.258 11.2512 19.2661 10.4837C16.2685 8.16434 12.9213 6.33619 9.34979 5.06771L8.69732 4.83597C7.44904 4.39263 6.13053 5.23719 5.96154 6.52574C5.48938 10.126 5.48938 13.8739 5.96154 17.4742C6.13053 18.7627 7.44904 19.6073 8.69731 19.1639L9.34979 18.9322C12.9213 17.6637 16.2685 15.8356 19.2661 13.5162Z" fill="${colors.textPrimary}" /></svg></div><div class="waveform">${bars}</div><p class="record-duration">${formatDuration(recording.durationMs)}</p></div>`;
}

function renderTextSection(post: Post): string {
  // `post.html` is the editor's own document (execCommand output, not user-
  // typed markup) so it's embedded as-is, matching how RichTextEditor renders
  // a saved post read-only; a pre-rich-text post falls back to escaped plain
  // text with its line breaks kept.
  const content = post.html ? post.html : escapeHtml(post.text).replace(/\n/g, '<br />');
  return `<div class="text-section"><div class="divider"></div><div class="content">${content}</div></div>`;
}

/** One post's page — mirrors `PostDetailScreen`'s own conditional section logic exactly. */
async function renderPostPage(post: Post): Promise<string> {
  const sections: string[] = [renderDateWritten(post)];

  if (post.photoUri) {
    const dataUri = await photoDataUri(post.photoUri);
    if (dataUri) sections.push(renderImageSection(dataUri, post.fitMode));
  }

  if (post.recording) sections.push(renderRecordView(post));

  if (post.text.length > 0) sections.push(renderTextSection(post));

  return `<div class="page"><div class="detail">${sections.join('')}</div></div>`;
}

/**
 * The full document handed to `printToFileAsync`, one page per post, oldest
 * first (a diary reads front to back — the same order the Report montage
 * runs in, for the same reason).
 *
 * Fonts aren't embedded: the platform WebView `printToFileAsync` renders
 * through has no access to the app's bundled Inter/Poppins files without
 * base64-inlining every weight as `@font-face` data URIs, which is a lot of
 * machinery for a document nobody pixel-compares against Figma. The system
 * font stack below is the same trade-off already made for Figma-asset gaps
 * elsewhere (DESIGN_SYSTEM.md §5) — every color, spacing, and radius value
 * still comes straight from `tokens.ts`.
 */
export async function buildExportHtml(posts: Post[]): Promise<string> {
  const pages = await Promise.all(posts.map(renderPostPage));
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .page {
    width: ${PAGE_WIDTH}px;
    height: ${PAGE_HEIGHT}px;
    background: ${colors.background};
    padding-top: ${PAGE_TOP_INSET}px;
    page-break-after: always;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }
  .detail {
    padding: ${spacing.md}px;
    display: flex;
    flex-direction: column;
    gap: ${spacing.md}px;
  }
  .date-written {
    width: 100%;
    height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    white-space: nowrap;
  }
  .date-label {
    margin: 0;
    font-size: ${typography.subtext.fontSize}px;
    font-weight: 700;
    letter-spacing: ${typography.subtext.letterSpacing}px;
    line-height: ${typography.subtext.lineHeight / typography.subtext.fontSize};
    color: ${colors.textPrimary};
  }
  .day-label {
    margin: 0;
    font-size: ${typography.overline.fontSize}px;
    font-weight: 500;
    letter-spacing: ${typography.overline.letterSpacing}px;
    color: ${colors.textTertiary};
  }
  .image-section {
    width: 100%;
    height: 358px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .image-section img { width: 100%; height: 100%; }
  .record-view {
    display: flex;
    align-items: center;
    gap: ${spacing.md}px;
    min-height: 56px;
    padding: ${spacing.sm}px ${spacing[10]}px;
    border-radius: ${radius.sm}px;
  }
  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 5px ${spacing.sm}px;
    border-radius: ${radius.sm}px;
    background:
      linear-gradient(180deg, #FFFFFF 7.29%, rgba(255, 255, 255, 0) 65.625%),
      ${colors.buttonSecondary};
    border: 1px solid ${colors.buttonSecondaryRing};
  }
  .waveform {
    flex: 1;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
  }
  .bar { border-radius: ${BAR_WIDTH / 2}px; background: ${colors.textPlaceholder}; }
  .record-duration {
    margin: 0;
    font-size: ${typography.body.fontSize}px;
    letter-spacing: ${typography.body.letterSpacing}px;
    color: ${colors.textPrimary};
    white-space: nowrap;
  }
  .text-section {
    display: flex;
    flex-direction: column;
    gap: ${spacing.sm}px;
    padding: 0 ${spacing[5]}px;
  }
  .divider { width: 100%; height: 1px; background: ${colors.borderSubtle}; }
  .content {
    font-size: ${typography.body.fontSize}px;
    line-height: ${typography.body.lineHeight / typography.body.fontSize};
    letter-spacing: ${typography.body.letterSpacing}px;
    color: ${colors.textPrimary};
    word-wrap: break-word;
  }
  .content ul, .content ol { padding-left: 22px; margin: 0; }
  .content hr { border: none; border-top: 1px solid ${colors.borderSubtle}; margin: ${spacing.md}px 0; }
</style>
</head>
<body>
${pages.join('\n')}
</body>
</html>`;
}
