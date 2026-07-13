# Repository Structure

## Directory Map

```text
.
├── NASA Dashboard.html       Live application entry point and inline App
├── CLAUDE.md                 Repository guidance for coding agents
├── design-canvas.jsx         Standalone pan/zoom design presentation canvas
├── components/               Live React UI and Three.js rendering code
├── data/                     Baked data and browser API client
├── styles/                   Shared design tokens and HUD CSS
├── variants/                 Standalone layout explorations, not live
├── docs/                     Plans, references, and captured screenshots
├── _check/                   Visual comparison screenshots
├── uploads/                  Imported image references and source assets
└── .planning/codebase/       Generated repository map documents
```

## Root Files

`NASA Dashboard.html` is the executable page. It contains the HTML shell, CDN dependencies, script order, tweak-panel markup and styles, the inline `App`, provider nesting, tab routing, edit-mode messaging, and React mount call.

`CLAUDE.md` records the project's non-standard runtime constraints and component conventions. It should be consulted before changing script structure, data flow, design tokens, the globe, or edit-mode behavior.

`design-canvas.jsx` exports `DesignCanvas`, `DCSection`, `DCArtboard`, and `DCPostIt` to `window`. It is a reusable presentation canvas for moodboards and variant pages, not part of the loaded dashboard.

`Nasa Dashboard.code-workspace` is editor workspace metadata. It does not participate in the browser runtime.

## `components/`

`components/hud.jsx` is the lowest-level React component file. It contains the reusable visual vocabulary: typography, chips, bars, tick marks, charts, radar/scatter graphics, corner frames, dividers, scan lines, and clocks.

`components/extras.jsx` contains cross-screen interaction utilities. It owns `Tip`, `InfoDot`, `DrawerProvider`, `useDrawer`, `GLOSSARY`, robust image components, drawer layout helpers, and domain-specific detail panels.

`components/globe.jsx` contains the Three.js subsystem. It defines shader source, `latLonToVec3`, and `Globe3D`, including drag rotation, idle spin, texture fallback, marker projection, and cleanup.

`components/chrome.jsx` contains shared application state and the persistent frame. Its main sections are `DataProvider`, `useData`, the simulated `useLiveISS` hook, ambient helpers, `Chrome`, `StatusBar`, `TabOverview`, and `FeedStream`.

`components/tabs.jsx` contains the remaining screen-level components: `TabEarth`, `TabNEO`, `TabSolar`, `TabDeep`, and `TabMars`. It also contains `MapLegendPanel` and `GlobeWithReadout`, which support globe-based tabs.

The dependency direction inside `components/` is approximately:

`hud.jsx` → `extras.jsx` → `globe.jsx` → `chrome.jsx` → `tabs.jsx`.

Files do not import one another. `NASA Dashboard.html` enforces this direction with ordered `<script>` tags.

## `data/`

`data/nasa.js` defines `window.NASA`, the baked fallback and demo dataset. Top-level domains include `apod`, `epic`, `iss`, `neos`, `donki`, `exoplanets`, `mars`, `mars_photos`, `deepsky`, and `fireballs`.

`data/api-client.js` defines `window.NASA_API`. It owns timeout handling, remote requests, response normalization, per-session caches, and fallback behavior.

Keep the UI-facing shape stable across both files. A record returned by `data/api-client.js` should match what the relevant component already receives from `data/nasa.js`.

When changing a baked data shape, also review the cache-busting query strings for these files in `NASA Dashboard.html` so a hard refresh does not reuse stale browser content.

## `styles/`

`styles/hud.css` is the only shared stylesheet. It defines the `--hud-*` color tokens, three font-family tokens, typography roles, hairlines, bracket frames, grids, motion keyframes, status chips, and small layout utilities.

Most component-specific dimensions, grid definitions, spacing, and positioning remain inline in JSX. Search the relevant screen in `components/chrome.jsx` or `components/tabs.jsx` before assuming a layout value lives in CSS.

Shared visual primitives use the `Hud` prefix in JSX and the `hud-` prefix in CSS. New reusable visual behavior should follow those names.

## `variants/`

`variants/cockpit.jsx` defines the `VariantCockpit` alternate composition.

`variants/instrument.jsx` defines the `VariantInstrument` alternate composition.

`variants/light-table.jsx` defines the `VariantLightTable` alternate composition.

`variants/timeline.jsx` defines the `VariantTimeline` alternate composition.

Each variant publishes one top-level component to `window` and reads from `window.NASA`. None of these files is referenced by `NASA Dashboard.html`; changes here do not change the live dashboard unless a separate page loads them.

## `docs/` and Visual Assets

`docs/superpowers/plans/` contains dated implementation plans. These are historical planning records, not executable specifications.

`docs/reference/` contains Oblivion-inspired interface references used to guide the visual language.

`docs/screenshots/` contains captured states of the NEO screen and drawer used for visual verification during earlier changes.

`_check/` contains broad dashboard screenshots such as overview, Mars, NEO, and drawer captures. These are useful for manual visual comparison.

`uploads/` contains pasted images and source references. Files here may be temporary design inputs; confirm actual runtime usage before changing or deleting them.

## Naming and Placement Conventions

React components and hooks use PascalCase and `use*` names respectively: `TabMars`, `DrawerProvider`, and `useData`.

Screen-level components use the `Tab` prefix. Drawer content components use the `Detail` suffix. Reusable HUD primitives use the `Hud` prefix. Standalone explorations use the `Variant` prefix.

Global data namespaces use uppercase names: `window.NASA` and `window.NASA_API`. Component files expose public names with `Object.assign(window, {...})` or direct `window.Name = Name` assignments at the bottom.

Keep live data definitions in `data/`, reusable live interface code in `components/`, shared CSS in `styles/`, and non-live visual explorations in `variants/`.

Do not place runtime code in `docs/`, `_check/`, or `uploads/`. Do not load `design-canvas.jsx` or `variants/*.jsx` into the main dashboard unless the product direction explicitly promotes those explorations into the live experience.

## Where to Make Common Changes

To add or alter a dashboard screen, start in `components/chrome.jsx` for Overview or `components/tabs.jsx` for the other tabs, then update the tab map and navigation in `NASA Dashboard.html` and `components/chrome.jsx` if a new tab is introduced.

To add a reusable chart or visual readout, use `components/hud.jsx` and export it to `window`.

To add a tooltip definition or drawer detail surface, use `components/extras.jsx` and extend `GLOSSARY` rather than duplicating explanatory copy inline.

To change live NASA fetching, normalization, caching, or fallback behavior, use `data/api-client.js`; update `data/nasa.js` when the fallback shape must change.

To change global color, type, hairline, grain, or motion styling, start in `styles/hud.css`. The runtime accent override and tweak controls live in `NASA Dashboard.html`.

To change globe rendering or pointer behavior, use `components/globe.jsx`. To change how a specific screen configures or frames a globe, use `components/tabs.jsx`.

## Generated and Operational Notes

There is no `src/`, `public/`, `package.json`, build output directory, test directory, or server directory in this repository.

There is no generated application bundle to edit. The browser reads the checked-in HTML, JavaScript, JSX, and CSS directly.

The `.planning/codebase/` directory is documentation generated from the current repository state. It should describe actual paths and current behavior, but it is not loaded by the application.
