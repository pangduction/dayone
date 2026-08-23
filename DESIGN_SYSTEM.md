# DayOne Design System Rules

Extracted from the Figma **Design System** page (node `27:24771`) of
https://www.figma.com/design/Fv2MwZPH1NImXNF16W5cxw/DayOne via the Figma MCP
`get_variable_defs` / `get_design_context` tools. The raw tokens live in
`src/theme/tokens.ts` — this file is the *rulebook* for using them. Follow it
whenever you write or edit a UI component.

## 1. Never hardcode design values

- No raw hex colors, font sizes, font families, spacing numbers, or
  `borderRadius` literals in component code. Import from
  `src/theme/tokens.ts` (`colors`, `spacing`, `radius`, `typography`,
  `shadows`) instead.
- If a value you need isn't in `tokens.ts` yet, look up the real Figma node
  (search the Design System page, node `27:24771`) with `get_design_context`
  or `get_variable_defs`, add it to `tokens.ts` with a comment noting the
  Figma name, then use the token. Don't guess a value and don't invent a new
  one-off constant in the component file.
- One-off *layout* numbers that aren't part of the visual language (e.g. a
  screen's top safe-area padding) are fine as raw numbers — this rule is
  about colors, type, spacing, and radius, which must all trace back to a
  token.

## 2. Color usage

- Prefer the **semantic** `colors` export (`colors.textPrimary`,
  `colors.border`, `colors.accent`, …) over the raw `palette`. Reach for
  `palette` directly only when no semantic alias exists yet — and then add
  the alias to `colors` rather than importing `palette` repeatedly.
- The canonical grayscale is `palette.g50`…`palette.g900` (Figma's `G_`
  scale). A few older Figma nodes reference a second, slightly different
  gray scale (`grey900 #18181B`, `gray600 #52525B`, `neutral700 #404040`,
  etc.) — these are kept in `palette` only for exact 1:1 ports of those
  specific nodes. Do not use them in new components; use the `G_` scale.
- `palette.system*` (systemRed/Blue/Green/…) is an iOS-style swatch set used
  by picker/palette components, not general UI chrome — don't reach for it
  for buttons, text, or backgrounds.
- `colors.overlayContainer` (G800 @ 70%) / `colors.overlaySolid` (G900 @ 70%)
  are for controls overlaid on top of photo content (the Add screen's
  Fit/Filled toggle and Delete pill) — not general chrome backgrounds.

## 3. Typography usage

Use the named style from `typography` that matches intent — don't
reconstruct a style from raw `fontSize`/`fontFamily`:

| Token             | Figma style      | Use for                                   |
|-------------------|------------------|--------------------------------------------|
| `typography.display`      | (Login only)  | The "DayOne" wordmark                      |
| `typography.titleMedium`  | Title-Medium  | Large screen/section titles                |
| `typography.titleSmall`   | Title-Small   | Modal / card titles                        |
| `typography.calendarTitle`| Calendar/Title| Calendar header title                      |
| `typography.calendarDate` | Calendar/Date | Calendar date cell numbers                 |
| `typography.calendarDay`  | Calendar/Day  | Calendar weekday labels                    |
| `typography.body`         | Body          | Default body text, placeholders, input text|
| `typography.subtext`      | Subtext       | Button labels, field labels                |
| `typography.caption`      | Caption       | Small annotations (Poppins Bold)           |
| `typography.overline`     | Overline      | Eyebrow/overline labels                    |

Every style already has `fontFamily`, `fontSize`, `letterSpacing`, and (where
Figma specifies one) `lineHeight` pre-computed in points — spread the whole
object into a `Text` style rather than picking individual fields:

```tsx
<Text style={[styles.label, typography.subtext, { color: colors.textSecondary }]}>
```

New font weights/families must be loaded via `fontAssets` in
`src/theme/tokens.ts` and registered with `useFonts` in `App.tsx` before a
screen using them can render — never inline a `require()` for a font in a
component.

## 4. Component style reference

These are the padding / gap / corner-radius specs read directly off the
Figma components. Match them when building the equivalent React Native
component; use `spacing.*` / `radius.*` tokens, not the raw numbers below.

| Component (Figma name)              | Padding (H / V)   | Gap  | Radius       | Notes |
|--------------------------------------|-------------------|------|--------------|-------|
| Button / L / Filled / Primary        | 16 / 8            | —    | 16 (`radius.lg`) | height 48, `colors.buttonDark` bg, `typography.body` white label |
| Button / M / Ghost / Secondary       | 16 / —            | —    | 12 (`radius.md`) | min-height 40, white bg, `border` 1px, `shadows.xs`, `typography.subtext` label |
| Chip Button                          | 8 / 10            | —    | 8 (`radius.sm`)  | height 40, `shadows.xs`; active border = `colors.accent`, inactive = `colors.border` |
| Alert                                | 20 / 8            | 8    | 8 (`radius.sm`)  | `colors.success` bg, white `typography.body` text (13px) |
| Input (text field)                   | 12 / 10           | —    | 8 (`radius.sm`)  | white bg, `border` 1px, `shadows.xs`, placeholder in `colors.textPlaceholder` |
| Input with label                     | —                 | 8    | —            | label uses `typography.subtext` in `colors.textSecondary`, 8px above the input |
| Search input field                   | 12 / 12           | 8    | 8 (`radius.sm`)  | `border` 1px, `colors.accent` text cursor |
| Button / M / Header Action (e.g. "Done") | 12 / 8        | —    | 16 (`radius.lg`) | height 40; off = `colors.surface` bg / `colors.border` text (node `3184:5701`), on = `colors.accent` bg / `colors.textOnDark` text (node `3184:5903`) — both states verified via `get_design_context`. See `HeaderActionButton.tsx`. |
| Button/Icon/Plain                    | 8 (all)           | —    | 16 (`radius.lg`) | bare 40×40 tap target, transparent bg. See `IconButton.tsx`. |
| Button/Icon/Contained                | 8 / 5             | —    | 8 (`radius.sm`)  | white/`colors.surface` bg, `shadows.xs`; the "5" vertical padding is a Figma-exact value, not on the spacing scale. See `IconButtonContained.tsx`. |
| SegmentedButton (Fit/Filled toggle)  | 2 (container)     | —    | 17 (off-scale) outer, 16 (`radius.lg`) active segment | overlaid top-center on a selected photo; container bg `colors.overlayContainer`, active segment bg `colors.overlaySolid` + white icon/label, inactive = transparent + `colors.textPlaceholder`. Node `3192:12065`. See `SegmentedButton.tsx`. |
| Button / S / Filled / FAB (e.g. "Delete") | 12 / 3 (left) · 8 / 3 (right) | 3 | 20 (off-scale) | `colors.overlaySolid` bg, white `typography.overline` label, trailing 16×16 `ic/cross`. Node `3192:11841`. See `FilledFabButton.tsx`. |

When implementing a component not in this table, pull its real spec with
`get_design_context` on its node in the Design System page — don't
extrapolate from a similar-looking row above.

**Prefer the master component over a screen instance.** A component placed
inside a specific screen frame (e.g. a `Navigation` instance on
`Home-Calendar-Default`) only shows *that screen's* variant. The Design
System page also has the master component/component-set definition (search
for its bare name) — fetch that node too before implementing, since it
reveals every variant (e.g. `Navigation`'s `selected="Home"` vs
`selected="Report"`) including ones the current screen doesn't use yet.
Concretely: `Navigation`'s Home/Report icons aren't just recolored when
active — they swap to an entirely different glyph (filled vs outline). Port
the variant(s) you actually need now; note in a comment which ones from the
master component are still missing so a later screen doesn't silently reuse
the wrong glyph.

## 5. Icons and images

- Reuse `@expo/vector-icons` (`Ionicons`, etc.) when a matching glyph
  exists — that's already the project's convention.
- Otherwise, use the exact asset exported by Figma for that node (via
  `get_design_context` / `download_assets`), not a hand-drawn approximation.
  Figma's exported asset URLs expire after ~7 days — save the file into
  `assets/` rather than referencing the URL directly. See
  `assets/logo-google.svg` / `logo-apple.svg` / `logo-kakao.svg` / `ic-*.svg`
  (raw Figma vectors) plus `src/components/icons/SocialLogos.tsx` and
  `HomeIcons.tsx` (their `react-native-svg` rendering, since the project has
  no `.svg`-import transformer configured) and `assets/splash-collage.png`
  for the pattern — a plain PNG can be `require()`'d directly, a vector
  asset gets ported into an `Svg`/`Path` component whose path data matches
  its `assets/*.svg` file. A fixed-color brand mark (social logos) bakes its
  Figma fill(s) straight into the component; a single-color DayOne icon
  (`HomeIcons.tsx`) instead takes a required `color` prop so call sites pass
  a `colors.*` token, per §1/§2, rather than a hardcoded fill.
- If Figma asset hosts aren't reachable from the current sandbox, add a
  `TODO` comment describing the real asset to swap in later. This has come
  up even though the Figma MCP tools themselves (`get_design_context`,
  `download_assets`) work fine here: they confirm a node's exact frame
  size, inset percentages, color, and node id, but every actual
  `www.figma.com/api/mcp/asset/...` byte-fetch 403s from this sandbox's
  outbound proxy. `src/components/icons/AddIcons.tsx` is the current
  example — each export is an Ionicons stand-in sized to the real Figma
  frame (so layout/gaps are already correct) with a `TODO` naming the exact
  node to port from a session with unrestricted network access.

## 6. Where things live

- `src/theme/tokens.ts` — all design tokens (`palette`, `colors`, `spacing`,
  `radius`, `typography`, `shadows`, `fontAssets`). Single source of truth;
  extend it, don't duplicate it.
- `src/components/` — reusable components, one per recurring Figma
  component: `IconButton.tsx` (Button/Icon/Plain), `IconButtonContained.tsx`
  (Button/Icon/Contained), `HeaderActionButton.tsx` (Button / M / Header
  Action), `SegmentedButton.tsx` (Fit/Filled toggle), `FilledFabButton.tsx`
  (Button / S / Filled / FAB), plus `icons/HomeIcons.tsx` and
  `icons/AddIcons.tsx` for each screen's ported/stand-in glyphs.
- `src/screens/` — one file per Figma screen/frame.
- `src/navigation/RootNavigator.tsx` — the single React Navigation native
  stack (Login/Home/Add). `initialRouteName` is temporarily `"Home"` since
  sign-in has no real auth yet; flip it back to `"Login"` once that's wired
  up.
- `src/data/` — local, on-device data stores (no backend yet). `posts.ts`
  is an AsyncStorage-backed store for the one-post-per-day / one-photo-per-post
  rule; screens should go through its functions rather than touching
  AsyncStorage directly.
- `src/utils/calendar.ts` — pure date-math helpers (days in month, weekday
  grid) shared by any screen that renders a calendar.

Keep this file in sync: whenever a new token or component spec is pulled
from Figma, update the relevant section here as well as `tokens.ts`.
