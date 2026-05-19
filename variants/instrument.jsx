// ─────────────────────────────────────────────────────────────
// VARIATION C — "INSTRUMENT CLUSTER" Radial Dominant
// Inspired by reference image 09 — concentric rings dominate,
// polar plots and triangular velocity vectors. Highly graphical.
// Adapted: inner solar system map + NEO orbital plot + DONKI wheel.
// ─────────────────────────────────────────────────────────────

const VariantInstrument = () => {
  const { neos, donki, exoplanets, iss, mars } = window.NASA;

  // NEOs plotted on polar chart — angle derived from id, radius from miss distance
  const neoPoints = neos.slice(0, 10).map((n, i) => ({
    angle: (i * 37) % 360 / 360,
    r: Math.min(0.95, 0.15 + Math.log10(n.miss_km) / 10),
    label: n.name.split(' ').pop().slice(0,4),
    hot: n.hazard,
  }));

  return (
    <div className="hud hud-frame" style={{ width:'100%', height:'100%', padding: 20, boxSizing:'border-box', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gridTemplateRows:'30px repeat(2, 1fr) 120px', gap: 14 }}>

      {/* top strip */}
      <div style={{ gridColumn:'1 / -1', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--hud-hairline)', paddingBottom: 6 }}>
        <div style={{ display:'flex', gap: 20, alignItems:'baseline' }}>
          <HudLabel size={11} track={0.3}>Wx·DATA</HudLabel>
          <HudValue size={22}>SKYTWR</HudValue>
          <HudMono size={9} tone="steel">QUAD·A3·177</HudMono>
        </div>
        <div style={{ display:'flex', gap: 20, alignItems:'baseline' }}>
          <HudLabel size={10}>PRESSURE X4·409</HudLabel>
          <HudLabel size={10} tone="primary">TET·SYSTEM K7·226</HudLabel>
          <HudLabel size={10}>DATA·STATUS</HudLabel>
          <HudLabel size={10} tone="primary">MONITOR·FEED</HudLabel>
          <HudChip tone="hot">ACTIVE</HudChip>
          <HudLabel size={10}>SUMMARY</HudLabel>
        </div>
      </div>

      {/* TL — compass wheel (solar flare direction) */}
      <div style={{ border:'1px solid var(--hud-hairline-soft)', padding: 14, display:'flex', flexDirection:'column', position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudLabel size={10}>SOLAR · FLR</HudLabel>
          <HudMono size={9} tone="hot">X·{donki.find(d=>d.type==='FLR')?.class}</HudMono>
        </div>
        <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'relative' }}>
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
              {/* outer filled arc */}
              <path d="M 110 10 A 100 100 0 1 1 30 160" stroke="var(--hud-cool)" strokeWidth="18" opacity="0.75" />
              {/* inner ring */}
              <circle cx="110" cy="110" r="80" stroke="var(--hud-hairline)" />
              <circle cx="110" cy="110" r="60" stroke="var(--hud-hairline)" />
              <circle cx="110" cy="110" r="40" stroke="var(--hud-hairline)" />
              {/* ticks */}
              {Array.from({ length: 60 }).map((_, i) => {
                const a = (i/60)*Math.PI*2 - Math.PI/2;
                const r1 = 100, r2 = i%5===0 ? 92 : 96;
                return <line key={i} x1={110+Math.cos(a)*r1} y1={110+Math.sin(a)*r1} x2={110+Math.cos(a)*r2} y2={110+Math.sin(a)*r2} stroke={i%5===0?'var(--hud-ink)':'var(--hud-hairline)'} />;
              })}
              {/* cardinal pointer */}
              <polygon points="110,4 116,20 104,20" fill="var(--hud-cool)" />
              {/* crosshair */}
              <line x1="110" y1="110" x2="110" y2="30" stroke="var(--hud-cool)" strokeDasharray="2 2" />
              <circle cx="110" cy="110" r="3" fill="var(--hud-accent)" />
            </svg>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudMono size={8} tone="steel">HEADING</HudMono>
          <HudMono size={8} tone="hot">S12W28 · AR13721</HudMono>
        </div>
      </div>

      {/* TC — concentric diagnostic matrix (DONKI energy wheel) */}
      <div style={{ border:'1px solid var(--hud-hairline-soft)', padding: 14, display:'flex', flexDirection:'column', position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudLabel size={10}>FORCE·R</HudLabel>
          <HudMono size={9} tone="hot">P1·449</HudMono>
        </div>
        <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
            {/* concentric rings */}
            {[100, 80, 60, 42].map((r, i) => (
              <circle key={i} cx="120" cy="120" r={r} stroke="var(--hud-hairline)" />
            ))}
            {/* broken-up sector tiles around */}
            {Array.from({ length: 36 }).map((_, i) => {
              const a0 = (i/36)*Math.PI*2, a1 = a0 + (Math.PI*2/36)*0.85;
              const r1 = 64, r2 = 72 + (donki[i % donki.length].intensity)*20;
              const p1 = [120+Math.cos(a0)*r1, 120+Math.sin(a0)*r1];
              const p2 = [120+Math.cos(a1)*r1, 120+Math.sin(a1)*r1];
              const p3 = [120+Math.cos(a1)*r2, 120+Math.sin(a1)*r2];
              const p4 = [120+Math.cos(a0)*r2, 120+Math.sin(a0)*r2];
              const hot = donki[i % donki.length].intensity > 0.6;
              return <polygon key={i} points={`${p1.join(',')} ${p2.join(',')} ${p3.join(',')} ${p4.join(',')}`} fill={hot ? 'var(--hud-accent)' : 'var(--hud-cool)'} opacity={0.4 + donki[i%donki.length].intensity*0.6} />;
            })}
            {/* rotating outer ticks */}
            <g style={{ transformOrigin:'120px 120px', animation:'hud-rot 60s linear infinite' }}>
              {Array.from({ length: 72 }).map((_, i) => {
                const a = (i/72)*Math.PI*2;
                return <line key={i} x1={120+Math.cos(a)*104} y1={120+Math.sin(a)*104} x2={120+Math.cos(a)*(i%6===0?112:108)} y2={120+Math.sin(a)*(i%6===0?112:108)} stroke="var(--hud-ink-dim)" />;
              })}
            </g>
            {/* center */}
            <circle cx="120" cy="120" r="4" fill="var(--hud-accent)" />
            <text x="120" y="124" fill="var(--hud-ink)" fontSize="10" fontFamily="var(--font-display)" textAnchor="middle" letterSpacing="2">SOLAR·ENE</text>
          </svg>
        </div>
      </div>

      {/* TR — segmented bar matrix */}
      <div style={{ border:'1px solid var(--hud-hairline-soft)', padding: 14 }}>
        <HudLabel size={10}>EXO·ARCHIVE · HABITABLE ZONE</HudLabel>
        <div style={{ marginTop: 10, display:'flex', flexDirection:'column', gap: 6 }}>
          {exoplanets.slice(0, 8).map((p, i) => {
            const scoreR = Math.min(1, p.radius_earth / 2.5);
            const scoreT = 1 - Math.abs(288 - p.temp_k) / 288;
            return (
              <div key={p.name} style={{ display:'grid', gridTemplateColumns: '74px 1fr 36px', gap: 6, alignItems:'center' }}>
                <HudMono size={8} tone={p.habitable?'ink':'steel'}>{p.name}</HudMono>
                <div style={{ display:'flex', gap: 1, height: 12 }}>
                  {Array.from({ length: 24 }).map((_, j) => (
                    <div key={j} style={{ flex: 1, background: j < scoreR*12 ? 'var(--hud-cool)' : j < 12 ? 'var(--hud-steel-dim)' : j < 12 + scoreT*12 ? 'var(--hud-accent)' : 'var(--hud-steel-dim)' }} />
                  ))}
                </div>
                <HudMono size={8} tone={p.habitable?'hot':'steel'}>{p.distance_ly < 100 ? p.distance_ly.toFixed(1) : Math.round(p.distance_ly)}ly</HudMono>
              </div>
            );
          })}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop: 12 }}>
          <HudMono size={8} tone="cool">■ RADIUS ×E</HudMono>
          <HudMono size={8} tone="hot">■ TEMP ×K</HudMono>
        </div>
      </div>

      {/* BL — radar polar (NEOs) */}
      <div style={{ border:'1px solid var(--hud-hairline-soft)', padding: 14, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudLabel size={10}>NEO · POLAR</HudLabel>
          <HudMono size={9} tone="hot">{neos.filter(n=>n.hazard).length}·PHA</HudMono>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <HudRadar size={220} rings={5} sectors={12} points={neoPoints} centerLabel="EARTH" />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudMono size={8} tone="steel">INNER 0.05 au</HudMono>
          <HudMono size={8} tone="steel">OUTER 0.5 au</HudMono>
        </div>
      </div>

      {/* BC — WIND SYSTEM (Mars wind vectors as radial) */}
      <div style={{ border:'1px solid var(--hud-hairline-soft)', padding: 14, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudLabel size={10}>WIND · SYSTEM</HudLabel>
          <HudLabel size={10} tone="primary">MARS·SOL·{mars.sol}</HudLabel>
        </div>
        <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
            {/* half-rings (like ref 09 wind system) */}
            {[20, 40, 60, 80, 100].map((r, i) => (
              <path key={i} d={`M ${120-r} 180 A ${r} ${r} 0 0 1 ${120+r} 180`}
                    stroke={i === 0 ? 'var(--hud-accent-2)' : i === 1 ? 'var(--hud-accent)' : i === 2 ? 'var(--hud-cool)' : 'var(--hud-steel-dim)'}
                    strokeWidth={i===0?3:1} />
            ))}
            {/* wind dir pointer */}
            {(() => {
              const a = (mars.wind_dir_deg - 90) * Math.PI / 180;
              const x = 120 + Math.cos(a) * 90, y = 180 + Math.sin(a) * 90;
              return <>
                <line x1="120" y1="180" x2={x} y2={y} stroke="var(--hud-accent)" strokeWidth="2" />
                <circle cx={x} cy={y} r="3" fill="var(--hud-accent)" />
              </>;
            })()}
            <circle cx="120" cy="180" r="3" fill="var(--hud-ink)" />
            {/* readouts */}
            <text x="12" y="220" fill="var(--hud-ink-dim)" fontSize="9" fontFamily="var(--font-mono)">MIN {mars.wind_speed_ms.min}</text>
            <text x="120" y="220" fill="var(--hud-ink)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">AVG {mars.wind_speed_ms.avg} m/s</text>
            <text x="228" y="220" fill="var(--hud-accent)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">MAX {mars.wind_speed_ms.max}</text>
          </svg>
        </div>
      </div>

      {/* BR — VELOCITY VECTOR triangle (NEO approach vectors) */}
      <div style={{ border:'1px solid var(--hud-hairline-soft)', padding: 14, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudLabel size={10}>VELOCITY · VECTOR</HudLabel>
          <HudMono size={9} tone="hot">49·749</HudMono>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="260" height="220" viewBox="0 0 260 220" fill="none">
            {/* nested triangles */}
            {[1, 0.8, 0.6, 0.4, 0.2].map((s, i) => (
              <polygon key={i}
                points={`${130},${10+(110)*(1-s)} ${130-110*s},${200-(100)*(1-s)} ${130+110*s},${200-(100)*(1-s)}`}
                stroke={i === 0 ? 'var(--hud-ink)' : i === 1 ? 'var(--hud-cool)' : 'var(--hud-steel-dim)'}
                strokeWidth={i===0?1:0.6}
                opacity={1 - i*0.12}
              />
            ))}
            {/* tick along base */}
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={i} x1={20+i*22} y1={200} x2={20+i*22} y2={i%2===0?190:194} stroke="var(--hud-ink)" />
            ))}
            {/* axis labels */}
            <text x="130" y="8" fill="var(--hud-accent)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="middle">A·VEL</text>
            <text x="14" y="212" fill="var(--hud-cool)" fontSize="8" fontFamily="var(--font-mono)">B·MAG</text>
            <text x="246" y="212" fill="var(--hud-cool)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="end">C·DIST</text>
            {/* plot samples */}
            {neos.slice(0,6).map((n, i) => {
              const t = i / 5;
              const cx = 130 + (t-0.5)*180;
              const cy = 60 + (1-t)*120;
              return <g key={n.id}><rect x={cx-3} y={cy-3} width="6" height="6" fill={n.hazard ? 'var(--hud-accent)' : 'var(--hud-ink)'} /></g>;
            })}
          </svg>
        </div>
      </div>

      {/* bottom 3 wide stats */}
      <div style={{ gridColumn:'1 / -1', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap: 12, borderTop:'1px solid var(--hud-hairline)', paddingTop: 10 }}>
        {[
          { label:'ISS · ALT',  val: iss.altitude_km.toFixed(1), unit:'KM',     sub:'LEO·NOM' },
          { label:'ISS · VEL',  val: (iss.velocity_kmh/1000).toFixed(2), unit:'×10³ KMH', sub:'ORBIT·'+iss.orbit },
          { label:'MARS · PRS', val: mars.pressure_pa, unit:'Pa',     sub:'SOL·'+mars.sol },
          { label:'KP · IDX',   val: donki.find(d=>d.type==='GST')?.kp_index, unit:'KP', sub:'GEO·STORM·G'+((donki.find(d=>d.type==='GST')?.kp_index||0)-4) },
        ].map((s, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', gap: 4, position:'relative', padding: 8 }} className="hud-bracket-4">
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <HudLabel size={9}>{s.label}</HudLabel>
              <HudMono size={9} tone="steel">#{String(i+1).padStart(3,'0')}</HudMono>
            </div>
            <div style={{ display:'flex', alignItems:'baseline', gap: 6 }}>
              <HudValue size={36} tone={i===3?'hot':'ink'}>{s.val}</HudValue>
              <HudLabel size={9} tone="steel">{s.unit}</HudLabel>
            </div>
            <HudLabel size={8}>{s.sub}</HudLabel>
          </div>
        ))}
      </div>
    </div>
  );
};

window.VariantInstrument = VariantInstrument;
