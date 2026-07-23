# CLAUDE.md

Guidance for Claude Code when working in this repository. Keep this file aligned with `AGENTS.md`.

## Project in one paragraph

NASA TET·VISION is a desktop-first, full-viewport space telemetry dashboard inspired by the *Oblivion* HUD. The live app has six tabs: Overview, Earth Observation, NEO Track, Space Weather, Deep Space, and Mars. It uses live NASA/JPL data where possible, immediately renders curated fallback data, and opens contextual details in a right-side drawer. This is a browser prototype, not a production service.

## Run and verify

There is no build step, package manager, test runner, linter, or continuous-integration setup. Do not invent commands or claim automated checks passed.

Serve the repository root over HTTP; `file://` is not reliable for Babel, Three.js, fonts, textures, or API requests:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/NASA%20Dashboard.html`, then hard-reload after source changes.

Designer-focused smoke check:

1. Confirm the dashboard fills a desktop viewport without page-level scrolling.
2. Open all six tabs and check the browser console for errors.
3. Open and close at least one detail drawer on each affected tab.
4. If globe code changed, test drag, feature selection, Reset, contour mode, and photo mode.
5. If data code changed, verify both live responses and the baked-data fallback path.
6. If motion or Tweaks changed, test accent, grain, motion off, minimize, and the edit-mode bridge.

The current UI uses fixed, dense desktop grids and has no responsive breakpoints. Treat mobile and narrow-screen support as a new design task, not an existing guarantee.

## Runtime and load order

The entry point is `NASA Dashboard.html`. It loads React 18.3.1, ReactDOM 18.3.1, Babel Standalone 7.29.0, and Three.js 0.160.0 from CDNs. Babel transpiles JSX in the browser.

There is no module system. Files are classic `<script>` tags and publish shared values to `window`, usually with `Object.assign(window, { ... })`. Do not introduce imports, exports, a bundler, or a package manager unless the user explicitly asks for an architectural migration.

Script order in `NASA Dashboard.html` is a dependency contract:

1. `data/nasa.js` — baked fallback data and browser-visible NASA key
2. `data/api-client.js` — live fetch helpers with fallback behavior
3. `components/hud.jsx` — visual primitives
4. `components/extras.jsx` — images, tooltips, glossary, drawer, detail views
5. `components/globe.jsx` — Three.js globe
6. `components/chrome.jsx` — data context, app chrome, Overview tab
7. `components/tabs.jsx` — Earth, NEO, Space Weather, Deep Space, and Mars tabs

When a loaded file changes, bump that file's `?v=` value in `NASA Dashboard.html` so browsers do not keep stale code. Current cache-busters are `nasa.js?v=9`, `api-client.js?v=11`, and `v=2` for `hud.jsx`, `extras.jsx`, `chrome.jsx`, and `tabs.jsx`; `globe.jsx` currently has no cache-buster.

## Architecture and data flow

`DataProvider` in `components/chrome.jsx` starts with `window.NASA` fallback data, then requests live data through `window.NASA_API`. Most fetch helpers catch failures and return baked values, so tab components normally receive data rather than rejected promises. `useData()` is the shared read path. NEO range changes trigger a new feed request; orbital and Sentry lookups are cached in memory for the session.

`useLiveISS()` is simulated ambient telemetry, not a live ISS-position service. It updates once per second from baked baseline values. Do not describe it as real tracking.

The app shell and active tab are selected in the inline `App` component in `NASA Dashboard.html`. The active tab, Earth globe mode, and Tweaks minimized state use `localStorage`. There is no URL router.

`DrawerProvider` in `components/extras.jsx` owns one global right-side drawer. Interactive cards call `useDrawer().open(<DetailComponent />)`. When adding a new clickable data item, provide a clear hover/focus state and a suitable detail view rather than hiding important context in raw labels.

## Three.js globe

`Globe3D` in `components/globe.jsx` is the only non-React rendering surface. Its effect owns and cleans up the Three.js scene, camera, renderer, animation frame, and pointer listeners.

- `mode="contour"` uses a custom shader with simplex noise and isolines.
- `mode="photo"` uses a texture and falls back to a blue surface when loading fails.
- HTML markers are projected from latitude/longitude every frame.
- `onReady` exposes `{ reset, rotateTo(lat, lon) }` to parent components.
- Changing globe mode intentionally rebuilds the scene.

Preserve cleanup behavior and cap pixel ratio unless performance work explicitly replaces this approach.

## Visual language

Shared design tokens live under `:root` in `styles/hud.css`:

- `--hud-bg`, `--hud-bg-deep`, `--hud-panel` — dark surfaces
- `--hud-ink`, `--hud-ink-dim` — primary information
- `--hud-steel`, `--hud-steel-dim` — secondary information
- `--hud-accent`, `--hud-accent-2`, `--hud-cool` — live, alert, and telemetry accents
- `--hud-grid`, `--hud-grid-2`, `--hud-hairline`, `--hud-hairline-soft` — structure and dividers
- `--font-display`, `--font-sans`, `--font-mono` — labels/values, body copy, and telemetry

Use tokens for reusable interface colors. Existing media backdrops, overlays, and the inline Tweaks panel contain some literal colors; do not use that as a reason to spread new one-off values. Numeric readouts should keep tabular numerals.

The signature treatment is a four-corner bracket: `.hud-bracket-4` in CSS or `<HudCorner>` in JSX. Use it deliberately for instrumented groups, not every container. Reuse the `Hud*` primitives in `components/hud.jsx` before creating a parallel visual component.

Motion is ambient and restrained: scans, sweeps, rotating rings, and live counters. Respect the existing Motion Off control. Any new animation must still make sense when animation is disabled.

## Language, tooltips, and accessibility

Plain-English domain explanations live in `GLOSSARY` in `components/extras.jsx`. Add new scientific terms there and use `<Tip info={GLOSSARY.key}>`; do not duplicate explanations across tabs.

Preserve semantic buttons where they already exist and add keyboard access, focus styling, labels, and reduced-motion consideration when improving interactions. Many existing clickable cards are `<div>` elements and the app does not yet provide complete keyboard or mobile support. Treat that as known debt, not as an established accessible pattern.

## Edit-mode bridge

The Tweaks panel in `NASA Dashboard.html` communicates with a parent iframe or design tool through `window.postMessage`.

- It listens for `__activate_edit_mode` and `__deactivate_edit_mode`.
- It announces `__edit_mode_available`.
- It sends `__edit_mode_set_keys` with accent, grain, or motion edits.
- `TWEAK_DEFAULTS` must remain wrapped by `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/`.

Do not rename messages or remove markers without coordinating the external host contract.

## Repository map

- `NASA Dashboard.html` — live entry point, app composition, Tweaks UI, edit bridge
- `styles/hud.css` — tokens, shared HUD classes, animation styles
- `data/nasa.js` — curated fallback data and deep-sky metadata
- `data/api-client.js` — NASA/JPL/Image Library requests and graceful fallbacks
- `components/hud.jsx` — reusable visual primitives and charts
- `components/extras.jsx` — media fallbacks, glossary, drawer, detail views
- `components/globe.jsx` — interactive Three.js globe
- `components/chrome.jsx` — shared data state, app frame, status areas, Overview
- `components/tabs.jsx` — the other five live tabs
- `design-canvas.jsx` — standalone pan/zoom design canvas; not loaded by the live app
- `variants/` — standalone layout explorations; not loaded by the live app
- `docs/reference/` — *Oblivion* visual references
- `docs/screenshots/` and `_check/` — visual QA evidence
- `docs/superpowers/plans/` — historical implementation plans, not runtime source
- `uploads/` — source/reference imagery; confirm usage before deleting

Do not wire `design-canvas.jsx` or `variants/` into the main HTML unless the task explicitly promotes an exploration into the live dashboard.

## Security and external dependencies

The NASA API key is currently stored in browser-delivered source and must be treated as public/demo access, not a secret. Do not copy its value into documentation, logs, screenshots, or new files. A truly private key would require a server-side proxy or another backend boundary.

The app depends on unpkg, Google Fonts, NASA APIs, JPL APIs, NASA image hosts, Vercel Web Analytics, and browser network access. Analytics is enabled through the static-site script in `NASA Dashboard.html`; do not introduce a package manager only to load `@vercel/analytics`. CDN or API failure should degrade to baked data or visual fallbacks rather than break the shell. Three.js currently lacks a Subresource Integrity hash; the other main CDN scripts include one.

## Change discipline

- Preserve unrelated user changes; the working tree may already be dirty.
- Make focused edits and keep `CLAUDE.md` and `AGENTS.md` synchronized when repository guidance changes.
- Maintain data shapes consumed by components, or update baked data, live normalization, and every consumer together.
- Do not silently convert simulated or curated values into claims of live telemetry.
- Do not edit reference explorations when the task targets the live dashboard.
- After changes, report manual checks honestly and list any untested browser, viewport, API-failure, or accessibility states.
