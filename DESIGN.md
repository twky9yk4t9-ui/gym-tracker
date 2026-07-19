# Design

## Theme

Dark-only "Forge": OLED graphite room, liquid-glass panels, iron numerals, one ember
accent reserved for earned progression. Calm > complete; the tool disappears into the set.

## Color

All colors live as Tailwind v4 `@theme` tokens in `src/theme.css` — no ad-hoc hex in components.

| Token | Value | Role |
|---|---|---|
| `--color-bg` | `#0a0b0d` | app background |
| `--color-ink` | `rgba(255,255,255,0.92)` | primary text |
| `--color-ink-2` | `rgba(255,255,255,0.62)` | secondary text, labels (≥4.5:1) |
| `--color-ink-3` | `rgba(255,255,255,0.46)` | tertiary text, ghosts, placeholders (≥4.5:1) |
| `--color-glass` | `rgba(255,255,255,0.055)` | glass surface fill |
| `--color-glass-2` | `rgba(255,255,255,0.09)` | raised/active glass |
| `--color-line` | `rgba(255,255,255,0.08)` | hairlines |
| `--color-ember` | `#ff9330` | earned progression ONLY |

Muscle families (entity-anchored, CVD-validated; always paired with a label or dot):
upper = cool steel ramp — back `#4a66e8`, chest `#4e86f0`, shoulders `#56a8f5`,
biceps `#5cc8ea`, triceps `#6fe0d6`; lower = warm ember ramp — quads `#e8564f`,
hamstrings `#ee7a48`, glutes `#f5a13d`, calves `#fad65a`. Muscle color is used for
dots, bars, chips-tints, chart lines — never for body text.

Physical plate colors (kg convention, muted) live only in `LoadoutSheet` — they depict
equipment, not data.

## Typography

System SF stack (`--font-sans`); ALL numerals use `.num` = `ui-rounded` + `tabular-nums`.
Fixed scale: 11 / 13 / 15 / 17 / 22 / 28 / 40 (`--text-2xs` … `--text-2xl`).
Regular for text, semibold for numerals, bold for titles. Sentence-case labels — no
tracked-uppercase eyebrows (RIR-style acronyms exempt).

## Spacing & Shape

4pt grid; screen gutter 20px; radii 12 (`chip`) / 20 (`card`) / 28 (`sheet`);
safe-area insets everywhere (`viewport-fit=cover`). Glass panels via `.glass`
(blur 24 + saturate 1.4 + 0.5px hairline) — purposeful, brief-mandated.

## Components

- **ExerciseCard**: glass card; muscle dot before the name (becomes a muscle-colored
  check when all planned sets are logged); target label right; variant chips
  (active = glass-2 + ink text + colored dot context); ember jump chip; SetRows.
- **SetRow**: index · `weight kg × reps` numerals · 44px check circle (muscle-tinted
  when logged). Ghost prefill in ink-3.
- **Keypad**: bottom glass sheet, 4-col grid, ±jump steppers, Log set bottom-right.
- **RestPill**: floating above tab bar. Armed = `−30 · ▶ m:ss · +30` (starts on tap,
  remembers last-started duration); running = `✕ m:ss` with draining hairline + `+30`.
  Never auto-starts.
- **Sheets** (`Sheet`): bottom glass, spring ~380ms, scrim tap closes.
- **TabBar**: floating glass pill — session chips (drag-reorder in edit) · `+` (edit) ·
  divider · timer chip · trends chip.
- **Steppers**: label above `− value +`, sentence case.

## Motion

`motion` springs, 250–450ms, no bounce >0.3. Motion conveys state only: sheet
entrance, check tap-spring, cue chip arrival, card settle. Every animation has a
`useReducedMotion` fade/instant alternative. No page-load choreography beyond a
~50ms/card stagger on session open.

## Charts

recharts, lazy-loaded. Single-series lines in the entity's muscle color; tonnage in
neutral ink; grid `rgba(255,255,255,0.06)`; ticks ink-3; glass tooltip on tap.
Weekly volume = plain HTML bars with the 10–20 band zone. No legends (single series,
titled); no dual axes.
