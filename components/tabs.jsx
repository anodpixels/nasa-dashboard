// Remaining tabs: Earth, NEO, Solar (space weather), Deep (exoplanets), Mars

const TabEarth = () => {
  const { epic } = useData();
  const iss = useLiveISS();
  const drawer = useDrawer();
  const [globeMode, setGlobeMode] = React.useState(() => localStorage.getItem('earth-mode') || 'contour');
  React.useEffect(() => { localStorage.setItem('earth-mode', globeMode); }, [globeMode]);
  const globeApi = React.useRef(null);

  const earthAnnotations = React.useMemo(() => [
    { id:'iss', lat: iss.latitude, lon: iss.longitude, label:'◉ ISS', size: 14, color:'var(--hud-accent)', font:'var(--font-mono)', name:'ISS', desc:'International Space Station live position' },
    { id:'L1', lat:  56, lon: -42, label:'L', size: 32, name:'Icelandic Low', desc:'Persistent low-pressure system over the North Atlantic' },
    { id:'L2', lat: -22, lon: -110, label:'L', size: 32, name:'Southeast Pacific Low', desc:'Common cyclonic system off the west coast of South America' },
    { id:'H1', lat:  28, lon: 142, label:'H', size: 32, name:'North Pacific High', desc:'Semipermanent high-pressure system west of California' },
    { id:'H2', lat: -38, lon:  18, label:'H', size: 32, name:'South Atlantic High', desc:'Subtropical high-pressure ridge south of Africa' },
  ], [iss.latitude, iss.longitude]);

  // Marker list passed to the globe (smaller subset of annotations + spec entries)
  const earthMarkers = React.useMemo(() => [
    ...earthAnnotations,
    { id:'eq0', lat: 0,  lon:  -30, label:'0', size: 14, color:'var(--hud-ink-dim)' },
    { id:'eq2', lat: 5,  lon:   75, label:'2', size: 14, color:'var(--hud-ink-dim)' },
    { id:'eq3', lat: -3, lon: -170, label:'3', size: 14, color:'var(--hud-ink-dim)' },
  ], [earthAnnotations]);

  return (
    <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateColumns:'1.6fr 1fr', gap: 12, padding: 12, boxSizing:'border-box' }}>
      <div style={{ position:'relative', border:'1px solid var(--hud-hairline)', background:'#000', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {/* Mode toggle */}
        <div style={{ position:'absolute', top: 12, right: 12, zIndex: 3, display:'flex', border:'1px solid var(--hud-hairline)' }}>
          {[
            { k:'contour', label:'CONTOUR' },
            { k:'photo',   label:'PHOTO' },
          ].map((opt, i) => (
            <button key={opt.k} onClick={() => setGlobeMode(opt.k)} style={{
              background: globeMode === opt.k ? 'var(--hud-accent)' : 'transparent',
              color: globeMode === opt.k ? 'var(--hud-bg)' : 'var(--hud-ink-dim)',
              border: 'none',
              borderLeft: i === 0 ? 'none' : '1px solid var(--hud-hairline)',
              padding: '6px 14px',
              fontFamily: 'var(--font-display)',
              fontSize: 10,
              letterSpacing: '0.24em',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}>{opt.label}</button>
          ))}
        </div>

        {/* Header */}
        <div style={{ position:'absolute', top: 12, left: 16, zIndex: 2 }}>
          <Tip info={GLOSSARY.epic}><HudLabel size={9} tone="hot">EPIC · DSCOVR · L1 LAGRANGE</HudLabel></Tip>
          <HudValue size={16}>FULL·DISK EARTH</HudValue>
        </div>

        {/* Globe */}
        <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <GlobeWithReadout
            key={globeMode}
            mode={globeMode}
            color="#f5f1e8"
            seed={91.7}
            contours={10}
            scale={2.2}
            size={520}
            markers={earthMarkers}
            apiRef={globeApi}
            photoUrl="https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
            tempC={globeMode === 'contour' ? 14.2 : null}
            info={`Earth · radius 6,371 km. Atmosphere 78% N₂ + 21% O₂. ${globeMode === 'contour' ? 'Pressure highs (H) and lows (L) drive the wind systems shown by isobaric contours.' : 'EPIC camera aboard DSCOVR captures the full sunlit disk every 1–2 hours from 1.5 million km out.'}`}
            onClick={() => drawer.open(<EarthDetail iss={iss} epic={epic} />)}
          />
        </div>

        {/* Footer */}
        <div style={{ position:'absolute', bottom: 12, left: 16, right: 16, display:'flex', justifyContent:'space-between', zIndex: 2 }}>
          <HudMono size={9} tone="steel">CENTROID {epic.meta?.centroid_coordinates?.lat?.toFixed?.(2) || '—'}°N {epic.meta?.centroid_coordinates?.lon?.toFixed?.(2) || '—'}°E</HudMono>
          <HudMono size={9} tone="steel">DRAG TO ROTATE</HudMono>
          <HudMono size={9} tone="hot">{epic.meta?.date || '—'}</HudMono>
        </div>
        <ScanField />
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 12 }}>
          <HudLabel size={9}>ISS · LIVE TELEMETRY</HudLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, marginTop: 10 }}>
            {[
              ['LATITUDE', iss.latitude.toFixed(4), '°', GLOSSARY.lat],
              ['LONGITUDE', iss.longitude.toFixed(4), '°', GLOSSARY.lon],
              ['ALTITUDE', iss.altitude_km.toFixed(2), 'KM', GLOSSARY.alt_km],
              ['VELOCITY', iss.velocity_kmh.toFixed(1), 'KMH', GLOSSARY.vel_kmh],
            ].map(([l,v,u,info], i) => (
              <div key={i} className="hud-bracket-4" style={{ padding: 8 }}>
                <Tip info={info}><HudLabel size={8}>{l}</HudLabel></Tip>
                <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
                  <HudValue size={22} tone={i<2?'hot':'cool'}>{v}</HudValue>
                  <HudLabel size={8} tone="steel">{u}</HudLabel>
                </div>
              </div>
            ))}
          </div>
        </div>
        <MapLegendPanel
          title="EARTH · ANNOTATIONS"
          info="Markers shown on the contour globe. Click a row to rotate the globe and face that location."
          rows={earthAnnotations.map(a => ({
            id: a.id,
            label: a.label,
            name: a.name,
            desc: a.desc,
            lat: a.lat,
            lon: a.lon,
            color: a.color || 'var(--hud-ink)',
          }))}
          onSelect={(r) => globeApi.current?.rotateTo(r.lat, r.lon)}
        />
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 12, flex: 1 }}>
          <Tip info="DSCOVR is the spacecraft hosting the EPIC camera. Its orientation in space is described by a 4-component quaternion (q0..q3) relative to the J2000 reference frame.">
            <HudLabel size={9}>DSCOVR · ATTITUDE</HudLabel>
          </Tip>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8, marginTop: 10 }}>
            {['q0','q1','q2','q3'].map(k => (
              <div key={k} className="hud-bracket-4" style={{ padding: 6 }}>
                <HudLabel size={7}>{k.toUpperCase()}</HudLabel>
                <HudMono size={10} tone="ink">{(window.NASA.epic.attitude_quaternions[k]).toFixed(3)}</HudMono>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <Tip info={GLOSSARY.j2000}><HudLabel size={9}>SUN · J2000 POSITION</HudLabel></Tip>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 6 }}>
              {['x','y','z'].map(a => <HudMono key={a} size={10} tone="steel">{a.toUpperCase()}·{(window.NASA.epic.sun_j2000_position[a]/1e6).toFixed(2)}Gm</HudMono>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabNEO = () => {
  const { neos } = useData();
  const drawer = useDrawer();
  const hazards = neos.filter(n=>n.hazard);
  const [selectedId, setSelectedId] = React.useState(null);
  const [sortBy, setSortBy] = React.useState({ key: 'date', dir: 1 });
  const rowRefs = React.useRef({});
  const selectPoint = (id) => {
    setSelectedId(id);
    const el = rowRefs.current[id];
    if (el) el.scrollIntoView({ block:'nearest', behavior:'smooth' });
  };
  const today = React.useMemo(() => { const d = new Date(); d.setUTCHours(0,0,0,0); return d; }, []);
  // Build a date window that adapts to the data: anchored at min(today, earliest)
  // and spans at least 7 days, but extends to cover the latest if data reaches further.
  // Keeps the polar plot meaningful when data is partially or entirely past.
  const dateWindow = React.useMemo(() => {
    const ts = neos.map(n => n.date && new Date(n.date).setUTCHours(0,0,0,0)).filter(Boolean);
    const todayMs = today.getTime();
    if (!ts.length) return { min: todayMs, max: todayMs + 7 * 86400000 };
    const min = Math.min(todayMs, ...ts);
    const max = Math.max(min + 7 * 86400000, ...ts, todayMs);
    return { min, max };
  }, [neos, today]);
  const dayOffset = (iso) => {
    if (!iso) return 0;
    const d = new Date(iso); d.setUTCHours(0,0,0,0);
    const span = dateWindow.max - dateWindow.min || 86400000;
    return Math.max(0, Math.min(1, (d.getTime() - dateWindow.min) / span));
  };
  const RADAR_SIZE = 420;
  const RADAR_R = RADAR_SIZE / 2 - 8;
  const ldToRadius = (ld) => {
    const t = Math.log10(Math.max(0.5, ld));
    return Math.min(0.95, 0.18 + 0.57 * (t / 1.5)) * RADAR_R;
  };
  const ringRadiiLD = [1, 5, 30].map(ldToRadius);
  const neoPoints = React.useMemo(() => neos.map((n) => ({
    id: n.id,
    angle: dayOffset(n.date),
    r: ldToRadius(n.miss_lunar) / RADAR_R,
    label: n.name.split(' ').pop().slice(0,4),
    hot: n.hazard,
    size: 4 + Math.log10(Math.max(1, n.diameter_m)) * 2.4,
    selected: n.id === selectedId,
    onClick: selectPoint,
  })), [neos, selectedId]);
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const nextApproach = React.useMemo(() => {
    const upcoming = neos
      .filter(n => n.date)
      .map(n => ({ n, ts: new Date(n.date).getTime() }))
      .filter(x => x.ts >= now - 86400000)
      .sort((a, b) => a.ts - b.ts);
    return upcoming[0] || null;
  }, [neos, now]);
  const fmtCountdown = (ms) => {
    const past = ms < 0;
    const a = Math.abs(ms);
    if (a < 60000) return past ? 'JUST NOW' : 'NOW';
    const s = Math.floor(a / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const body = `${d}D ${String(h).padStart(2,'0')}H ${String(m).padStart(2,'0')}M`;
    return past ? `T+ ${body}` : body;
  };
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
  const sortedNeos = React.useMemo(() => {
    const get = {
      date: (n) => new Date(n.date || 0).getTime(),
      name: (n) => n.name,
      dia:  (n) => n.diameter_m,
      vel:  (n) => n.velocity_kms,
      miss: (n) => n.miss_lunar,
      pha:  (n) => n.hazard ? 1 : 0,
    }[sortBy.key] || ((n) => 0);
    return [...neos].sort((a, b) => {
      const va = get(a), vb = get(b);
      if (va < vb) return -1 * sortBy.dir;
      if (va > vb) return  1 * sortBy.dir;
      return 0;
    });
  }, [neos, sortBy]);
  return (
    <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap: 12, padding: 12, boxSizing:'border-box' }}>
      <div style={{ border:'1px solid var(--hud-hairline)', padding: 12, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudLabel size={10}>NEO · POLAR PLOT</HudLabel>
          <HudChip tone="hot" solid>{hazards.length} PHA</HudChip>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <HudRadar
            size={RADAR_SIZE}
            customRings={ringRadiiLD}
            ringLabels={['1 LD', '5 LD', '30 LD']}
            sectors={Math.max(7, Math.min(14, Math.round((dateWindow.max - dateWindow.min) / 86400000)))}
            points={neoPoints}
            centerLabel="EARTH"
            spin={0}
          />
        </div>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap: 14, marginTop: 4, marginBottom: 6, flexWrap:'wrap' }}>
          <span style={{ display:'flex', alignItems:'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, background:'var(--hud-ink)', display:'inline-block' }} />
            <HudMono size={8} tone="steel">NEO</HudMono>
          </span>
          <span style={{ display:'flex', alignItems:'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, background:'var(--hud-accent)', display:'inline-block' }} />
            <HudMono size={8} tone="steel">PHA</HudMono>
          </span>
          <HudMono size={8} tone="steel">SIZE · ∝ log(DIA)</HudMono>
          <HudMono size={8} tone="steel">RING · MISS·LD</HudMono>
          <HudMono size={8} tone="steel">ANGLE · APPROACH DATE</HudMono>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudMono size={8} tone="steel">RINGS · 1 / 5 / 30 LD</HudMono>
          <HudMono size={8} tone="steel">WINDOW · {Math.round((dateWindow.max - dateWindow.min) / 86400000)} DAYS</HudMono>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap: 10, minHeight: 0 }}>
        <div style={{ border:'1px solid var(--hud-hairline)', flex: 1, display:'flex', flexDirection:'column', minHeight: 0 }}>
          {nextApproach && (
            <div onClick={() => { setSelectedId(nextApproach.n.id); drawer.open(<NEODetail neo={nextApproach.n} />); }}
                 className="hud-clickable"
                 style={{ display:'grid', gridTemplateColumns:'90px 1fr auto', gap: 10, padding:'8px 10px', alignItems:'center',
                          borderBottom:'1px solid var(--hud-accent)',
                          background:'rgba(232,122,42,0.10)', cursor:'pointer', flexShrink: 0 }}>
              <HudLabel size={8} tone="hot">NEXT APPROACH</HudLabel>
              <HudMono size={11} tone="ink">{nextApproach.n.name}{nextApproach.n.hazard ? ' · PHA' : ''}</HudMono>
              <HudValue size={14} tone="hot" style={{ fontVariantNumeric:'tabular-nums' }}>{fmtCountdown(nextApproach.ts - now)}</HudValue>
            </div>
          )}
          <div style={{ background:'#1a1a1a', padding:'4px 10px', display:'grid', gridTemplateColumns:'32px 1fr 78px 56px 60px 70px 32px', gap: 10, flexShrink: 0 }}>
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
                <HudLabel size={8} tone={active ? 'hot' : 'steel'}
                          className={key ? 'hud-sort-h' : undefined}
                          style={{ cursor: key ? 'pointer' : 'default' }}>
                  {h}{arrow}
                </HudLabel>
              );
              return info
                ? <Tip key={h} info={info}><span onClick={onClick}>{label}</span></Tip>
                : <span key={h} onClick={onClick}>{label}</span>;
            })}
          </div>
          <div style={{ flex: 1, overflowY:'auto', minHeight: 0 }}>
            {sortedNeos.map((n, i) => (
              <div key={n.id||i}
                ref={(el) => { if (el) rowRefs.current[n.id] = el; }}
                onClick={() => { setSelectedId(n.id); drawer.open(<NEODetail neo={n} />); }}
                onMouseEnter={() => setSelectedId(n.id)}
                className="hud-clickable"
                style={{ display:'grid', gridTemplateColumns:'32px 1fr 78px 56px 60px 70px 32px', gap: 10, padding:'5px 10px',
                borderBottom:'1px solid var(--hud-hairline-soft)',
                background: n.id === selectedId
                  ? 'rgba(232,122,42,0.18)'
                  : (n.hazard ? 'rgba(232,122,42,0.08)' : 'transparent'),
                boxShadow: n.id === selectedId ? 'inset 2px 0 0 var(--hud-accent)' : 'none',
                cursor:'pointer' }}>
                <HudMono size={9} tone="steel">{String(i+1).padStart(2,'0')}</HudMono>
                <HudMono size={9} tone={n.hazard?'hot':'ink'}>{n.name}</HudMono>
                <HudMono size={9} tone={n.date && new Date(n.date).setUTCHours(0,0,0,0) === today.getTime() ? 'hot' : 'ink-dim'}>{n.date?.slice(5) || '—'}</HudMono>
                <HudMono size={9} tone="ink-dim">{n.diameter_m}</HudMono>
                <HudMono size={9} tone="cool">{n.velocity_kms}</HudMono>
                <HudMono size={9} tone={n.hazard?'hot':'ink-dim'}>{n.miss_lunar.toFixed(2)}</HudMono>
                <HudMono size={9} tone={n.hazard?'hot':'steel'}>{n.hazard?'●':'○'}</HudMono>
              </div>
            ))}
          </div>
        </div>
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 14, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 14, flexShrink: 0 }}>
          <div className="hud-bracket-4" style={{ padding: 14, display:'flex', flexDirection:'column', gap: 4, minWidth: 0 }}>
            <HudLabel size={9}>NEXT APPROACH</HudLabel>
            <HudValue size={28} tone="hot" style={{ fontVariantNumeric:'tabular-nums' }}>
              {nextApproach ? fmtCountdown(nextApproach.ts - now) : '—'}
            </HudValue>
            <HudMono size={9} tone="steel" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nextApproach?.n.name || 'NO UPCOMING'}</HudMono>
          </div>
          <div className="hud-bracket-4" style={{ padding: 14, display:'flex', flexDirection:'column', gap: 4, minWidth: 0 }}>
            <HudLabel size={9}>CLOSEST PASS · 7D</HudLabel>
            <HudValue size={28} tone={closestPass?.hazard ? 'hot' : 'cool'} style={{ fontVariantNumeric:'tabular-nums' }}>
              {closestPass ? `${closestPass.miss_lunar.toFixed(2)} LD` : '—'}
            </HudValue>
            <HudMono size={9} tone="steel" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{closestPass?.name || ''}{closestPass?.hazard ? ' · PHA' : ''}</HudMono>
          </div>
          <div className="hud-bracket-4" style={{ padding: 14, display:'flex', flexDirection:'column', gap: 4, minWidth: 0 }}>
            <HudLabel size={9}>LARGEST · 7D</HudLabel>
            <HudValue size={28} tone="ink" style={{ fontVariantNumeric:'tabular-nums' }}>
              {largestObject ? `${largestObject.diameter_m.toLocaleString()} M` : '—'}
            </HudValue>
            <HudMono size={9} tone="steel" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{largestObject ? `${largestObject.name} · ${compareSize(largestObject.diameter_m)}` : ''}</HudMono>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabSolar = () => {
  const { donki } = useData();
  const drawer = useDrawer();
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  return (
    <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 12, padding: 12, boxSizing:'border-box' }}>
      <div style={{ border:'1px solid var(--hud-hairline)', padding: 12, display:'flex', flexDirection:'column' }}>
        <HudLabel size={10}>SOLAR · FLARE COMPASS</HudLabel>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="300" height="300" viewBox="0 0 220 220" fill="none">
            <path d="M 110 10 A 100 100 0 1 1 23.4 160" stroke="var(--hud-cool)" strokeWidth="18" strokeLinecap="round" opacity="0.7" />
            {[80,60,40].map(r => <circle key={r} cx="110" cy="110" r={r} stroke="var(--hud-hairline)" />)}
            <g style={{ animation:'hud-rot 40s linear infinite', transformOrigin:'110px 110px' }}>
              {Array.from({ length: 60 }).map((_, i) => {
                const a = (i/60)*Math.PI*2 - Math.PI/2;
                return <line key={i} x1={110+Math.cos(a)*100} y1={110+Math.sin(a)*100} x2={110+Math.cos(a)*(i%5===0?92:96)} y2={110+Math.sin(a)*(i%5===0?92:96)} stroke={i%5===0?'var(--hud-ink)':'var(--hud-hairline)'} />;
              })}
            </g>
            <polygon points="110,4 116,20 104,20" fill="var(--hud-accent)" />
            <circle cx="110" cy="110" r="3" fill="var(--hud-accent)" />
          </svg>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudMono size={9} tone="steel">ACTIVE·REGIONS</HudMono>
          <HudMono size={9} tone="hot">{donki.filter(d=>d.type==='FLR').length}·FLR · {donki.filter(d=>d.type==='CME').length}·CME</HudMono>
        </div>
      </div>
      <div style={{ border:'1px solid var(--hud-hairline)', padding: 12, display:'flex', flexDirection:'column' }}>
        <HudLabel size={10}>ENERGY · WHEEL</HudLabel>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="300" height="300" viewBox="0 0 240 240" fill="none">
            {[100, 80, 60, 42].map((r, i) => <circle key={i} cx="120" cy="120" r={r} stroke="var(--hud-hairline)" />)}
            {Array.from({ length: 36 }).map((_, i) => {
              const eventIdx = i % donki.length;
              const event = donki[eventIdx];
              const a0 = (i/36)*Math.PI*2, a1 = a0 + (Math.PI*2/36)*0.85;
              const r1 = 64, r2 = 72 + event.intensity*20;
              const p1 = [120+Math.cos(a0)*r1, 120+Math.sin(a0)*r1];
              const p2 = [120+Math.cos(a1)*r1, 120+Math.sin(a1)*r1];
              const p3 = [120+Math.cos(a1)*r2, 120+Math.sin(a1)*r2];
              const p4 = [120+Math.cos(a0)*r2, 120+Math.sin(a0)*r2];
              const hot = event.intensity > 0.6;
              const highlighted = hoveredIdx === eventIdx;
              return <polygon
                key={i}
                points={`${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')}`}
                fill={highlighted || hot ? 'var(--hud-accent)' : 'var(--hud-cool)'}
                opacity={highlighted ? 1 : 0.4 + event.intensity*0.6}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s, fill 0.15s' }}
                onMouseEnter={() => setHoveredIdx(eventIdx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => drawer.open(<DonkiDetail event={event} />)}
              />;
            })}
            <g style={{ animation:'hud-rot 60s linear infinite', transformOrigin:'120px 120px' }}>
              {Array.from({ length: 72 }).map((_, i) => {
                const a = (i/72)*Math.PI*2;
                return <line key={i} x1={120+Math.cos(a)*104} y1={120+Math.sin(a)*104} x2={120+Math.cos(a)*(i%6===0?112:108)} y2={120+Math.sin(a)*(i%6===0?112:108)} stroke="var(--hud-ink-dim)" />;
              })}
            </g>
            <circle cx="120" cy="120" r="4" fill="var(--hud-accent)" />
          </svg>
        </div>
      </div>
      <div style={{ border:'1px solid var(--hud-hairline)', padding: 12, overflowY:'auto' }}>
        <HudLabel size={10}>EVENT · LOG · 30D</HudLabel>
        <div style={{ marginTop: 10, display:'flex', flexDirection:'column', gap: 8 }}>
          {donki.map((d, i) => (
            <div key={i}
                 onClick={() => drawer.open(<DonkiDetail event={d} />)}
                 onMouseEnter={() => setHoveredIdx(i)}
                 onMouseLeave={() => setHoveredIdx(null)}
                 className="hud-clickable"
                 style={{ display:'grid', gridTemplateColumns:'46px 1fr auto', gap: 8, padding: 6, borderBottom:'1px solid var(--hud-hairline-soft)', alignItems:'center', cursor:'pointer',
                   background: hoveredIdx === i ? 'rgba(232,122,42,0.12)' : undefined,
                   boxShadow: hoveredIdx === i ? 'inset 0 0 0 1px var(--hud-accent)' : undefined,
                 }}>
              <HudChip tone={d.intensity>0.6?'hot':d.intensity>0.35?'cool':'steel'} solid={d.intensity>0.8}>{d.type}</HudChip>
              <div>
                <HudMono size={9} tone="ink">{d.class || (d.speed_kms && `${d.speed_kms}km/s`) || (d.kp_index && `Kp${d.kp_index}`) || '—'}</HudMono>
                <HudMono size={8} tone="steel" style={{ display:'block' }}>{(d.peak || d.id || '').slice(0,16)}</HudMono>
              </div>
              <div style={{ width: 40 }}>
                <HudBar value={d.intensity} segments={8} height={6} color={d.intensity>0.6?'var(--hud-accent)':'var(--hud-cool)'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TabDeep = () => {
  const { exoplanets, deepsky } = useData();
  const drawer = useDrawer();
  const [heroHover, setHeroHover] = React.useState(false);
  return (
    <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateRows:'minmax(0, 38%) 1fr', gap: 12, padding: 12, boxSizing:'border-box' }}>
      {/* Hero strip — same curated entry as Overview */}
      {deepsky && (
        <div onClick={() => drawer.open(<DeepSkyDetail entry={deepsky} />)}
             onMouseEnter={() => setHeroHover(true)}
             onMouseLeave={() => setHeroHover(false)}
             className="hud-clickable"
             style={{ position:'relative', border:'1px solid var(--hud-hairline)', overflow:'hidden', background:'#000', cursor:'pointer' }}>
          <DeepSkyImage entry={deepsky} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)' }} />
          <div style={{ position:'absolute', top: 16, left: 20, right: 20, display:'flex', justifyContent:'space-between' }}>
            <HudLabel size={9} tone="hot">{deepsky.telescope} · {deepsky.instrument}</HudLabel>
            <HudMono size={9} tone="steel">RA {deepsky.ra}  ·  DEC {deepsky.dec}</HudMono>
          </div>
          <div style={{ position:'absolute', bottom: 16, left: 20, maxWidth: '55%' }}>
            <HudValue size={28}>{deepsky.title.toUpperCase()}</HudValue>
            <HudMono size={10} tone="steel" style={{ display:'block', marginTop: 4 }}>
              {deepsky.target} · {deepsky.target_type} · {deepsky.distance} · {deepsky.year}
            </HudMono>
            <div style={{ marginTop: 10, fontFamily:'Rajdhani, sans-serif', fontSize: 12, lineHeight: 1.5, color:'var(--hud-ink-dim)',
                opacity: heroHover ? 1 : 0.6, transition:'opacity 0.18s' }}>
              {deepsky.blurb}
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap: 12, minHeight: 0 }}>
      <div style={{ border:'1px solid var(--hud-hairline)', padding: 14, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudLabel size={10}>EXOPLANET · ARCHIVE</HudLabel>
          <HudMono size={9} tone="hot">{exoplanets.filter(p=>p.habitable).length}·HABITABLE</HudMono>
        </div>
        <div style={{ flex:1, position:'relative', marginTop: 14 }}>
          <svg width="100%" height="100%" viewBox="0 0 500 360" preserveAspectRatio="xMidYMid meet">
            {/* axis */}
            <line x1="40" y1="20" x2="40" y2="330" stroke="var(--hud-hairline)" />
            <line x1="40" y1="330" x2="480" y2="330" stroke="var(--hud-hairline)" />
            {[0,1,2,3,4].map(i => <line key={i} x1="40" y1={20+i*77.5} x2="480" y2={20+i*77.5} stroke="var(--hud-hairline-soft)" strokeDasharray="2 3" />)}
            <text x="10" y="180" fill="var(--hud-steel)" fontSize="9" fontFamily="var(--font-display)" letterSpacing="2" transform="rotate(-90 10 180)">RADIUS · RE</text>
            <text x="250" y="354" fill="var(--hud-steel)" fontSize="9" fontFamily="var(--font-display)" letterSpacing="2" textAnchor="middle">DISTANCE · LY (LOG)</text>
            {exoplanets.map((p, i) => {
              const x = 40 + (Math.log10(p.distance_ly) / 3.5) * 440;
              const y = 330 - (p.radius_earth / 3) * 300;
              return <g key={p.name}>
                <circle cx={x} cy={y} r={4 + p.radius_earth*2} fill={p.habitable?'var(--hud-accent)':'var(--hud-steel)'} opacity="0.8" />
                <circle cx={x} cy={y} r={4 + p.radius_earth*2 + 6} stroke={p.habitable?'var(--hud-accent)':'var(--hud-steel)'} fill="none" opacity="0.4" strokeDasharray="1 2" />
                <text x={x+12} y={y+3} fill="var(--hud-ink-dim)" fontSize="8" fontFamily="var(--font-mono)">{p.name}</text>
              </g>;
            })}
          </svg>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap: 10, overflow:'hidden' }}>
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 10, flex: 1, overflowY:'auto' }}>
          <HudLabel size={10}>CATALOG</HudLabel>
          <div style={{ marginTop: 8, display:'flex', flexDirection:'column', gap: 6 }}>
            {exoplanets.map((p, i) => {
              const scoreR = Math.min(1, p.radius_earth / 2.5);
              const scoreT = 1 - Math.abs(288 - p.temp_k) / 288;
              return (
                <div key={p.name} onClick={() => drawer.open(<ExoplanetDetail planet={p} />)} className="hud-clickable" style={{ display:'grid', gridTemplateColumns:'110px 1fr 50px', gap: 8, alignItems:'center', padding:'4px 6px', borderBottom:'1px solid var(--hud-hairline-soft)', cursor:'pointer' }}>
                  <HudMono size={9} tone={p.habitable?'ink':'steel'}>{p.name}</HudMono>
                  <div style={{ display:'flex', gap: 1, height: 10 }}>
                    {Array.from({ length: 24 }).map((_, j) => (
                      <div key={j} style={{ flex:1, background: j < scoreR*12 ? 'var(--hud-cool)' : j < 12 ? 'var(--hud-steel-dim)' : j < 12+scoreT*12 ? 'var(--hud-accent)' : 'var(--hud-steel-dim)' }} />
                    ))}
                  </div>
                  <HudMono size={8} tone={p.habitable?'hot':'steel'}>{p.distance_ly < 100 ? p.distance_ly.toFixed(1) : Math.round(p.distance_ly)}ly</HudMono>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

const TabMars = () => {
  const { mars, marsPhotos } = useData();
  const drawer = useDrawer();
  const globeApi = React.useRef(null);

  const marsAnnotations = React.useMemo(() => [
    { id:'H', lat:  18, lon: -134, label:'H', size: 36, name:'Olympus Mons',  desc:'Largest volcano in the solar system — 22 km tall, 600 km wide.' },
    { id:'L', lat: -42, lon:   70, label:'L', size: 36, name:'Hellas Planitia', desc:'Deepest basin on Mars — 7 km below the datum, 2,300 km wide.' },
    { id:'B', lat:  -5, lon:  138, label:'B', size: 22, name:'Curiosity Rover', desc:`Gale Crater. Active on the surface since 2012 · Sol ${mars.sol}.` },
    { id:'W', lat:   0, lon:   92, label:'W', size: 22, name:'Wind Vector',    desc:`Current direction ${mars.wind_dir_deg}° · ${mars.wind_speed_ms.avg} m/s avg.` },
  ], [mars.sol, mars.wind_dir_deg, mars.wind_speed_ms.avg]);

  const marsMarkers = React.useMemo(() => [
    ...marsAnnotations,
    { id:'n0',  lat:  62, lon:    5, label:'0',  size: 16, color:'var(--hud-ink-dim)' },
    { id:'n2',  lat:   8, lon:   35, label:'2',  size: 16, color:'var(--hud-ink-dim)' },
    { id:'n3',  lat: -12, lon:   -8, label:'3',  size: 16, color:'var(--hud-ink-dim)' },
    { id:'n10a',lat: -28, lon:  118, label:'10', size: 16, color:'var(--hud-ink-dim)' },
    { id:'n10b',lat: -58, lon:   28, label:'10', size: 16, color:'var(--hud-ink-dim)' },
  ], [marsAnnotations]);

  return (
    <div style={{ width:'100%', height:'100%', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap: 12, padding: 12, boxSizing:'border-box' }}>
      {/* LEFT — 3D Mars contour globe */}
      <div style={{ border:'1px solid var(--hud-hairline)', padding: 14, display:'flex', flexDirection:'column', position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between', flexShrink: 0 }}>
          <Tip info="Mars — the fourth planet from the Sun. Red from iron-oxide dust.">
            <HudLabel size={10}>MARS · ISOBARIC CONTOUR</HudLabel>
          </Tip>
          <HudMono size={9} tone="hot">SOL·{mars.sol} · LS {mars.ls}°</HudMono>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <GlobeWithReadout
            mode="contour"
            color="#f5f1e8"
            seed={37.2}
            contours={9}
            scale={2.6}
            size={520}
            markers={marsMarkers}
            apiRef={globeApi}
            tempC={mars.air_temp_c.avg}
            info={`Mars · radius 3,390 km (53% of Earth). Gravity 3.71 m/s² (38% of Earth). A Martian year is 687 Earth days, a sol is 24h 39m. Atmosphere 95% CO₂, <1% as dense as Earth's. Surface temps swing from −140 °C polar winter to +30 °C equatorial summer. Olympus Mons (H, Tharsis): the largest volcano in the solar system, 22 km tall. Hellas Planitia (L): the deepest basin, 7 km below the datum. Curiosity rover (B) is in Gale Crater.`}
            onClick={() => drawer.open(<MarsDetail mars={mars} />)}
          />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', flexShrink: 0 }}>
          <HudMono size={8} tone="steel">DRAG TO ROTATE</HudMono>
          <HudMono size={8} tone="steel">{mars.season.toUpperCase()} · INSIGHT</HudMono>
        </div>
      </div>

      {/* RIGHT — top: horizontal metrics; bottom: rover photos */}
      <div style={{ display:'flex', flexDirection:'column', gap: 12, minHeight: 0 }}>
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 14, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12, flexShrink: 0 }}>
          {[
            { label:'AIR·TEMP·AVG', val: mars.air_temp_c.avg, unit:'°C', tone:'cool', info:'Mean atmospheric temperature across the sol.' },
            { label:'AIR·TEMP·MAX', val: mars.air_temp_c.max, unit:'°C', tone:'hot', info:'Peak daytime temperature — usually near local noon.' },
            { label:'PRESSURE', val: mars.pressure_pa, unit:'Pa', tone:'ink', info: GLOSSARY.mars_pressure },
            { label:'WIND·AVG', val: mars.wind_speed_ms.avg, unit:'m/s', tone:'cool', info:'Average horizontal wind speed. Mars wind is fast but thin — a 30 m/s gust on Mars feels like 3 m/s on Earth.' },
          ].map((s, i) => (
            <div key={i} className="hud-bracket-4" style={{ padding: 12, display:'flex', flexDirection:'column' }}>
              <Tip info={s.info}><HudLabel size={9}>{s.label}</HudLabel></Tip>
              <div style={{ display:'flex', alignItems:'baseline', gap: 6, marginTop: 6 }}>
                <HudValue size={34} tone={s.tone}>{s.val}</HudValue>
                <HudLabel size={10} tone="steel">{s.unit}</HudLabel>
              </div>
            </div>
          ))}
        </div>

        {/* Surface annotations legend */}
        <MapLegendPanel
          title="MARS · SURFACE ANNOTATIONS"
          info="Markers shown on the contour globe. Click a row to rotate the globe and face that feature."
          rows={marsAnnotations.map(a => ({
            id: a.id,
            label: a.label,
            name: a.name,
            desc: a.desc,
            lat: a.lat,
            lon: a.lon,
            color: 'var(--hud-ink)',
          }))}
          onSelect={(r) => globeApi.current?.rotateTo(r.lat, r.lon)}
        />

        {/* Rover photos gallery */}
        <div style={{ border:'1px solid var(--hud-hairline)', flex: 1, display:'flex', flexDirection:'column', minHeight: 0 }}>
          <div style={{ background:'#1a1a1a', padding:'5px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink: 0 }}>
            <Tip info="Mars Rover Photos — real photographs transmitted back to Earth by NASA's rovers. Currently showing Curiosity's most recent downlink.">
              <HudLabel size={10}>ROVER · CURIOSITY · LATEST DOWNLINK</HudLabel>
            </Tip>
            <HudMono size={9} tone="hot">{marsPhotos ? `${marsPhotos.length}·FRAMES` : 'SYNCING'}</HudMono>
          </div>
          <div style={{ flex: 1, padding: 10, overflowY:'auto', minHeight: 0 }}>
            {!marsPhotos && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio:'1/1', border:'1px solid var(--hud-hairline)', background:'repeating-linear-gradient(45deg, #1a1a1a 0 4px, #0a0a0a 4px 8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <HudMono size={8} tone="steel">SYNC</HudMono>
                  </div>
                ))}
              </div>
            )}
            {marsPhotos && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8 }}>
                {marsPhotos.map(p => (
                  <div key={p.id} onClick={() => drawer.open(<RoverPhotoDetail photo={p} />)} className="hud-clickable" style={{ cursor:'pointer', border:'1px solid var(--hud-hairline)', position:'relative', aspectRatio:'1/1', overflow:'hidden', background:'linear-gradient(135deg, #3a1408, #1a0604)' }}>
                    <img src={p.img_src} alt=""
                         onError={(e) => { e.currentTarget.style.display='none'; }}
                         style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: 0.9 }} />
                    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity: 0.35 }} viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs><pattern id={`rp${p.id}`} width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8 L8 0" stroke="#e87a2a" strokeWidth="0.4" /></pattern></defs>
                      <rect width="100" height="100" fill={`url(#rp${p.id})`} />
                    </svg>
                    <div style={{ position:'absolute', top: 4, left: 4, right: 4, display:'flex', justifyContent:'space-between' }}>
                      <HudMono size={7} tone="hot" style={{ background:'rgba(0,0,0,0.7)', padding:'1px 4px' }}>{p.camera_code}</HudMono>
                      <HudMono size={7} tone="ink" style={{ background:'rgba(0,0,0,0.7)', padding:'1px 4px' }}>SOL·{p.sol}</HudMono>
                    </div>
                    <div style={{ position:'absolute', bottom: 0, left: 0, right: 0, background:'linear-gradient(transparent, rgba(0,0,0,0.85))', padding:'10px 6px 4px' }}>
                      <HudMono size={7} tone="steel">{p.earth_date}</HudMono>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Map legend panel — list of globe annotations, click to rotate-to.
// ──────────────────────────────────────────────────────────────
const MapLegendPanel = ({ title, info, rows, onSelect }) => {
  const fmt = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}°`;
  return (
    <div style={{ border:'1px solid var(--hud-hairline)' }}>
      <div style={{ background:'#1a1a1a', padding:'4px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Tip info={info}><HudLabel size={9}>{title}</HudLabel></Tip>
        <HudMono size={8} tone="steel">CLICK·TO·ROTATE</HudMono>
      </div>
      <div style={{ padding:'4px 0' }}>
        {rows.map((r) => (
          <div key={r.id}
               onClick={() => onSelect?.(r)}
               className="hud-clickable"
               style={{ display:'grid', gridTemplateColumns:'28px 1fr 88px', gap: 8, alignItems:'center', padding:'5px 10px', cursor:'pointer' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize: 18, fontWeight: 300, color: r.color, letterSpacing:'0.02em', textAlign:'center' }}>{r.label}</div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 11, color:'var(--hud-ink)', letterSpacing:'0.12em', textTransform:'uppercase' }}>{r.name}</div>
              {r.desc && <div style={{ fontFamily:'Rajdhani, sans-serif', fontSize: 10, color:'var(--hud-steel)', lineHeight: 1.3, marginTop: 1 }}>{r.desc}</div>}
            </div>
            <div style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontSize: 9, color:'var(--hud-ink-dim)' }}>
              {fmt(r.lat)}<br/>{fmt(r.lon)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Globe with center temperature readout + hover-info tooltip + click handler.
const GlobeWithReadout = ({ mode, color, seed, contours, scale, size, markers, tempC, info, photoUrl, onClick, apiRef }) => {
  const f = tempC != null ? (tempC * 9/5 + 32) : null;
  const [hover, setHover] = React.useState(false);
  const [interacted, setInteracted] = React.useState(false);
  const localApiRef = React.useRef(null);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
         style={{ position:'relative' }}>
      <div onClick={(e) => { if (!interacted) setInteracted(true); if (onClick && e.target.tagName !== 'CANVAS') onClick(); }}
           onPointerDownCapture={() => setInteracted(true)}
           style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <Globe3D
          mode={mode} color={color} seed={seed} contours={contours} scale={scale}
          size={size} markers={markers} photoUrl={photoUrl}
          onReady={(api) => { localApiRef.current = api; if (apiRef) apiRef.current = api; }}
        />
      </div>
      {tempC != null && (
        <>
          <div style={{ position:'absolute', left: '14%', top: '44%', fontFamily:'var(--font-display)', fontSize: 26, color:'var(--hud-ink)', pointerEvents:'none', textShadow:'0 0 6px rgba(0,0,0,0.9)' }}>
            {tempC.toFixed(1)}°C
          </div>
          <div style={{ position:'absolute', right: '14%', top: '54%', fontFamily:'var(--font-display)', fontSize: 26, color:'var(--hud-ink)', pointerEvents:'none', textShadow:'0 0 6px rgba(0,0,0,0.9)' }}>
            {f.toFixed(1)}°F
          </div>
        </>
      )}
      {hover && info && (
        <div style={{ position:'absolute', top: 12, left: '50%', transform:'translateX(-50%)', background:'rgba(10,10,10,0.94)', border:'1px solid var(--hud-accent)', padding:'10px 14px', maxWidth: 380, color:'var(--hud-ink)', fontFamily:'Rajdhani, sans-serif', fontSize: 11, lineHeight: 1.5, pointerEvents:'none', zIndex: 10 }}>
          {info}
        </div>
      )}
      {/* Reset button — fades in after first interaction */}
      <button
        onClick={(e) => { e.stopPropagation(); localApiRef.current?.reset(); }}
        style={{
          position:'absolute', bottom: 10, left: 10,
          background:'rgba(10,10,10,0.85)', border:'1px solid var(--hud-hairline)',
          color:'var(--hud-ink-dim)',
          fontFamily:'var(--font-display)', fontSize: 10, letterSpacing:'0.24em',
          padding:'5px 10px', cursor:'pointer', textTransform:'uppercase',
          display:'flex', alignItems:'center', gap: 6,
          opacity: interacted ? 1 : 0,
          pointerEvents: interacted ? 'auto' : 'none',
          transition:'opacity 0.25s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--hud-accent)'; e.currentTarget.style.borderColor = 'var(--hud-accent)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--hud-ink-dim)'; e.currentTarget.style.borderColor = 'var(--hud-hairline)'; }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M 1.5 5 A 3.5 3.5 0 1 1 5 8.5" />
          <polyline points="1.5,2.5 1.5,5 4,5" />
        </svg>
        RESET
      </button>
    </div>
  );
};

window.TabEarth = TabEarth;
window.TabNEO = TabNEO;
window.TabSolar = TabSolar;
window.TabDeep = TabDeep;
window.TabMars = TabMars;
