import { Pressable, StyleSheet, View } from 'react-native';
import Text from './Text';
import { IcCalendar, IcPlus, IcPulse } from './icons/HomeIcons';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, typography } from '../theme/tokens';

export type NavTab = 'Home' | 'Report';

type Props = {
  selected: NavTab;
  onHome: () => void;
  onAdd: () => void;
  onReport: () => void;
};

/**
 * Figma "Navigation" (component 3184:3667), verified in both variants:
 * `selected="Home"` on Home-Calendar (3184:4123) and `selected="Report"` on
 * Report-Default (3196:13233).
 *
 * The two variants use the *same* glyphs — ic/calendar, ic/plus, ic/pulse.
 * Only the colour changes, and the selected tab swaps its label for a 3pt
 * dot. (An earlier note in this repo claimed the icons swapped between filled
 * and outline forms; assets/Navigation.svg and both variants say otherwise.)
 *
 * Add is never the selected tab — it pushes a screen and comes back — so it
 * always shows its label.
 */
export default function BottomNavigation({ selected, onHome, onAdd, onReport }: Props) {
  const { t } = useLanguage();
  return (
    <View style={styles.navigation}>
      <NavItem
        label={t('bottomNav.home')}
        selected={selected === 'Home'}
        onPress={onHome}
        icon={(color) => <IcCalendar size={24} color={color} />}
      />
      <NavItem
        label={t('bottomNav.add')}
        selected={false}
        onPress={onAdd}
        icon={(color) => <IcPlus size={24} color={color} />}
      />
      <NavItem
        label={t('bottomNav.report')}
        selected={selected === 'Report'}
        onPress={onReport}
        icon={(color) => <IcPulse size={24} color={color} />}
      />
    </View>
  );
}

function NavItem({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon: (color: string) => React.ReactNode;
}) {
  return (
    <Pressable
      style={styles.navItem}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      {icon(selected ? colors.textPrimary : colors.textPlaceholder)}
      <View style={styles.navSecondRow}>
        {selected ? (
          <View style={styles.navSelectedDot} />
        ) : (
          <Text style={[typography.overline, styles.navLabel]}>{label}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navigation: {
    flexDirection: 'row',
    gap: 27,
    justifyContent: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.background,
    paddingHorizontal: 21, // Figma: doesn't land on the spacing scale; exact nav-bar value
    paddingTop: 8,
    paddingBottom: 16,
  },
  navItem: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSecondRow: {
    // Figma "Menu Title" row (nodes 3184:3526/3531/3535): a fixed 45x13 box
    // sitting directly under the icon frame with no gap — verified via
    // get_metadata's absolute coords (icon y:4 h:24, row y:28 h:13 on all
    // three tabs). Every tab's label/dot must be centered in this same 13px
    // row, not placed bare, or the dot (3px) ends up shorter than the label
    // text and throws off the icon's vertical centering.
    width: '100%',
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSelectedDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textPrimary, // Figma: G900, verified via get_variable_defs on node 3184:3527 — not accent
  },
  navLabel: {
    color: colors.textPlaceholder,
  },
});
