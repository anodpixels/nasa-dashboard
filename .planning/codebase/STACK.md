# Technology Stack

## Application Shape

- The project is a static, browser-only dashboard with no application server or backend.
- `NASA Dashboard.html` is the live entry point and contains the root React render plus the edit-mode controls.
- There is no build step, package manager, lockfile, bundler, or generated application bundle.
- Local development is a plain HTTP file server, documented in `CLAUDE.md` as `python3 -m http.server 8000`.
- The page must be served over HTTP rather than opened with `file://`, because browser security rules affect Babel, WebGL textures, and remote requests.

## Languages and Runtime

- HTML5 defines the document shell and runtime wiring in `NASA Dashboard.html`.
- JavaScript is used for data, API access, browser state, and rendering behavior in `data/*.js` and `components/*.jsx`.
- JSX is used directly in `components/hud.jsx`, `components/extras.jsx`, `components/globe.jsx`, `components/chrome.jsx`, and `components/tabs.jsx`.
- CSS defines shared design tokens, global visual treatments, animation, and utility classes in `styles/hud.css`.
- The only required runtime is a modern web browser with JavaScript, Fetch, WebGL, CSS custom properties, and Local Storage support.
- JSX is transpiled in the browser by Babel Standalone, so source files are delivered rather than precompiled.

## Core Libraries

- React `18.3.1` supplies components, hooks, context, and state management; it is loaded from unpkg in `NASA Dashboard.html`.
- ReactDOM `18.3.1` mounts the application with `ReactDOM.createRoot` in `NASA Dashboard.html`.
- Babel Standalone `7.29.0` compiles JSX and modern JavaScript in the browser, configured through `type="text/babel"` script tags.
- Three.js `0.160.0` powers the interactive WebGL globe in `components/globe.jsx`.
- React, ReactDOM, and Babel use pinned CDN versions and Subresource Integrity metadata in `NASA Dashboard.html`.
- Three.js is version-pinned but does not have an integrity attribute in `NASA Dashboard.html`.

## Module and Component Model

- There is no ES module system: files are classic scripts loaded in a fixed order by `NASA Dashboard.html`.
- Cross-file APIs are published on `window`, for example `window.NASA` in `data/nasa.js` and `window.NASA_API` in `data/api-client.js`.
- Shared React primitives are exposed with `Object.assign(window, ...)` at the end of `components/hud.jsx` and `components/extras.jsx`.
- The main data layer is a React context named `DataCtx` inside `components/chrome.jsx`; consumers use the global `useData()` hook.
- The drawer system uses a second React context in `components/extras.jsx`.
- Script order is a dependency boundary: data loads first, then primitives, composite components, the globe, chrome, and tabs.

## Rendering and Styling

- Most UI is React-rendered HTML and inline style objects; global tokens and reusable classes live in `styles/hud.css`.
- The globe is the only separate rendering surface and uses Three.js with a `WebGLRenderer` in `components/globe.jsx`.
- The contour globe uses embedded GLSL vertex and fragment shaders, including procedural simplex noise, in `components/globe.jsx`.
- Design tokens are CSS custom properties under `:root` in `styles/hud.css`, including palette, hairlines, and three font roles.
- Google Fonts supplies Rajdhani, JetBrains Mono, and Barlow Condensed through an `@import` in `styles/hud.css`.
- The dashboard is designed as a fixed, full-viewport interface; `NASA Dashboard.html` sets the root to `100vw` by `100vh` and hides page overflow.

## Browser APIs and State

- Fetch and `AbortController` provide network access and eight-second request timeouts in `data/api-client.js`.
- Local Storage remembers the selected dashboard tab and Tweaks-panel state in `NASA Dashboard.html`.
- Local Storage also remembers the Earth globe display mode in `components/tabs.jsx`.
- `requestAnimationFrame` drives globe motion and marker projection in `components/globe.jsx`.
- Timers drive clocks, telemetry simulations, loading ambience, and feed motion across `components/hud.jsx`, `components/chrome.jsx`, and `components/tabs.jsx`.
- `window.postMessage` connects the Tweaks panel to an optional parent-frame edit-mode host in `NASA Dashboard.html`.

## Data and Assets

- `data/nasa.js` contains deterministic fallback records for every major dashboard section.
- `data/api-client.js` converts live API responses into the simpler shapes expected by the UI.
- Remote NASA imagery is displayed directly from NASA image hosts; the Earth photo globe uses a Three.js-hosted texture URL in `components/tabs.jsx`.
- `design-canvas.jsx` is a standalone pan-and-zoom design canvas and is not loaded by the live entry point.
- `variants/*.jsx` contains alternate design explorations and is not part of the live dashboard runtime.
- `_check/`, `docs/reference/`, `docs/screenshots/`, and `uploads/` are visual references or review artifacts rather than executable application code.

## Tooling and Quality Infrastructure

- No automated test runner, linter, formatter, type checker, or continuous-integration workflow is configured.
- No TypeScript is present; runtime data contracts are implicit in the JavaScript object shapes.
- Cache-busting query strings are maintained manually on local scripts in `NASA Dashboard.html`.
- Historical browser-review artifacts exist under `.playwright-mcp/`, but they do not constitute a committed test suite and are ignored by `.gitignore`.
- `Nasa Dashboard.code-workspace` is a minimal Visual Studio Code workspace with no project-specific settings.
