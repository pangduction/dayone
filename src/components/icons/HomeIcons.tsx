import Svg, { Path } from 'react-native-svg';

/**
 * Vector icons for the Home / "Home-Calendar-Default" screen (Figma node
 * 3184:4117, fileKey Fv2MwZPH1NImXNF16W5cxw), ported 1:1 from the exported
 * assets the same way as `./AddIcons.tsx` / `./SocialLogos.tsx`:
 *   - ic/rows       — header left,  assets/ic/rows.svg
 *   - ic/share      — header right, assets/ic/share.svg
 *   - ic/calendar   — nav "Home",   assets/ic/calendar.svg
 *   - ic/plus       — nav "Add",    assets/ic/plus.svg
 *   - ic/pulse      — nav "Report", assets/ic/pulse.svg
 *   - ic/arrow-down — calendar title chevron, assets/ic/arrow-down.svg
 *
 * Every asset ships as a full 24x24 canvas with the glyph already inset
 * inside it, so `viewBox="0 0 24 24"` plus `size` reproduces Figma's exact
 * inset on its own — no outer frame `View` needed at the call site. (These
 * were previously ported at their tight glyph bounding box, which required
 * call sites to wrap them in a 24x24 frame to recreate that inset; getting
 * that wrapper wrong is what made the bottom nav's icon/label spacing drift
 * twice. The full-canvas form removes that failure mode.)
 *
 * `size` is the frame: 24 everywhere except the calendar-title chevron,
 * whose Figma instance is 20.
 *
 * Unlike the brand marks in SocialLogos.tsx, these are DayOne's own
 * single-color glyphs, so `color` is a required prop — callers pass a
 * `colors.*` token (e.g. `colors.textPrimary`, `colors.textPlaceholder`),
 * never the `#030303` fill baked into the raw asset (DESIGN_SYSTEM.md §1/§2).
 *
 * Selected vs. unselected: `assets/Navigation.svg` (the exported master
 * component-set, node 3184:3668) renders both variants, and their path data
 * is identical apart from a 104px vertical offset between the two rows and
 * the `fill` (G900 #030303 selected / G400 #9EA4AA not) — i.e. the calendar
 * and pulse glyphs are *recolored*, not swapped for a different shape. So
 * each icon here serves both states; the call site just passes
 * `colors.textPrimary` or `colors.textPlaceholder`. (An earlier comment
 * here claimed they swapped glyphs — that was an unverified guess,
 * corrected once the real asset was available.)
 */

type IconProps = {
  size?: number;
  color: string;
};

export function IcRows({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.95714 5.19236C4.54554 6.52645 4.54554 7.97349 4.95714 9.30758C9.64146 9.75904 14.3583 9.75904 19.0427 9.30758C19.4543 7.97349 19.4543 6.52645 19.0427 5.19236C14.3583 4.74089 9.64146 4.74089 4.95714 5.19236ZM4.70865 3.70943C9.55792 3.2352 14.4419 3.2352 19.2912 3.70943C19.8257 3.76171 20.275 4.128 20.4392 4.63377C20.9888 6.32686 20.9888 8.17307 20.4392 9.86617C20.275 10.3719 19.8257 10.7382 19.2912 10.7905C14.4419 11.2647 9.55792 11.2647 4.70865 10.7905C4.1741 10.7382 3.72483 10.3719 3.56065 9.86617C3.01103 8.17307 3.01103 6.32686 3.56065 4.63377C3.72483 4.128 4.1741 3.76171 4.70865 3.70943Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.95714 14.6924C4.54554 16.0265 4.54554 17.4735 4.95714 18.8076C9.64146 19.259 14.3583 19.259 19.0427 18.8076C19.4543 17.4735 19.4543 16.0265 19.0427 14.6924C14.3583 14.2409 9.64146 14.2409 4.95714 14.6924ZM4.70865 13.2094C9.55792 12.7352 14.4419 12.7352 19.2912 13.2094C19.8257 13.2617 20.275 13.628 20.4392 14.1338C20.9888 15.8269 20.9888 17.6731 20.4392 19.3662C20.275 19.8719 19.8257 20.2382 19.2912 20.2905C14.4419 20.7647 9.55792 20.7647 4.70865 20.2905C4.1741 20.2382 3.72483 19.8719 3.56065 19.3662C3.01103 17.6731 3.01103 15.8269 3.56065 14.1338C3.72483 13.628 4.1741 13.2617 4.70865 13.2094Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcShare({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12.5C19.2761 12.5 19.5 12.7239 19.5 13V18.5H4.5V13C4.5 12.7239 4.72386 12.5 5 12.5C5.27614 12.5 5.5 12.7239 5.5 13V17.5H18.5V13C18.5 12.7239 18.7239 12.5 19 12.5Z"
        fill={color}
      />
      <Path
        d="M15.3535 7.64648C15.5488 7.84175 15.5488 8.15825 15.3535 8.35352C15.1583 8.54877 14.8417 8.54878 14.6465 8.35352L12.5 6.20703V14C12.5 14.2761 12.2761 14.5 12 14.5C11.7239 14.5 11.5 14.2761 11.5 14V6.20703L9.35352 8.35352C9.15825 8.54877 8.84174 8.54878 8.64648 8.35352C8.45124 8.15825 8.45124 7.84174 8.64648 7.64648L12 4.29297L15.3535 7.64648Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcCalendar({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.99982 3.25C7.41403 3.25 7.74982 3.58579 7.74982 4V5.66763C10.5776 5.4158 13.4221 5.4158 16.2498 5.66763V4C16.2498 3.58579 16.5856 3.25 16.9998 3.25C17.414 3.25 17.7498 3.58579 17.7498 4V5.81644C19.2429 6.02754 20.4224 7.20847 20.6221 8.71484L20.7086 9.36779C21.0726 12.1141 21.0412 14.8984 20.6152 17.6359C20.4042 18.9919 19.3026 20.0335 17.9368 20.1681L16.7438 20.2858C13.5888 20.5969 10.4108 20.5969 7.25574 20.2858L6.06274 20.1681C4.697 20.0335 3.59534 18.9919 3.38433 17.6359C2.95837 14.8984 2.92693 12.1141 3.29097 9.36779L3.37752 8.71484C3.57719 7.20845 4.75674 6.02751 6.24982 5.81643V4C6.24982 3.58579 6.5856 3.25 6.99982 3.25ZM7.44498 7.2028C10.4742 6.90408 13.5254 6.90408 16.5546 7.2028L17.46 7.2921C18.3268 7.37757 19.0206 8.04854 19.1351 8.91194L19.2216 9.56489C19.2519 9.793 19.2792 10.0214 19.3037 10.25H4.69588C4.72036 10.0214 4.74772 9.79301 4.77796 9.5649L4.86451 8.91194C4.97896 8.04854 5.67278 7.37757 6.53953 7.2921L7.44498 7.2028ZM4.57665 11.75C4.47847 13.6381 4.5752 15.5332 4.86649 17.4052C4.97233 18.0854 5.52491 18.6078 6.20995 18.6754L7.40295 18.793C10.4601 19.0945 13.5395 19.0945 16.5966 18.793L17.7896 18.6754C18.4747 18.6078 19.0272 18.0854 19.1331 17.4052C19.4244 15.5332 19.5211 13.6381 19.4229 11.75H4.57665Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcPlus({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 6.25C12.4142 6.25 12.75 6.58579 12.75 7V11.25H17C17.4142 11.25 17.75 11.5858 17.75 12C17.75 12.4142 17.4142 12.75 17 12.75H12.75V17C12.75 17.4142 12.4142 17.75 12 17.75C11.5858 17.75 11.25 17.4142 11.25 17V12.75H7C6.58579 12.75 6.25 12.4142 6.25 12C6.25 11.5858 6.58579 11.25 7 11.25H11.25V7C11.25 6.58579 11.5858 6.25 12 6.25Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcPulse({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.23967 4.87594C8.18246 4.53491 7.8995 4.27719 7.55462 4.25201C7.20974 4.22683 6.89234 4.4407 6.7862 4.76981L4.69627 11.25H2C1.58579 11.25 1.25 11.5858 1.25 12C1.25 12.4142 1.58579 12.75 2 12.75H5.24242C5.56795 12.75 5.8563 12.54 5.95622 12.2302L7.26937 8.15859L9.10882 19.1241C9.16679 19.4697 9.45634 19.7291 9.8062 19.7488C10.1561 19.7686 10.473 19.5434 10.5695 19.2066L12.999 10.7266L14.2789 15.2061C14.3613 15.4947 14.608 15.7064 14.9059 15.7441C15.2037 15.7818 15.4954 15.6382 15.6471 15.3791L17.1874 12.75H18.3535C18.68 13.9043 19.7412 14.75 21 14.75C22.5188 14.75 23.75 13.5188 23.75 12C23.75 10.4812 22.5188 9.25002 21 9.25002C19.7412 9.25002 18.68 10.0958 18.3535 11.25H16.7576C16.4913 11.25 16.245 11.3912 16.1105 11.6209L15.2394 13.1078L13.7211 7.79398C13.6292 7.4721 13.335 7.25014 13.0003 7.25002C12.6655 7.24989 12.3712 7.47164 12.279 7.79345L10.04 15.6084L8.23967 4.87594ZM19.75 12C19.75 11.3097 20.3096 10.75 21 10.75C21.6904 10.75 22.25 11.3097 22.25 12C22.25 12.6904 21.6904 13.25 21 13.25C20.3096 13.25 19.75 12.6904 19.75 12Z"
        fill={color}
      />
    </Svg>
  );
}

export function IcArrowDown({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.9202 8.18005H11.6902H6.08024C5.12024 8.18005 4.64024 9.34005 5.32024 10.0201L10.5002 15.2001C11.3302 16.0301 12.6802 16.0301 13.5102 15.2001L15.4802 13.2301L18.6902 10.0201C19.3602 9.34005 18.8802 8.18005 17.9202 8.18005Z"
        fill={color}
      />
    </Svg>
  );
}
