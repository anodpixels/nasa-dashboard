# Coding Conventions

## Repository model

- The live application starts in `NASA Dashboard.html`; there is no package manager, build step, or generated bundle.
- Browser dependencies are loaded from CDN `<script>` tags in `NASA Dashboard.html`: React 18, ReactDOM, Babel Standalone, and Three.js.
- Local JavaScript and JSX files are classic scripts, not ES modules. Do not add `import` or `export` unless the whole runtime architecture is deliberately migrated.
- Script order in `NASA Dashboard.html` is a dependency contract: `data/nasa.js`, `data/api-client.js`, HUD primitives, extras, globe, chrome, then tabs.
- Public functions and components are attached to `window`, either individually or with `Object.assign(window, {...})`; examples are at the ends of `components/hud.jsx`, `components/extras.jsx`, and `components/tabs.jsx`.
- `design-canvas.jsx` and `variants/*.jsx` are standalone design explorations. They are not part of the live dashboard and should not be coupled into `NASA Dashboard.html` casually.

## Naming and file organization

- React components use PascalCase names such as `DataProvider`, `HudRadar`, `TabNEO`, and `DeepSkyImage`.
- Hooks use the `use` prefix, as in `useData`, `useDrawer`, and `useLiveISS`.
- Shared HUD primitives use the `Hud` prefix and live in `components/hud.jsx`.
- Screen-level tab components use the `Tab` prefix and live in `components/tabs.jsx`; `TabOverview` remains in `components/chrome.jsx` with the shell it summarizes.
- Detail-drawer components use the `Detail` suffix and live in `components/extras.jsx`, for example `NEODetail` and `MarsDetail`.
- Constants use uppercase snake case when they are genuinely fixed, such as `GLOSSARY`, `NASA_KEY`, `API`, and `SIMPLEX_3D`.
- Internal caches use a double-underscore prefix in `data/api-client.js`, such as `__orbCache` and `__sentryCache`; this is a repository convention, not JavaScript privacy.
- CSS classes use a `hud-` prefix, with modifier-style names such as `.hud-chip--hot` in `styles/hud.css`.

## JavaScript and React style

- Use modern browser JavaScript: `const` by default, `let` only for reassignment, arrow functions for short callbacks, optional chaining, and object/array spread.
- Files generally use two-space indentation, semicolons, single-quoted JavaScript strings, and double-quoted JSX attributes.
- Formatting is compact and hand-authored. Small handlers and effects are often one line; complex calculations and JSX should remain expanded for readability.
- Components are functions. Small, purely presentational components are commonly concise arrow functions; stateful or imperative components use a block body.
- Access React APIs through the global namespace (`React.useState`, `React.useEffect`) rather than named imports.
- Keep state near the screen or component that owns the interaction. Shared live data belongs in `DataProvider` in `components/chrome.jsx`; drawer state belongs in `DrawerProvider` in `components/extras.jsx`.
- Memoize derived arrays, provider APIs, and expensive display calculations with `React.useMemo`; stable imperative operations may use `React.useCallback` and refs.
- Effects that create timers, animation frames, or event listeners must return cleanup functions. Existing examples are in `components/globe.jsx`, `components/chrome.jsx`, and `design-canvas.jsx`.
- Preserve deliberate remount behavior: the Earth globe uses `key={globeMode}` in `components/tabs.jsx` so changing render modes rebuilds the Three.js scene.
- There is no TypeScript, PropTypes, schema validator, or formal public type definition. Data shape is communicated through literals in `data/nasa.js`, component props, and nearby comments.

## Data and network conventions

- `data/nasa.js` contains deterministic baked data shaped like the remote NASA responses; the UI must remain useful when the network is unavailable.
- Fetch functions in `data/api-client.js` catch failures and return baked values from `window.NASA` instead of rejecting into the UI.
- New network calls should go through `safeFetch` so they inherit timeout and HTTP-status handling.
- Cache repeat detail requests in memory when appropriate, following `fetchNeoOrbitalData` and `fetchSentryAll` in `data/api-client.js`.
- Keep transformation logic at the API boundary: normalize remote property names and units before data reaches tab components.
- If a change alters a data file or its shape, review and bump the matching `?v=` cache-buster in `NASA Dashboard.html`.
- Important security exception: a NASA API key is committed in both `data/api-client.js` and `data/nasa.js`. Treat it as public browser-side configuration, not a secret; do not place private credentials in this architecture.

## Visual and CSS conventions

- The primary palette, typography, grid, and hairlines are CSS custom properties under `:root` in `styles/hud.css`.
- Prefer `var(--hud-*)` and `var(--font-*)` in live components so the Tweaks panel can update `--hud-accent` consistently.
- Use `HudLabel`, `HudValue`, and `HudMono` for the established label, value, and telemetry hierarchy instead of restyling text repeatedly.
- Numeric readouts use tabular numerals through the HUD primitives and `.hud-value`/`.hud-mono` styles.
- Use `.hud-bracket-4` or `HudCorner` for instrumented groups that need the four-corner frame motif.
- Add plain-English domain definitions to `GLOSSARY` in `components/extras.jsx`, then expose them through `Tip` or `InfoDot`; do not scatter duplicate tooltip copy.
- Layout is primarily inline style objects inside JSX; reusable states, animations, and visual utilities live in `styles/hud.css`.
- Actual-code exception: live files such as `components/extras.jsx`, `components/tabs.jsx`, `components/chrome.jsx`, and `components/globe.jsx` still contain hardcoded hex and `rgba(...)` values. New work should reduce this drift rather than copy it.
- `design-canvas.jsx` and `variants/*.jsx` intentionally have their own exploratory colors and should not be treated as the live product's token standard.

## Interaction, accessibility, and comments

- Use real `<button>` controls where the action is a control, following the tab buttons in `components/chrome.jsx` and reset button in `components/tabs.jsx`.
- Current accessibility is incomplete: many clickable `<div>`/`<span>` elements have no keyboard handler, focus state, or semantic role, and `Tip` is hover-only. Do not present these existing patterns as an accessibility standard.
- New interactive elements should support keyboard activation, visible focus, and an accessible name; drawers should eventually add dialog semantics and focus management.
- Images use an `alt` attribute, but some decorative and fallback images use `alt=""`; choose decorative versus informative alternative text deliberately.
- Comments are used to explain design intent, scientific mappings, fallback behavior, and lifecycle reasons. Avoid comments that merely restate the next line.
- Preserve external integration anchors `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/` in `NASA Dashboard.html`; outside tooling depends on them.
- Keep edits focused. The repository currently has unrelated user changes, so do not overwrite or reformat adjacent work without checking `git diff` first.
