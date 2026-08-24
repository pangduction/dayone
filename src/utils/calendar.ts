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
 * Figma's "Calendar Date" grid is always six rows tall (node 3184:4121 has
 * exactly six "Date of the week" frames, 6 x 51.71 + 5 x 8 = 350.26), and
 * six is also the most any month can need — 31 days starting on a Saturday.
 * A month that needs fewer still gets six, so the calendar block keeps a
 * constant height.
 */
export const CALENDAR_WEEK_ROWS = 6;

/**
 * Splits a month into calendar weeks for a grid layout (Figma: Home-Calendar
 * "Calendar Date", node 3184:4121). Each week is 7 slots; `null` marks a
 * slot outside the month (rendered blank, matching the `opacity-0`
 * placeholder cells in the design).
 *
 * The result is always `CALENDAR_WEEK_ROWS` rows, trailing blank ones
 * included. That's what Figma draws, and it's what keeps the screen stable:
 * Home lays its blocks out with `space-between`, so a calendar that shrank
 * to four rows in February would let the free space grow and push the title,
 * weekday labels and first week down the screen relative to a six-row month
 * like August. Reserving the rows pins every block to its Figma y whatever
 * month is showing.
 */
export function getCalendarWeeks(year: number, month: number): (number | null)[][] {
  const total = daysInMonth(year, month);
  const firstWeekday = firstWeekdayOfMonth(year, month);

  const days: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (days.length < CALENDAR_WEEK_ROWS * 7) days.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}
