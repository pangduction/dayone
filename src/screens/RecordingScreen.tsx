import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import SecondaryButton from '../components/SecondaryButton';
import Waveform from '../components/Waveform';
import HeaderX from '../components/HeaderX';
import { IcPause, IcPlay } from '../components/icons/CommonIcons';
import { formatDuration } from '../utils/duration';
import { colors, spacing, typography } from '../theme/tokens';

/** How often the meter is sampled into the waveform. */
const SAMPLE_INTERVAL_MS = 100;
/** expo-audio reports loudness in dBFS; anything below this reads as silence. */
const SILENCE_DB = -50;

/**
 * Figma "Add-Recording-1" / "Add-Recording-2" (nodes 3184:7806 / 3184:7899),
 * the full-screen recorder reached from the Add screen's mic button.
 *
 * A Header/X (node 3184:7855) that only carries a close button, then a column
 * spaced 80 apart: the timer in `typography.titleLarge` / `colors.textPlaceholder`,
 * the waveform, and an action field of a large Button/Secondary/Default over
 * its label. Idle reads "Tap to speak" with a play glyph; recording reads
 * "Listening..." with a pause glyph.
 *
 * Stopping hands the finished recording back to the Add screen through
 * `onFinish`, which the Add screen sets before pushing this route — the post
 * isn't saved here, only its recording captured.
 */
export default function RecordingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Recording'>>();

  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);
  // The recorder is stopped from two places — the button and unmount — and
  // must only ever run once.
  const finished = useRef(false);

  // Poll the recorder rather than trusting a status callback: the timer and
  // the waveform both need a steady tick, and the meter only has a value
  // while recording.
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      const status = recorder.getStatus();
      setElapsedMs(status.durationMillis ?? 0);
      const db = status.metering;
      if (typeof db === 'number') {
        setSamples((current) => [...current, normalizeMeter(db)]);
      }
    }, SAMPLE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isRecording, recorder]);

  const start = useCallback(async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Microphone access needed', 'Allow microphone access to record your voice.');
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
  }, [recorder]);

  const stop = useCallback(async () => {
    if (finished.current) return;
    finished.current = true;
    setIsRecording(false);
    await recorder.stop();
    // Recording is exclusive; hand the session back so playback works after.
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

    const uri = recorder.uri;
    if (uri) params.onFinish({ uri, durationMs: elapsedMs, samples });
    navigation.goBack();
  }, [recorder, elapsedMs, samples, params, navigation]);

  // Closing mid-recording throws the take away rather than keeping a partial.
  const cancel = useCallback(async () => {
    if (!finished.current && isRecording) {
      finished.current = true;
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    }
    navigation.goBack();
  }, [recorder, isRecording, navigation]);

  return (
    <View style={styles.container}>
      <HeaderX onClose={cancel} />

      <View style={styles.body}>
        <Text style={[typography.titleLarge, styles.timer]}>{formatDuration(elapsedMs)}</Text>

        <View style={styles.track}>
          <Waveform samples={samples} height={44} />
        </View>

        <View style={styles.actionField}>
          <SecondaryButton
            size="large"
            accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
            onPress={isRecording ? stop : start}
          >
            {isRecording ? (
              <IcPause size={24} color={colors.textPrimary} />
            ) : (
              <IcPlay size={24} color={colors.textPrimary} />
            )}
          </SecondaryButton>
          <Text style={[typography.subtext, styles.hint]}>
            {isRecording ? 'Listening...' : 'Tap to speak'}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** dBFS (roughly -160..0) to the 0..1 the waveform draws. */
function normalizeMeter(db: number): number {
  if (!Number.isFinite(db) || db < SILENCE_DB) return 0;
  return Math.min(1, (db - SILENCE_DB) / -SILENCE_DB);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 47,
    paddingBottom: 34,
  },
  body: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 80, // Figma: the recording column's gap (node 3184:7865)
  },
  timer: {
    width: '100%',
    textAlign: 'center',
    color: colors.textPlaceholder,
  },
  track: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  actionField: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  hint: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
