# Testing Guide

## Current status

- **Missing:** there is no automated test runner, unit-test framework, browser-test configuration, lint configuration, formatter configuration, package manifest, or continuous-integration workflow.
- **Missing:** no files matching normal `*.test.*` or `*.spec.*` source-test patterns exist in the repository.
- `CLAUDE.md` explicitly says not to invent test or lint commands. There is no `npm test`, `npm run lint`, Jest, Vitest, Cypress, or configured Playwright command.
- `.playwright-mcp/` contains browser-inspection logs and page snapshots from manual sessions, not a repeatable Playwright test suite. It is ignored by `.gitignore`.
- `_check/*.jpg` and `docs/screenshots/*.png` are visual review artifacts, not executable snapshot tests and not automatically compared.
- `docs/superpowers/plans/2026-05-21-neo-tab-improvements.md` documents the project's actual verification posture: serve locally, hard-reload, and inspect the relevant tab manually.

## Required manual smoke test

- Start a static server from the repository root: `python3 -m http.server 8000`.
- Open `http://localhost:8000/NASA%20Dashboard.html`; do not use `file://`, because Babel, Three.js, images, and network behavior require HTTP.
- Open browser developer tools before testing and watch both the Console and Network panels.
- Hard-reload after editing `data/*.js` or `components/*.jsx` so browser caches do not hide the change.
- Confirm the shell renders at desktop size with no blank root, Babel error, missing-global error, or Three.js error.
- Visit all six tabs through the top navigation: Overview, Earth Observation, NEO Track, Space Weather, Deep Space, and Mars.
- Verify each tab remains readable at the target 1920×1080 viewport used by the existing design-capture plan.
- Test a narrower viewport manually; responsive behavior is not formally specified, so record clipping or unusable controls rather than assuming support.

## Data and failure-path checks

- Test once online and once with the browser Network panel set to Offline.
- Offline, `DataProvider` in `components/chrome.jsx` should continue showing baked values from `data/nasa.js` rather than an empty or crashed screen.
- Confirm loading indicators settle after API calls complete or fall back; no fetch rejection should surface as an unhandled console error.
- Force an image request to fail and verify `APODImage` and `DeepSkyImage` in `components/extras.jsx` move through their URL lists and then show the procedural starfield.
- On Mars, verify failed rover images are hidden cleanly and placeholder tiles remain legible in `components/tabs.jsx`.
- Exercise repeat NEO drawer openings to confirm cached orbital and Sentry requests do not break later selections.
- If the shape of `data/nasa.js` changes, test both fresh load and hard reload after bumping its cache-buster in `NASA Dashboard.html`.

## Interaction checks by area

- Navigation: click every top tab, reload, and confirm the last tab is restored from `localStorage` by `NASA Dashboard.html`.
- Tweaks panel: activate it through the edit-mode message bridge, change accent, grain, and motion, and confirm visuals update without reloading.
- Tweaks persistence: minimize and reload; confirm `nasa-tweaks-min` restores the last state.
- Drawer: open detail drawers from Overview cards, NEO rows, solar events, deep-sky content, exoplanets, and Mars photos; close by both the backdrop and close button.
- Tooltips: hover glossary affordances and confirm text is not clipped behind adjacent panels.
- Earth/Mars globe: drag the globe, select a legend row, switch contour/photo mode, and use Reset.
- Globe lifecycle: switch tabs and globe modes repeatedly; check for duplicate canvases, runaway animation, frozen markers, or increasing console errors.
- NEO: switch 1/3/7-day ranges, change polar/energy view, sort each table column, select plot markers and rows, and verify the same object remains highlighted.
- Space Weather: hover and select timeline events, then confirm the linked detail drawer shows the intended event.
- Deep Space and Overview: click imagery and the reticle target; confirm image fallback and drawer content remain aligned with the selected entry.

## Accessibility checks

- Test the page using only Tab, Shift+Tab, Enter, Space, and Escape.
- Expected current gap: many clickable `<div>` and `<span>` elements in `components/chrome.jsx` and `components/tabs.jsx` cannot be reached or activated by keyboard.
- Expected current gap: `Tip` in `components/extras.jsx` opens on mouse hover only and has no focus behavior.
- Expected current gap: `DrawerProvider` does not declare dialog semantics, trap focus, restore focus, or close on Escape.
- Check that real buttons have a visible focus indicator and an accessible label; the Tweaks toggle in `NASA Dashboard.html` already has `aria-label`.
- Check informative images for useful alternative text and decorative images for `alt=""`.
- With operating-system reduced-motion enabled, verify the dashboard is usable; current motion control is custom and there is no confirmed `prefers-reduced-motion` rule.

## Visual regression process

- Compare changed tabs against the nearest baseline in `_check/` or `docs/screenshots/`; file names identify the tab or drawer state.
- Match viewport, accent, grain, motion, data state, and drawer state before comparing screenshots.
- Inspect token-sensitive elements: accent borders, alert fills, hairlines, label hierarchy, tabular numerals, four-corner brackets, and hover/selected states.
- For Three.js canvases and remote NASA imagery, allow for content variation but do not accept missing canvases, broken aspect ratios, or unreadable overlays.
- Existing screenshots have no approval metadata or automated pixel threshold. Treat them as reference material and confirm intended differences with the designer.

## Highest-value future automation (not currently installed)

- Add a small browser smoke suite that loads `NASA Dashboard.html`, visits every tab, and fails on uncaught console errors.
- Add network interception tests proving each API client returns the baked fallback when NASA endpoints time out or fail.
- Add interaction coverage for drawers, tab persistence, globe reset, NEO selection synchronization, and Tweaks message events.
- Add screenshot baselines for the six tabs at 1920×1080 plus one agreed smaller viewport.
- Add accessibility checks for semantic controls, keyboard access, dialog behavior, image text alternatives, and reduced motion.
- Any future test tooling must include its actual setup, checked-in configuration, and documented command before contributors are told to run it.

## Change-completion checklist

- [ ] App served over HTTP and hard-reloaded.
- [ ] No new console errors or failed required local assets.
- [ ] All six tabs still render.
- [ ] Changed interaction tested with mouse and keyboard.
- [ ] Online and offline/fallback states checked when data or imagery changed.
- [ ] Drawer, hover, selected, loading, empty, and error states checked where relevant.
- [ ] 1920×1080 visual comparison completed; smaller viewport checked for severe clipping.
- [ ] Cache-buster reviewed when `data/*.js` changed.
- [ ] User-owned changes remain intact in `git diff`.
