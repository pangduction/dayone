import { View, StyleSheet } from 'react-native';
import Text from './Text';
import { colors, radius } from '../theme/tokens';

/**
 * Maps to Figma's "Date" component (Design System page, node 9:5941) variant
 * names: Default, Totday-Default, Photo, Today-Done/Image, Text or Record,
 * Tody-Done/Text or Record — renamed here to camelCase.
 */
export type DateCellStatus = 'default' | 'today' | 'photo' | 'todayPhoto' | 'record' | 'todayRecord';

type Props = {
  date: number;
  status?: DateCellStatus;
};

/** Figma: 51.71 x 51.71, fully rounded ("rounded-[500px]"). */
const CELL_SIZE = 51.71;

const PHOTO_STATUSES: DateCellStatus[] = ['photo', 'todayPhoto'];

export default function CalendarDateCell({ date, status = 'default' }: Props) {
  const isPhotoSlot = PHOTO_STATUSES.includes(status);

  return (
    <View style={[styles.base, containerStyle[status]]}>
      {isPhotoSlot ? (
        // Real photo/thumbnail assets aren't available in this environment
        // (network policy blocks the Figma asset CDN) — keep the circle's
        // exact size and position and fill it with a neutral G200 block
        // instead of exporting the calendar as a flat image. Swap this View
        // for an <Image> once real thumbnails are wired up.
        <View style={styles.photoPlaceholder} />
      ) : (
        <Text variant="calendarDate" color={textColorByStatus[status]}>
          {date}
        </Text>
      )}
    </View>
  );
}

const containerStyle = StyleSheet.create({
  default: {},
  today: { backgroundColor: 'rgba(0, 132, 255, 0.08)' }, // Figma: bg-[rgba(0,132,255,0.08)]
  photo: {},
  todayPhoto: { borderWidth: 1, borderColor: colors.accent },
  record: { backgroundColor: colors.gray[900] },
  todayRecord: { backgroundColor: colors.accent },
});

const textColorByStatus: Record<DateCellStatus, string> = {
  default: colors.gray[600],
  today: colors.accent,
  photo: colors.white,
  todayPhoto: colors.white,
  record: colors.white,
  todayRecord: colors.white,
};

const styles = StyleSheet.create({
  base: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.gray[200],
  },
});
