# Codebase Concerns

## Security and trust boundaries

- `data/nasa.js` and `data/api-client.js` contain the NASA API key in browser-delivered source.
- Any visitor can read that key, so it must be treated as public/demo access rather than a secret.
- Do not copy the key value into plans, documentation, logs, screenshots, or additional files.
- Private credentials would require a server-side proxy or another backend boundary; this repository has neither.
- The edit-mode bridge in `NASA Dashboard.html` sends and receives `window.postMessage` events with a wildcard origin.
- The bridge is useful for design tooling but does not currently validate the sending origin.
- React, ReactDOM, Babel, and Three.js are loaded from unpkg in `NASA Dashboard.html`.
- Three.js does not currently have a Subresource Integrity hash, unlike the other main CDN scripts.

## Reliability and data meaning

- The shell depends on CDN access before any React interface can render.
- Live views depend on NASA, JPL, NASA image, and Google Fonts hosts.
- `data/api-client.js` catches most request errors and silently returns baked data.
- Silent fallback keeps the interface usable but can make stale data look live.
- The UI does not consistently label whether a value came from a live request or a fallback.
- `useLiveISS()` in `components/chrome.jsx` simulates orbital movement from baked values; it is not a live ISS position feed.
- Some telemetry, rover metadata, and comparison labels are curated or derived for visual storytelling.
- Product copy must not imply operational or safety-critical accuracy.
- Fetch requests use an eight-second timeout but have no retry or user-facing error state.

## Architecture and maintainability

- `NASA Dashboard.html` relies on an exact global script order.
- Shared values are published on `window`, so missing exports or reordered scripts fail at runtime.
- There is no static type checking to catch data-shape or prop mismatches.
- Large files such as `components/tabs.jsx` and `components/chrome.jsx` combine many UI responsibilities.
- Most component styling is inline, which makes repeated layout and state changes harder to audit.
- `CLAUDE.md` and `AGENTS.md` intentionally duplicate core guidance and must be kept synchronized.
- Cache-buster values in `NASA Dashboard.html` require manual updates after source changes.
- Historical plans under `docs/superpowers/plans/` may describe proposals that were never shipped.
- Standalone `variants/` files and `design-canvas.jsx` are not part of the live app and can drift from it.

## Testing and delivery gaps

- The repository has no automated test runner.
- It has no lint or formatting configuration.
- It has no build validation or continuous-integration workflow.
- Verification is currently manual through a local HTTP server and browser inspection.
- API-failure behavior requires deliberate network blocking or stubbing to test.
- The `_check/` and `docs/screenshots/` images are evidence, not repeatable regression tests.
- Browser compatibility is undocumented beyond the modern APIs used in the source.
- External CDN and API behavior can change without a repository change.

## UX, accessibility, and responsive behavior

- The live app is built around dense, fixed desktop grids.
- There are no responsive media queries in `styles/hud.css`.
- The 420-pixel detail drawer in `components/extras.jsx` can overwhelm narrow viewports.
- Many interactive cards use clickable `<div>` elements instead of semantic controls.
- Those cards may not be reachable or operable by keyboard.
- Drawer focus is not trapped, restored, or announced as a dialog.
- Tooltips rely primarily on hover and may be unavailable to touch or keyboard users.
- Motion Off disables CSS animations globally, but there is no direct `prefers-reduced-motion` media query.
- Dense labels and low-contrast hairlines need visual checks across display quality and zoom levels.
- Mobile support and full accessibility should be scoped as explicit design/engineering work.

## Rendering and performance

- `components/globe.jsx` runs a continuous animation loop and projects HTML markers every frame.
- It caps pixel ratio at two, which limits GPU load on high-density displays.
- Globe prop changes rebuild the Three.js scene; this is intentional but makes cleanup correctness important.
- Texture and CDN failures must continue to leave a usable fallback surface.
- Several one-second timers and ambient animations run throughout the UI.
- Performance should be checked on lower-power laptops before increasing particle counts, markers, or animation density.

## Repository hygiene

- The current working tree contains user changes outside documentation and must not be overwritten.
- The visual references appear to be moving from `reference/` to `docs/reference/`; preserve the moved files and confirm before deleting duplicates.
- `uploads/` contains source/reference imagery whose usage is not always evident from the live entry point.
- Generated browser logs under `.playwright-mcp/` are ignored and should remain out of commits.
- `.DS_Store` files exist locally and are ignored; avoid adding more platform artifacts.

## Priorities

1. Protect data meaning by clearly distinguishing live, fallback, simulated, and curated values.
2. Add keyboard and drawer accessibility when interaction work next touches those areas.
3. Add a minimal repeatable browser smoke test before substantial feature growth.
4. Decide whether the browser-visible NASA key and wildcard edit bridge are acceptable for the deployment context.
5. Treat responsive support as a designed feature rather than a small CSS patch.
