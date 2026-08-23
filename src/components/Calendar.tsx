import { View, StyleSheet } from 'react-native';
import Text from './Text';
import CalendarDateCell, { DateCellStatus } from './CalendarDateCell';
import { spacing } from '../theme/tokens';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export type CalendarCell = { date: number; status?: DateCellStatus } | null;

type Props = {
  /** Rows of 7 cells (Sun–Sat), matching Figma's grid. `null` = out-of-month/empty cell. */
  weeks: CalendarCell[][];
};

/**
 * Maps to Figma's "Calendar" component (Design System page, node 3184:3400,
 * "Content=On" variant, "Calendar Body" subtree) — a weekday header row plus
 * a 7-column date grid, both built from real Text/View nodes. Rebuilt from
 * the component's actual node tree rather than the flattened "splash
 * thumbnail" raster used elsewhere in the file, per the "no flat image
 * export" requirement.
 */
export default function Calendar({ weeks }: Props) {
  return (
    <View>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} variant="calendarDay" style={styles.weekdayLabel}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {weeks.map((week, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {week.map((cell, colIndex) =>
              cell ? (
                <CalendarDateCell key={colIndex} date={cell.date} status={cell.status} />
              ) : (
                <View key={colIndex} style={styles.emptyCell} />
              )
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

/** Figma: "Date" instances are 51.71 x 51.71. */
const CELL_SIZE = 51.71;

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  weekdayLabel: {
    width: 50,
    textAlign: 'center',
  },
  grid: {
    marginTop: spacing.lg, // Figma: "Calendar Date" sits 24px below "Calendar Days"
    gap: spacing.sm, // Figma row pitch 59.71 - cell 51.71 = 8
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
});
