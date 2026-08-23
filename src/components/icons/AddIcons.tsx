import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

/**
 * Icon stand-ins for the Add screen (Figma "Add-Default" 3184:5508 /
 * "Add-Image-2" 3184:5903, fileKey Fv2MwZPH1NImXNF16W5cxw).
 *
 * Unlike HomeIcons.tsx, these are NOT ported from real Figma vector data.
 * This sandbox can reach the Figma MCP tools themselves — get_design_context
 * and download_assets both confirm each icon's exact frame size, inset,
 * color, and node id below — but cannot fetch the actual asset bytes:
 * every www.figma.com/api/mcp/asset/... URL returns a 403 from this
 * sandbox's outbound proxy (confirmed via curl; not something a retry
 * fixes). Per DESIGN_SYSTEM.md §5's documented fallback, each icon here is
 * an Ionicons stand-in wrapped in a frame `View` sized to the real Figma
 * frame, so *layout* (gaps, tap targets, inset centering) is already
 * pixel-accurate — only the glyph shape itself is an approximation. Swap
 * the Ionicons call for a real ported <Svg>/<Path> (see HomeIcons.tsx for
 * the pattern) once the vector bytes are available from a session with
 * unrestricted network access.
 */

type IconProps = {
  size?: number;
  color: string;
};

/** TODO: port ic/arrow-left from node 3184:5668 — 24x24 frame, glyph inset
 * 21.58% top/bottom, 11.46% left/right. Ionicons stand-in for now. */
export function IcArrowLeft({ size = 24, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="arrow-back" size={size * 0.75} color={color} />
    </View>
  );
}

/** TODO: port ic/microphone from node 3184:5911 — 24x24 frame, glyph inset
 * 10.29%/3.13% vertical, 17.71% horizontal. Ionicons stand-in for now. */
export function IcMicrophone({ size = 24, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="mic-outline" size={size * 0.75} color={color} />
    </View>
  );
}

/** TODO: no Figma node fetched yet for the empty-photo-state glyph; this is
 * an unverified Ionicons placeholder, not a ported vector. */
export function IcImage({ size = 24, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="image-outline" size={size * 0.85} color={color} />
    </View>
  );
}

/** TODO: port ic/cross from node I3192:11838;13:16347 — 16x16 frame, glyph
 * inset ~10.23% all sides, rotated 45deg. Ionicons stand-in for now. */
export function IcCross({ size = 16, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="close" size={size * 0.9} color={color} />
    </View>
  );
}

/** TODO: port ic/Fit from node 3192:12018 — 12x12 frame, glyph inset 7.29%
 * top/bottom, 5.21% left/right. Ionicons stand-in for now. */
export function IcFit({ size = 12, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="scan-outline" size={size} color={color} />
    </View>
  );
}

/** TODO: port ic/Filled from node 3192:12026 — 12x12 frame, glyph inset
 * 5.21% all sides. Ionicons stand-in for now. */
export function IcFilled({ size = 12, color }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="square" size={size * 0.85} color={color} />
    </View>
  );
}
