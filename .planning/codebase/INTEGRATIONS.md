# External Integrations

## Integration Model

- All integrations run directly in the visitor's browser; there is no backend proxy, database, job runner, or server-side secret store.
- `data/api-client.js` owns live requests and publishes the client as `window.NASA_API`.
- `components/chrome.jsx` starts live requests through `DataProvider` after the fallback dataset has rendered.
- Each fetcher catches failures and returns data from `window.NASA` in `data/nasa.js`, so most network failures degrade to baked content rather than an error screen.
- Requests use the browser's Fetch API with an eight-second abort timeout through `safeFetch()` in `data/api-client.js`.

## NASA Open APIs

- Base host: `api.nasa.gov`, configured in `data/api-client.js`.
- Astronomy Picture of the Day uses `/planetary/apod` through `fetchAPOD()` for the APOD record.
- NeoWs uses `/neo/rest/v1/feed` through `fetchNEOs(days)` for one to seven days of near-Earth-object approaches.
- NeoWs uses `/neo/rest/v1/neo/{id}` through `fetchNeoOrbitalData(id)` when a near-Earth-object detail drawer needs orbital metadata.
- DONKI solar-flare events use `/DONKI/FLR` through `fetchDONKI()`.
- DONKI coronal-mass-ejection events use `/DONKI/CME` through `fetchDONKI()`.
- DONKI geomagnetic-storm events use `/DONKI/GST` through `fetchDONKI()`.
- EPIC metadata uses `/EPIC/api/natural` through `fetchEPIC()`.
- Live NASA responses are normalized into the UI-facing fields in `data/api-client.js`; the UI does not render raw API responses directly.
- API failures are deliberately silent at the UI level because each fetcher returns the matching baked dataset from `data/nasa.js`.

## NASA and JPL Image Services

- Mars imagery search uses the NASA Image and Video Library at `images-api.nasa.gov/search` in `fetchMarsPhotos()`.
- Mars and curated deep-sky image assets use `images-assets.nasa.gov` URLs stored in `data/nasa.js`.
- APOD fallback imagery uses `apod.nasa.gov` URLs stored in `data/nasa.js`.
- EPIC full-resolution imagery uses `epic.gsfc.nasa.gov/archive/natural/...` URLs assembled by `fetchEPIC()` in `data/api-client.js`.
- Deep-sky details prefer the first curated image URL and image components provide lower-resolution or generated fallbacks in `components/extras.jsx`.
- The photo-mode Earth globe loads a texture from `threejs.org/examples/textures/planets/earth_atmos_2048.jpg` in `components/tabs.jsx`.

## JPL Sentry

- The public JPL Sentry endpoint at `ssd-api.jpl.nasa.gov/sentry.api?all=1` is called by `fetchSentryAll()` in `data/api-client.js`.
- Sentry results are indexed by object designation for lookup in near-Earth-object detail views.
- The result is cached in memory for the lifetime of the page through `__sentryCache` in `data/api-client.js`.
- Per-object NeoWs orbital responses are also cached in memory through `__orbCache` in `data/api-client.js`.
- No cache survives a page reload, and there is no service worker or persistent network cache managed by the application.

## Runtime CDN Dependencies

- unpkg delivers React, ReactDOM, Babel Standalone, and Three.js, all declared in `NASA Dashboard.html`.
- The page cannot start its React interface if React, ReactDOM, or Babel fails to load from unpkg.
- The page can start without Three.js, but `components/globe.jsx` logs a warning and cannot render the globe.
- Google Fonts delivers Rajdhani, JetBrains Mono, and Barlow Condensed through `styles/hud.css`.
- Font failure falls back to system sans-serif or monospace stacks declared in the same CSS file.

## Parent-Frame Edit Mode

- `NASA Dashboard.html` announces edit-mode availability to `window.parent` with a `__edit_mode_available` message.
- It listens for `__activate_edit_mode` and `__deactivate_edit_mode` messages to show or hide the Tweaks panel.
- Accent, grain, and motion changes are posted back as `__edit_mode_set_keys` messages.
- Messages currently use the wildcard target origin `*`, and incoming messages are not filtered by origin in `NASA Dashboard.html`.
- The `EDITMODE-BEGIN` and `EDITMODE-END` comments around `TWEAK_DEFAULTS` are stable anchors for an external design tool that rewrites defaults.
- This host integration is optional; when the dashboard runs as a top-level page, posting to `window.parent` posts to the page itself and the core UI still works.

## Authentication and Sensitive Configuration

- NASA API calls use an API key embedded directly in both `data/api-client.js` and `data/nasa.js`.
- The credential value is intentionally not reproduced in this document.
- Because the application is browser-only, any embedded API key is visible to users and should be treated as public, rate-limitable client configuration rather than a secret.
- There is no environment-variable loading, secrets manager, authentication provider, user login, or authorization layer.
- There are no cookies or bearer-token flows in the repository.

## Persistence, Databases, and Messaging

- There is no database integration and no backend storage.
- Local Storage is the only persistent state, used for `nasa-tab`, `nasa-tweaks-min`, and `earth-mode` in `NASA Dashboard.html` and `components/tabs.jsx`.
- There are no webhooks, WebSockets, Server-Sent Events, analytics services, crash reporting services, payment providers, or email services.
- The dashboard's apparent live ISS position and several telemetry readouts are local simulations, not external live-stream integrations; see `useLiveISS()` and timer-driven UI in `components/chrome.jsx`.

## Standalone and Non-Live Integrations

- `variants/light-table.jsx` references the NASA APOD endpoint and `window.NASA_KEY`, but the variant is not loaded by `NASA Dashboard.html`.
- `design-canvas.jsx` and other files under `variants/` are design explorations, not deployed entry points.
- `.playwright-mcp/` contains local browser-inspection artifacts, but no Playwright package or automated test configuration is present.

## Operational Risks

- CDN failure, content-security-policy restrictions, or offline use can prevent core libraries, fonts, or textures from loading.
- Browser-side API requests depend on the remote services permitting cross-origin access and respecting their public rate limits.
- The current fallback strategy protects the main content areas, but it can make stale baked data look live because errors are not surfaced to the user.
- The hard-coded API credential can be copied by anyone who loads the application and should not be granted access beyond public NASA endpoints.
- The unvalidated wildcard `postMessage` bridge broadens which frames can send edit-mode commands; origin checks are advisable if the dashboard is embedded in a production host.
