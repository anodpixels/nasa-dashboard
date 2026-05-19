# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

No build step. No package manager. The entry point is `NASA Dashboard.html`, which loads React 18, ReactDOM, Babel Standalone, and Three.js 0.160 from unpkg, then loads the local `data/*.js` and `components/*.jsx` via `<script>` tags. JSX is transpiled in the browser by `@babel/standalone`.

To run: serve the project root over HTTP (Babel + Three.js + texture loads need real HTTP, not `file://`):

```
python3 -m http.server 8000
# then open http://localhost:8000/NASA%20Dashboard.html
```

After editing a `data/*.js` or `components/*.jsx`, hard-reload. The HTML uses `?v=5` cache-busters on `data/nasa.js` and `data/api-client.js` — bump those when changing the baked data shape.

There is no test runner, no linter config, no CI. Don't invent commands.

## Architecture

### Module system: there isn't one

Every file is a classic `<script>`. Components and helpers publish themselves on `window` at the bottom of the file via `Object.assign(window, { Foo, Bar })`. Cross-file references go through `window.Foo` (or, since the global object is the default scope at top level, just `Foo`). When adding a new component or helper, follow that pattern — don't introduce ES modules, imports, or a bundler.

Script load order in `NASA Dashboard.html` matters: `data/nasa.js` → `data/api-client.js` → `hud.jsx` (primitives) → `extras.jsx` (Tip/Drawer/GLOSSARY/Detail components) → `globe.jsx` → `chrome.jsx` (DataProvider + Chrome + TabOverview) → `tabs.jsx` (other tabs). If you split a file, insert its `<script type="text/babel">` in the right slot.

### Data flow

`DataProvider` (`components/chrome.jsx`) renders the baked data from `window.NASA.*` immediately, then kicks off `window.NASA_API.fetch*()` calls and swaps results in as they arrive. Every fetcher in `data/api-client.js` catches its own errors and falls back to `window.NASA.*` — the UI never sees a rejection. Consumers read via `useData()`. A separate `useLiveISS()` hook simulates 1Hz orbital drift on top of `window.NASA.iss` for ambient motion.

Tabs are pure presentational consumers of `useData()`. They open the drawer via `useDrawer().open(<XDetail …/>)` from `extras.jsx`. The drawer is a global singleton mounted by `DrawerProvider`.

### Three.js globe

`Globe3D` (`components/globe.jsx`) is the only non-React rendering surface. It owns its own scene/camera/renderer in a single `useEffect` keyed on its props (so changing `mode` between `contour` and `photo` tears down and rebuilds the scene — that's intentional; see the `key={globeMode}` on the Earth tab).

- `mode="contour"` uses a `ShaderMaterial` with embedded simplex-3D noise + isoline fragment shader. `seed`, `contours`, `scale` are uniforms.
- `mode="photo"` is `MeshBasicMaterial` with a texture from `photoUrl`, with a blue fallback if the texture errors.
- Markers are HTML elements positioned per-frame by projecting `latLonToVec3` through `sphere.matrixWorld` then the camera. Visibility uses the marker's facing direction relative to camera-forward.
- The imperative `{ reset, rotateTo(lat, lon) }` API is published via `onReady`; the `MapLegendPanel` rows call `rotateTo` so the globe slews to a feature when its legend row is clicked. The base rotation is `baseRotX = -0.25` (the earth-ish tilt) — `rotateTo` adds latitude to that, not replaces it.

### Design tokens

`styles/hud.css` defines all colors, fonts, and hairlines as CSS custom properties under `:root`. The accent (`--hud-accent`) is hot-swapped at runtime by the Tweaks panel via `document.documentElement.style.setProperty('--hud-accent', …)`. Every component reads tokens through `var(--hud-*)` — there are no hardcoded color literals in component files, and new code should keep it that way. Three font stacks: `--font-display` (Barlow Condensed, used for labels and values), `--font-sans` (Rajdhani, body), `--font-mono` (JetBrains Mono, numerics + log streams). All numeric values use `font-variant-numeric: tabular-nums`.

The signature visual is the four-corner L-bracket frame: `.hud-bracket-4` (CSS) or `<HudCorner>` (JSX). Use these around any "instrumented" group of values.

### Tooltips and the glossary

Plain-English explainers live in the `GLOSSARY` object in `extras.jsx`. Wrap any label with `<Tip info={GLOSSARY.foo}>…</Tip>` to get a hover tooltip. When adding a new domain term to the UI, add an entry to `GLOSSARY` and reference it — don't inline explanations.

### Edit mode bridge

The Tweaks panel posts `{ type: '__edit_mode_set_keys', edits: {…} }` to `window.parent` whenever a knob changes, and listens for `__activate_edit_mode` / `__deactivate_edit_mode`. This is the contract for an external host (a parent iframe / design tool) to drive the dashboard. The `TWEAK_DEFAULTS` literal at the top of the inline script is wrapped in `/*EDITMODE-BEGIN*/…/*EDITMODE-END*/` markers — those are intentional anchors for outside-the-tab tooling to find and rewrite. Don't remove the markers.

### Standalone files (not wired in)

- `design-canvas.jsx` — a self-contained Figma-style pan/zoom viewport (`DesignCanvas`, `DCSection`, `DCArtboard`, `DCPostIt`). Not loaded by `NASA Dashboard.html`. Used for moodboard/variant pages.
- `variants/*.jsx` — alternate layout explorations (`cockpit`, `instrument`, `light-table`, `timeline`). Reference, not in the build.
- `reference/`, `_check/`, `uploads/` — image references and screenshots.

When touching the live dashboard, don't reach into `variants/` and don't load `design-canvas.jsx` from the main HTML.
