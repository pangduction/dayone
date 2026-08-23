/** Number of days in `month` (0-indexed, matches `Date#getMonth()`) of `year`. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Weekday (0 = Sun … 6 = Sat) of the 1st of `month` (0-indexed) in `year`. */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Splits a month into calendar weeks for a grid layout (Figma: Home-Calendar
 * "Calendar Date", node 3184:4121). Each week is 7 slots; `null` marks a
 * leading/trailing slot outside the month (rendered blank, matching the
 * `opacity-0` placeholder cells in the design).
 */
export function getCalendarWeeks(year: number, month: number): (number | null)[][] {
  const total = daysInMonth(year, month);
  const firstWeekday = firstWeekdayOfMonth(year, month);

  const days: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (days.length % 7 !== 0) days.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}
