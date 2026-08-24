import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { colors, radius, shadows } from '../theme/tokens';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

const TRACK_WIDTH = 40;
const TRACK_HEIGHT = 18;
const THUMB_SIZE = 14;
const THUMB_INSET = 2;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_INSET * 2 - THUMB_SIZE; // 22

/**
 * Figma "toggle" (component node 9:6902 off / 9:6905 on) — the switch used
 * throughout the Notification settings (Flow 7.1). 40x18 track, 14x14 white
 * thumb inset 2 on every side. Off fill is `colors.toggleTrackOff` (a light
 * grey adjacent to but distinct from the G-scale); on fill is
 * `colors.toggleOn`, a green outside the app's usual accent blue — Figma's
 * own choice for this one control, not a mistake to "fix" to accent. The
 * thumb's drop shadow flips direction with which side it's resting on
 * (`shadows.toggleThumbOff`/`On`). The track's own inset shadow isn't
 * reproduced — RN has no inset shadow, and at this size it isn't visually
 * load-bearing.
 */
export default function ToggleSwitch({ value, onValueChange, accessibilityLabel, disabled }: Props) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [value, progress]);

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.toggleTrackOff, colors.toggleOn],
  });
  const thumbTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, THUMB_TRAVEL],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={disabled ? styles.disabled : undefined}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.thumb,
            value ? shadows.toggleThumbOn : shadows.toggleThumbOff,
            { transform: [{ translateX: thumbTranslate }] },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radius.full,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    left: THUMB_INSET,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  disabled: {
    opacity: 0.4,
  },
});
