# Figma Tab Captures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring every NASA Dashboard tab into the target Figma file as a pixel-perfect captured frame using `generate_figma_design`, with deep-linkable tab routing so each headless capture lands on the right tab.

**Architecture:** Add URL-hash-based tab routing to the dashboard (`#tab=earth`, `#tab=neo`, …) so `generate_figma_design` — which runs headless and can't click UI — can render each tab in isolation by URL. Expose the locally-running dashboard via a public tunnel (cloudflared or ngrok), then run one `generate_figma_design` capture per tab against the tunnel URL, dropping each result into the existing Figma file at `figma.com/design/PZUTg1YHJpAfhRN2ZYWrVg`.

**Tech Stack:** React 18 (in-browser Babel), `window.location.hash` for routing, cloudflared/ngrok for the tunnel, Figma `generate_figma_design` MCP tool, the figma-use skill's reference workflow.

**Tabs to capture (6):** `overview`, `earth`, `neo`, `solar`, `deep`, `mars` — keys defined in `NASA Dashboard.html:136`.

---

## File Structure

- Modify: `NASA Dashboard.html:80-104` — extend the `tab` state initializer and `useEffect` to read/write `window.location.hash` in addition to `localStorage`.
- No other source files change. The Figma work happens entirely through MCP calls; the Figma file is the artifact.

---

## Task 1: Hash-based tab routing

**Why:** `generate_figma_design` loads the dashboard headlessly and has no way to click the tab bar. The only way to control which tab it captures is the URL. We add a `#tab=<key>` fragment that the `App` component reads on mount and writes whenever the user clicks a tab — `localStorage` stays as a secondary persistence layer so refresh-without-hash still works.

**Files:**
- Modify: `NASA Dashboard.html:80-104`

- [ ] **Step 1: Read the current `App` component to confirm the exact lines we're touching**

Run: `sed -n '80,105p' "NASA Dashboard.html"`
Expected: lines 80–104 match the snippet quoted in Step 2's `old_string`.

- [ ] **Step 2: Replace the tab state initializer + persistence effect with a hash-aware version**

Edit `NASA Dashboard.html`. Find:

```javascript
function App() {
  const [tab, setTab] = React.useState(() => localStorage.getItem('nasa-tab') || 'overview');
```

Replace with:

```javascript
const VALID_TABS = ['overview', 'earth', 'neo', 'solar', 'deep', 'mars'];
function readTabFromHash() {
  const m = /(?:^|[#&])tab=([^&]+)/.exec(window.location.hash || '');
  const v = m && decodeURIComponent(m[1]);
  return VALID_TABS.includes(v) ? v : null;
}
function App() {
  const [tab, setTab] = React.useState(() => readTabFromHash() || localStorage.getItem('nasa-tab') || 'overview');
```

Then find:

```javascript
  React.useEffect(() => { localStorage.setItem('nasa-tab', tab); }, [tab]);
```

Replace with:

```javascript
  React.useEffect(() => {
    localStorage.setItem('nasa-tab', tab);
    const next = `#tab=${tab}`;
    if (window.location.hash !== next) {
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`);
    }
  }, [tab]);
  React.useEffect(() => {
    const onHash = () => { const v = readTabFromHash(); if (v && v !== tab) setTab(v); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [tab]);
```

- [ ] **Step 3: Manual verification — confirm each hash routes to the right tab**

1. Reload `http://localhost:8000/NASA%20Dashboard.html#tab=earth` — Earth Observation tab renders.
2. Reload `http://localhost:8000/NASA%20Dashboard.html#tab=neo` — NEO Track renders.
3. Click another tab in the UI — the URL hash updates to match (`history.replaceState`, no scroll).
4. Reload with an unknown hash (`#tab=bogus`) — falls back to `localStorage`/`overview`.

Expected: all four behaviors hold. If any fail, fix before continuing — the captures depend on this.

- [ ] **Step 4: Commit**

```bash
git add "NASA Dashboard.html"
git commit -m "feat(routing): hash-based tab deep-links for headless capture"
```

---

## Task 2: Public tunnel to localhost:8000

**Why:** `generate_figma_design` fetches the page from Figma's servers, which can't reach `localhost`. We need a publicly-resolvable HTTPS URL pointing at the dev server.

**Files:** None — runtime tunnel only.

- [ ] **Step 1: Start cloudflared (no signup, ephemeral tunnel)**

Run in a new terminal window (keep open for the duration of captures):

```bash
cloudflared tunnel --url http://localhost:8000
```

Expected: cloudflared prints a line like `https://<random-words>.trycloudflare.com`. Copy that URL. It expires when the process exits.

If cloudflared is not installed: `brew install cloudflared` (macOS) and retry. Alternative: `ngrok http 8000` if cloudflared is unavailable.

- [ ] **Step 2: Smoke-test the tunnel**

Open `<TUNNEL_URL>/NASA%20Dashboard.html#tab=earth` in an incognito window. Expected: the dashboard loads identically to localhost, on the Earth tab.

If the page fails to load (CORS, mixed content, missing texture URLs): check the browser console. The dashboard pulls Three.js, React, and NASA imagery from public CDNs — those resolve fine over HTTPS. Local `data/*.js` and `components/*.jsx` are served by the same tunnel.

- [ ] **Step 3: Record the tunnel URL for Task 3**

Note the exact URL — Task 3 uses it 6 times. Treat it as ephemeral: if cloudflared restarts, re-run Task 3 with the new URL.

---

## Task 3: Capture each tab into Figma

**Why:** One `generate_figma_design` call per tab, all targeting the same Figma file. We do them in parallel since they're independent.

**Files:** Figma file `PZUTg1YHJpAfhRN2ZYWrVg`, page node `0:1`.

- [ ] **Step 1: Verify Figma MCP is connected**

Run: invoke `mcp__plugin_figma_figma__whoami`.
Expected: returns the connected user. If it errors, reconnect Figma MCP before proceeding.

- [ ] **Step 2: Identify the destination page node**

The URL `figma.com/design/PZUTg1YHJpAfhRN2ZYWrVg/...?node-id=0-1` → `fileKey = PZUTg1YHJpAfhRN2ZYWrVg`, `nodeId = 0:1` (page root). Captures will be appended to this page; `generate_figma_design` finds clear space automatically.

- [ ] **Step 3: Run the six captures in parallel**

Issue 6 `mcp__plugin_figma_figma__generate_figma_design` calls in a single message, one per tab. For each:

- `url`: `<TUNNEL_URL>/NASA%20Dashboard.html#tab=<key>` — substitute each tab key.
- `targetFileKey`: `PZUTg1YHJpAfhRN2ZYWrVg`
- `targetNodeId`: `0:1`
- `name`: `NASA Dashboard — <Label>` (Overview / Earth Observation / NEO Track / Space Weather / Deep Space / Mars).
- `viewport`: `1920x1080` (the dashboard is laid out as a 16:9 instrument panel; smaller viewports break the grid).

Wait for all 6 to complete. Capture the returned node IDs into a list.

- [ ] **Step 4: Visual QA — screenshot each captured frame and compare to the live tab**

For each of the 6 returned node IDs, in parallel:
1. Call `mcp__plugin_figma_figma__get_screenshot` with the node ID.
2. Open the same tab in a browser at `http://localhost:8000/NASA%20Dashboard.html#tab=<key>` and visually compare.

Look for: missing background images (Three.js `<canvas>` content sometimes rasterizes blank), clipped panels, wrong accent color (Tweaks panel shouldn't be visible — confirm the screenshot didn't catch it open), placeholder/loading states baked in (APOD/EPIC/Mars fetches must complete before capture; if a tab still shows `LOADING`, re-run that single capture).

- [ ] **Step 5: Re-capture any tab that came back wrong**

If a capture shows loading states or a blank globe canvas:
- Open the URL in a headless-equivalent browser tab, wait ~5s for fetches to settle, then re-issue the single `generate_figma_design` call for that tab.
- The dashboard's `DataProvider` (`components/chrome.jsx:10-34`) renders baked fallback data immediately, so loading states should be rare — but `EPIC` fetches latest imagery from NASA and can lag.

For the `earth` tab specifically: the Three.js globe renders to a `<canvas>` and `generate_figma_design` flattens canvases to a single image fill. This is expected — the contour shader can't be reconstructed as Figma nodes. Accept the rasterized result.

- [ ] **Step 6: Commit any remaining source changes (none expected) and close the tunnel**

```bash
git status
```

Expected: clean working tree (Task 1 is the only source change; already committed).

Stop cloudflared (`Ctrl-C` in the tunnel terminal).

---

## Self-Review

**1. Spec coverage:**
- Route A capture path — Task 3 ✓
- Tunnel for localhost — Task 2 ✓
- Tab switching for headless capture — Task 1 ✓
- All 6 tabs covered — Task 3 Step 3 ✓
- Figma file destination — Task 3 Steps 2–3 ✓

**2. Placeholders:** None — every step shows the actual code, command, or MCP call shape required.

**3. Type consistency:** `VALID_TABS` array matches the keys in `NASA Dashboard.html:136` (`tabMap` keys). Hash regex matches the format the persistence effect writes.

---

## Notes for the implementer

- The hash routing is a real product feature, not just a capture aid — keep it. It makes every tab linkable, which is useful regardless of the Figma work.
- `generate_figma_design` rasterizes images and canvas content into Figma `IMAGE` fills. The output is *not* a design-system-linked composition — it's a high-fidelity snapshot. If editable Figma components are needed later, that's Route B (a separate plan).
- The Tweaks panel (bottom-right of the dashboard) is visible by default. If captures show it expanded, set `localStorage.setItem('nasa-tweaks-min', '1')` in DevTools before capturing, or add a query param to force-minimize it. Default is already minimized for new sessions, so headless captures should be clean.
