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
- `colors.backdrop` (G900 @ 30%) is the full-screen scrim behind a modal
  sheet; `colors.photoScrim` is that same value darkening a photo thumbnail
  (a calendar day cell), and `colors.overlayAccent` (Accent @ 30%) is its
  today counterpart; `colors.surfaceDark` (G600) is a filled tile sitting
  *on* a light sheet (Modal/Gallery's camera tile). None is a page
  background.

## 3. Typography usage

Use the named style from `typography` that matches intent — don't
reconstruct a style from raw `fontSize`/`fontFamily`:

| Token             | Figma style      | Use for                                   |
|-------------------|------------------|--------------------------------------------|
| `typography.display`      | (Login only)  | The "DayOne" wordmark                      |
| `typography.titleLarge`   | Title-Large   | The recording screen's timer               |
| `typography.titleMedium`  | Title-Medium  | Large screen/section titles                |
| `typography.titleSmall`   | Title-Small   | Modal / card titles                        |
| `typography.calendarTitle`| Calendar/Title| Calendar header title                      |
| `typography.calendarDate` | Calendar/Date | Calendar date cell numbers                 |
| `typography.calendarDay`  | Calendar/Day  | Calendar weekday labels                    |
| `typography.body`         | Body          | Default body text, placeholders, input text|
| `typography.subtext`      | Subtext       | Button labels, field labels                |
| `typography.caption`      | Caption       | Small annotations (Poppins Bold)           |
| `typography.overline`     | Overline      | Eyebrow/overline labels                    |
| `typography.reportDate`   | Report/Date   | A report thumbnail's day label — the one **italic** in the system (Inter Medium Italic 9) |
| `typography.reportCaption`| Report/Caption| A report thumbnail's text excerpt (Inter Medium 11)      |
| `typography.alert`        | (local)       | Alert banner text — Inter Medium 13/20, a local override on the Alert component rather than a named Figma style |

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
| Button / M / Ghost / Secondary       | 16 / —            | —    | 12 (`radius.md`) | min-height 40, white bg, 1px **`colors.borderSubtle`** (G100 `#E9E9E9` — the component node `3192:9209` binds G100, not the G200 this row previously said), `shadows.xs`, centered `typography.subtext` label in `colors.textSecondary`. Used for the post detail header's "Edit". See `GhostButton.tsx`. |
| Chip Button                          | 8 / — (see note)  | —    | 8 (`radius.sm`)  | 72.5×40 (four across a sheet's 326 content width), white bg, `shadows.xs`, `typography.body` label. Three states: enabled = `colors.border` border / `colors.textStrong` label; active = `colors.accent` border, same label; disabled = same border with a `colors.borderSubtle` label. Its auto-layout says 10 of vertical padding, but the fixed 40 height wins — the text node sits at y=8.5 with height 23 (node `3198:4669`), one Body line centred. Setting the 10 in RN leaves only 18pt for a 22.5pt line and cuts the descenders of "May"/"Aug"/"Sep", so the label is simply centred in the 40. Node `3198:4670`. See `ChipButton.tsx`. |
| Button / M / Icon / Secondary        | 12 / —            | —    | 12 (`radius.md`) | the icon-only sibling of Ghost/Secondary: min-height 40, min-width 44, white bg, 1px `colors.borderSubtle`, `shadows.xs`. Used for the month picker's year stepper. Node `3198:4642`. See `GhostIconButton.tsx`. |
| Alert                                | 20 / 8            | 8    | 8 (`radius.sm`)  | `colors.success` bg, 24pt white `ic/check`, then the message in `typography.alert` (white). The screen showing it does the positioning — Figma pins it at top 47 with 16 of horizontal padding, over the header (node `3233:5182`). Node `3233:5183`. See `AlertBanner.tsx`, named that way so it can't be confused with React Native's own `Alert`. |
| Input (text field)                   | 12 / 10           | —    | 8 (`radius.sm`)  | white bg, `border` 1px, `shadows.xs`, placeholder in `colors.textPlaceholder` |
| Input with label                     | —                 | 8    | —            | label uses `typography.subtext` in `colors.textSecondary`, 8px above the input |
| Search input field                   | 12 / 12           | 8    | 8 (`radius.sm`)  | 358x47 (12 + one Body line + 12), white bg, 1px **`colors.borderSubtle`** (G100 `#E9E9E9` — the node binds G100, not the G200 this row previously implied by saying `border`), and **no shadow** — unlike the plain Input field, this one carries none. A 16pt `ic/search` — not the header's 24 — then the query in `typography.body`, caret in `colors.accent`. It has **two states, keyed on whether anything has been typed** (both Figma frames show a caret, so the trigger is the query rather than focus): empty = G900 icon over the placeholder "What are you looking for?" in `colors.textPlaceholder` (node `3192:10554`); typing = **`colors.accent` icon** over the query in `colors.textPrimary` (node `3192:11131`). The border does not change. Nodes `3192:10553` / `3192:11130`. See `PostSearchScreen.tsx`. |
| Button / M / Header Action (e.g. "Done") | 12 / 8        | —    | 16 (`radius.lg`) | height 40; off = `colors.surface` bg / `colors.border` text (node `3184:5701`), on = `colors.accent` bg / `colors.textOnDark` text (node `3184:5903`) — both states verified via `get_design_context`. See `HeaderActionButton.tsx`. |
| Button/Icon/Plain                    | 8 (all)           | —    | 16 (`radius.lg`) | bare 40×40 tap target, transparent bg. See `IconButton.tsx`. |
| Button/Icon/Contained                | 8 / 5             | —    | 8 (`radius.sm`)  | the Home header's share button. Figma gives it **exactly Button/Secondary/Default's treatment** — the gradient, the 1px ring and `shadows.secondary` — so `IconButtonContained.tsx` delegates to `SecondaryButton` rather than restating it. (It had been built as a flat `colors.surface` chip with `shadows.xs`, which was wrong on all three counts.) The "5" vertical padding is Figma-exact, not on the spacing scale. Node `3183:2841`. |
| SegmentedButton (Fit/Filled toggle)  | 2 (container)     | —    | 17 (off-scale) outer, 16 (`radius.lg`) active segment | overlaid top-center on a selected photo; container bg `colors.overlayContainer`, active segment bg `colors.overlaySolid` + white icon/label, inactive = transparent + `colors.textPlaceholder`. Node `3192:12065`. See `SegmentedButton.tsx`. |
| Button / S / Filled / FAB (e.g. "Delete") | 12 / 3 (left) · 8 / 3 (right) | 3 | 20 (off-scale) | `colors.overlaySolid` bg, white `typography.overline` label, trailing 16×16 `ic/cross`. Node `3192:11841`. See `FilledFabButton.tsx`. |
| Button / L / Filled / Primary        | 16 / 8            | —    | 16 (`radius.lg`) | height 48, centered white `typography.body` label. Two fills in use: `colors.buttonDark` on the master (node `3192:9208`, Modal/Gallery's "Go to Gallery") and `colors.accent` where an instance overrides it (node `3233:4552`, Modal/Leave's "Leave") — the `tone` prop. See `PrimaryButton.tsx`. |
| Button / L / Filled / White          | 18 / 10           | —    | 16 (`radius.lg`) | min-height 48, white bg, centered `typography.body` label in `colors.textTertiary`; the quiet companion to Primary in a modal's actions. The 18/10 padding is Figma-exact, not on the spacing scale. Node `3202:5778`. See `WhiteButton.tsx`. |
| Date (calendar day cell)             | —                 | —    | 500 (`radius.full`) | square, `typography.calendarDate`. Six states = {no post, photo post, text-only post} x {another day, today}: no post → transparent/G600 text, or `colors.accentSubtle`/`colors.accent` on today; photo post → thumbnail under `colors.photoScrim`, or under `colors.overlayAccent` plus a 1px `colors.accent` border on today; text-only → solid `colors.textPrimary`, or solid `colors.accent` on today. White label on every filled state. Component `9:5857`, all variants in `assets/Date.svg`. See `CalendarDateCell.tsx`. |
| Header/Post                          | 5 (left) / 16 (right) · 16 vertical | 8 (actions) | — | `Button/Icon/Plain` + `ic/arrow-left` on the left; on the right a row of two `Button / M / Ghost / Secondary`, "Edit" then "Delete" (node `3233:4663`). Node `3192:11899`. Same shell as Header/Add. |
| Header/Add · Header/List (centre)    | 5 (left) / 16 (right) · 16 vertical | — | — | back button left, action(s) right, and a "Date Information" block absolutely centred: the date in `typography.caption`/`colors.textPrimary` over a second line in **`typography.overline`**/`colors.textPlaceholder` — the weekday on Header/Add (node `3184:5701`), the post count on Header/List (node `3192:9263`). The two headers differ in their **first** line too: Header/Add names the day being written, Header/List names the month being listed — "August, 2026" (node `3192:9483`), with a comma no `toLocaleDateString` option set produces. The second line was Caption until Figma changed it; only the first line is Caption now. |
| Post Detail (column)                 | 16                | 16   | —            | stacks Date Written, then whichever of Image Section / Record/View / Text Section the post has. Date Written: height 40, centered, `typography.subtext` in `colors.textPrimary` over `typography.caption` in `colors.textTertiary` (weekday spelled out in full). Image Section: square, Fit letterboxes / Filled crops. Text Section: min-height 240, gap 8, paddingHorizontal 12, a 1px `colors.borderSubtle` divider above `typography.body` content. Section `3192:11364`. See `PostDetailScreen.tsx`. |
| Button/Secondary/Default             | 8 / 5             | —    | 8 (`radius.sm`) inline, 16 (`radius.lg`) large | glossy light button carrying a play/pause glyph: a white-to-transparent gradient over `colors.buttonSecondary` with a 1px `colors.buttonSecondaryRing` border and `shadows.secondary`. Inline inside Record/Edit and Record/View (node `3192:12489`); 56×48 on the recording screen (node `3184:7871`). Figma's shadow stacks a drop shadow with a 1px *ring* — RN has no spread, so the ring is a real border. See `SecondaryButton.tsx`. |
| Header/X                             | 5 (left) / 16 (right) · 16 vertical | — | — | the Add header's shell with a single close button pushed right (`justify-end`) and nothing else. Node `3184:7855`. Used by the recording screen and by post search, so it lives in `HeaderX.tsx` rather than being restated in each. |
| Record/Edit · Record/View            | 12 (left) / 3 (right) · 8 vertical — edit; 40 / 8 — view | 16 | 8 (`radius.sm`) | min-height 56: a `Button/Secondary/Default`, the waveform, then the duration in `typography.body`. Edit (node `3192:12499`) has a `colors.surface` background and a trailing remove button; View (node `3192:12570`) is transparent, inset further, and shows the duration in `colors.textPrimary`. See `RecordRow.tsx`. |
| music track (waveform)               | —                 | —    | —            | 44 tall on the recording screen (node `3184:7867`), 14 inside a Record row. Figma draws it as one decorative vector of a few hundred paths (~100KB in `assets/Record/*.svg`), which would freeze the same squiggle onto every recording — so it is drawn from the recording's own loudness instead. See `Waveform.tsx`. |
| editor (formatting toolbar)          | 16                | space-between | — | `colors.editorBar` bg, seven 24pt icons (text colour, bold, italic, underline, bullet list, numbered list, horizontal rule) — 56 tall. Opening the palette makes it 112: a `colors.editorPaletteBar` row of nine 24pt swatches at `radius.sm` with a 16pt gap after a 16pt inset, plus a 48x48 top-rounded backdrop behind the text-colour button. Node `13:15150`, whole component exported to `assets/editor.svg`. See `EditorToolbar.tsx`. |
| Modal sheet (shell)                  | 16 (content)      | 8 (actions) | 24 (`radius.xl`) | white sheet, `shadows.xl`; title `typography.subtext` with paddingTop 20 + a 20px spacer row, close button absolute at right 8 / top 8.4; content paddingTop 20; actions block paddingTop 24 / paddingBottom 24. Backdrop = `colors.backdrop` over a blur, sheet bottom-aligned with paddingTop 16 / paddingBottom 40. Every Figma modal repeats this skeleton — build new ones on `ModalSheet.tsx` rather than restating it. |
| Modal/Gallery                        | —                 | 3 (tiles) | —            | fills the shell above: square `radius.sm` tiles, first `colors.surfaceDark` + 32px `ic/camera`, rest recent photos with a `colors.borderSubtle` hairline; the row is drawn 404 wide inside a 326 content area, so it scrolls horizontally. Action = "Go to Gallery". Node `3198:4446`. See `GalleryModal.tsx`. |
| Modal/Leave                          | —                 | 8    | —            | fills the shell above: body in `typography.body` / `colors.textSecondary`, then "Leave" (Primary, accent tone) over "Keep Editing" (White). Raised when leaving the Add screen with unsaved edits. Node `3233:4557`, in context `3233:4558`. See `LeaveModal.tsx`. |
| Modal/Date-Default (month picker)    | 16 (content)      | 16   | —            | fills the shell above: a year stepper (two Button / M / Icon / Secondary either side of the year in `typography.titleMedium` / `colors.yearLabel`, gap 24), a 1px `colors.borderSubtle` divider, then twelve Chip Buttons wrapping four to a row at gap 8, and a "Done" primary. Node `3229:4259`, in context `3229:4271`. See `MonthPickerModal.tsx`. |
| Post List Thumbnail                  | 16 / 24 (content) | 4 (pill) | 8 (`radius.sm`) | the Home-List row: height 88, white bg, a 1px **`colors.borderStrong`** (G600) outline — much darker than `colors.border`. A fixed 72-wide Image block (weekday in `typography.subtext` over the day in `typography.titleSmall`, the latter at lineHeight **29**, not the token's 24 — this instance leaves the leading on auto, which is what makes the Date Field 19 + 29 = 48) then a flexible Content block. Component set `3192:9526` has five variants and which applies follows from the post alone: a photo stays inside the 72 block when there is also text (`Photo and Text`, `3192:9523`) and bleeds across the whole card when there isn't (`Only Photo` `3192:9527`, `Photo and Record` `3192:9655`) — under `colors.photoScrim` either way, with the date white; with no photo the block is white and the date `colors.textStrong` (`Text and Record` `3192:9524`, `Only Record` `3192:9525`). Content shows the text if there is any (2 lines, ellipsised), otherwise the recording pill (20pt `ic/play` + `typography.body` duration, white over a full-bleed photo, else `colors.textPrimary`) — **a recording is never drawn next to text in any variant**. Those five cover all seven shapes a post can take: text-only is `Text and Record` minus the record it never rendered, and photo+text+record is `Photo and Text` for the same reason. See `PostListThumbnail.tsx`. |
| Header/Report                        | 5 (left) / 16 (right) · 16 vertical | — | — | Header/X's shell — one button pushed right — carrying `ic/setting` instead of `ic/cross`. Node `3196:13123`. |
| Navigation                           | 21 / 8 top · 16 bottom | 27 | — | the bottom bar, verified in **both** variants: `selected="Home"` (`3184:4123`) and `selected="Report"` (`3196:13233`). The two use the **same** glyphs — only the colour changes, and the selected tab swaps its label for a 3pt G900 dot. (An earlier note here claimed the icons swapped filled/outline; they don't.) Add is never selected. See `BottomNavigation.tsx`. |
| Post Report Thumbnail                | 4 (image box)     | 8 / 16 | —      | one post in the Report montage: a 120-wide column whose image block is a fixed 120x160. With a photo the block *is* the photo; with none it's an empty box outlined 1px **dashed** `colors.border`, holding the post's text at `typography.reportCaption` / `colors.textStrong`. The day label — `typography.reportDate` / `colors.textSecondary`, reading "(2), Thu" — hugs the image at gap 8; a caption (only when the post has a photo, else the text is already inside the box) sits at the far end at gap 16. `dateUp` mirrors the column, so label and caption swap ends. A recording draws Figma's Record/View pinned to the block's bottom — waveform over duration — on `colors.photoScrim` when over a photo. Nodes `3196:14379`/`14381`/`14383`/`14385`/`14387`/`14389`. See `PostReportThumbnail.tsx`. |
| Post Thumbnail Rows                  | 16 (ours)         | 16   | —            | the montage strip: each post gets a 120-wide **320-tall** Thumbnail Section, and sections **alternate top- and bottom-aligned**, which also sets each thumbnail's `dateUp` so the day label always falls toward the middle. Verified against Figma's six sections, whose (y, height) are (0,180) (82,238) (0,238) (140,180) (0,180) (140,180) — every even one topped out, every odd one bottomed out at 320. Figma's strip is 800 wide = 6x120 + 5x16, centred so it bleeds past both screen edges. Nodes `3196:14205` / `3196:14377`. See `PostThumbnailRows.tsx`. |
| Lock Paper                           | 16 / 16 top · 40 bottom | 16 | —     | the veil over a month whose report isn't ready: `colors.lockPaper` (white @ 70%) over a background blur, so the strip stays visible underneath. Centred 40pt `ic/present` over two lines of `typography.subtext` in `colors.textSecondary`. Node `3196:14417`. |
| Modal/Date-Report                    | 16 (content)      | 16   | —            | **structurally identical to Modal/Date-Default** — same shell, year stepper, divider, twelve chips, Done. Only which chips are enabled differs, so it reuses `MonthPickerModal` through its `isSelectable` prop rather than being a second component. Node `3198:4736`, in context `3198:4740`. |
| Modal/Delete-Post                    | —                 | 8    | —            | fills the shell above: two body lines in `typography.body` / `colors.textSecondary`, then "Delete" (Primary, **warning** tone) over "Cancel" (White). Raised by the post detail header's Delete. Node `3233:4928`, in context `3233:4929`. See `DeletePostModal.tsx`. |

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
- **Exported assets ship as a full 24x24 canvas** with the glyph already
  inset inside it (`assets/ic/*.svg`). Port them with
  `viewBox="0 0 24 24"` and let `size` be the frame — that reproduces
  Figma's inset on its own, so the call site needs no wrapper `View`.
  Don't re-derive a tight glyph bounding box: doing that pushes the inset
  into the caller's layout, and getting that wrapper wrong is what made
  the bottom nav's icon/label spacing drift twice.
- If Figma asset hosts aren't reachable from the current sandbox, add a
  `TODO` comment describing the real asset to swap in later. Note that
  this can happen even when the Figma MCP tools themselves
  (`get_design_context`, `download_assets`) work: those confirm a node's
  exact frame size, inset percentages, color, and node id, but the actual
  `www.figma.com/api/mcp/asset/...` byte-fetch may be blocked by the
  sandbox's outbound proxy. In that case the assets have to come in
  through the repo instead (`assets/`), as they did for the Add screen's
  icons.

## 6. Where things live

- `src/theme/tokens.ts` — all design tokens (`palette`, `colors`, `spacing`,
  `radius`, `typography`, `shadows`, `fontAssets`). Single source of truth;
  extend it, don't duplicate it.
- `src/components/` — reusable components, one per recurring Figma
  component: `IconButton.tsx` (Button/Icon/Plain), `IconButtonContained.tsx`
  (Button/Icon/Contained), `HeaderActionButton.tsx` (Button / M / Header
  Action), `SegmentedButton.tsx` (Fit/Filled toggle), `FilledFabButton.tsx`
  (Button / S / Filled / FAB), `PrimaryButton.tsx` (Button / L / Filled /
  Primary), `GalleryModal.tsx` (Modal/Gallery), plus `icons/HomeIcons.tsx`
  and `icons/AddIcons.tsx` for each screen's ported glyphs.
- `src/screens/` — one file per Figma screen/frame. `HomeListScreen.tsx` is
  the calendar's month as a list (Home-List-Default `3192:8914` empty /
  Home-List-Done `3192:9547` filled); it has **no bottom navigation** —
  Figma gives it only Header/List and the list body.
  `PostSearchScreen.tsx` is the search over that month (Home-List-Search-1
  `3192:10548` / -2 `3192:11125`), opened from Header/List's ic/search.
  `ReportScreen.tsx` is Flow 5's month-as-a-montage (Report-Default
  `3196:12678` locked / Report-Done `3196:14258`).
- `src/navigation/RootNavigator.tsx` — the single React Navigation native
  stack (Login/Home/HomeList/PostSearch/Add/PostDetail/Recording). `initialRouteName` is temporarily `"Home"` since
  sign-in has no real auth yet; flip it back to `"Login"` once that's wired
  up. Every route pushes as an ordinary page — Add is a full Figma frame
  with its own back button, not a modal sheet. The only modal in the app so
  far is `GalleryModal`, which Figma really does draw as an overlay.
- `src/data/` — local, on-device data stores (no backend yet). `posts.ts`
  is an AsyncStorage-backed store for the one-post-per-day / one-photo-per-post
  rule; screens should go through its functions rather than touching
  AsyncStorage directly.
- `src/utils/calendar.ts` — pure date-math helpers (days in month, weekday
  grid) shared by any screen that renders a calendar.

## 7. Product rules that shape the UI

Rules that aren't visible in any Figma node but decide what a screen does.
Note them here so they don't get re-derived (or quietly dropped) later.

- **One post per calendar day.** `savePost` upserts by date, so the rule is
  the data shape rather than a validation step.
- **One photo per post.** Every entry point into the photo picker replaces
  the current photo instead of appending.
- **A post needs any one of** text, a photo, or a voice recording to publish
  — that's what the Add header's Done pill enables on.
- **One voice recording per post.** The recorder is a pushed screen that hands
  its take back to the Add screen through a callback rather than saving
  anything itself, so a post is still only written when Done is pressed, and
  closing the recorder mid-take throws that take away.
- **The story field is rich text.** Bold, italic, underline, per-range colour,
  bullet and numbered lists, and horizontal rules, all visible while typing.
  React Native's `TextInput` cannot render mixed inline formatting during
  editing, so the field is a `contenteditable` document in a WebView
  (`RichTextEditor.tsx`) rather than a native input; the seven toolbar actions
  map one-to-one onto `document.execCommand`. The same component renders a
  saved post read-only on the detail screen. A post stores both `html` and a
  plain-text `text`, because emptiness checks and future previews want text
  rather than markup.
- **The empty list's "Add Record" is current-month only.** Home-List's empty
  state (node `3192:8914`) offers a way out of being empty, and that only
  works for the month you can still write into: the button writes *today*, so
  on a past month's list it would leave the list just as empty. Past months
  keep the message and drop the button. There is no sensible day to offer
  instead — the 1st and the last are both inventions that would create a post
  on a date nobody picked. The message stays either way, but its wording
  follows the same split: Figma's "You haven't written anything yet." is
  written for a month still open, so a past one reads "You didn't write
  anything." instead. (Future months never reach this screen; the month
  picker stops at the current one, per the rule below.)
- **Search matches a post's plain text, within one month.** The search
  screen reads `post.text`, not `post.html`, so a query can't match markup;
  matching is case-insensitive substring. It covers the month the list was
  showing rather than every post ever written, because the results are Post
  List Thumbnails, which carry a weekday and a day but no month — across
  months, two rows reading "Sat 15" would be indistinguishable. Figma draws
  no "no matches" state, so a query that finds nothing lists nothing.
- **Home and Report put the Calendar Title on the same line, y 143.87.**
  Both frames agree on it: Home-Calendar-Default's Calendar starts at 119
  with its title 24.87 inside (node `3192:9061`), and Report Content does
  the same (node `3196:13480`). Kept as `layout.headerToTitle`.
  **Take the Home frame from `3192:9057`, not `3184:4117`** — the older one
  pins its Calendar at 135.58 at exactly its content height (447.26), so
  the title sits flush at the top, while `3192:9057` stretches the Calendar
  to 497 and centres the same content, which is where the 24.87 comes from
  (half of 497 - 447.26). Home reaches that offset by grouping its header
  and calendar so the gap is fixed rather than whatever `space-between`
  distributes — otherwise the title would shift with the screen height and
  could never match Report's.
- **Switching between Home and Report has no transition.** They are peers
  on the same bottom bar, not one pushed out of the other; a slide reads as
  going deeper, and a cross-fade still animates a swap that should just
  happen. **Both** screens carry `animation: 'none'`: tapping Report pushes
  it, which Report's own option governs, but tapping Home pops back to a
  Home already in the stack, and that follows Home's option rather than the
  departing screen's. Setting one alone leaves the two directions looking
  different. The same pop returns to Home after a post is deleted, so that
  swaps rather than slides too.
- **A month's report exists only once the month is over.** The Lock Paper
  says so outright ("Catch it on the morning of the 1st"), so the current
  month is covered by the veil rather than shown, and its strip does not
  drift while hidden. The Report's month picker offers a month when it has
  a report — a past month with at least one post — plus the current month,
  which is both where the veil lives and the only way back after moving to
  an older one. Verified against Figma's Modal/Date-Report (node
  `3198:4740`), which enables Feb/Mar/May/Jul and marks August active.
- **The report montage runs oldest first.** Figma numbers the strip from 1
  left to right, the opposite of the Home list's newest-first order. It
  drifts left to right on its own; dragging takes over and the drift does
  not resume, and it stops at the end rather than looping — a jump back to
  the start would be more jarring than stopping. The speed and that
  hand-off are ours; Figma says only that the strip moves.
- **No writing ahead.** DayOne records the day you are living, so calendar
  days after today are inert: they don't open Add and don't open a post.
  Today and past days both stay writable. The month picker follows the same
  rule — months after the current one are disabled chips, and its forward
  year arrow stops at the current year, since a later year would have nothing
  selectable in it. (Figma greys the months; the arrow's stop follows from the
  rule rather than being drawn.)

Keep this file in sync: whenever a new token or component spec is pulled
from Figma, update the relevant section here as well as `tokens.ts`.
