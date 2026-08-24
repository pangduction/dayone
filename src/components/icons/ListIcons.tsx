import Svg, { Path } from 'react-native-svg';

/**
 * Glyphs the Home-List screen introduces, ported from the exported assets
 * like the rest (DESIGN_SYSTEM.md §5): a full 24x24 canvas with the glyph
 * already inset, so `size` is the frame and the call site needs no wrapper.
 *
 *   - ic/search   — Header/List's right action, assets/ic/search.svg
 *   - ic/edit-alt — the empty list's pencil, assets/ic/edit-alt.svg
 *
 * Figma draws ic/edit-alt at 40 rather than 24 (node 3192:9214). It is still
 * the same 24 canvas scaled up, which its reported insets confirm: 13.54% =
 * 3.25/24 and 17.71% = (24 - 19.75)/24 are exactly this path's bounds. So
 * `<IcEditAlt size={40} />` reproduces it — no separate 40pt asset.
 */

type IconProps = {
  size?: number;
  color: string;
};

export function IcSearch({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3849 15.4458C11.7346 17.5685 7.8552 17.4014 5.39842 14.9446C2.76238 12.3086 2.76238 8.0347 5.39842 5.39866C8.03445 2.76262 12.3083 2.76262 14.9444 5.39866C17.4011 7.85544 17.5682 11.7349 15.4456 14.3851L20.6012 19.5408C20.8941 19.8337 20.8941 20.3085 20.6012 20.6014C20.3083 20.8943 19.8334 20.8943 19.5405 20.6014L14.3849 15.4458ZM6.45908 13.8839C4.40882 11.8337 4.40882 8.50957 6.45908 6.45932C8.50933 4.40907 11.8334 4.40907 13.8837 6.45932C15.9324 8.50807 15.9339 11.8288 13.8882 13.8794C13.8867 13.8809 13.8852 13.8824 13.8837 13.8839C13.8822 13.8854 13.8807 13.8869 13.8792 13.8884C11.8286 15.9342 8.50783 15.9327 6.45908 13.8839Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcEditAlt({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.1369 3.46967C14.9963 3.32902 14.8055 3.25 14.6066 3.25C14.4077 3.25 14.2169 3.32902 14.0763 3.46967L4.88388 12.6621C4.78965 12.7563 4.72223 12.8739 4.68856 13.0028L3.68856 16.8313C3.62127 17.0889 3.69561 17.3629 3.88388 17.5511C4.07215 17.7394 4.34614 17.8138 4.60375 17.7465L8.43218 16.7465C8.56111 16.7128 8.67874 16.6454 8.77297 16.5511L17.9654 7.35876C18.2582 7.06586 18.2582 6.59099 17.9654 6.2981L15.1369 3.46967ZM6.08843 13.5788L14.6066 5.06066L16.3744 6.82843L7.8562 15.3466L5.46344 15.9716L6.08843 13.5788Z"
        fill={color}
      />
      <Path
        d="M4 19.25C3.58579 19.25 3.25 19.5858 3.25 20C3.25 20.4142 3.58579 20.75 4 20.75H19C19.4142 20.75 19.75 20.4142 19.75 20C19.75 19.5858 19.4142 19.25 19 19.25H4Z"
        fill={color}
      />
    </Svg>
  );
}
