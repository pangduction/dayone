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

When implementing a component not in this table, pull its real spec with
`get_design_context` on its node in the Design System page — don't
extrapolate from a similar-looking row above.

## 5. Icons and images

- Reuse `@expo/vector-icons` (`Ionicons`, etc.) when a matching glyph
  exists — that's already the project's convention (see
  `SocialLoginButton.tsx`).
- Otherwise, use the exact asset exported by Figma for that node (via
  `get_design_context` / `download_assets`), not a hand-drawn approximation.
  Figma's exported asset URLs expire after ~7 days — save the file into
  `assets/` rather than referencing the URL directly.
- If Figma asset hosts aren't reachable from the current sandbox, add a
  `TODO` comment describing the real asset to swap in later — see the
  existing notes in `SocialLoginButton.tsx` / `LoginScreen.tsx` for the
  expected format.

## 6. Where things live

- `src/theme/tokens.ts` — all design tokens (`palette`, `colors`, `spacing`,
  `radius`, `typography`, `shadows`, `fontAssets`). Single source of truth;
  extend it, don't duplicate it.
- `src/components/` — reusable components, one per recurring Figma
  component.
- `src/screens/` — one file per Figma screen/frame.

Keep this file in sync: whenever a new token or component spec is pulled
from Figma, update the relevant section here as well as `tokens.ts`.
