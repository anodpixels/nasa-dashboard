// ─────────────────────────────────────────────────────────────
// VARIATION B — "DRONE MATRIX" Cockpit Grid
// Dense multi-panel layout inspired by reference image 03.
// Big wireframe center, dispatched-row table on right, telemetry strip bottom.
// Adapted for NASA: ISS wireframe + NEO track table + space weather history.
// ─────────────────────────────────────────────────────────────

const VariantCockpit = () => {
  const { iss, neos, donki, mars, exoplanets } = window.NASA;

  const flux = React.useMemo(() => Array.from({ length: 60 }, (_, i) => Math.abs(Math.sin(i*0.3) * 0.6 + Math.random()*0.4)), []);
  const ammo = React.useMemo(() => Array.from({ length: 30 }, () => Math.random()), []);

  return (
    <div className="hud hud-frame" style={{ width:'100%', height:'100%', padding: 20, display:'grid', gridTemplateRows: '36px 1fr 120px 38px', gap: 10, boxSizing:'border-box' }}>

      {/* ── Top meta strip ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap: 10, alignItems:'center', borderBottom:'1px solid var(--hud-hairline)', paddingBottom: 6 }}>
        <div style={{ gridColumn:'span 2', display:'flex', gap: 12, alignItems:'baseline' }}>
          <HudLabel size={10}>RnDMX</HudLabel>
          <HudValue size={20}>ISS·R</HudValue>
        </div>
        <div style={{ gridColumn:'span 2' }}>
          <HudLabel size={8}>STATION STATUS</HudLabel>
          <HudLabel size={9} tone="primary">MONITOR FEED</HudLabel>
        </div>
        <div style={{ gridColumn:'span 2', display:'flex', justifyContent:'space-between' }}>
          <HudLabel size={10}>MODULE</HudLabel>
          <HudValue size={20} tone="hot">{iss.orbit.toString().slice(-4)}</HudValue>
        </div>
        <div style={{ gridColumn:'span 2' }}>
          <HudLabel size={8}>ACTIVITY</HudLabel>
          <HudLabel size={9} tone="primary">SUMMARY</HudLabel>
        </div>
        {['X2','X4','X7','277'].map((n, i) => (
          <div key={i} style={{ borderLeft: '1px solid var(--hud-hairline)', paddingLeft: 8 }}>
            <HudLabel size={8}>NODE N°</HudLabel>
            <HudValue size={18}>{n}</HudValue>
          </div>
        ))}
      </div>

      {/* ── Main body: 3 columns ── */}
      <div style={{ display:'grid', gridTemplateColumns: '1.3fr 1fr 1.7fr', gap: 14, minHeight: 0 }}>

        {/* LEFT — big ISS wireframe */}
        <div style={{ position:'relative', border:'1px solid var(--hud-hairline-soft)', padding: 14, display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <div>
              <HudLabel size={9}>ORB CODE</HudLabel>
              <div style={{ marginTop: 4 }}><HudValue size={52}>A1</HudValue></div>
            </div>
            <div>
              <HudLabel size={9}>ACT STATUS</HudLabel>
              <div style={{ marginTop: 4 }}><HudValue size={52}>XX</HudValue></div>
            </div>
          </div>

          {/* ISS wireframe */}
          <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <svg width="85%" viewBox="0 0 300 220" fill="none" stroke="var(--hud-ink)" strokeWidth="0.8">
              {/* solar panels */}
              <g opacity="0.9">
                <rect x="10" y="40" width="70" height="40" />
                <line x1="10" y1="50" x2="80" y2="50" /><line x1="10" y1="60" x2="80" y2="60" /><line x1="10" y1="70" x2="80" y2="70" />
                <line x1="25" y1="40" x2="25" y2="80" /><line x1="40" y1="40" x2="40" y2="80" /><line x1="55" y1="40" x2="55" y2="80" /><line x1="70" y1="40" x2="70" y2="80" />
                <rect x="220" y="40" width="70" height="40" />
                <line x1="220" y1="50" x2="290" y2="50" /><line x1="220" y1="60" x2="290" y2="60" /><line x1="220" y1="70" x2="290" y2="70" />
                <line x1="235" y1="40" x2="235" y2="80" /><line x1="250" y1="40" x2="250" y2="80" /><line x1="265" y1="40" x2="265" y2="80" /><line x1="280" y1="40" x2="280" y2="80" />
                <rect x="10" y="140" width="70" height="40" />
                <line x1="10" y1="150" x2="80" y2="150" /><line x1="10" y1="160" x2="80" y2="160" /><line x1="10" y1="170" x2="80" y2="170" />
                <rect x="220" y="140" width="70" height="40" />
                <line x1="220" y1="150" x2="290" y2="150" /><line x1="220" y1="160" x2="290" y2="160" /><line x1="220" y1="170" x2="290" y2="170" />
              </g>
              {/* truss */}
              <line x1="80" y1="60" x2="220" y2="60" />
              <line x1="80" y1="160" x2="220" y2="160" />
              <line x1="80" y1="60" x2="80" y2="160" />
              <line x1="220" y1="60" x2="220" y2="160" />
              {/* central modules */}
              <rect x="110" y="80" width="80" height="60" fill="#0c0c0c" />
              <circle cx="150" cy="110" r="22" />
              <circle cx="150" cy="110" r="12" />
              <rect x="125" y="95" width="50" height="30" />
              <line x1="110" y1="110" x2="80" y2="110" />
              <line x1="190" y1="110" x2="220" y2="110" />
              <circle cx="80" cy="110" r="4" fill="var(--hud-accent)" stroke="none" />
              <circle cx="220" cy="110" r="4" fill="var(--hud-accent)" stroke="none" />
              {/* callouts */}
              <line x1="150" y1="88" x2="150" y2="30" stroke="var(--hud-accent)" strokeDasharray="2 2" />
              <text x="154" y="34" fill="var(--hud-accent)" fontSize="8" fontFamily="var(--font-mono)">CHAN 39.020</text>
              <line x1="110" y1="140" x2="70" y2="195" stroke="var(--hud-steel)" strokeDasharray="2 2" />
              <text x="14" y="200" fill="var(--hud-ink-dim)" fontSize="8" fontFamily="var(--font-mono)">ELEM 28·55</text>
              <line x1="190" y1="140" x2="230" y2="195" stroke="var(--hud-steel)" strokeDasharray="2 2" />
              <text x="210" y="200" fill="var(--hud-ink-dim)" fontSize="8" fontFamily="var(--font-mono)">SMUN 33·45·80</text>
            </svg>
          </div>

          {/* Status switches */}
          <div style={{ display:'flex', gap: 0, marginTop: 8 }}>
            {['ONLINE','OFFLINE','REPAIR','MIA'].map((s, i) => (
              <div key={s} style={{ flex: 1, border: '1px solid var(--hud-hairline)', padding: '4px 6px', textAlign:'center',
                background: i === 0 ? 'rgba(232,122,42,0.15)' : 'transparent',
                color: i === 0 ? 'var(--hud-accent)' : 'var(--hud-steel)' }}>
                <HudLabel size={8} style={{ color:'inherit' }}>{s}</HudLabel>
              </div>
            ))}
          </div>

          {/* Bottom bars — energy usage flux */}
          <div style={{ marginTop: 10 }}>
            <HudLabel size={8}>STATION ENERGY FLUX · kWs</HudLabel>
            <div style={{ display:'flex', alignItems:'flex-end', gap: 1, height: 36, marginTop: 4 }}>
              {flux.map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v*100}%`, background: v > 0.75 ? 'var(--hud-accent)' : v > 0.4 ? 'var(--hud-cool)' : 'var(--hud-steel)' }} />
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4 }}>
              <HudMono size={8} tone="steel">IPV 16·17187{'\u2032'}5</HudMono>
              <HudMono size={8} tone="steel">FPL 20·30341{'\u2032'}8</HudMono>
              <HudMono size={8} tone="hot">A1·XX·492·P3</HudMono>
            </div>
          </div>
        </div>

        {/* CENTER — diagnostic rings + fuel */}
        <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
          <div style={{ border:'1px solid var(--hud-hairline-soft)', padding: 10 }}>
            <HudLabel size={9}>FUEL STATUS</HudLabel>
            <div style={{ marginTop: 8, display:'flex', flexDirection:'column', gap: 5 }}>
              {[0.85, 0.72, 0.61, 0.58, 0.44, 0.31].map((v, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap: 6 }}>
                  <HudMono size={8} tone="steel">{String(i+1).padStart(2,'0')}</HudMono>
                  <HudBar value={v} segments={20} height={6} color={v > 0.6 ? 'var(--hud-accent)' : v > 0.4 ? 'var(--hud-cool)' : 'var(--hud-steel)'} />
                  <HudMono size={8} tone="ink-dim">{Math.round(v*100)}</HudMono>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, border:'1px solid var(--hud-hairline-soft)', padding: 10, display:'flex', flexDirection:'column' }}>
            <HudLabel size={9}>POSITION DATA</HudLabel>
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <HudRing size={180} innerRadius={40} rings={4} ticks={60} spin={120} fillPct={0.38} color="var(--hud-cool)">
                <div style={{ textAlign:'center' }}>
                  <HudValue size={20} tone="hot">{iss.latitude.toFixed(2)}</HudValue>
                  <div style={{ height: 2 }} />
                  <HudValue size={20} tone="cool">{iss.longitude.toFixed(2)}</HudValue>
                  <div style={{ height: 4 }} />
                  <HudLabel size={7}>LAT · LON</HudLabel>
                </div>
              </HudRing>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <HudMono size={8} tone="steel">ALT {iss.altitude_km}km</HudMono>
              <HudMono size={8} tone="hot">VEL {(iss.velocity_kmh/1000).toFixed(1)}k kmh</HudMono>
            </div>
          </div>
        </div>

        {/* RIGHT — dispatched NEO grid (9 cells) */}
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          <HudLabel size={10} style={{ letterSpacing:'0.3em' }}>DISPATCHED · NEO · TRACK · TABLE</HudLabel>
          <div style={{ flex: 1, display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 6 }}>
            {neos.slice(0, 9).map((n, i) => (
              <div key={n.id} style={{ border:'1px solid var(--hud-hairline)', padding: 8, display:'flex', flexDirection:'column', justifyContent:'space-between', background: n.hazard ? 'rgba(232,122,42,0.06)' : 'transparent' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <HudMono size={7} tone="steel">OBS·{String(Math.floor(n.diameter_m)).padStart(4,'0')}</HudMono>
                    <div><HudValue size={22} tone={n.hazard ? 'hot' : 'ink'}>{n.name.split(' ')[1] || n.name.slice(-3)}</HudValue></div>
                  </div>
                  {/* tiny asteroid wireframe */}
                  <svg width="32" height="22" viewBox="0 0 32 22" fill="none" stroke={n.hazard ? 'var(--hud-accent)' : 'var(--hud-ink)'} strokeWidth="0.6">
                    <path d="M 6 12 Q 3 6 8 4 Q 14 2 20 4 Q 28 6 26 14 Q 22 20 14 19 Q 6 18 6 12 Z" />
                    <circle cx="12" cy="10" r="1" />
                    <circle cx="18" cy="13" r="0.6" />
                    <path d="M 0 11 L 4 11 M 28 11 L 32 11" strokeDasharray="1 1" />
                  </svg>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <HudMono size={7} tone={n.hazard ? 'hot' : 'steel'}>{n.miss_lunar.toFixed(1)}LD</HudMono>
                  {/* small circular ring */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={n.hazard ? 'var(--hud-accent)' : 'var(--hud-steel)'}>
                    <circle cx="8" cy="8" r="6" strokeDasharray="1 1" />
                    <circle cx="8" cy="8" r="3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ammo matrix strip (space weather history) ── */}
      <div style={{ display:'grid', gridTemplateColumns: '200px 1fr', gap: 14, borderTop:'1px solid var(--hud-hairline)', paddingTop: 10 }}>
        <div>
          <HudLabel size={9}>SPACE·WX MATRIX</HudLabel>
          <div style={{ marginTop: 8, display:'flex', alignItems:'flex-end', gap: 1, height: 60 }}>
            {donki.map((d, i) => {
              const hot = d.intensity > 0.6;
              return <div key={i} style={{ flex: 1, height: `${d.intensity*100}%`,
                background: hot ? 'var(--hud-accent)' : d.intensity > 0.4 ? 'var(--hud-cool)' : 'var(--hud-steel-dim)' }} />;
            })}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4 }}>
            <HudMono size={8} tone="steel">ENE MATRIX</HudMono>
            <HudMono size={8} tone="hot">{donki.filter(d=>d.intensity>0.6).length} HOT</HudMono>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 4 }}>
          {['H1','D5','F7','D2','Z7','Y2','H7','U5','Y2','X7','A2','34','R7','Y5'].map((c, i) => (
            <div key={i} style={{ border: '1px solid var(--hud-hairline)', padding: '2px 4px', textAlign:'center' }}>
              <HudMono size={7} tone="steel" style={{ display:'block' }}>PID·{String(i).padStart(2,'0')}</HudMono>
              <HudValue size={18} tone={i === 0 ? 'hot' : 'ink'}>{c}</HudValue>
              <div style={{ display:'flex', justifyContent:'center', gap: 1, marginTop: 2 }}>
                {[0,1,2].map(j => <div key={j} style={{ width: 3, height: 3, background: j <= (i%3) ? 'var(--hud-ink)' : 'var(--hud-steel-dim)' }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 16, borderTop:'1px solid var(--hud-hairline-soft)', paddingTop: 8 }}>
        <HudMono size={9} tone="steel">STATION·ENERGY·USAGE</HudMono>
        <div style={{ display:'flex', gap: 16 }}>
          <HudMono size={8} tone="steel">IPV·{iss.orbit}</HudMono>
          <HudMono size={8} tone="steel">FPL·{mars.sol}</HudMono>
          <HudMono size={8} tone="hot">A1·XX·492·P3</HudMono>
        </div>
        <HudClock size={14} />
      </div>

    </div>
  );
};

window.VariantCockpit = VariantCockpit;
