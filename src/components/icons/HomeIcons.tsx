import Svg, { Path } from 'react-native-svg';

/**
 * Vector icons for the Home / "Home-Calendar-Default" screen (Figma node
 * 3184:4117, fileKey Fv2MwZPH1NImXNF16W5cxw), ported 1:1 the same way as
 * `./SocialLogos.tsx`:
 *   - ic/rows       — header left,  instance I3184:5500;3183:2840
 *   - ic/share      — header right, instance I3184:5500;3183:2841;26:18522
 *   - ic/calendar   — nav "Home",   instance I3184:4123;3184:3525
 *   - ic/plus       — nav "Add",    instance I3184:4123;3184:3529
 *   - ic/pulse      — nav "Report", instance I3184:4123;3184:3533
 *   - ic/arrow-down — calendar title chevron, instance I3184:4121;3183:2858
 * Raw sources: assets/ic-rows.svg, ic-share.svg, ic-calendar.svg,
 * ic-plus.svg, ic-pulse.svg, ic-arrow-down.svg.
 *
 * Each Figma icon component is a fixed-size square/tap-target frame (24×24,
 * or 20×20 for the chevron) with the visible glyph inset inside it — the
 * `viewBox` below is the glyph's own tight bounding box (matching the raw
 * .svg asset exactly), and `size` is that outer frame, so passing the same
 * `size` the Figma instance uses (24, or 20 for arrow-down) reproduces the
 * exact inset when the icon sits in a centered container, same as the
 * `Ionicons` calls these replace.
 *
 * Unlike the brand marks in SocialLogos.tsx, these are DayOne's own
 * single-color glyphs, so `color` is a required prop — callers pass a
 * `colors.*` token (e.g. `colors.textPrimary`, `colors.textPlaceholder`),
 * never a value baked into the component (DESIGN_SYSTEM.md §1/§2). Figma's
 * exported fill for each (kept as-is in the raw assets/*.svg files) happens
 * to equal a `palette.g*` step already aliased in `colors` — see the call
 * sites in HomeScreen.tsx.
 */

type IconProps = {
  size?: number;
  color: string;
};

export function IcRows({ size = 24, color }: IconProps) {
  const scale = size / 24;
  return (
    <Svg width={17.7029 * scale} height={17.2924 * scale} viewBox="0 0 17.7029 17.2924" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.80871 1.8386C1.3971 3.17269 1.3971 4.61973 1.80871 5.95382C6.49302 6.40528 11.2099 6.40528 15.8942 5.95382C16.3058 4.61973 16.3058 3.17269 15.8942 1.8386C11.2099 1.38713 6.49303 1.38713 1.80871 1.8386ZM1.56022 0.355672C6.40948 -0.118557 11.2934 -0.118557 16.1427 0.355672C16.6773 0.407948 17.1265 0.774239 17.2907 1.28001C17.8403 2.9731 17.8403 4.81931 17.2907 6.51241C17.1265 7.01818 16.6773 7.38447 16.1427 7.43675C11.2934 7.91097 6.40948 7.91097 1.56021 7.43675C1.02566 7.38447 0.576394 7.01818 0.41221 6.51241C-0.137403 4.81931 -0.137403 2.9731 0.41221 1.28001C0.576394 0.774239 1.02566 0.407948 1.56022 0.355672Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.80871 11.3386C1.3971 12.6727 1.3971 14.1197 1.80871 15.4538C6.49302 15.9053 11.2099 15.9053 15.8942 15.4538C16.3058 14.1197 16.3058 12.6727 15.8942 11.3386C11.2099 10.8871 6.49303 10.8871 1.80871 11.3386ZM1.56022 9.85567C6.40948 9.38144 11.2934 9.38144 16.1427 9.85567C16.6773 9.90795 17.1265 10.2742 17.2907 10.78C17.8403 12.4731 17.8403 14.3193 17.2907 16.0124C17.1265 16.5182 16.6773 16.8845 16.1427 16.9367C11.2934 17.411 6.40948 17.411 1.56021 16.9367C1.02566 16.8845 0.576394 16.5182 0.41221 16.0124C-0.137403 14.3193 -0.137403 12.4731 0.41221 10.78C0.576394 10.2742 1.02566 9.90795 1.56022 9.85567Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcShare({ size = 24, color }: IconProps) {
  const scale = size / 24;
  return (
    <Svg width={15 * scale} height={14.207 * scale} viewBox="0 0 15 14.207" fill="none">
      <Path
        d="M14.5 8.20703C14.7761 8.20703 15 8.43089 15 8.70703V14.207H0V8.70703C0 8.43089 0.223858 8.20703 0.5 8.20703C0.776142 8.20703 1 8.43089 1 8.70703V13.207H14V8.70703C14 8.43089 14.2239 8.20703 14.5 8.20703Z"
        fill={color}
      />
      <Path
        d="M10.8535 3.35352C11.0488 3.54878 11.0488 3.86528 10.8535 4.06055C10.6583 4.2558 10.3417 4.25581 10.1465 4.06055L8 1.91406V9.70703C8 9.98317 7.77614 10.207 7.5 10.207C7.22386 10.207 7 9.98317 7 9.70703V1.91406L4.85352 4.06055C4.65825 4.2558 4.34174 4.25581 4.14648 4.06055C3.95124 3.86529 3.95124 3.54877 4.14648 3.35352L7.5 0L10.8535 3.35352Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcCalendar({ size = 24, color }: IconProps) {
  const scale = size / 24;
  return (
    <Svg width={17.9205 * scale} height={17.2691 * scale} viewBox="0 0 17.9205 17.2691" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.96027 0C4.37448 0 4.71027 0.335786 4.71027 0.75V2.41763C7.538 2.1658 10.3825 2.1658 13.2103 2.41763V0.75C13.2103 0.335786 13.5461 0 13.9603 0C14.3745 0 14.7103 0.335786 14.7103 0.75V2.56644C16.2033 2.77754 17.3828 3.95847 17.5825 5.46484L17.6691 6.11779C18.0331 8.86412 18.0017 11.6484 17.5757 14.3859C17.3647 15.7419 16.263 16.7835 14.8973 16.9181L13.7043 17.0358C10.5492 17.3469 7.37124 17.3469 4.21619 17.0358L3.02319 16.9181C1.65745 16.7835 0.555787 15.7419 0.344778 14.3859C-0.0811805 11.6484 -0.112621 8.86412 0.251414 6.11779L0.337966 5.46484C0.537643 3.95845 1.71719 2.77751 3.21027 2.56643V0.75C3.21027 0.335786 3.54605 0 3.96027 0ZM4.40543 3.9528C7.43462 3.65408 10.4859 3.65408 13.515 3.9528L14.4205 4.0421C15.2872 4.12757 15.9811 4.79854 16.0955 5.66194L16.1821 6.31489C16.2123 6.543 16.2397 6.77139 16.2641 7H1.65633C1.68081 6.77139 1.70817 6.54301 1.73841 6.3149L1.82496 5.66194C1.93941 4.79854 2.63323 4.12757 3.49998 4.0421L4.40543 3.9528ZM1.5371 8.5C1.43892 10.3881 1.53565 12.2832 1.82694 14.1552C1.93278 14.8354 2.48536 15.3578 3.1704 15.4254L4.3634 15.543C7.42054 15.8445 10.4999 15.8445 13.5571 15.543L14.7501 15.4254C15.4351 15.3578 15.9877 14.8354 16.0935 14.1552C16.3848 12.2832 16.4816 10.3881 16.3834 8.5H1.5371Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcPlus({ size = 24, color }: IconProps) {
  const scale = size / 24;
  return (
    <Svg width={11.5 * scale} height={11.5 * scale} viewBox="0 0 11.5 11.5" fill="none">
      <Path
        d="M5.75 0C6.16421 0 6.5 0.335786 6.5 0.75V5H10.75C11.1642 5 11.5 5.33579 11.5 5.75C11.5 6.16421 11.1642 6.5 10.75 6.5H6.5V10.75C6.5 11.1642 6.16421 11.5 5.75 11.5C5.33579 11.5 5 11.1642 5 10.75V6.5H0.75C0.335787 6.5 2.53566e-07 6.16421 0 5.75C1.81059e-08 5.33579 0.335787 5 0.75 5H5V0.75C5 0.335786 5.33579 0 5.75 0Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcPulse({ size = 24, color }: IconProps) {
  const scale = size / 24;
  return (
    <Svg width={22.5 * scale} height={15.5 * scale} viewBox="0 0 22.5 15.5" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.98967 0.625939C6.93246 0.284905 6.6495 0.0271905 6.30462 0.00200799C5.95974 -0.0231744 5.64234 0.190704 5.5362 0.51981L3.44627 7.00002H0.75C0.335786 7.00002 0 7.3358 0 7.75002C0 8.16423 0.335786 8.50002 0.75 8.50002H3.99242C4.31795 8.50002 4.6063 8.29003 4.70622 7.98022L6.01937 3.90859L7.85882 14.8741C7.91679 15.2197 8.20634 15.4791 8.5562 15.4988C8.90606 15.5186 9.22297 15.2934 9.31948 14.9566L11.749 6.47659L13.0289 10.9561C13.1113 11.2447 13.358 11.4564 13.6559 11.4941C13.9537 11.5318 14.2454 11.3882 14.3971 11.1291L15.9374 8.50002H17.1035C17.43 9.65427 18.4912 10.5 19.75 10.5C21.2688 10.5 22.5 9.2688 22.5 7.75002C22.5 6.23123 21.2688 5.00002 19.75 5.00002C18.4912 5.00002 17.43 5.84576 17.1035 7.00002H15.5076C15.2413 7.00002 14.995 7.14117 14.8605 7.37089L13.9894 8.85775L12.4711 3.54398C12.3792 3.2221 12.085 3.00014 11.7503 3.00002C11.4155 2.99989 11.1212 3.22164 11.029 3.54345L8.79002 11.3584L6.98967 0.625939ZM18.5 7.75002C18.5 7.05966 19.0596 6.50002 19.75 6.50002C20.4404 6.50002 21 7.05966 21 7.75002C21 8.44037 20.4404 9.00002 19.75 9.00002C19.0596 9.00002 18.5 8.44037 18.5 7.75002Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcArrowDown({ size = 20, color }: IconProps) {
  const scale = size / 20;
  return (
    <Svg width={11.6672 * scale} height={6.36875 * scale} viewBox="0 0 11.6672 6.36875" fill="none">
      <Path
        d="M10.7656 0H5.57398H0.898976C0.0989765 0 -0.301023 0.966667 0.265643 1.53333L4.58231 5.85C5.27398 6.54167 6.39898 6.54167 7.09064 5.85L8.73231 4.20833L11.4073 1.53333C11.9656 0.966667 11.5656 0 10.7656 0Z"
        fill={color}
      />
    </Svg>
  );
}
