// ─────────────────────────────────────────────────────────────
// VARIATION A — "TET VISION" Light Table
// Dominant centered imagery (APOD) with side rails of telemetry.
// Follows the Oblivion reference images 02 & 21 most directly.
// ─────────────────────────────────────────────────────────────

const VariantLightTable = () => {
  const { apod, iss, epic, donki, neos, mars } = window.NASA;
  const [apodErr, setApodErr] = React.useState(false);

  // Generate fake waveform for "voice feed"
  const wave = React.useMemo(() => Array.from({ length: 48 }, () => 0.15 + Math.random() * 0.85), []);
  const elev = React.useMemo(() => Array.from({ length: 64 }, () => 0.3 + Math.random() * 0.7), []);

  return (
    <div className="hud hud-frame" style={{ width: '100%', height: '100%', padding: 20, display: 'grid', gridTemplateColumns: '240px 1fr 220px', gridTemplateRows: '52px 1fr 70px', gap: 12, boxSizing: 'border-box' }}>

      {/* ─── TOP STRIP ─── */}
      <div style={{ gridColumn: '1 / -1', display:'grid', gridTemplateColumns: '240px 1fr 220px', gap: 12 }}>
        {/* Top-left: logo + ONLINE */}
        <div style={{ display:'flex', alignItems:'center', gap: 14, padding: '0 4px' }}>
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" stroke="var(--hud-ink)" strokeWidth="2">
            <path d="M50 8 L92 82 L8 82 Z" />
            <circle cx="50" cy="62" r="6" fill="var(--hud-accent)" stroke="none" />
            <line x1="30" y1="82" x2="70" y2="82" stroke="var(--hud-accent)" strokeWidth="3" />
          </svg>
          <HudValue size={34} weight={300}>ONLINE</HudValue>
        </div>

        {/* Top-center: title */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 24, borderBottom: '1px solid var(--hud-hairline)', paddingBottom: 4 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--hud-ink)" strokeWidth="1">
              <circle cx="10" cy="10" r="9" />
              <circle cx="10" cy="10" r="4" />
              <line x1="10" y1="1" x2="10" y2="19" />
              <line x1="1" y1="10" x2="19" y2="10" />
            </svg>
            <HudLabel size={12} track={0.3} tone="primary">NASA·VISION</HudLabel>
          </div>
          <HudLabel size={10} tone="steel">DEEP SPACE NETWORK · STATION 14</HudLabel>
          <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="5,0 10,10 0,10" fill="var(--hud-accent)" /></svg>
            <HudLabel size={10} tone="hot">TOUR 3636</HudLabel>
          </div>
          <HudMono size={10} tone="steel">LAT: {epic.centroid_coordinates.lat}°N · LON: {epic.centroid_coordinates.lon}°E</HudMono>
        </div>

        {/* Top-right: FEEDS header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap: 10 }}>
          <HudValue size={28}>FEEDS</HudValue>
        </div>
      </div>

      {/* ─── LEFT RAIL ─── */}
      <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>

        {/* Mission clock + operator */}
        <div className="hud-bracket-4" style={{ padding: 10 }}>
          <HudClock size={26} />
          <div style={{ height: 6 }} />
          <HudLabel tone="steel" size={9}>UTC · MISSION DAY</HudLabel>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop: 4 }}>
            <HudValue size={20} tone="cool"><HudMissionDay /></HudValue>
            <HudChip tone="hot">LIVE</HudChip>
          </div>
        </div>

        {/* Operator + waveform */}
        <div style={{ display:'grid', gridTemplateColumns: '62px 1fr', gap: 8, border:'1px solid var(--hud-hairline)', padding: 8 }}>
          <div style={{ background:'#111', aspectRatio: '1', position:'relative', overflow:'hidden' }}>
            <svg width="100%" height="100%" viewBox="0 0 60 60">
              <rect width="60" height="60" fill="#0a0a0a" />
              {/* silhouette */}
              <circle cx="30" cy="22" r="10" fill="#1f1f1f" />
              <path d="M 8 60 Q 30 32 52 60 Z" fill="#1f1f1f" />
              <line x1="0" y1="48" x2="60" y2="48" stroke="var(--hud-accent)" strokeWidth="0.5" opacity="0.5" />
            </svg>
            <div style={{ position:'absolute', bottom: 2, left: 2 }}>
              <HudMono size={8} tone="hot">OP · 09</HudMono>
            </div>
          </div>
          <div>
            <HudLabel size={9}>VOICE FEED</HudLabel>
            <div style={{ display:'flex', alignItems:'flex-end', gap: 1, height: 28, marginTop: 4 }}>
              {wave.map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v*100}%`, background: i < 32 ? 'var(--hud-cool)' : 'var(--hud-accent)' }} />
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4 }}>
              <HudMono size={9} tone="steel">J. COOPER</HudMono>
              <HudMono size={9} tone="cool">CLR</HudMono>
            </div>
          </div>
        </div>

        {/* Mission block */}
        <div>
          <div style={{ background:'#1a1a1a', padding: '4px 8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <HudLabel size={9}>MISSION</HudLabel>
            <HudLabel size={9} tone="primary">EARTH·OBSERVATION</HudLabel>
          </div>

          {/* Mission metrics grid */}
          <div style={{ border:'1px solid var(--hud-hairline)', borderTop:'none' }}>
            {[
              { label: 'CRAFT Nº', val: '01', sub: `ALT ${iss.altitude_km.toFixed(1)}\nVEL ${Math.round(iss.velocity_kmh/100)/10}k\nORB ${iss.orbit}`, icon: 'iss' },
              { label: 'CREW', val: iss.crew.length, sub: `ISS ${iss.crew.filter(c=>c.craft==='ISS').length}\nTGG ${iss.crew.filter(c=>c.craft==='Tiangong').length}\nEVA 0`, icon: 'crew' },
              { label: 'EPIC FEED', val: 'L1', sub: `${epic.dscovr_j2000_position.x.toFixed(0).slice(0,4)}k km\nlat ${epic.centroid_coordinates.lat}\nlon ${epic.centroid_coordinates.lon}`, icon: 'epic' },
              { label: 'SPACE WX', val: donki.filter(d=>d.intensity>0.5).length, sub: `FLR ${donki.filter(d=>d.type==='FLR').length}\nCME ${donki.filter(d=>d.type==='CME').length}\nKP ${donki.find(d=>d.type==='GST')?.kp_index || 0}`, icon: 'sun' },
            ].map((r, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns: '1fr 1fr 36px', borderBottom: i < 3 ? '1px solid var(--hud-hairline)' : 'none', padding: '6px 8px', gap: 6, alignItems:'center' }}>
                <div>
                  <HudLabel size={8}>{r.label}</HudLabel>
                  <div style={{ marginTop: 2 }}>
                    <HudValue size={22}>{r.val}</HudValue>
                  </div>
                </div>
                <HudMono size={8} tone="steel" style={{ whiteSpace:'pre-line', lineHeight: 1.3 }}>{r.sub}</HudMono>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--hud-ink)" strokeWidth="1">
                  {r.icon === 'iss' && <><line x1="6" y1="16" x2="26" y2="16" /><rect x="14" y="12" width="4" height="8" fill="var(--hud-ink)" /><line x1="10" y1="12" x2="10" y2="20" /><line x1="22" y1="12" x2="22" y2="20" /></>}
                  {r.icon === 'crew' && <><circle cx="16" cy="12" r="4" /><path d="M 6 26 Q 16 18 26 26" /></>}
                  {r.icon === 'epic' && <><circle cx="16" cy="16" r="8" /><ellipse cx="16" cy="16" rx="8" ry="3" /><line x1="4" y1="16" x2="28" y2="16" strokeDasharray="2 2" /></>}
                  {r.icon === 'sun' && <><circle cx="16" cy="16" r="4" fill="var(--hud-accent)" stroke="none" />{[0,45,90,135,180,225,270,315].map(a => { const r1=a*Math.PI/180; return <line key={a} x1={16+Math.cos(r1)*7} y1={16+Math.sin(r1)*7} x2={16+Math.cos(r1)*11} y2={16+Math.sin(r1)*11} />; })}</>}
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Comm link */}
        <div style={{ background:'#1a1a1a', padding: '6px 8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <HudLabel size={9}>COMM LINK</HudLabel>
          <HudLabel size={9} tone="primary">DSN·14 · MADRID</HudLabel>
        </div>

        {/* Command / TECH footer */}
        <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--hud-hairline)' }}>
          <div style={{ padding: 8, borderRight: '1px solid var(--hud-hairline)' }}>
            <HudLabel size={9}>COMMAND</HudLabel>
            <div style={{ marginTop: 6, display:'flex', alignItems:'center', gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="6" fill="none" stroke="var(--hud-steel)" /><circle cx="10" cy="10" r="2" fill="var(--hud-steel)" /></svg>
              <HudValue size={20} tone="steel">OFF</HudValue>
            </div>
          </div>
          <div style={{ padding: 8 }}>
            <HudLabel size={9}>TECH · 49</HudLabel>
            <div style={{ marginTop: 6, display:'flex', alignItems:'center', gap: 8 }}>
              <HudBar value={0.8} segments={4} color="var(--hud-accent)" height={14} style={{ width: 24 }} />
              <HudValue size={20} tone="hot">ON</HudValue>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CENTER: APOD HERO ─── */}
      <div style={{ display:'flex', flexDirection:'column', gap: 6, minWidth: 0 }}>
        {/* Grid overlay + image */}
        <div style={{ flex: 1, position:'relative', border: '1px solid var(--hud-hairline)', overflow:'hidden', background: '#000' }}>

          {/* APOD image */}
          {!apodErr ? (
            <img
              src={`https://api.nasa.gov/planetary/apod?api_key=${window.NASA_KEY}&thumbs=true`}
              style={{ display:'none' }}
              onError={() => setApodErr(true)}
              alt=""
            />
          ) : null}
          <img
            src="https://apod.nasa.gov/apod/image/2403/NGC1365_JamesWebb_960.jpg"
            onError={(e) => { e.target.src = 'https://images-assets.nasa.gov/image/PIA13005/PIA13005~medium.jpg'; }}
            style={{ position:'absolute', inset: 0, width:'100%', height:'100%', objectFit:'cover', opacity: 0.78, filter: 'contrast(1.08) saturate(0.9)' }}
            alt=""
          />

          {/* dark vignette for legibility */}
          <div style={{ position:'absolute', inset:0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)' }} />

          {/* HUD grid overlay with coords */}
          <svg style={{ position:'absolute', inset: 0, width:'100%', height:'100%' }} preserveAspectRatio="none">
            {/* grid */}
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={`v${i}`} x1={`${(i+1)/14*100}%`} y1="0" x2={`${(i+1)/14*100}%`} y2="100%" stroke="rgba(245,241,232,0.14)" strokeWidth="1" />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i+1)/8*100}%`} x2="100%" y2={`${(i+1)/8*100}%`} stroke="rgba(245,241,232,0.14)" strokeWidth="1" />
            ))}
          </svg>

          {/* Column labels A-H on left */}
          <div style={{ position:'absolute', left: 4, top: 0, bottom: 20, display:'flex', flexDirection:'column', justifyContent:'space-around' }}>
            {['A','B','C','D','E','F','G','H'].map(l => <HudMono key={l} size={9} tone="ink">{l}</HudMono>)}
          </div>
          {/* Row labels 1-13 on bottom */}
          <div style={{ position:'absolute', bottom: 4, left: 20, right: 20, display:'flex', justifyContent:'space-between' }}>
            {Array.from({ length: 13 }, (_, i) => i+1).map(n => <HudMono key={n} size={9} tone="ink">{n}</HudMono>)}
          </div>

          {/* Corner brackets */}
          <div style={{ position:'absolute', inset: 8 }}>
            <svg style={{ position:'absolute', inset: 0, width:'100%', height:'100%' }} fill="none" stroke="var(--hud-ink)" strokeWidth="1">
              <path d="M 0 20 L 0 0 L 20 0" />
              <path d="M calc(100% - 20px) 0 L 100% 0 L 100% 20" />
              <path d="M 0 calc(100% - 20px) L 0 100% L 20 100%" />
              <path d="M calc(100% - 20px) 100% L 100% 100% L 100% calc(100% - 20px)" />
            </svg>
          </div>

          {/* Reticle over interesting area */}
          <div style={{ position:'absolute', top: '38%', left: '55%', pointerEvents:'none' }}>
            <HudReticle size={90} color="var(--hud-accent)" />
            <div style={{ position:'absolute', left: 96, top: 36, whiteSpace:'nowrap' }}>
              <HudMono size={9} tone="hot">TARGET · NGC 1365</HudMono><br/>
              <HudMono size={9} tone="cool">60 Mly · FORNAX</HudMono>
            </div>
          </div>

          {/* Distance rings */}
          <div style={{ position:'absolute', top: 20, right: 30 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="var(--hud-ink)" opacity="0.4">
              <circle cx="40" cy="40" r="36" strokeDasharray="2 3" />
              <circle cx="40" cy="40" r="24" />
              <circle cx="40" cy="40" r="12" />
              <line x1="40" y1="0" x2="40" y2="80" strokeDasharray="1 3" />
              <line x1="0" y1="40" x2="80" y2="40" strokeDasharray="1 3" />
            </svg>
          </div>

          {/* Bottom overlay: title caption */}
          <div style={{ position:'absolute', bottom: 28, left: 24, right: 24 }}>
            <HudLabel size={9} tone="hot">APOD · 2026·04·18</HudLabel>
            <div style={{ marginTop: 2 }}>
              <HudValue size={22}>{apod.title.toUpperCase()}</HudValue>
            </div>
            <HudMono size={9} tone="steel" style={{ marginTop: 2, display:'block' }}>IMG · {apod.copyright}</HudMono>
          </div>

          {/* Scan line */}
          <HudScanline />
        </div>

        {/* Elevation strip under image */}
        <div style={{ display:'grid', gridTemplateColumns: '120px 1fr 140px 180px', gap: 12, alignItems:'center', padding: '4px 8px', border:'1px solid var(--hud-hairline)' }}>
          <div>
            <HudLabel size={8}>SURFACE ELEV</HudLabel>
            <div style={{ display:'flex', gap: 6, marginTop: 2 }}>
              <HudMono size={8} tone="hot">MAX 42</HudMono>
              <HudMono size={8} tone="cool">MIN -08</HudMono>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap: 1, height: 22 }}>
            {elev.map((v, i) => (
              <div key={i} style={{ flex: 1, height: `${v*100}%`, background: v > 0.7 ? 'var(--hud-accent)' : 'var(--hud-ink)' }} />
            ))}
          </div>
          <HudMono size={9} tone="steel">{'#####  #### ####  ###'}</HudMono>
          <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--hud-accent)"><polygon points="11,3 20,18 2,18" /></svg>
            <HudBar value={0.62} segments={10} height={8} color="var(--hud-accent)" />
            <HudMono size={9} tone="hot">-68·71</HudMono>
          </div>
        </div>
      </div>

      {/* ─── RIGHT RAIL ─── */}
      <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
        {/* DATALINKS */}
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <HudLabel size={9}>DATALINKS</HudLabel>
            <HudValue size={22} tone="hot">{donki.length}</HudValue>
          </div>
          <div style={{ display:'flex', gap: 2, marginTop: 6 }}>
            {donki.slice(0, 8).map((d, i) => (
              <div key={i} style={{
                flex: 1, height: 18,
                background: d.intensity > 0.7 ? 'var(--hud-accent)' : d.intensity > 0.4 ? 'var(--hud-cool)' : 'var(--hud-steel-dim)',
                opacity: 0.3 + d.intensity * 0.7,
              }} title={d.type} />
            ))}
          </div>
        </div>

        {/* MAIN MAP FEED card with topo */}
        <div style={{ border:'1px solid var(--hud-hairline)' }}>
          <div style={{ background:'var(--hud-accent)', color:'var(--hud-bg)', padding: '4px 8px', display:'flex', justifyContent:'space-between' }}>
            <HudLabel size={9} style={{ color:'var(--hud-bg)' }}>MAIN MAP</HudLabel>
            <HudLabel size={9} style={{ color:'var(--hud-bg)' }}>FEED</HudLabel>
          </div>
          <div style={{ height: 80, background:'#0a0a0a', position:'relative', overflow:'hidden' }}>
            <svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none">
              {/* topo-style concentric contours */}
              {Array.from({ length: 6 }).map((_, i) => (
                <path key={i} d={`M 0 ${20+i*8} Q 50 ${10+i*8} 100 ${25+i*6} T 200 ${18+i*7}`} fill="none" stroke="var(--hud-ink)" strokeWidth="0.5" opacity={0.2 + i*0.1} />
              ))}
            </svg>
          </div>
        </div>

        {/* TET CAM — NEOs as thumbnails */}
        <div style={{ border:'1px solid var(--hud-hairline)' }}>
          <div style={{ background:'#1a1a1a', padding: '4px 8px', display:'flex', justifyContent:'space-between' }}>
            <HudLabel size={9}>NEO · TRACK</HudLabel>
            <HudLabel size={9} tone="primary">FEED</HudLabel>
          </div>
          <div style={{ padding: 6, display:'grid', gap: 4 }}>
            <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background:'var(--hud-accent)' }} />
              <HudMono size={9} tone="hot">{neos.filter(n=>n.hazard).length} HAZARD</HudMono>
              <div style={{ flex:1 }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background:'var(--hud-steel)' }} />
              <HudMono size={9} tone="steel">{neos.filter(n=>!n.hazard).length} NOM</HudMono>
            </div>
            {neos.slice(0, 4).map((n, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize: 9 }}>
                <HudMono size={8} tone={n.hazard ? 'hot' : 'ink-dim'}>{n.name}</HudMono>
                <HudMono size={8} tone="steel">{n.miss_lunar.toFixed(1)}LD</HudMono>
              </div>
            ))}
          </div>
        </div>

        {/* SHIP CAM — solar + mars */}
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
            <HudLabel size={9}>INSTR·PANEL</HudLabel>
            <HudMono size={8} tone="steel">F 5.6</HudMono>
          </div>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <HudRing size={96} innerRadius={28} rings={3} ticks={40} spin={80} fillPct={mars.ls / 360}>
              <div style={{ textAlign:'center' }}>
                <HudValue size={16} tone="hot">{mars.sol}</HudValue>
                <div style={{ height: 2 }} />
                <HudLabel size={7}>MARS SOL</HudLabel>
              </div>
            </HudRing>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 8 }}>
            <div><HudLabel size={8}>AF</HudLabel> <HudMono size={9}>{mars.air_temp_c.avg}°</HudMono></div>
            <div><HudLabel size={8}>MF</HudLabel> <HudMono size={9}>{mars.pressure_pa}Pa</HudMono></div>
          </div>
        </div>

        {/* Rotation indicator */}
        <div style={{ border:'1px solid var(--hud-hairline)', padding: 8, flex: 1 }}>
          <div style={{ background:'#1a1a1a', padding: '3px 6px', marginBottom: 6 }}>
            <HudLabel size={9}>SKY·ROT</HudLabel>
          </div>
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height: 60 }}>
            <svg width="80" height="50" viewBox="0 0 80 50" fill="none" stroke="var(--hud-ink)" strokeWidth="1">
              <path d="M 40 10 L 20 40 L 60 40 Z" />
              <line x1="40" y1="10" x2="40" y2="40" strokeDasharray="2 2" />
              <circle cx="40" cy="40" r="2" fill="var(--hud-accent)" />
            </svg>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4 }}>
            <HudLabel size={8}>L</HudLabel>
            <HudLabel size={10} tone="primary">90°</HudLabel>
            <HudLabel size={8}>R</HudLabel>
          </div>
          <HudLabel size={8} style={{ display:'block', textAlign:'center', marginTop: 4 }}>ROTATION</HudLabel>
        </div>
      </div>

      {/* ─── BOTTOM STRIP ─── */}
      <div style={{ gridColumn: '1 / -1', display:'grid', gridTemplateColumns: '240px 1fr 220px', gap: 12, alignItems:'center' }}>
        <HudMono size={8} tone="steel">PKT 0x2EAB · CRC·OK · RX·118ms</HudMono>
        <div style={{ display:'flex', justifyContent:'space-between', gap: 24, padding: '0 12px' }}>
          <HudMono size={9} tone="steel">CURSOR · 47·12N 155·81W</HudMono>
          <div style={{ display:'flex', gap: 4 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ width: 14, height: 14, border: '1px solid var(--hud-ink)' }} />
            ))}
          </div>
          <HudMono size={9} tone="steel">PWR·NOMINAL · 118%</HudMono>
        </div>
        <HudMono size={8} tone="steel" style={{ textAlign:'right' }}>SIG ·█·▇·▅·▇·▆·█·▇·▄·</HudMono>
      </div>
    </div>
  );
};

window.VariantLightTable = VariantLightTable;
