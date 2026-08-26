import type { Language } from '../data/language';

/**
 * Korean-language equivalents of the handful of `toLocaleDateString('en-US',
 * ...)` calls scattered across calendar-facing screens — `'ko-KR'` locale
 * strings exist, but don't reliably reproduce Figma's own English-side
 * formatting choices (e.g. HomeListScreen's "August, 2026" comma, which no
 * `toLocaleDateString` option set produces either), so these are written by
 * hand instead, the same way `HomeListScreen.tsx`'s own `monthLabel` already
 * is for English.
 */
function koreanMonthYear(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

/** Home/Report's calendar title: two separate strings the caller renders as two `Text` nodes, in reading order for the language — "August" / "2026" in English, "2026년" / "8월" in Korean (year first). */
export function formatCalendarTitleParts(date: Date, language: Language): [string, string] {
  if (language === 'ko') return [`${date.getFullYear()}년`, `${date.getMonth() + 1}월`];
  return [date.toLocaleDateString('en-US', { month: 'long' }), String(date.getFullYear())];
}

/** HomeListScreen's header: "August, 2026" / "2026년 8월". */
export function formatMonthCommaYear(date: Date, language: Language): string {
  if (language === 'ko') return koreanMonthYear(date);
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  return `${month}, ${date.getFullYear()}`;
}

/** DateRangeModal's month stepper: "August 2026" / "2026년 8월". */
export function formatMonthYear(date: Date, language: Language): string {
  if (language === 'ko') return koreanMonthYear(date);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** DateRangeModal's start/end display fields: "Aug 6, 2026" / "2026년 8월 6일". */
export function formatShortDate(date: Date, language: Language): string {
  if (language === 'ko') return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Add screen / PostDetailBody's "Date Written" line: "Aug 6, 2026" / "2026년 8월 6일". */
export function formatLongDate(date: Date, language: Language): string {
  if (language === 'ko') return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const KOREAN_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** A short weekday label ("Thu" / "목"), e.g. the Add screen's header. */
export function formatWeekdayShort(date: Date, language: Language): string {
  if (language === 'ko') return KOREAN_WEEKDAYS[date.getDay()];
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/** The weekday spelled out in full ("Thursday" / "목요일"), e.g. PostDetailBody's "Date Written". */
export function formatWeekdayLong(date: Date, language: Language): string {
  if (language === 'ko') return `${KOREAN_WEEKDAYS[date.getDay()]}요일`;
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/** ExportToPdfScreen's Files-list range label: "Aug 6 - 13, 2026" / "Aug 6 - Sep 3, 2026", and their Korean equivalents. */
export function formatDateRangeLabel(start: Date, end: Date, language: Language): string {
  const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  if (language === 'ko') {
    if (sameMonth) return `${koreanMonthYear(start)} ${start.getDate()}일 - ${end.getDate()}일`;
    return `${koreanMonthYear(start)} ${start.getDate()}일 - ${koreanMonthYear(end)} ${end.getDate()}일`;
  }
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (sameMonth) return `${startLabel} - ${end.getDate()}, ${end.getFullYear()}`;
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startLabel} - ${endLabel}`;
}
