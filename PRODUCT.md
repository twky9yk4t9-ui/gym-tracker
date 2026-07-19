# Product

## Register

product

## Users

One user: Nico, a serious lifter with Apple-grade taste. Primary context: at the gym,
mid-session, tired, one hand free, phone in hand between sets. Secondary context: at home,
building or adjusting his own program. The job: log what happened on the bar in one tap,
and see — without asking — when he's earned more weight and whether a muscle is drifting
under-trained.

## Product Purpose

A single-user, offline-first iPhone PWA for logging self-programmed gym sessions and
watching strength arrive. It is an instrument, not a training plan: the app never
prescribes exercises, splits, or loads. Success = every set logged with near-zero
interaction cost, and progress (e1RM, weekly volume vs the 10–20 set band, earned jumps)
legible at a glance.

## Brand Personality

Iron, calm, earned. Feels like an Apple Fitness screen, not a form: dark graphite room,
liquid glass, rounded numerals, one ember-colored moment reserved for progression you
earned. Quiet confidence — the app never celebrates, nags, or decorates.

## Anti-references

- Generic AI looks: cream-and-serif, black-and-acid-green, broadsheet hairline rules.
- Fitness-app dashboards: KPI walls, rings for everything, confetti, streaks, coach-speak.
- Form-like CRUD UIs: modal mazes, dropdown pickers for things a chip tap could do.
- Anything that prescribes training or pre-fills a program.

## Design Principles

1. **One hand, tired, mid-set, without thinking.** Every element must pass this test;
   if it adds a tap, a decision, or a word not needed at the gym, cut it or hide it
   behind progressive disclosure.
2. **The app notices, the lifter decides.** Intelligence (jump cues, volume bands,
   prefills, rest suggestions) surfaces quietly and acts only on a tap — never
   automatically, never as a popup.
3. **Numbers become iron.** Weight is physical: plate loadouts, tonnage, rounded
   tabular numerals. Show the metal, not the metric.
4. **Two color families, one ember.** Upper body cool steel, lower body warm ember-reds;
   ember-orange appears only for earned progression. Never a rainbow, never decoration.
5. **When in doubt, remove.** A calm, near-empty screen that does the job beats a
   complete one.

## Accessibility & Inclusion

- Dark-only by deliberate choice (basement gyms, OLED); all text ≥ 4.5:1 against the
  graphite surface, large/bold numerals ≥ 3:1.
- Identity never by color alone: muscle colors always ride next to a text label or dot.
- Full `prefers-reduced-motion` alternatives (crossfade/instant) for every animation.
- Touch targets ≥ 44px for gym-time actions, ≥ 24px in home-context editors.
- Visible keyboard focus; aria labels on all icon-only controls.
