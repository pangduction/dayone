import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  /** Loudness per slice of the recording, 0..1. */
  samples: number[];
  height: number;
  color?: string;
};

/**
 * How many bars fill the track, whatever the recording's length. Exported so
 * the Export-to-PDF template (`src/pdf/postPageTemplate.ts`) can draw the
 * exact same bar geometry as static HTML for a post's Record/View — the PDF
 * has no player to animate, but it still reads as the same waveform.
 */
export const BAR_COUNT = 64;
export const BAR_WIDTH = 2;
export const MIN_BAR = 2;

/**
 * Figma's "music track" (nodes 3184:7867, 3192:12490, 3192:12561) — the
 * waveform beside a recording.
 *
 * Figma draws it as a single decorative vector of a few hundred hand-placed
 * paths, around 100KB in `assets/Record/*.svg`. Porting that literally would
 * ship the same frozen squiggle for every recording, so this draws the same
 * shape from the recording's own loudness instead: bars of the exported
 * width, resampled to a fixed count so a five-second clip and a five-minute
 * one both fill the track.
 *
 * A recording with no stored samples — one made before they were kept — falls
 * back to a flat line rather than an empty gap.
 */
export default function Waveform({ samples, height, color = colors.textPlaceholder }: Props) {
  const bars = resample(samples, BAR_COUNT);

  return (
    <View style={[styles.track, { height }]}>
      {bars.map((level, index) => (
        <View
          key={index}
          style={{
            width: BAR_WIDTH,
            height: Math.max(MIN_BAR, level * height),
            borderRadius: BAR_WIDTH / 2,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

/** Averages `samples` into exactly `count` buckets. */
export function resample(samples: number[], count: number): number[] {
  if (samples.length === 0) return new Array(count).fill(0);
  if (samples.length === count) return samples;

  const out: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const start = Math.floor((i * samples.length) / count);
    const end = Math.max(start + 1, Math.floor(((i + 1) * samples.length) / count));
    let total = 0;
    for (let j = start; j < end; j += 1) total += samples[j];
    out.push(total / (end - start));
  }
  return out;
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
});
