import Svg, { Path } from 'react-native-svg';

/**
 * Vector brand marks for the Login screen's social buttons, ported 1:1 from
 * the Figma Design System page (fileKey Fv2MwZPH1NImXNF16W5cxw):
 *   - Logo/Google — node 3182:2741 (raw source: assets/logo-google.svg)
 *   - Logo/Apple  — node 3182:2740 (raw source: assets/logo-apple.svg)
 *   - Logo/Kakao  — node 3182:2739 (raw source: assets/logo-kakao.svg)
 *
 * `react-native-svg` renders these as vectors (no transformer configured for
 * bare `.svg` imports), so the path data below matches the corresponding
 * `assets/*.svg` file exactly — treat that file as the source of truth and
 * keep the two in sync if the logo is ever re-exported from Figma.
 *
 * Fill colors are each mark's own brand/vector color straight from Figma,
 * not DayOne design-system tokens (DESIGN_SYSTEM.md §1 governs this app's UI
 * chrome, not the literal contents of an imported third-party logo).
 */

type LogoProps = {
  size?: number;
};

export function GoogleLogo({ size = 18 }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path
        d="M17.64 10.2045C17.64 9.56591 17.5827 8.95227 17.4764 8.36364H9V11.845H13.8436C13.635 12.97 13.0009 13.9232 12.0477 14.5614V16.8195H14.9564C16.6582 15.2527 17.64 12.9455 17.64 10.2045Z"
        fill="#4285F4"
      />
      <Path
        d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
        fill="#34A853"
      />
      <Path
        d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z"
        fill="#FBBC05"
      />
      <Path
        d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
        fill="#EA4335"
      />
    </Svg>
  );
}

export function AppleLogo({ size = 18 }: LogoProps) {
  const height = (size * 17.1) / 14.0625;
  return (
    <Svg width={size} height={height} viewBox="0 0 14.0625 17.1" fill="none">
      <Path
        d="M7.23999 3.94615C8.02002 3.94615 8.9978 3.42435 9.58008 2.72861C10.1074 2.09809 10.4919 1.21755 10.4919 0.336999C10.4919 0.217418 10.481 0.0978386 10.459 0C9.59106 0.0326128 8.54736 0.57616 7.92114 1.30451C7.42676 1.85893 6.97632 2.72861 6.97632 3.62003C6.97632 3.75048 6.99829 3.88093 7.00928 3.92441C7.06421 3.93528 7.1521 3.94615 7.23999 3.94615ZM4.49341 17.1C5.55908 17.1 6.03149 16.3934 7.36084 16.3934C8.71216 16.3934 9.00879 17.0783 10.1953 17.0783C11.3599 17.0783 12.1399 16.0129 12.876 14.9693C13.7 13.7735 14.0405 12.5994 14.0625 12.5451C13.9856 12.5233 11.7554 11.621 11.7554 9.08811C11.7554 6.89218 13.5132 5.90292 13.6121 5.82683C12.4475 4.17444 10.6787 4.13096 10.1953 4.13096C8.88794 4.13096 7.82227 4.91367 7.1521 4.91367C6.427 4.91367 5.47119 4.17444 4.3396 4.17444C2.18628 4.17444 0 5.93554 0 9.26205C0 11.3275 0.812988 13.5126 1.81274 14.9258C2.66968 16.1216 3.41675 17.1 4.49341 17.1Z"
        fill="#F4F4F5"
      />
    </Svg>
  );
}

export function KakaoLogo({ size = 18 }: LogoProps) {
  const height = (size * 16.889) / 18;
  return (
    <Svg width={size} height={height} viewBox="0 0 18 16.889" fill="none">
      <Path
        opacity={0.902}
        d="M9 0C4.29 0 0 3.786 0 6.989C0 9.389 1.558 11.506 3.931 12.764L2.933 16.43C2.844 16.755 3.213 17.013 3.496 16.826L7.873 13.921C8.242 13.957 8.618 13.978 9 13.978C13.97 13.978 18 10.849 18 6.989C18 3.786 13.97 0 9 0Z"
        fill="#18181B"
      />
    </Svg>
  );
}
