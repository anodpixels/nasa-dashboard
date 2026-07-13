# Architecture

## System Overview

This repository is a browser-only NASA telemetry dashboard. It is a single-page React application with no build process, package manager, server-side application, or module bundler.

The live entry point is `NASA Dashboard.html`. It loads third-party libraries from a CDN, then loads local JavaScript and JSX files in dependency order. Babel Standalone converts JSX in the browser.

The architecture is intentionally global: files publish components and services to `window`, and later scripts consume those names. There are no ES module `import` or `export` statements.

## Runtime Composition

The load order in `NASA Dashboard.html` is part of the dependency graph:

1. `data/nasa.js` creates the baked fallback dataset at `window.NASA`.
2. `data/api-client.js` creates browser-side fetch functions at `window.NASA_API`.
3. `components/hud.jsx` publishes reusable visual primitives such as `HudLabel`, `HudValue`, and `HudRadar`.
4. `components/extras.jsx` publishes tooltips, the drawer system, glossary text, image fallbacks, and detail views.
5. `components/globe.jsx` publishes the Three.js globe and coordinate helper.
6. `components/chrome.jsx` publishes shared data context, the application frame, and the Overview tab.
7. `components/tabs.jsx` publishes the remaining five tab screens.
8. The inline `App` in `NASA Dashboard.html` selects a tab, nests providers, and mounts React into `#root`.

Because names are shared through `window`, moving a script tag earlier can break references that have not been defined yet. New live files must be added to `NASA Dashboard.html` after their dependencies and before their consumers.

## Application Layers

### 1. Data source layer

`data/nasa.js` is the always-available local source. It contains APOD, EPIC, ISS, near-Earth object, space-weather, exoplanet, Mars, deep-sky, and fireball records.

`data/api-client.js` is a normalization and resilience layer. It fetches remote NASA and JPL responses, converts them into the smaller shapes expected by the UI, caches selected orbital and Sentry results for the browser session, and falls back to `window.NASA` on failure.

Fetch functions catch errors internally. As a result, normal UI consumers receive data rather than rejected promises, but they cannot directly distinguish a live response from baked fallback data.

### 2. Shared state layer

`DataProvider` in `components/chrome.jsx` owns shared data state. It renders baked data immediately, starts live requests after mount, and replaces each slice as its request completes.

`useData()` exposes the provider value to the application frame and tab screens. It includes remote-backed records, loading flags, the selected NEO date window, and fixed fallback records.

`DrawerProvider` in `components/extras.jsx` owns one global drawer. Consumers call `useDrawer().open(<DetailComponent />)` and pass already-rendered React content into the provider.

Local interaction state remains close to each screen. Examples include tab selection in `NASA Dashboard.html`, Earth globe mode in `components/tabs.jsx`, and NEO selection, sorting, and view mode in `components/tabs.jsx`.

### 3. Presentation layer

`components/hud.jsx` is the visual primitive library. Its components render labels, values, chips, charts, rings, radar plots, scatter plots, clocks, brackets, and scan-line elements.

`styles/hud.css` supplies global tokens and shared visual behaviors. Most screen layout is still expressed as inline React styles inside `components/chrome.jsx` and `components/tabs.jsx`.

`components/chrome.jsx` provides the persistent shell: header, six-tab navigation, content viewport, and status bar. It also contains `TabOverview` because the first screen and shell were developed together.

`components/tabs.jsx` contains `TabEarth`, `TabNEO`, `TabSolar`, `TabDeep`, and `TabMars`, plus globe wrappers and legend helpers used by Earth and Mars.

`components/extras.jsx` owns secondary information surfaces: hover tooltips, image URL fallbacks, glossary copy, the slide-in drawer, and all drawer detail components.

### 4. Non-React rendering layer

`components/globe.jsx` is the only imperative rendering subsystem. `Globe3D` creates and disposes its own Three.js scene, camera, renderer, sphere, texture or shader material, pointer handlers, and animation frame loop inside a React effect.

React still owns the globe's outer container and HTML marker elements. The Three.js animation loop projects latitude/longitude coordinates into screen positions and directly updates marker transforms and opacity.

The globe exposes `reset()` and `rotateTo(lat, lon)` through the `onReady` callback. `MapLegendPanel` actions in `components/tabs.jsx` call that imperative API through a React ref.

## Primary Data Flow

The normal startup flow is:

`NASA Dashboard.html` → `DataProvider` → immediate `window.NASA` values → tab render → `window.NASA_API.fetch*()` → normalized response or fallback → React state update → affected consumers re-render.

The NEO date-range flow is user-driven:

`TabNEO` → `setNeoDays()` from `useData()` → `DataProvider` effect → `fetchNEOs(neoDays)` → updated NEO collection → NEO charts and table re-render.

The detail flow is:

tab or overview click target → `useDrawer().open()` → `DrawerProvider` stores detail JSX → overlay and right-side panel render above the dashboard → backdrop or close button clears the content.

The design-tweak flow is separate from React context:

controls in `NASA Dashboard.html` → local React state and DOM listeners → CSS custom property or injected animation rule → optional `window.parent.postMessage()` event for an external iframe host.

## Entry Points and Persistence

`NASA Dashboard.html` is the only live application entry point. `ReactDOM.createRoot()` mounts the inline `App` component.

The selected dashboard tab is stored under `nasa-tab` in browser `localStorage`. Earth contour/photo mode uses `earth-mode`, and the tweak panel's minimized state uses `nasa-tweaks-min`.

The edit-mode bridge listens for `__activate_edit_mode` and `__deactivate_edit_mode`, announces `__edit_mode_available`, and emits `__edit_mode_set_keys`. The `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/` anchors around `TWEAK_DEFAULTS` are part of that external contract.

## Boundaries and Extension Rules

Live dashboard work belongs in `NASA Dashboard.html`, `data/`, `components/`, and `styles/`.

`design-canvas.jsx` is a standalone pan-and-zoom presentation surface. It is not loaded by the live dashboard.

`variants/cockpit.jsx`, `variants/instrument.jsx`, `variants/light-table.jsx`, and `variants/timeline.jsx` are alternate design explorations. They read the global data model but are not wired into `NASA Dashboard.html`.

`docs/`, `_check/`, and `uploads/` contain plans, references, and visual artifacts rather than runtime code.

When adding a shared component, publish it to `window` at the bottom of its file and place its script before all consumers. When adding a new data type, provide a baked fallback in `data/nasa.js`, normalize the live response in `data/api-client.js`, expose it through `DataProvider`, and then consume it through `useData()`.

## Architectural Trade-offs

The no-build setup makes the prototype easy to serve and inspect, but script order replaces an explicit module graph and all public names share one global namespace.

Inline layout styles make each screen visually self-contained, but shared spacing and responsive behavior are harder to audit than the color and typography tokens in `styles/hud.css`.

The fallback-first data path keeps the interface populated during network failures. The trade-off is that the current provider does not expose data provenance or explicit error states to designers and users.

The fixed viewport shell and large hard-coded grid columns are optimized for a desktop instrument-panel composition. Responsive reflow is not currently a separate architectural layer.
