import Svg, { Path } from 'react-native-svg';

/**
 * Glyphs used across several screens rather than belonging to one, ported
 * from the exported assets like the rest (DESIGN_SYSTEM.md §5): a full 24x24
 * canvas with the glyph already inset, so `size` is the frame and the call
 * site needs no wrapper.
 *
 *   - ic/check — the Alert banner's tick, assets/ic/check.svg
 *   - ic/play  — Button/Secondary/Default's glyph, assets/ic/play.svg
 *   - ic/pause — its recording-in-progress counterpart, assets/ic/pause.svg
 */

type IconProps = {
  size?: number;
  color: string;
};

export function IcCheck({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.0303 7.96967C18.3232 8.26256 18.3232 8.73744 18.0303 9.03033L11.0303 16.0303C10.7374 16.3232 10.2626 16.3232 9.96967 16.0303L5.96967 12.0303C5.67678 11.7374 5.67678 11.2626 5.96967 10.9697C6.26256 10.6768 6.73744 10.6768 7.03033 10.9697L10.5 14.4393L16.9697 7.96967C17.2626 7.67678 17.7374 7.67678 18.0303 7.96967Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcPlay({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.2661 13.5162C20.258 12.7487 20.258 11.2512 19.2661 10.4837C16.2685 8.16434 12.9213 6.33619 9.34979 5.06771L8.69732 4.83597C7.44904 4.39263 6.13053 5.23719 5.96154 6.52574C5.48938 10.126 5.48938 13.8739 5.96154 17.4742C6.13053 18.7627 7.44904 19.6073 8.69731 19.1639L9.34979 18.9322C12.9213 17.6637 16.2685 15.8356 19.2661 13.5162Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcPause({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.2757 5.46995C17.7109 5.63029 18 6.04492 18 6.50872L18 17.4912C18 17.955 17.7109 18.3696 17.2757 18.53C16.4523 18.8333 15.5477 18.8333 14.7243 18.53C14.2891 18.3696 14 17.955 14 17.4912L14 6.50872C14 6.04492 14.2891 5.63029 14.7243 5.46995C15.5477 5.16659 16.4523 5.16659 17.2757 5.46995Z"
        fill={color}
      />
      <Path
        d="M9.27568 5.46995C9.71088 5.63029 10 6.04492 10 6.50872L10 17.4912C10 17.955 9.71088 18.3696 9.27568 18.53C8.45228 18.8333 7.54772 18.8333 6.72432 18.53C6.28912 18.3696 6 17.955 6 17.4912L6 6.50872C6 6.04492 6.28912 5.63029 6.72432 5.46995C7.54772 5.16659 8.45228 5.16659 9.27568 5.46995Z"
        fill={color}
      />
    </Svg>
  );
}
