# Adopt Material UI as the UI framework

The UI was hand-rolled: CSS custom properties, a `<details>`-based sidebar accordion, and custom modal divs (~1200 lines across `App.css` and components). As the app grew, this became costly to extend consistently. We're replacing it wholesale with `@mui/material` (v9) so component behavior (a11y, focus, keyboard handling, theming) comes from the library instead of being reimplemented per-feature.

## Decisions

- **Styling engine: Emotion, not Pigment CSS.** Pigment CSS is MUI's newer zero-runtime option but is less mature and adds Vite build-config surface this app's scale doesn't need. Emotion is the default, documented path.
- **Theme mapping: `palette.primary` = Pokédex red (`#dc0a2d` / dark `#8b0000`), `palette.secondary` = Pokédex blue (`#2ca0dc`).** Every MUI component that defaults to "primary" now matches the brand without per-component color props. `TYPE_COLORS` (18 per-type colors) stays a standalone constants map applied via `sx`, not folded into the theme palette — MUI's palette has fixed slots that don't fit 18 dynamic values.
- **Single light theme, no dark mode.** The app never had one; adding a toggle would be new scope, not a framework swap.
- **Layout goes responsive as part of this migration**, even though the original ask didn't request it: permanent `Drawer` on desktop, temporary `Drawer` + `AppBar` toggle on mobile, auto-closing on Pokémon selection. The prior layout was a fixed 380px desktop-only shell with no mobile breakpoint; adopting `Drawer` made the responsive variant close to free, and shipping the framework swap without it would have meant redoing the sidebar shell again for a mobile pass later.
- **Migration executed as a single big-bang rewrite** (not component-by-component increments), with existing test files (`Sidebar`, `DetailView`, `MovesModal`) rewritten in place against the new MUI DOM/ARIA roles, and `App.css` deleted entirely in favor of `CssBaseline` + theme.
