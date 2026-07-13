// ─────────────────────────────────────────────────────────────
// Unified NASA HUD — tabbed dashboard, hero-dominant (A) with
// radial analysis views (C). Live APIs via NASA_API client.
// Ambient motion everywhere.
// ─────────────────────────────────────────────────────────────

// ── Shared data context ──────────────────────────────────────
const DataCtx = React.createContext(null);

function DataProvider({ children }) {
  const [apod, setApod] = React.useState(window.NASA.apod);
  const [neos, setNeos] = React.useState(window.NASA.neos);
  const [donki, setDonki] = React.useState(window.NASA.donki);
  const [epic, setEpic] = React.useState({ meta: window.NASA.epic, url: null });
  const [marsPhotos, setMarsPhotos] = React.useState(null);
  const [sentry, setSentry] = React.useState({});
  const [neoDays, setNeoDays] = React.useState(7);
  const [loading, setLoading] = React.useState({ apod: true, neos: true, donki: true, epic: true, marsPhotos: true });

  React.useEffect(() => {
    window.NASA_API.fetchAPOD().then(d => { setApod(d); setLoading(l => ({...l, apod:false})); });
    window.NASA_API.fetchDONKI().then(d => { setDonki(d); setLoading(l => ({...l, donki:false})); });
    window.NASA_API.fetchEPIC().then(d => { setEpic(d); setLoading(l => ({...l, epic:false})); });
    window.NASA_API.fetchMarsPhotos().then(d => { setMarsPhotos(d); setLoading(l => ({...l, marsPhotos:false})); });
    window.NASA_API.fetchSentryAll?.().then(d => setSentry(d || {}));
  }, []);

  React.useEffect(() => {
    setLoading(l => ({...l, neos:true}));
    window.NASA_API.fetchNEOs(neoDays).then(d => { setNeos(d); setLoading(l => ({...l, neos:false})); });
  }, [neoDays]);

  // Pick one curated deep-sky image for the session — stable across tab switches
  const [deepsky] = React.useState(() => {
    const list = window.NASA.deepsky || [];
    return list[Math.floor(Math.random() * list.length)] || null;
  });

  const value = { apod, neos, donki, epic, marsPhotos, sentry, neoDays, setNeoDays, loading, iss: window.NASA.iss, mars: window.NASA.mars, exoplanets: window.NASA.exoplanets, fireballs: window.NASA.fireballs, deepsky };
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

const useData = () => React.useContext(DataCtx);

// ── Live ISS simulation (ticks every second for motion) ─────
function useLiveISS() {
  const [t, setT] = React.useState(Date.now());
  React.useEffect(() => { const id = setInterval(() => setT(Date.now()), 1000); return () => clearInterval(id); }, []);
  const base = window.NASA.iss;
  // orbital period ~92 min; fake a drift
  const dt = (t / 1000) % 5520;
  const lat = Math.sin(dt / 880) * 51.6;
  const lon = ((t / 1000 / 15.3) % 360) - 180;
  const alt = base.altitude_km + Math.sin(dt / 400) * 1.8;
  const vel = base.velocity_kmh + Math.sin(dt / 300) * 12;
  return { ...base, latitude: +lat.toFixed(4), longitude: +lon.toFixed(4), altitude_km: +alt.toFixed(2), velocity_kmh: +vel.toFixed(1) };
}

// ── Ambient scan line overlay ───────────────────────────────
const ScanField = () => (
  <>
    <style>{`
      @keyframes hud-scan-v { 0% { transform: translateY(-10%); opacity: 0 } 8% { opacity: 1 } 92% { opacity: 1 } 100% { transform: translateY(110%); opacity: 0 } }
      @keyframes hud-sweep-h { 0% { transform: translateX(-10%); opacity: 0 } 8% { opacity: 0.6 } 92% { opacity: 0.6 } 100% { transform: translateX(110%); opacity: 0 } }
    `}</style>
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:0, right:0, height: 2, background:'linear-gradient(to right, transparent, var(--hud-accent), transparent)', opacity: 0.8, animation:'hud-scan-v 7s linear infinite' }} />
      <div style={{ position:'absolute', top:0, bottom:0, width: 1, background:'linear-gradient(to bottom, transparent, rgba(245,241,232,0.3), transparent)', animation:'hud-sweep-h 11s linear infinite' }} />
    </div>
  </>
);

// ── Ticking counter (digits roll) ────────────────────────────
const Ticker = ({ value, size = 20, digits = 4, tone = 'ink' }) => {
  const [display, setDisplay] = React.useState(value);
  React.useEffect(() => {
    const step = (value - display) / 8;
    if (Math.abs(step) < 0.001) { setDisplay(value); return; }
    const t = setTimeout(() => setDisplay(display + step), 40);
    return () => clearTimeout(t);
  }, [value, display]);
  const str = display.toFixed(Math.max(0, digits - String(Math.floor(Math.abs(display))).length));
  return <HudValue size={size} tone={tone}>{str}</HudValue>;
};

// ═════════════════════════════════════════════════════════════
// CHROME — app frame, header, tabs, status bar
// ═════════════════════════════════════════════════════════════

const Chrome = ({ tab, setTab, children }) => {
  const { apod, loading } = useData();
  const [onlineBlink, setOnlineBlink] = React.useState(true);
  React.useEffect(() => { const id = setInterval(() => setOnlineBlink(b => !b), 900); return () => clearInterval(id); }, []);
  const anyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="hud hud-frame" style={{ width:'100%', height:'100%', display:'grid', gridTemplateRows:'60px 30px 1fr 28px', boxSizing:'border-box', padding: 14 }}>
      {/* HEADER */}
      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr 280px', alignItems:'center', gap: 16, borderBottom:'1px solid var(--hud-hairline)' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
          <svg width="34" height="34" viewBox="0 0 100 100" fill="none" stroke="var(--hud-ink)" strokeWidth="2">
            <path d="M50 8 L92 82 L8 82 Z" />
            <circle cx="50" cy="62" r="7" fill="var(--hud-accent)" stroke="none" />
            <line x1="28" y1="82" x2="72" y2="82" stroke="var(--hud-accent)" strokeWidth="4" />
          </svg>
          <div>
            <HudValue size={24} weight={300}>ONLINE</HudValue>
            <div style={{ display:'flex', gap:6, alignItems:'center', marginTop: 2 }}>
              <div style={{ width: 6, height: 6, background: onlineBlink ? 'var(--hud-accent)' : 'transparent', border:'1px solid var(--hud-accent)' }} />
              <HudLabel size={8} tone="hot">TET·VISION · V2.4</HudLabel>
            </div>
          </div>
        </div>

        <div style={{ textAlign:'center', display:'flex', flexDirection:'column', gap:3 }}>
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap: 16 }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--hud-ink)" strokeWidth="1" style={{ animation:'hud-rot 24s linear infinite', transformOrigin:'center' }}>
              <circle cx="10" cy="10" r="9" /><circle cx="10" cy="10" r="4" /><line x1="10" y1="1" x2="10" y2="19" /><line x1="1" y1="10" x2="19" y2="10" />
            </svg>
            <Tip info={GLOSSARY.dsn}><HudLabel size={14} track={0.4} tone="primary">NASA · DEEP SPACE NETWORK</HudLabel></Tip>
            <HudChip tone={anyLoading ? 'cool' : 'hot'} solid={!anyLoading}>{anyLoading ? 'SYNC' : 'LIVE'}</HudChip>
          </div>
          <Tip info={GLOSSARY.session}><HudMono size={9} tone="steel">SESSION {Math.floor(Date.now()/1000).toString(16).slice(-8).toUpperCase()} · STATION·14 · MADRID DSN</HudMono></Tip>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
          <HudClock size={24} />
          <HudMono size={9} tone="steel">UTC · MD <HudMissionDay /></HudMono>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', alignItems:'stretch', borderBottom:'1px solid var(--hud-hairline)' }}>
        {[
          { k: 'overview', label: 'OVERVIEW',     id: '01' },
          { k: 'earth',    label: 'EARTH·OBS',    id: '02' },
          { k: 'neo',      label: 'NEO·TRACK',    id: '03' },
          { k: 'solar',    label: 'SPACE·WX',     id: '04' },
          { k: 'deep',     label: 'DEEP·SPACE',   id: '05' },
          { k: 'mars',     label: 'MARS',         id: '06' },
        ].map((t, i) => {
          const active = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              flex: 1, background: active ? 'rgba(232,122,42,0.1)' : 'transparent',
              border:'none', borderRight: '1px solid var(--hud-hairline-soft)', cursor:'pointer',
              display:'flex', alignItems:'center', gap: 10, padding:'0 14px',
              color: active ? 'var(--hud-accent)' : 'var(--hud-ink-dim)',
              position:'relative', transition:'background 0.2s',
            }}>
              {active && <div style={{ position:'absolute', left:0, top:0, bottom:0, width: 2, background:'var(--hud-accent)' }} />}
              <HudMono size={8} tone="steel" style={{ fontSize: 8 }}>{t.id}</HudMono>
              <HudLabel size={11} track={0.25} style={{ color:'inherit' }}>{t.label}</HudLabel>
              {active && <div className="hud-cursor" style={{ marginLeft:'auto', color:'var(--hud-accent)' }}>▸</div>}
            </button>
          );
        })}
      </div>

      {/* BODY */}
      <div style={{ position:'relative', overflow:'hidden' }}>
        {children}
      </div>

      {/* STATUS BAR */}
      <StatusBar />
    </div>
  );
};

// ── Status bar ──────────────────────────────────────────────
const StatusBar = () => {
  const { neos, donki, loading } = useData();
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => { const id = setInterval(() => setTick(t => t+1), 1000); return () => clearInterval(id); }, []);

  return (
    <div style={{ borderTop:'1px solid var(--hud-hairline)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px', gap: 20 }}>
      <div style={{ display:'flex', gap: 16 }}>
        <Tip info={GLOSSARY.packet} placement="bottom"><HudMono size={9} tone="steel">PKT·0x{((Date.now()/100)|0).toString(16).slice(-4).toUpperCase()}</HudMono></Tip>
        <Tip info={GLOSSARY.crc} placement="bottom"><HudMono size={9} tone="steel">CRC·OK</HudMono></Tip>
        <Tip info={GLOSSARY.rx} placement="bottom"><HudMono size={9} tone="hot">RX·{(88 + (tick % 40)).toString().padStart(3,'0')}ms</HudMono></Tip>
      </div>
      <div style={{ display:'flex', gap: 16, alignItems:'center' }}>
        <Tip info={GLOSSARY.neo} placement="bottom"><HudMono size={9} tone="steel">NEOS {loading.neos ? '…' : neos.length}</HudMono></Tip>
        <HudMono size={9} tone="hot">ALERTS {donki.filter(d=>d.intensity>0.6).length}</HudMono>
        <div style={{ display:'flex', gap: 1 }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const v = Math.abs(Math.sin((tick + i*2) * 0.4));
            return <div key={i} style={{ width: 3, height: 12, background: v > 0.5 ? 'var(--hud-accent)' : 'var(--hud-steel)', opacity: 0.3 + v*0.7 }} />;
          })}
        </div>
        <HudMono size={9} tone="steel">PWR·118%</HudMono>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
// TAB 1 — OVERVIEW (A's hero + key widgets from C)
// ═════════════════════════════════════════════════════════════

const TabOverview = () => {
  const { apod, neos, donki, mars, deepsky, loading } = useData();
  const iss = useLiveISS();
  const drawer = useDrawer();
  const [reticleHover, setReticleHover] = React.useState(false);

  const openISSDetail = () => drawer.open(<ISSDetail iss={iss} />);
  const openDeepSkyDetail = () => deepsky && drawer.open(<DeepSkyDetail entry={deepsky} />);
  const openNEODetail = (n) => drawer.open(<NEODetail neo={n} />);
  const openCrewDetail = (c) => drawer.open(<CrewDetail crew={c} />);
  const openSpaceWxDetail = () => drawer.open(<SpaceWxDetail donki={donki} />);
  const openMarsDetail = () => drawer.open(<MarsDetail mars={mars} />);

  return (
    <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateColumns:'260px 1fr 260px', gap: 12, padding: 12, boxSizing:'border-box' }}>

      {/* LEFT RAIL — telemetry */}
      <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
        <div className="hud-bracket-4 hud-clickable" style={{ padding: 10, cursor:'pointer' }} onClick={openISSDetail}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Tip info={GLOSSARY.iss}><HudLabel size={9}>LIVE · ISS</HudLabel></Tip>
            <HudMono size={8} tone="hot" className="hud-cursor">▸ MORE</HudMono>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 6, marginTop: 6 }}>
            <div><Tip info={GLOSSARY.lat}><HudLabel size={7}>LAT</HudLabel></Tip><div><Ticker value={iss.latitude} size={18} tone="hot" /></div></div>
            <div><Tip info={GLOSSARY.lon}><HudLabel size={7}>LON</HudLabel></Tip><div><Ticker value={iss.longitude} size={18} tone="hot" /></div></div>
            <div><Tip info={GLOSSARY.alt_km}><HudLabel size={7}>ALT·KM</HudLabel></Tip><div><Ticker value={iss.altitude_km} size={18} tone="cool" /></div></div>
            <div><Tip info={GLOSSARY.vel_kmh}><HudLabel size={7}>VEL·KMH</HudLabel></Tip><div><Ticker value={iss.velocity_kmh} size={18} tone="cool" /></div></div>
          </div>
          <div style={{ marginTop: 6 }}>
            <Tip info={GLOSSARY.orbit}><HudLabel size={7}>ORBIT</HudLabel></Tip>
            <HudValue size={14} tone="ink">{iss.orbit.toLocaleString()}</HudValue>
          </div>
        </div>

        <div style={{ border:'1px solid var(--hud-hairline)' }}>
          <div style={{ background:'#1a1a1a', padding:'4px 8px', display:'flex', justifyContent:'space-between' }}>
            <Tip info={GLOSSARY.crew}><HudLabel size={9}>CREW ROSTER</HudLabel></Tip>
            <HudMono size={9} tone="hot">{iss.crew.length}·ACTIVE</HudMono>
          </div>
          <div style={{ padding: 6, display:'flex', flexDirection:'column', gap: 2 }}>
            {iss.crew.map((c, i) => (
              <div key={i} onClick={() => openCrewDetail(c)} className="hud-clickable" style={{ display:'grid', gridTemplateColumns: '10px 1fr 50px', gap: 8, alignItems:'center', padding:'3px 2px', cursor:'pointer' }}>
                <div style={{ width: 6, height: 6, background: c.craft === 'ISS' ? 'var(--hud-accent)' : 'var(--hud-cool)' }} />
                <HudMono size={9} tone="ink">{c.name}</HudMono>
                <Tip info={GLOSSARY.mission_day}><HudMono size={8} tone="steel">MD·{c.mission_day}</HudMono></Tip>
              </div>
            ))}
          </div>
        </div>

        <div className="hud-clickable" onClick={openSpaceWxDetail} style={{ border:'1px solid var(--hud-hairline)', padding: 10, flex: 1, display:'flex', flexDirection:'column', gap: 8, cursor:'pointer' }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Tip info={GLOSSARY.kp}><HudLabel size={9}>SPACE WX · KP</HudLabel></Tip>
            <HudChip tone={donki.find(d=>d.type==='GST') ? 'hot' : 'steel'}>
              {donki.find(d=>d.type==='GST') ? `G${(donki.find(d=>d.type==='GST')?.kp_index||4)-4}·STORM` : 'QUIET'}
            </HudChip>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap: 2, flex: 1, minHeight: 50 }}>
            {donki.slice(0, 12).map((d, i) => {
              const hot = d.intensity > 0.6;
              return <div key={i} style={{
                flex:1, height:`${d.intensity*100}%`,
                background: hot ? 'var(--hud-accent)' : d.intensity > 0.35 ? 'var(--hud-cool)' : 'var(--hud-steel-dim)',
                minHeight: 4,
              }} title={`${d.type} — ${d.class || d.speed_kms || d.kp_index}`} />;
            })}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <HudMono size={8} tone="steel">-30D</HudMono>
            <HudMono size={8} tone="hot">{donki.filter(d=>d.intensity>0.6).length}·MAJ</HudMono>
            <HudMono size={8} tone="steel">NOW</HudMono>
          </div>
        </div>

        <div onClick={openMarsDetail} className="hud-clickable" style={{ border:'1px solid var(--hud-hairline)', padding: 10, cursor:'pointer' }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <Tip info={GLOSSARY.sol}><HudLabel size={9}>MARS · SOL·{mars.sol}</HudLabel></Tip>
            <HudMono size={8} tone="hot" className="hud-cursor">▸</HudMono>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 6, marginTop: 6 }}>
            <div><HudLabel size={7}>T·AVG</HudLabel><HudValue size={16} tone="cool">{mars.air_temp_c.avg}°</HudValue></div>
            <div><Tip info={GLOSSARY.mars_pressure}><HudLabel size={7}>PRESS</HudLabel></Tip><HudValue size={16}>{mars.pressure_pa}</HudValue></div>
          </div>
        </div>
      </div>

      {/* CENTER — APOD HERO */}
      <div style={{ display:'flex', flexDirection:'column', gap: 8, minWidth: 0 }}>
        <div onClick={openDeepSkyDetail}
             className="hud-clickable"
             style={{ flex: 1, position:'relative', border:'1px solid var(--hud-hairline)', overflow:'hidden', background:'#000', cursor:'pointer' }}>
          {deepsky ? <DeepSkyImage entry={deepsky} /> : <APODImage apod={apod} />}
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.7))' }} />

          {/* Grid overlay */}
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} preserveAspectRatio="none">
            {Array.from({ length: 14 }).map((_, i) => <line key={`v${i}`} x1={`${(i+1)/14*100}%`} y1="0" x2={`${(i+1)/14*100}%`} y2="100%" stroke="rgba(245,241,232,0.1)" />)}
            {Array.from({ length: 8 }).map((_, i) => <line key={`h${i}`} x1="0" y1={`${(i+1)/8*100}%`} x2="100%" y2={`${(i+1)/8*100}%`} stroke="rgba(245,241,232,0.1)" />)}
          </svg>

          {/* Column / row labels */}
          <div style={{ position:'absolute', left: 6, top: 10, bottom: 30, display:'flex', flexDirection:'column', justifyContent:'space-around' }}>
            {['A','B','C','D','E','F','G','H'].map(l => <HudMono key={l} size={8} tone="ink">{l}</HudMono>)}
          </div>
          <div style={{ position:'absolute', bottom: 6, left: 24, right: 24, display:'flex', justifyContent:'space-between' }}>
            {Array.from({ length: 13 }, (_, i) => i+1).map(n => <HudMono key={n} size={8} tone="ink">{n}</HudMono>)}
          </div>

          {/* Corner brackets */}
          <div style={{ position:'absolute', top: 8, left: 8, width: 18, height: 18, borderTop:'1px solid var(--hud-ink)', borderLeft:'1px solid var(--hud-ink)' }} />
          <div style={{ position:'absolute', top: 8, right: 8, width: 18, height: 18, borderTop:'1px solid var(--hud-ink)', borderRight:'1px solid var(--hud-ink)' }} />
          <div style={{ position:'absolute', bottom: 8, left: 8, width: 18, height: 18, borderBottom:'1px solid var(--hud-ink)', borderLeft:'1px solid var(--hud-ink)' }} />
          <div style={{ position:'absolute', bottom: 8, right: 8, width: 18, height: 18, borderBottom:'1px solid var(--hud-ink)', borderRight:'1px solid var(--hud-ink)' }} />

          {/* Reticle — locks onto deepsky.focal, readout in grid coords */}
          {(() => {
            const fx = deepsky?.focal?.x ?? 0.5;
            const fy = deepsky?.focal?.y ?? 0.5;
            const col = Math.min(13, Math.max(1, Math.ceil(fx * 13)));
            const row = String.fromCharCode(65 + Math.min(7, Math.max(0, Math.floor(fy * 8))));
            const reticleSize = 80;
            const stopAndOpen = (e) => { e.stopPropagation(); openDeepSkyDetail(); };
            return (
              <div
                onClick={stopAndOpen}
                onMouseEnter={() => setReticleHover(true)}
                onMouseLeave={() => setReticleHover(false)}
                style={{
                  position:'absolute',
                  left: `calc(${fx * 100}% - ${reticleSize/2}px)`,
                  top:  `calc(${fy * 100}% - ${reticleSize/2}px)`,
                  width: reticleSize, height: reticleSize,
                  cursor:'pointer', zIndex: 3,
                  transition:'transform 0.18s ease',
                  transform: reticleHover ? 'scale(1.06)' : 'scale(1)',
                }}>
                <HudReticle size={reticleSize} color="var(--hud-accent)" />
                {/* Grid-cell readout — pinned right of the reticle */}
                <div style={{
                  position:'absolute', left: reticleSize + 6, top: reticleSize/2 - 8,
                  display:'flex', alignItems:'center', gap: 4,
                  padding:'2px 5px', whiteSpace:'nowrap',
                  background:'rgba(10,10,10,0.7)', border:'1px solid var(--hud-accent)',
                }}>
                  <HudMono size={9} tone="hot">LOCK</HudMono>
                  <HudMono size={9} tone="ink">{row}·{col}</HudMono>
                </div>
                {/* Hover tooltip — target metadata */}
                {deepsky && (
                  <div style={{
                    position:'absolute', left: reticleSize/2 - 110, top: reticleSize + 8,
                    width: 220, padding:'8px 10px',
                    background:'rgba(10,10,10,0.92)', border:'1px solid var(--hud-accent)',
                    opacity: reticleHover ? 1 : 0,
                    transform: `translateY(${reticleHover ? 0 : -3}px)`,
                    transition:'opacity 0.18s ease, transform 0.18s ease',
                    pointerEvents:'none',
                  }}>
                    <HudLabel size={8} tone="hot">TARGET LOCK</HudLabel>
                    <div style={{ marginTop: 2 }}>
                      <HudValue size={13}>{deepsky.target.toUpperCase()}</HudValue>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 2, marginTop: 6 }}>
                      <HudMono size={8} tone="steel">RA · {deepsky.ra}</HudMono>
                      <HudMono size={8} tone="steel">DEC · {deepsky.dec}</HudMono>
                      <HudMono size={8} tone="steel">DIST · {deepsky.distance}</HudMono>
                      <HudMono size={8} tone="steel">GRID · {row}·{col}</HudMono>
                    </div>
                    <HudMono size={8} tone="hot" style={{ display:'block', marginTop: 6 }}>▸ CLICK FOR FULL DETAIL</HudMono>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Spinning distance rings top-right */}
          <div style={{ position:'absolute', top: 20, right: 30 }}>
            <svg width="70" height="70" viewBox="0 0 80 80" fill="none" style={{ animation:'hud-rot 30s linear infinite' }}>
              <circle cx="40" cy="40" r="36" stroke="var(--hud-ink)" strokeDasharray="2 3" opacity="0.5" />
              <circle cx="40" cy="40" r="24" stroke="var(--hud-ink)" opacity="0.5" />
              <circle cx="40" cy="40" r="12" stroke="var(--hud-ink)" opacity="0.5" />
              <polygon points="40,0 44,10 36,10" fill="var(--hud-accent)" />
            </svg>
          </div>

          {/* Caption */}
          <div style={{ position:'absolute', bottom: 26, left: 32, right: 32 }}>
            <HudLabel size={9} tone="hot">
              {deepsky ? `${deepsky.telescope} · ${deepsky.instrument}` : `APOD · ${apod.date || '—'}`}
            </HudLabel>
            <div style={{ marginTop: 3 }}>
              <HudValue size={24}>{((deepsky?.title) || apod.title || 'LOADING').toUpperCase()}</HudValue>
            </div>
            <HudMono size={9} tone="steel" style={{ display:'block', marginTop: 4, maxWidth: 500 }}>
              {deepsky
                ? `${deepsky.target} · ${deepsky.distance} · ${deepsky.year}`
                : (apod.copyright ? `© ${apod.copyright.replace(/\n/g,' ')}` : 'NASA / PUBLIC DOMAIN')}
            </HudMono>
          </div>

          {/* Persistent info card — always visible, hairline frame (accent on the kicker only) */}
          {deepsky && (
            <div style={{
              position:'absolute', top: 22, left: 32, maxWidth: 320,
              background:'rgba(10,10,10,0.78)',
              border:'1px solid var(--hud-hairline)',
              padding:'12px 14px',
              pointerEvents:'none',
              zIndex: 4,
            }}>
              <HudLabel size={9} tone="hot">{deepsky.target_type}</HudLabel>
              <div style={{ marginTop: 4, marginBottom: 8 }}>
                <HudValue size={14}>{deepsky.target.toUpperCase()}</HudValue>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 4, marginBottom: 8 }}>
                <HudMono size={9} tone="steel">CONST · {deepsky.constellation}</HudMono>
                <HudMono size={9} tone="steel">DIST · {deepsky.distance}</HudMono>
                <HudMono size={9} tone="steel">RA · {deepsky.ra}</HudMono>
                <HudMono size={9} tone="steel">DEC · {deepsky.dec}</HudMono>
              </div>
              <div style={{ fontFamily:'Rajdhani, sans-serif', fontSize: 11, lineHeight: 1.45, color:'var(--hud-ink-dim)' }}>
                {deepsky.blurb}
              </div>
              <HudMono size={8} tone="hot" style={{ display:'block', marginTop: 8 }}>▸ CLICK FOR FULL DETAIL</HudMono>
            </div>
          )}

          <ScanField />
        </div>

        {/* Bottom strip */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap: 8, border:'1px solid var(--hud-hairline)', padding: 8 }}>
          {[
            { label: deepsky ? `${deepsky.telescope}·HERO` : 'APOD·TITLE', val: (deepsky?.title || apod.title)?.slice(0, 18).toUpperCase() || '—', tone:'ink' },
            { label:'NEOs·TODAY', val: neos.length, tone:'hot' },
            { label:'HAZARDOUS', val: neos.filter(n=>n.hazard).length, tone:'hot' },
            { label:'WX·EVENTS',  val: donki.length, tone:'cool' },
          ].map((s, i) => (
            <div key={i}>
              <HudLabel size={8}>{s.label}</HudLabel>
              <div><HudValue size={20} tone={s.tone}>{s.val}</HudValue></div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT RAIL — feeds + analysis */}
      <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Tip info={GLOSSARY.datalinks}><HudLabel size={9}>DATALINKS</HudLabel></Tip>
            <HudValue size={22} tone="hot">{donki.length}</HudValue>
          </div>
          <div style={{ display:'flex', gap: 2, marginTop: 6 }}>
            {donki.slice(0, 12).map((d, i) => (
              <div key={i} title={`${d.type} · intensity ${(d.intensity*100).toFixed(0)}%`} style={{ flex:1, height: 18,
                background: d.intensity > 0.7 ? 'var(--hud-accent)' : d.intensity > 0.4 ? 'var(--hud-cool)' : 'var(--hud-steel-dim)',
                opacity: 0.3 + d.intensity * 0.7 }} />
            ))}
          </div>
        </div>

        <div style={{ border:'1px solid var(--hud-hairline)' }}>
          <div style={{ background:'var(--hud-accent)', color:'var(--hud-bg)', padding:'4px 8px', display:'flex', justifyContent:'space-between' }}>
            <Tip info={GLOSSARY.neo}><HudLabel size={9} style={{ color:'var(--hud-bg)' }}>NEO · PRIORITY</HudLabel></Tip>
            <HudLabel size={9} style={{ color:'var(--hud-bg)' }}>FEED</HudLabel>
          </div>
          <div style={{ padding: 8, display:'flex', flexDirection:'column', gap: 2 }}>
            {neos.slice(0, 6).map((n, i) => (
              <div key={n.id || i} onClick={() => openNEODetail(n)} className="hud-clickable" style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap: 6, alignItems:'center', padding:'3px 2px', cursor:'pointer' }}>
                <div style={{ width: 6, height: 6, background: n.hazard ? 'var(--hud-accent)' : 'var(--hud-steel)' }} />
                <HudMono size={8} tone={n.hazard?'hot':'ink'}>{(n.name || '').slice(0,14)}</HudMono>
                <HudMono size={8} tone="steel">{n.miss_lunar.toFixed(1)}LD</HudMono>
              </div>
            ))}
          </div>
        </div>

        <div style={{ border:'1px solid var(--hud-hairline)', padding: 10, display:'flex', flexDirection:'column', alignItems:'center' }}>
          <Tip info={GLOSSARY.orbital_phase} style={{ alignSelf:'flex-start' }}><HudLabel size={9}>ORBITAL·PHASE</HudLabel></Tip>
          <HudRing size={140} innerRadius={38} rings={3} ticks={60} spin={80} fillPct={(Date.now()/3600000) % 1} color="var(--hud-ink)">
            <div style={{ textAlign:'center' }}>
              <HudValue size={18} tone="hot">{String(Math.floor(((Date.now()/3600000) % 1) * 360)).padStart(3,'0')}</HudValue>
              <HudLabel size={7} style={{ display:'block', marginTop: 2 }}>DEG · ORBIT</HudLabel>
            </div>
          </HudRing>
        </div>

        <div style={{ border:'1px solid var(--hud-hairline)', padding: 10, flex: 1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
            <HudLabel size={9}>FEED · STREAM</HudLabel>
            <HudMono size={8} tone="hot" className="hud-blink">● REC</HudMono>
          </div>
          <FeedStream />
        </div>
      </div>
    </div>
  );
};

// Auto-scrolling feed log
const FeedStream = () => {
  const { donki, neos } = useData();
  const [lines, setLines] = React.useState([]);
  React.useEffect(() => {
    const msgs = [
      ...donki.slice(0, 5).map(d => `[${d.type}] ${d.class || d.speed_kms ? (d.class || d.speed_kms+'km/s') : ''} intensity ${(d.intensity*100).toFixed(0)}%`),
      ...neos.slice(0, 5).map(n => `[NEO] ${n.name} · ${n.miss_lunar.toFixed(1)}LD · ${n.velocity_kms}km/s`),
      '[DSN] Handshake OK · station 14',
      '[TEL] Packet 0x3F2A received',
      '[EPIC] L1 attitude nominal',
      '[APOD] Image cache refreshed',
    ];
    let i = 0;
    const id = setInterval(() => {
      setLines(prev => [...prev.slice(-5), msgs[i % msgs.length]]);
      i++;
    }, 1400);
    return () => clearInterval(id);
  }, [donki, neos]);
  return (
    <div style={{ fontFamily:'var(--font-mono)', fontSize: 9, color:'var(--hud-ink-dim)', lineHeight: 1.6 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ opacity: 0.3 + (i / lines.length) * 0.7 }}>
          <span style={{ color:'var(--hud-steel)' }}>{new Date().toISOString().slice(11,19)} </span>
          {l}
        </div>
      ))}
      <span className="hud-cursor" style={{ color:'var(--hud-accent)' }}>▊</span>
    </div>
  );
};

window.Chrome = Chrome;
window.TabOverview = TabOverview;
window.useData = useData;
window.useLiveISS = useLiveISS;
window.DataProvider = DataProvider;
window.ScanField = ScanField;
window.Ticker = Ticker;
