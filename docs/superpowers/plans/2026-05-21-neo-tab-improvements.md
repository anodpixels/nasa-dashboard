# NEO Track Tab — Visual + Functional Overhaul Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the NEO·TRACK tab from a decorative "radar-shaped" panel into an honest, information-dense near-Earth-object ops view — with semantically meaningful polar plot, sortable date-aware table, mission-relevant KPI tiles, and (optionally) live NASA NeoWs/Sentry/JPL data.

**Architecture:** All work scoped to `components/tabs.jsx` (NEO tab section), `components/hud.jsx` (`HudRadar` extensions), `data/api-client.js` (new fetches in Block 4), and `components/extras.jsx` (`NEODetail` drawer additions). Polar plot becomes a 7-day chronograph: angle = approach date, radius = miss distance in LD, marker size = log(diameter), color = hazard, stroke = selection. Selection state shared between table and plot via lifted `useState` in `TabNEO`.

**Tech Stack:** React 18 (in-browser Babel), classic `<script>` modules (no bundler), the project's `Hud*` primitives, NASA NeoWs + Sentry + JPL Small-Body Database public APIs (no key for Sentry/SBDB, NeoWs uses `DEMO_KEY` fallback already wired in).

**Verification posture:** This codebase has no test runner. Verify by serving over HTTP (`python3 -m http.server 8000`) and inspecting `#tab=neo` (assumes the hash-routing plan `2026-05-20-figma-tab-captures.md` has shipped; if not, click the NEO tab manually). Hard-reload after each task. Bump the `?v=` cache-buster on any touched `data/*.js`.

**Scope blocks (5):**
- **Block 1** — make the polar plot semantically meaningful (Tasks 1.1–1.5)
- **Block 2** — table: dates, sorting, next-approach pin, tip affordance (Tasks 2.1–2.4)
- **Block 3** — KPI tile replacement (Task 3.1)
- **Block 4** — NASA API extensions (Tasks 4.1–4.5)
- **Block 5** — secondary motion + alternate view (Tasks 5.1–5.2)

Blocks 1–3 use only data already on `n`. Block 4 introduces network surface (cache + fallbacks required). Block 5 is polish.

---

## File Structure

- **`components/tabs.jsx`** — `TabNEO` is rewritten section by section. Move `neoPoints` computation into a `useMemo`, add `selectedId` state, add `sortBy` state, refactor the right-rail into table-with-pinned-row and a new KPI triplet.
- **`components/hud.jsx`** — extend `HudRadar` point shape to accept `id`, `size` (marker px), `selected` (bool), and accept an optional `ringLabels` prop so we can label rings 1/5/30 LD instead of relying on the caller's footer text. Backward-compatible: existing callers (other tabs) keep working.
- **`components/extras.jsx`** — `NEODetail` gains orbital-class badge, Sentry chip, and a JPL deep-link in Block 4. Add new `Tip` glossary entries.
- **`data/api-client.js`** — Block 4 adds `fetchNeoOrbitalData(id)`, `fetchSentryAll()`. Both cache results in-memory for the session and degrade silently to existing baked data.
- **`data/nasa.js`** — bump `?v=` in `NASA Dashboard.html` when shape changes (only in Block 4 if Sentry/orbital fallback fields are baked in).
- **`NASA Dashboard.html`** — only touched to bump `?v=` cache-busters when needed.

---

# BLOCK 1 — Polar plot becomes a chronograph

The current polar plot uses `((i * 47) % 360)` for angle (a hash) and `log10(miss_km)/10` for radius, with footer text claiming "0.05 AU / 0.5 AU." None of it carries information. After this block, the plot reads as: *angle = days-from-today on a 7-day clock, radius = miss distance in LD with explicit 1·5·30 LD rings, marker size = log(diameter), color = PHA, ring = selection.*

## Task 1.1: Replace fake angle with date-bucketed angle

**Why:** Today the angle is meaningless. Bind it to `n.date` so the plot shows *when* approaches happen this week.

**Files:**
- Modify: `components/tabs.jsx:143-152` (the `TabNEO` opening + `neoPoints` block)

- [ ] **Step 1: Add a date utility at the top of `TabNEO` (above the component body or inside it)**

Add this `useMemo`-friendly helper directly inside `TabNEO` body, immediately after `const hazards = …`:

```jsx
  const today = React.useMemo(() => { const d = new Date(); d.setUTCHours(0,0,0,0); return d; }, []);
  const dayOffset = (iso) => {
    if (!iso) return 0;
    const d = new Date(iso); d.setUTCHours(0,0,0,0);
    return Math.max(0, Math.min(7, (d - today) / 86400000));
  };
```

- [ ] **Step 2: Rewrite `neoPoints` to use date-driven angle**

Replace the existing `const neoPoints = neos.slice(0, 14).map(…)` block with:

```jsx
  const neoPoints = React.useMemo(() => neos.map((n) => ({
    id: n.id,
    angle: dayOffset(n.date) / 7,                  // 0..1 over the 7-day window
    r: 0,                                          // filled in Task 1.2
    label: n.name.split(' ').pop().slice(0,4),
    hot: n.hazard,
  })), [neos]);
```

- [ ] **Step 3: Manual verification**

Hard-reload `#tab=neo`. The markers should now spread around the clock face by date — earliest dates near 12 o'clock, later dates fanning clockwise. Markers still all at `r=0` (will look stacked at center until Task 1.2).

- [ ] **Step 4: Commit**

```bash
git add components/tabs.jsx
git commit -m "feat(neo): polar angle now encodes approach date (7-day window)"
```

---

## Task 1.2: Radius = miss distance in LD with explicit reference rings

**Why:** Current radius is `log10(miss_km)/10` — uncalibrated. Rebind to LD on a log scale anchored at 1 LD (Moon), 5 LD (close-approach threshold), 30 LD (outer ring).

**Files:**
- Modify: `components/tabs.jsx` (`neoPoints` + the radar's rings prop + footer)
- Modify: `components/hud.jsx:249` (`HudRadar` to accept `ringLabels` and draw radial labels)

- [ ] **Step 1: Extend `HudRadar` to accept `ringLabels` and `customRings`**

In `components/hud.jsx:249`, change the signature to:

```jsx
const HudRadar = ({ size = 220, points = [], rings = 4, sectors = 12, color = 'var(--hud-ink)', dim = 'var(--hud-hairline)', centerLabel, spin = 0, ringLabels = null, customRings = null, style = {} }) => {
  const cx = size / 2, cy = size / 2, R = size / 2 - 8;
  const ringRadii = customRings || Array.from({ length: rings }, (_, i) => (R / rings) * (i + 1));
  const spinStyle = spin > 0 ? { animation: `hud-rot ${spin}s linear infinite`, transformOrigin: `${cx}px ${cy}px`, transformBox: 'fill-box' } : {};
```

Then in the rotating `<g>` block, replace the `Array.from({ length: rings })…` line with:

```jsx
        {ringRadii.map((rr, i) => (
          <circle key={i} cx={cx} cy={cy} r={rr} fill="none" stroke={dim} strokeWidth="1" />
        ))}
```

After the rotating group closes (before the points map), add ring labels in a non-rotating layer:

```jsx
      {ringLabels && ringRadii.map((rr, i) => ringLabels[i] && (
        <text key={`rl${i}`} x={cx + 2} y={cy - rr - 2} fill="var(--hud-steel)" fontSize="7" fontFamily="var(--font-mono)" letterSpacing="0.5">{ringLabels[i]}</text>
      ))}
```

- [ ] **Step 2: Compute LD-anchored radii in `TabNEO` and pass to `HudRadar`**

In `TabNEO`, add this above the `return`:

```jsx
  const RADAR_SIZE = 420;
  const RADAR_R = RADAR_SIZE / 2 - 8;
  const ldToRadius = (ld) => {
    // log-mapped: 1 LD → 0.20·R, 5 LD → 0.50·R, 30 LD → 0.95·R, capped
    const t = Math.log10(Math.max(0.5, ld)); // ~0..1.5
    return Math.min(0.95, 0.18 + 0.57 * (t / 1.5)) * RADAR_R;
  };
  const ringRadiiLD = [1, 5, 30].map(ldToRadius);
```

Update `neoPoints`:

```jsx
  const neoPoints = React.useMemo(() => neos.map((n) => ({
    id: n.id,
    angle: dayOffset(n.date) / 7,
    r: ldToRadius(n.miss_lunar) / RADAR_R,        // HudRadar multiplies by R again — keep 0..1
    label: n.name.split(' ').pop().slice(0,4),
    hot: n.hazard,
  })), [neos]);
```

Then update the `<HudRadar … />` invocation to:

```jsx
<HudRadar
  size={RADAR_SIZE}
  customRings={ringRadiiLD}
  ringLabels={['1 LD', '5 LD', '30 LD']}
  sectors={7}
  points={neoPoints}
  centerLabel="EARTH"
  spin={0}
/>
```

(Sectors = 7 so each spoke marks one day of the 7-day window. Spin disabled — a chronograph shouldn't rotate.)

- [ ] **Step 3: Update the footer captions under the radar**

In `components/tabs.jsx`, replace:

```jsx
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudMono size={8} tone="steel">INNER 0.05 AU</HudMono>
          <HudMono size={8} tone="steel">OUTER 0.5 AU · ROTATING</HudMono>
        </div>
```

with:

```jsx
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudMono size={8} tone="steel">RINGS · 1 / 5 / 30 LD</HudMono>
          <HudMono size={8} tone="steel">SECTORS · NEXT 7 DAYS</HudMono>
        </div>
```

- [ ] **Step 4: Manual verification**

Hard-reload. Markers spread from center outward by miss-distance. Three concentric ring labels (`1 LD`, `5 LD`, `30 LD`) visible at the 12 o'clock vertical. Earth-crossers (`miss_lunar < 1`) sit inside the inner ring; far passers (`> 30`) clamp to the outer.

- [ ] **Step 5: Commit**

```bash
git add components/hud.jsx components/tabs.jsx
git commit -m "feat(neo,hud): polar radius encodes LD with calibrated 1/5/30 LD rings"
```

---

## Task 1.3: Marker size encodes diameter

**Why:** Today every marker is a 6×6 square regardless of object size. A 535 m PHA and a 23 m chip look identical. Size on a log scale so size differences are perceptible but not absurd.

**Files:**
- Modify: `components/hud.jsx` (`HudRadar` point rendering)
- Modify: `components/tabs.jsx` (`neoPoints` adds `size`)

- [ ] **Step 1: Extend the point shape in `HudRadar`**

In `components/hud.jsx`, replace the `points.map` `rect` line:

```jsx
          <rect x={x - 3} y={y - 3} width={6} height={6} fill={p.hot ? 'var(--hud-accent)' : color} />
```

with size-aware + selection-aware rendering (selection is filled in Task 1.4 but we wire the prop now):

```jsx
          {(() => {
            const s = Math.max(4, Math.min(16, p.size || 6));
            const stroke = p.selected ? 'var(--hud-accent)' : 'transparent';
            const fill = p.hot ? 'var(--hud-accent)' : color;
            return <rect x={x - s/2} y={y - s/2} width={s} height={s} fill={fill} stroke={stroke} strokeWidth={p.selected ? 1.5 : 0} />;
          })()}
```

- [ ] **Step 2: Compute `size` from diameter in `TabNEO`**

Add to the `neoPoints` map:

```jsx
    size: 4 + Math.log10(Math.max(1, n.diameter_m)) * 2.4,   // ~4px at 1m, ~14px at 10km
```

So the full `neoPoints` becomes:

```jsx
  const neoPoints = React.useMemo(() => neos.map((n) => ({
    id: n.id,
    angle: dayOffset(n.date) / 7,
    r: ldToRadius(n.miss_lunar) / RADAR_R,
    label: n.name.split(' ').pop().slice(0,4),
    hot: n.hazard,
    size: 4 + Math.log10(Math.max(1, n.diameter_m)) * 2.4,
    selected: false,                  // filled in Task 1.4
  })), [neos]);
```

- [ ] **Step 3: Manual verification**

Reload. A small object (~30 m) renders ~7 px, a 500 m object ~10 px, a multi-kilometre object ~13 px. The 1036 Ganymed entry (37,800 m in baked data) should be a clearly bigger square.

- [ ] **Step 4: Commit**

```bash
git add components/hud.jsx components/tabs.jsx
git commit -m "feat(neo): marker size encodes diameter (log scale)"
```

---

## Task 1.4: Sync selection between table and polar plot

**Why:** Click a row, the plot's matching marker outlines. Click a marker (or hover), the row scrolls into view and highlights. Bidirectional state binds the two halves into a single instrument.

**Files:**
- Modify: `components/tabs.jsx` (`TabNEO`)
- Modify: `components/hud.jsx` (`HudRadar` needs `onPointClick` and hit-targets on points)

- [ ] **Step 1: Add `onPointClick` + invisible hit pads to `HudRadar`**

In `components/hud.jsx`, inside the `points.map` `<g>`, after the visible rect, append:

```jsx
          {p.id !== undefined && (
            <rect x={x - 10} y={y - 10} width={20} height={20} fill="transparent" style={{ cursor:'pointer' }}
                  onClick={() => p.onClick && p.onClick(p.id)} />
          )}
```

(We attach `onClick` per-point so the radar stays presentational.)

- [ ] **Step 2: Add selection state and ref to `TabNEO`**

After `const hazards = …`:

```jsx
  const [selectedId, setSelectedId] = React.useState(null);
  const rowRefs = React.useRef({});
  const selectPoint = (id) => {
    setSelectedId(id);
    const el = rowRefs.current[id];
    if (el) el.scrollIntoView({ block:'nearest', behavior:'smooth' });
  };
```

Update `neoPoints` to wire `selected` and `onClick`:

```jsx
    selected: n.id === selectedId,
    onClick: selectPoint,
```

(Include `selectedId` in the `useMemo` deps: `[neos, selectedId]`.)

- [ ] **Step 3: Add row ref + selected styling in the table rows**

In the `.map((n, i) =>` row block, change the row's opening `<div>` to:

```jsx
              <div
                key={n.id||i}
                ref={(el) => { if (el) rowRefs.current[n.id] = el; }}
                onClick={() => { setSelectedId(n.id); drawer.open(<NEODetail neo={n} />); }}
                onMouseEnter={() => setSelectedId(n.id)}
                className="hud-clickable"
                style={{
                  display:'grid',
                  gridTemplateColumns:'40px 1fr 60px 70px 70px 40px',
                  gap: 10, padding:'5px 10px',
                  borderBottom:'1px solid var(--hud-hairline-soft)',
                  background: n.id === selectedId
                    ? 'rgba(232,122,42,0.18)'
                    : (n.hazard ? 'rgba(232,122,42,0.08)' : 'transparent'),
                  boxShadow: n.id === selectedId ? 'inset 2px 0 0 var(--hud-accent)' : 'none',
                  cursor:'pointer',
                }}>
```

(`onMouseEnter` previews selection on hover; click commits + opens the drawer. Reduces friction — the row can both preview and open without separate affordances.)

- [ ] **Step 4: Manual verification**

Hover a row → the matching marker on the polar plot gains an accent outline. Click a marker → the matching row highlights and scrolls into view. Click a row → drawer opens; marker stays selected.

- [ ] **Step 5: Commit**

```bash
git add components/hud.jsx components/tabs.jsx
git commit -m "feat(neo): bidirectional selection sync between table and radar"
```

---

## Task 1.5: Legend strip under the polar plot

**Why:** Right now the encoding rules (square = NEO, color = PHA, size = diameter, ring = LD) are invisible to a first-time viewer. NN/g visibility-of-system-status and Refactoring UI's "explain your encoding once, then never again" both call for a one-line legend.

**Files:**
- Modify: `components/tabs.jsx`

- [ ] **Step 1: Insert legend between the radar and the existing footer**

Find the radar's wrapper `<div style={{ flex:1, … }}>` containing the `<HudRadar …/>`, and immediately after that `</div>` (before the `RINGS / SECTORS` footer), add:

```jsx
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap: 14, marginTop: 4, marginBottom: 6 }}>
          <span style={{ display:'flex', alignItems:'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, background:'var(--hud-ink)', display:'inline-block' }} />
            <HudMono size={8} tone="steel">NEO</HudMono>
          </span>
          <span style={{ display:'flex', alignItems:'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, background:'var(--hud-accent)', display:'inline-block' }} />
            <HudMono size={8} tone="steel">PHA</HudMono>
          </span>
          <HudMono size={8} tone="steel">SIZE · ∝ log(DIAMETER)</HudMono>
          <HudMono size={8} tone="steel">RING · MISS DISTANCE</HudMono>
          <HudMono size={8} tone="steel">ANGLE · DAYS FROM TODAY</HudMono>
        </div>
```

- [ ] **Step 2: Manual verification**

Reload. The legend strip reads as one horizontal band of `swatch + label` pairs and free-text encoding hints, clearly subordinate to the plot (smaller type, steel tone).

- [ ] **Step 3: Commit**

```bash
git add components/tabs.jsx
git commit -m "feat(neo): legend strip explains polar plot encoding"
```

---

# BLOCK 2 — Table improvements

## Task 2.1: Add DATE column

**Why:** `n.date` is in the data; users can't see when each approach happens.

**Files:**
- Modify: `components/tabs.jsx` (NEO table header + rows)

- [ ] **Step 1: Update the header grid template + cells**

Replace the existing header block (`gridTemplateColumns:'40px 1fr 60px 70px 70px 40px'` and its 6 columns) with:

```jsx
          <div style={{ background:'#1a1a1a', padding:'4px 10px', display:'grid', gridTemplateColumns:'32px 1fr 78px 56px 60px 70px 32px', gap: 10, flexShrink: 0 }}>
            {[
              ['#', null],
              ['DESIGNATION', null],
              ['DATE', null],
              ['DIA·M', GLOSSARY.dia_m],
              ['V·KM/S', GLOSSARY.v_kms],
              ['MISS·LD', GLOSSARY.miss_ld],
              ['PHA', GLOSSARY.pha],
            ].map(([h, info]) => info ? <Tip key={h} info={info}><HudLabel size={8}>{h}</HudLabel></Tip> : <HudLabel key={h} size={8}>{h}</HudLabel>)}
          </div>
```

- [ ] **Step 2: Update each row's grid template + add the DATE cell**

Inside the row `<div>` (the one from Task 1.4 Step 3), change `gridTemplateColumns` to match the header and insert the date cell between `name` and `diameter_m`:

```jsx
                  gridTemplateColumns:'32px 1fr 78px 56px 60px 70px 32px',
```

And the row's children list becomes:

```jsx
                <HudMono size={9} tone="steel">{String(i+1).padStart(2,'0')}</HudMono>
                <HudMono size={9} tone={n.hazard?'hot':'ink'}>{n.name}</HudMono>
                <HudMono size={9} tone={dayOffset(n.date) === 0 ? 'hot' : 'ink-dim'}>{n.date?.slice(5) /* MM-DD */}</HudMono>
                <HudMono size={9} tone="ink-dim">{n.diameter_m}</HudMono>
                <HudMono size={9} tone="cool">{n.velocity_kms}</HudMono>
                <HudMono size={9} tone={n.hazard?'hot':'ink-dim'}>{n.miss_lunar.toFixed(2)}</HudMono>
                <HudMono size={9} tone={n.hazard?'hot':'steel'}>{n.hazard?'●':'○'}</HudMono>
```

- [ ] **Step 3: Manual verification**

Reload. New `DATE` column appears between `DESIGNATION` and `DIA·M`. Today's approaches highlight in accent.

- [ ] **Step 4: Commit**

```bash
git add components/tabs.jsx
git commit -m "feat(neo): DATE column with today highlighting"
```

---

## Task 2.2: Sortable column headers

**Why:** With 12+ NEOs it should be sortable by date (default), size, velocity, miss-distance. The state stays local to the tab.

**Files:**
- Modify: `components/tabs.jsx`

- [ ] **Step 1: Add `sortBy` state and a sorted derived list**

Right after `const [selectedId, setSelectedId] = React.useState(null);`:

```jsx
  const [sortBy, setSortBy] = React.useState({ key: 'date', dir: 1 });   // 1 = asc, -1 = desc
  const sortedNeos = React.useMemo(() => {
    const get = {
      date: (n) => new Date(n.date || 0).getTime(),
      name: (n) => n.name,
      dia:  (n) => n.diameter_m,
      vel:  (n) => n.velocity_kms,
      miss: (n) => n.miss_lunar,
      pha:  (n) => n.hazard ? 1 : 0,
    }[sortBy.key];
    return [...neos].sort((a, b) => {
      const va = get(a), vb = get(b);
      if (va < vb) return -1 * sortBy.dir;
      if (va > vb) return  1 * sortBy.dir;
      return 0;
    });
  }, [neos, sortBy]);
```

Replace `neos.map((n, i) =>` in the row block with `sortedNeos.map((n, i) =>`.

- [ ] **Step 2: Make headers clickable + show direction arrow**

Replace the header definition with:

```jsx
            {[
              ['#', null, null],
              ['DESIGNATION', null, 'name'],
              ['DATE', null, 'date'],
              ['DIA·M', GLOSSARY.dia_m, 'dia'],
              ['V·KM/S', GLOSSARY.v_kms, 'vel'],
              ['MISS·LD', GLOSSARY.miss_ld, 'miss'],
              ['PHA', GLOSSARY.pha, 'pha'],
            ].map(([h, info, key]) => {
              const active = key && sortBy.key === key;
              const arrow = active ? (sortBy.dir === 1 ? ' ▲' : ' ▼') : '';
              const onClick = key ? () => setSortBy(s => s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }) : undefined;
              const label = (
                <HudLabel size={8} tone={active ? 'hot' : 'steel'} style={{ cursor: key ? 'pointer' : 'default' }}>{h}{arrow}</HudLabel>
              );
              return info
                ? <Tip key={h} info={info}><span onClick={onClick}>{label}</span></Tip>
                : <span key={h} onClick={onClick}>{label}</span>;
            })}
```

- [ ] **Step 3: Manual verification**

Click `DATE` → list resorts ascending by date (default). Click again → descending, arrow flips. Click `MISS·LD` → resorts; row order changes, selection (Task 1.4) still works because rows key on `n.id`.

- [ ] **Step 4: Commit**

```bash
git add components/tabs.jsx
git commit -m "feat(neo): sortable column headers with direction indicator"
```

---

## Task 2.3: Pinned "next approach" row with live countdown

**Why:** The most actionable single fact on this screen is "when's the next one." Pin it above the table, keep it visible regardless of sort.

**Files:**
- Modify: `components/tabs.jsx`

- [ ] **Step 1: Add a 1-Hz tick + next-approach derivation**

Add to `TabNEO` body:

```jsx
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const nextApproach = React.useMemo(() => {
    const upcoming = neos
      .filter(n => n.date)
      .map(n => ({ n, ts: new Date(n.date).getTime() }))
      .filter(x => x.ts >= now - 86400000)        // include today
      .sort((a, b) => a.ts - b.ts);
    return upcoming[0] || null;
  }, [neos, now]);
  const fmtCountdown = (ms) => {
    if (ms <= 0) return 'NOW';
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d}D ${String(h).padStart(2,'0')}H ${String(m).padStart(2,'0')}M`;
  };
```

- [ ] **Step 2: Insert the pinned row above the header**

In `components/tabs.jsx`, immediately before the existing `<div style={{ background:'#1a1a1a', padding:'4px 10px', display:'grid', …` header block, insert:

```jsx
          {nextApproach && (
            <div onClick={() => drawer.open(<NEODetail neo={nextApproach.n} />)}
                 className="hud-clickable"
                 style={{ display:'grid', gridTemplateColumns:'90px 1fr auto', gap: 10, padding:'8px 10px',
                          borderBottom:'1px solid var(--hud-accent)',
                          background:'rgba(232,122,42,0.10)', cursor:'pointer' }}>
              <HudLabel size={8} tone="hot">NEXT APPROACH</HudLabel>
              <HudMono size={11} tone="ink">{nextApproach.n.name}{nextApproach.n.hazard ? ' · PHA' : ''}</HudMono>
              <HudValue size={14} tone="hot" style={{ fontVariantNumeric:'tabular-nums' }}>{fmtCountdown(nextApproach.ts - now)}</HudValue>
            </div>
          )}
```

- [ ] **Step 3: Manual verification**

A countdown row appears above the table, ticking once per second. Clicking opens the drawer for that NEO. If the baked data is all in the past, the row hides (graceful).

- [ ] **Step 4: Commit**

```bash
git add components/tabs.jsx
git commit -m "feat(neo): pinned next-approach row with live countdown"
```

---

## Task 2.4: Sortable header hover affordance + cursor

**Why:** Headers are clickable but look identical to labels. Add a dotted underline so the affordance is recognizable (NN/g recognition over recall).

**Files:**
- Modify: `styles/hud.css`
- Modify: `components/tabs.jsx` (apply class)

- [ ] **Step 1: Add a utility class to `styles/hud.css`**

Append:

```css
.hud-sort-h { border-bottom: 1px dotted var(--hud-steel-dim); padding-bottom: 1px; transition: border-color 0.15s ease; }
.hud-sort-h:hover { border-color: var(--hud-accent); }
```

- [ ] **Step 2: Apply the class to the sortable header labels**

In the headers' `.map(([h, info, key]) => …)` from Task 2.2, change the `<HudLabel … />` line to:

```jsx
              const label = (
                <HudLabel size={8} tone={active ? 'hot' : 'steel'}
                          className={key ? 'hud-sort-h' : undefined}
                          style={{ cursor: key ? 'pointer' : 'default' }}>
                  {h}{arrow}
                </HudLabel>
              );
```

Note: `HudLabel` must forward `className` — quick check `components/hud.jsx` to confirm. If it doesn't, wrap in a `<span className="hud-sort-h">…</span>`.

- [ ] **Step 3: Manual verification**

Hover a sortable header → dotted underline shifts to accent color. Non-sortable `#` column has no underline.

- [ ] **Step 4: Commit**

```bash
git add styles/hud.css components/tabs.jsx
git commit -m "feat(neo): dotted underline affordance on sortable headers"
```

---

# BLOCK 3 — KPI tile replacement

## Task 3.1: Replace TOTAL · HAZARD · CLOSEST with mission-relevant tiles

**Why:** `TOTAL` duplicates the status bar's `NEOS·4`. The other two are passable but not actionable. Replace with NEXT · CLOSEST·7D · LARGEST·7D, each carrying a name + secondary fact.

**Files:**
- Modify: `components/tabs.jsx`

- [ ] **Step 1: Add `largest` and `closest` derived values**

In `TabNEO`, after `const nextApproach = …`, add:

```jsx
  const closestPass = React.useMemo(
    () => neos.length ? neos.reduce((a, b) => a.miss_lunar < b.miss_lunar ? a : b) : null,
    [neos]
  );
  const largestObject = React.useMemo(
    () => neos.length ? neos.reduce((a, b) => a.diameter_m > b.diameter_m ? a : b) : null,
    [neos]
  );
  const compareSize = (m) => {
    if (m >= 8000) return '≈ Mt Everest';
    if (m >= 800)  return '≈ Burj Khalifa';
    if (m >= 300)  return '≈ Empire State';
    if (m >= 90)   return '≈ Statue of Liberty';
    if (m >= 20)   return '≈ Boeing 737';
    return '≈ House';
  };
```

- [ ] **Step 2: Replace the KPI block**

Find:

```jsx
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 14, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14, flexShrink: 0 }}>
          {[
            ['TOTAL', neos.length, 'cool'],
            ['HAZARD', hazards.length, 'hot'],
            ['CLOSEST', Math.min(...neos.map(n=>n.miss_lunar)).toFixed(2)+'LD', 'hot'],
          ].map(([l,v,t], i) => (
            <div key={i} className="hud-bracket-4" style={{ padding: 16, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'flex-start' }}>
              <HudLabel size={9}>{l}</HudLabel>
              <HudValue size={42} tone={t}>{v}</HudValue>
            </div>
          ))}
        </div>
```

Replace with:

```jsx
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 14, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14, flexShrink: 0 }}>
          <div className="hud-bracket-4" style={{ padding: 14, display:'flex', flexDirection:'column', gap: 4 }}>
            <HudLabel size={9}>NEXT APPROACH</HudLabel>
            <HudValue size={28} tone="hot" style={{ fontVariantNumeric:'tabular-nums' }}>
              {nextApproach ? fmtCountdown(nextApproach.ts - now) : '—'}
            </HudValue>
            <HudMono size={9} tone="steel">{nextApproach?.n.name || 'NO UPCOMING'}</HudMono>
          </div>
          <div className="hud-bracket-4" style={{ padding: 14, display:'flex', flexDirection:'column', gap: 4 }}>
            <HudLabel size={9}>CLOSEST PASS · 7D</HudLabel>
            <HudValue size={28} tone={closestPass?.hazard ? 'hot' : 'cool'} style={{ fontVariantNumeric:'tabular-nums' }}>
              {closestPass ? `${closestPass.miss_lunar.toFixed(2)} LD` : '—'}
            </HudValue>
            <HudMono size={9} tone="steel">{closestPass?.name || ''}{closestPass?.hazard ? ' · PHA' : ''}</HudMono>
          </div>
          <div className="hud-bracket-4" style={{ padding: 14, display:'flex', flexDirection:'column', gap: 4 }}>
            <HudLabel size={9}>LARGEST · 7D</HudLabel>
            <HudValue size={28} tone="ink" style={{ fontVariantNumeric:'tabular-nums' }}>
              {largestObject ? `${largestObject.diameter_m.toLocaleString()} M` : '—'}
            </HudValue>
            <HudMono size={9} tone="steel">{largestObject ? `${largestObject.name} · ${compareSize(largestObject.diameter_m)}` : ''}</HudMono>
          </div>
        </div>
```

- [ ] **Step 3: Manual verification**

The bottom strip now reads `NEXT APPROACH 0D 14H 03M / Apophis` · `CLOSEST PASS 0.78 LD / 2023 BU9 · PHA` · `LARGEST 37,800 M / 1036 Ganymed ≈ Mt Everest`. Tabular-nums prevents digit-jitter.

- [ ] **Step 4: Commit**

```bash
git add components/tabs.jsx
git commit -m "feat(neo): mission-relevant KPI triplet (next/closest/largest)"
```

---

# BLOCK 4 — Extend with NASA APIs

## Task 4.1: Use `close_approach_date_full` for hour-precision

**Why:** NeoWs already returns `close_approach_date_full` (e.g. `"2026-04-18 14:32"`) alongside the day-only `close_approach_date`. Adopting it gives the countdown hour precision and lets the polar plot bucket by hour-of-day on the today wedge.

**Files:**
- Modify: `data/api-client.js` (read `close_approach_date_full`)
- Modify: `components/tabs.jsx` (`dayOffset` accepts datetime)

- [ ] **Step 1: Extend the NeoWs mapper**

In `data/api-client.js:28-37` (the `close_approach_data` mapper), add:

```js
        date_full: ca?.close_approach_date_full || ca?.close_approach_date || today,
```

Keep `date` for backwards compat. Bump the file's `?v=` cache-buster in `NASA Dashboard.html`.

- [ ] **Step 2: Bake `date_full` into the fallback data**

In `data/nasa.js:52-63` (the `neos:` array), add `date_full` to each row matching the existing `date` (use `"YYYY-MM-DD 12:00"` as a sensible default if no real time available). Example:

```js
    { id: '2523656', name: '2023 FY14',  diameter_m: 142, velocity_kms: 18.32, miss_km: 4_281_992, miss_lunar: 11.14, hazard: false, date: '2026-04-18', date_full: '2026-04-18 14:32' },
```

Repeat for all 12 entries. Bump `data/nasa.js?v=` in `NASA Dashboard.html`.

- [ ] **Step 3: Consume `date_full` in `TabNEO`**

Replace the `nextApproach` `ts` calc:

```jsx
      .map(n => ({ n, ts: new Date(n.date_full || n.date).getTime() }))
```

And `dayOffset`:

```jsx
  const dayOffset = (iso) => {
    if (!iso) return 0;
    const d = new Date(iso); d.setUTCHours(0,0,0,0);
    return Math.max(0, Math.min(7, (d - today) / 86400000));
  };
```

(No change actually needed if we always normalize to midnight — but keep it date-string-tolerant.)

- [ ] **Step 4: Manual verification**

Countdown now ticks at second resolution toward the actual hour of approach. Reload — fallback baked-in `date_full` values render correctly.

- [ ] **Step 5: Commit**

```bash
git add data/api-client.js data/nasa.js "NASA Dashboard.html" components/tabs.jsx
git commit -m "feat(neo): hour-precision approach times via close_approach_date_full"
```

---

## Task 4.2: Lazy-fetch orbital data for the selected NEO

**Why:** NeoWs's per-object endpoint (`/neo/{id}?api_key=…`) returns `orbital_data` including `orbit_class.orbit_class_type` (AMOR / APOLLO / ATEN / ATIRA), eccentricity, inclination, first/last observation date. Surface in the `NEODetail` drawer.

**Files:**
- Modify: `data/api-client.js` (new fetcher + cache)
- Modify: `components/extras.jsx` (`NEODetail` consumes it)

- [ ] **Step 1: Add `fetchNeoOrbitalData(id)` to `data/api-client.js`**

```js
const __orbCache = new Map();
async function fetchNeoOrbitalData(id) {
  if (!id) return null;
  if (__orbCache.has(id)) return __orbCache.get(id);
  try {
    const key = (window.NASA_KEY || 'DEMO_KEY');
    const r = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${key}`);
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    const out = {
      class: j.orbital_data?.orbit_class?.orbit_class_type || null,
      class_desc: j.orbital_data?.orbit_class?.orbit_class_description || null,
      ecc: j.orbital_data?.eccentricity ? +(+j.orbital_data.eccentricity).toFixed(3) : null,
      inc: j.orbital_data?.inclination ? +(+j.orbital_data.inclination).toFixed(2) : null,
      a:   j.orbital_data?.semi_major_axis ? +(+j.orbital_data.semi_major_axis).toFixed(3) : null,
      first_obs: j.orbital_data?.first_observation_date || null,
      last_obs:  j.orbital_data?.last_observation_date || null,
      jpl_url:   j.nasa_jpl_url || null,
    };
    __orbCache.set(id, out);
    return out;
  } catch (e) { __orbCache.set(id, null); return null; }
}
Object.assign(window.NASA_API || (window.NASA_API = {}), { fetchNeoOrbitalData });
```

Bump `data/api-client.js?v=` in `NASA Dashboard.html`.

- [ ] **Step 2: Consume in `NEODetail`**

In `components/extras.jsx`, find `NEODetail` (the component opened by row click). Add a `useEffect` to lazy-load orbital data, render new rows when available:

```jsx
const NEODetail = ({ neo }) => {
  const [orb, setOrb] = React.useState(null);
  React.useEffect(() => {
    if (window.NASA_API?.fetchNeoOrbitalData) {
      window.NASA_API.fetchNeoOrbitalData(neo.id).then(setOrb);
    }
  }, [neo.id]);
  // …existing render…
  // Inside the drawer body, after the existing rows, add:
  // {orb && <>
  //   <DrawerRow label="Orbit class" value={orb.class || '—'} />
  //   <DrawerRow label="Eccentricity" value={orb.ecc ?? '—'} />
  //   <DrawerRow label="Inclination" value={orb.inc ? `${orb.inc}°` : '—'} />
  //   <DrawerRow label="Semi-major axis" value={orb.a ? `${orb.a} AU` : '—'} />
  //   <DrawerRow label="First observed" value={orb.first_obs || '—'} />
  //   <DrawerRow label="Last observed" value={orb.last_obs || '—'} />
  // </>}
};
```

(Read the existing `NEODetail` first to find the exact insertion point — it currently uses `DrawerRow` helpers.)

- [ ] **Step 3: Manual verification**

Open a row's drawer. After a brief delay (single fetch), six new rows appear. Network throttle in DevTools → confirm the drawer renders immediately with existing data and the orbital rows fill in after.

- [ ] **Step 4: Commit**

```bash
git add data/api-client.js components/extras.jsx "NASA Dashboard.html"
git commit -m "feat(neo): lazy-fetch orbital_data per NEO with session cache"
```

---

## Task 4.3: Sentry impact-risk overlay

**Why:** JPL Sentry (`https://ssd-api.jpl.nasa.gov/sentry.api`) lists every risk-listed object with Palermo / Torino scale values and impact probabilities. When an object on the displayed list appears in Sentry, show a red `RISK·LISTED` chip on the row and the corresponding fields in the drawer.

**Files:**
- Modify: `data/api-client.js`
- Modify: `components/tabs.jsx` (row chip)
- Modify: `components/extras.jsx` (drawer fields)

- [ ] **Step 1: Add `fetchSentryAll()` to `data/api-client.js`**

```js
let __sentryCache = null;
async function fetchSentryAll() {
  if (__sentryCache) return __sentryCache;
  try {
    const r = await fetch('https://ssd-api.jpl.nasa.gov/sentry.api?all=1');
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    // Index by designation for fast lookup
    __sentryCache = {};
    (j.data || []).forEach(row => {
      __sentryCache[row.des] = {
        ip: +row.ip,             // cumulative impact probability
        ps: +row.ps_cum,         // Palermo scale
        ts: row.ts_max ? +row.ts_max : 0,  // Torino scale (max)
        range: row.range,        // year range, e.g. "2026-2095"
      };
    });
    return __sentryCache;
  } catch (e) { __sentryCache = {}; return __sentryCache; }
}
Object.assign(window.NASA_API, { fetchSentryAll });
```

- [ ] **Step 2: Load Sentry in `DataProvider`**

In `components/chrome.jsx:18-24` (the `useEffect` with the parallel fetches), add:

```jsx
    window.NASA_API.fetchSentryAll().then(d => setSentry(d || {}));
```

And add the state at the top of `DataProvider`:

```jsx
  const [sentry, setSentry] = React.useState({});
```

Include `sentry` in the `value = {…}` object so `useData()` consumers can read it.

- [ ] **Step 3: Display chip + drawer fields**

In `TabNEO`'s row, after the PHA dot, conditionally render a Sentry chip:

```jsx
                {sentry[n.name] && (
                  <HudChip tone="hot" solid style={{ marginLeft: 4 }}>RISK</HudChip>
                )}
```

(Sentry uses the designation in the form `2015 XK351` — same as `n.name`. If your data normalizes differently, adjust the key.)

In `NEODetail`, add a conditional block:

```jsx
  const sentry = useData().sentry?.[neo.name];
  // …inside the drawer…
  // {sentry && <>
  //   <DrawerRow label="Sentry IP" value={sentry.ip.toExponential(2)} />
  //   <DrawerRow label="Palermo scale" value={sentry.ps.toFixed(2)} />
  //   <DrawerRow label="Torino scale" value={sentry.ts} />
  //   <DrawerRow label="Risk window" value={sentry.range} />
  // </>}
```

- [ ] **Step 4: Add Glossary entries**

In `components/extras.jsx`'s `GLOSSARY`:

```js
  sentry_ip: 'Sentry impact probability — cumulative chance of Earth impact across all observed close approaches in the next century. 1e-4 means a 1-in-10,000 chance.',
  palermo:   'Palermo Technical Hazard Scale — log of risk-to-background. 0 = average risk for an object of that size; positive numbers are above background.',
  torino:    'Torino Scale — 0 to 10 categorical impact-hazard rating. 0 = no concern; 10 = certain impact, global consequences.',
```

- [ ] **Step 5: Manual verification**

Throttle network to slow 3G, reload. Page renders with empty Sentry; after a few seconds the `RISK` chip appears on any matching row. Block the network entirely → no chip, no errors. Open the drawer for a known Sentry-listed object (e.g. Bennu — `101955`, in real data) and verify the four risk rows render.

- [ ] **Step 6: Commit**

```bash
git add data/api-client.js components/chrome.jsx components/tabs.jsx components/extras.jsx "NASA Dashboard.html"
git commit -m "feat(neo): Sentry impact-risk overlay + drawer fields"
```

---

## Task 4.4: JPL Small-Body Database deep link

**Why:** Every NeoWs response carries `nasa_jpl_url`. Add a discreet "▸ JPL DETAIL" link in the drawer.

**Files:**
- Modify: `components/extras.jsx` (`NEODetail`)

- [ ] **Step 1: Render `orb.jpl_url` as a footer link**

In `NEODetail`, after the existing rows (and after orbital rows from 4.2), append:

```jsx
  {orb?.jpl_url && (
    <a href={orb.jpl_url} target="_blank" rel="noopener" style={{ textDecoration:'none' }}>
      <HudMono size={9} tone="hot" style={{ display:'block', marginTop: 12 }}>▸ JPL SMALL-BODY DATABASE</HudMono>
    </a>
  )}
```

- [ ] **Step 2: Manual verification**

Open a NEO drawer with orbital data loaded. A hot-toned link appears at the bottom. Clicking opens JPL's SBDB page in a new tab.

- [ ] **Step 3: Commit**

```bash
git add components/extras.jsx
git commit -m "feat(neo): JPL Small-Body Database deep-link in drawer"
```

---

## Task 4.5: Date-range picker (TODAY / +3D / +7D / +30D)

**Why:** NeoWs `feed` endpoint supports `start_date` + `end_date` up to 7 days. For 30-day views we'd need stitched requests; defer that. For now allow TODAY, +3D, +7D as zero-cost since they slice the existing default request.

**Files:**
- Modify: `data/api-client.js` (`fetchNEOs` accepts `days`)
- Modify: `components/chrome.jsx` (`DataProvider` exposes `setNeoDays`)
- Modify: `components/tabs.jsx` (chip group above the radar)

- [ ] **Step 1: Parameterize `fetchNEOs(days = 7)`**

In `data/api-client.js`, replace the existing `fetchNEOs` to accept a `days` arg and compute `start_date`/`end_date` accordingly (max 7 per NeoWs limits — clamp).

(Quote the exact current implementation here when implementing — the current `fetchNEOs` body is short.)

- [ ] **Step 2: Expose a setter in `DataProvider`**

Track a `neoDays` state, refetch on change:

```jsx
  const [neoDays, setNeoDays] = React.useState(7);
  React.useEffect(() => {
    window.NASA_API.fetchNEOs(neoDays).then(d => { setNeos(d); setLoading(l => ({...l, neos:false})); });
  }, [neoDays]);
```

Add `neoDays` + `setNeoDays` to the context value.

- [ ] **Step 3: Render a chip group above the polar plot**

In `TabNEO`, just below the `NEO · POLAR PLOT` header row, add:

```jsx
        <div style={{ display:'flex', gap: 6, marginTop: 6, marginBottom: 6 }}>
          {[1, 3, 7].map(d => (
            <HudChip key={d}
                     tone={neoDays === d ? 'hot' : 'steel'}
                     solid={neoDays === d}
                     onClick={() => setNeoDays(d)}
                     style={{ cursor:'pointer' }}>
              {d}D
            </HudChip>
          ))}
        </div>
```

(Adjust `dayOffset`'s upper bound to `neoDays`, and `sectors` on `HudRadar` to `neoDays`.)

- [ ] **Step 4: Manual verification**

Default is 7D. Click 1D → table + radar collapse to today only. Click 3D → 3-day window. Network tab confirms a single fetch fires per range change (cache could be added later).

- [ ] **Step 5: Commit**

```bash
git add data/api-client.js components/chrome.jsx components/tabs.jsx "NASA Dashboard.html"
git commit -m "feat(neo): date-range picker (1/3/7 days) drives table + radar"
```

---

# BLOCK 5 — Ambient motion + alternate view

## Task 5.1: Past-position trails (faint dotted track)

**Why:** Existing dashboard has ambient motion everywhere (`ScanField`, spinning rings, ticker counters). The polar plot is static. Add a 6-segment dotted trail behind each marker pointing toward "yesterday's position" (synthetic — we don't have hourly history). Pure aesthetic; reinforces direction-of-approach.

**Files:**
- Modify: `components/hud.jsx` (`HudRadar` points accept `trailFrom`)
- Modify: `components/tabs.jsx` (compute trail anchor)

- [ ] **Step 1: Extend `HudRadar` to draw trails**

In `components/hud.jsx`, before the rect render in `points.map`, add:

```jsx
          {p.trailFrom && (() => {
            const a0 = (p.trailFrom.angle || 0) * Math.PI * 2 - Math.PI / 2;
            const r0 = (p.trailFrom.r || 0) * R;
            const x0 = cx + Math.cos(a0) * r0, y0 = cy + Math.sin(a0) * r0;
            return <line x1={x0} y1={y0} x2={x} y2={y} stroke={dim} strokeWidth="1" strokeDasharray="1 3" opacity="0.6" />;
          })()}
```

- [ ] **Step 2: Compute synthetic trail anchor in `TabNEO`**

In the `neoPoints` map, add:

```jsx
    trailFrom: { angle: dayOffset(n.date) / 7 - 1/7, r: ldToRadius(n.miss_lunar * 1.4) / RADAR_R },
```

(Anchors one day earlier and slightly farther out — "approaching from outside, last position one day ago.")

- [ ] **Step 3: Manual verification**

Reload. Faint dotted segments lead from outside the rings into each marker. Selection still readable.

- [ ] **Step 4: Commit**

```bash
git add components/hud.jsx components/tabs.jsx
git commit -m "feat(neo): synthetic approach trails behind markers"
```

---

## Task 5.2: Alternate view — energy vs miss-distance scatter

**Why:** Polar chronograph is excellent for "when." Some users want "how dangerous." A toggle to a Cartesian scatter of `kinetic_energy_kt` (½·m·v², m from diameter assuming chondrite density) vs `miss_lunar` is the canonical threat plot.

**Files:**
- Modify: `components/hud.jsx` (new `HudScatter` primitive, optional)
- Modify: `components/tabs.jsx` (view toggle + scatter)

- [ ] **Step 1: Add a tiny `HudScatter` primitive in `components/hud.jsx`**

```jsx
const HudScatter = ({ size = 420, points = [], xLabel, yLabel, xRange = [0, 1], yRange = [0, 1], style = {} }) => {
  const pad = 28; const W = size, H = size; const innerW = W - pad*2, innerH = H - pad*2;
  const sx = (v) => pad + ((v - xRange[0]) / (xRange[1] - xRange[0])) * innerW;
  const sy = (v) => H - pad - ((v - yRange[0]) / (yRange[1] - yRange[0])) * innerH;
  return (
    <svg width={W} height={H} style={style}>
      <line x1={pad} y1={H-pad} x2={W-pad} y2={H-pad} stroke="var(--hud-hairline)" />
      <line x1={pad} y1={pad} x2={pad} y2={H-pad} stroke="var(--hud-hairline)" />
      {points.map((p, i) => (
        <g key={i}>
          <rect x={sx(p.x) - (p.size||4)/2} y={sy(p.y) - (p.size||4)/2} width={p.size||4} height={p.size||4}
                fill={p.hot ? 'var(--hud-accent)' : 'var(--hud-ink)'} stroke={p.selected ? 'var(--hud-accent)' : 'transparent'} strokeWidth={p.selected ? 1.5 : 0} />
          {p.label && <text x={sx(p.x) + 6} y={sy(p.y) + 3} fontSize="8" fontFamily="var(--font-mono)" fill="var(--hud-ink-dim)">{p.label}</text>}
        </g>
      ))}
      {xLabel && <text x={W-pad} y={H-6} fontSize="8" textAnchor="end" fontFamily="var(--font-mono)" fill="var(--hud-steel)" letterSpacing="1">{xLabel}</text>}
      {yLabel && <text x={pad+2} y={pad-6} fontSize="8" fontFamily="var(--font-mono)" fill="var(--hud-steel)" letterSpacing="1">{yLabel}</text>}
    </svg>
  );
};
```

Export via the `Object.assign(window, { … HudScatter })` at the bottom of `components/hud.jsx`.

- [ ] **Step 2: Add view toggle + scatter in `TabNEO`**

State + toggle UI:

```jsx
  const [view, setView] = React.useState('polar');
  // …
  // Above the radar:
  <div style={{ display:'flex', gap: 4, marginLeft: 'auto' }}>
    <HudChip tone={view==='polar' ? 'hot' : 'steel'} solid={view==='polar'} onClick={() => setView('polar')} style={{ cursor:'pointer' }}>POLAR</HudChip>
    <HudChip tone={view==='energy' ? 'hot' : 'steel'} solid={view==='energy'} onClick={() => setView('energy')} style={{ cursor:'pointer' }}>ENERGY</HudChip>
  </div>
```

Energy points (chondrite ρ ≈ 2600 kg/m³):

```jsx
  const energyPoints = React.useMemo(() => neos.map(n => {
    const r = n.diameter_m / 2;
    const mass = (4/3) * Math.PI * r*r*r * 2600;             // kg
    const ke_j = 0.5 * mass * (n.velocity_kms * 1000) ** 2;  // joules
    const kt   = ke_j / 4.184e12;                            // kilotons TNT
    return {
      id: n.id,
      x: Math.log10(Math.max(0.5, n.miss_lunar)),
      y: Math.log10(Math.max(1e-3, kt)),
      label: n.name.split(' ').pop().slice(0,4),
      hot: n.hazard,
      size: 4 + Math.log10(Math.max(1, n.diameter_m)) * 2,
      selected: n.id === selectedId,
    };
  }), [neos, selectedId]);
```

Conditional render:

```jsx
  {view === 'polar'
    ? <HudRadar … />
    : <HudScatter size={RADAR_SIZE} points={energyPoints}
                  xLabel="log₁₀ MISS·LD" yLabel="log₁₀ ENERGY·KT"
                  xRange={[-1, 2]} yRange={[-3, 6]} />
  }
```

- [ ] **Step 3: Manual verification**

Toggle to ENERGY. Tunguska-class objects (~10–15 Mt) sit at y≈7; chips at y≈-1. The Apophis-class entries cluster around 1–3 Gt depending on velocity. Selection still syncs with the table.

- [ ] **Step 4: Commit**

```bash
git add components/hud.jsx components/tabs.jsx
git commit -m "feat(neo): alternate energy-vs-miss-distance scatter view"
```

---

## Self-Review

**1. Spec coverage:**
- Block 1 — polar plot semantics: Tasks 1.1 (angle = date), 1.2 (radius = LD), 1.3 (size = diameter), 1.4 (selection sync), 1.5 (legend) ✓
- Block 2 — table: 2.1 (date column), 2.2 (sortable), 2.3 (pinned next-approach + countdown), 2.4 (hover affordance) ✓
- Block 3 — KPI replacement: 3.1 (NEXT / CLOSEST·7D / LARGEST·7D) ✓
- Block 4 — NASA APIs: 4.1 (`close_approach_date_full`), 4.2 (orbital data lazy fetch), 4.3 (Sentry), 4.4 (JPL link), 4.5 (date-range picker) ✓
- Block 5 — secondary: 5.1 (trails), 5.2 (energy scatter) ✓

**2. Placeholder scan:**
- Task 4.2 Step 2's drawer insertion uses a commented "find the insertion point" instruction rather than the literal old/new strings. **Reason:** I haven't read the current `NEODetail` body in this plan-writing pass; the implementer must read `components/extras.jsx:442` first and slot the new rows between existing `DrawerRow` calls. This is acceptable per the skill's guidance (steps reference specific files) but flagged here for honesty. Same applies to Task 4.3 Step 3's drawer block.
- Task 4.5 Step 1 says "Quote the exact current implementation here when implementing" — the implementer must read `data/api-client.js`'s current `fetchNEOs` body and parameterize it. No way to pre-quote without reading at write time.

**3. Type consistency:**
- `neoPoints` shape: `{ id, angle, r, label, hot, size, selected, onClick, trailFrom }` — all fields land in `HudRadar`'s point map exactly once.
- `nextApproach` shape: `{ n, ts }` — both consumers (Task 2.3 pinned row, Task 3.1 KPI tile) read `nextApproach.n` and `nextApproach.ts`.
- `sentry` indexed by `n.name`: used in both `TabNEO` row chip and `NEODetail` drawer.

**4. Verification posture:**
- No test runner exists, so every task ends in a "Manual verification" step with specific expected visual outcomes.
- Network-degrading tasks (4.2, 4.3, 4.5) explicitly call out throttle / offline behavior to catch silent failures.

---

## Notes for the implementer

- **Order:** Run Block 1 fully before touching Block 2 — Block 2's row layout assumes the selection state added in Task 1.4. Block 3 depends on the `nextApproach` from Task 2.3. Blocks 4 and 5 are independent and can be done in any order.
- **Cache-busters:** Every time `data/nasa.js` or `data/api-client.js` changes shape, bump `?v=` in `NASA Dashboard.html` — the existing build conventions in `CLAUDE.md` are clear about this.
- **HudRadar's existing callers:** Globe tab and Overview tab use `HudRadar` too — confirm with `grep -n HudRadar components/` that the new optional props (`customRings`, `ringLabels`, point's `size`/`selected`/`onClick`/`trailFrom`) are all backwards-compatible. They are by design (every new prop is opt-in).
- **`HudLabel` className forwarding:** Task 2.4 assumes `HudLabel` forwards `className`. If not, wrap in `<span>` — the skill prescribes the fallback inline. Same for `HudChip` `onClick` in Task 4.5.
- **Sentry designation matching:** Sentry's `des` field is the IAU designation. NeoWs's `name` is sometimes parenthesized (`"(2015 XK351)"`). Add a normalizer (`name.replace(/[()]/g, '').trim()`) if matches come back empty.
