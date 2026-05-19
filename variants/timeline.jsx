// ─────────────────────────────────────────────────────────────
// VARIATION D — "MISSION DAY" Timeline Strip
// Inspired by reference image 23 — upside-down mission-day calendar
// on left, long horizontal timeline, TET feed viewport, grid of events.
// Adapted: fireballs + DONKI events + CNEOS close approaches as timeline.
// ─────────────────────────────────────────────────────────────

const VariantTimeline = () => {
  const { fireballs, donki, neos, iss, mars, apod } = window.NASA;
  const events = [...donki.map(d => ({ type: d.type, date: d.peak || d.id.slice(0,10), tag: d.class || d.speed_kms || d.kp_index, hot: d.intensity > 0.6 })),
                  ...fireballs.map(f => ({ type: 'FB', date: f.date.slice(0,10), tag: f.energy_kt + 'kt', hot: f.energy_kt > 0.5 }))]
                  .sort((a,b) => a.date < b.date ? 1 : -1);

  return (
    <div className="hud hud-frame" style={{ width:'100%', height:'100%', padding: 20, boxSizing:'border-box', display:'grid', gridTemplateColumns:'240px 1fr 80px', gridTemplateRows:'110px 1fr 80px', gap: 12 }}>

      {/* TOP-LEFT — upside-down date block */}
      <div style={{ transform:'rotate(180deg)', display:'grid', gridTemplateColumns:'1fr 1fr 60px', gap: 6, alignItems:'center' }}>
        <div>
          <HudValue size={28}>1642</HudValue>
          <HudLabel size={9} style={{ display:'block', marginTop: 4 }}>X · 7</HudLabel>
          <HudLabel size={8} tone="steel" style={{ display:'block' }}>2072</HudLabel>
        </div>
        <div>
          <HudValue size={28}>MAR</HudValue>
          <HudLabel size={9} style={{ display:'block', marginTop: 4 }}>Y · 14</HudLabel>
          <HudLabel size={8} tone="steel" style={{ display:'block' }}>MISSION DAY</HudLabel>
        </div>
        <div style={{ textAlign:'center' }}>
          <HudValue size={28}>C</HudValue>
          <HudValue size={28} style={{ display:'block' }}>S</HudValue>
        </div>
      </div>

      {/* TOP-CENTER — playback strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr) 260px 1fr', gap: 8, alignItems:'center', borderBottom:'1px solid var(--hud-hairline)', paddingBottom: 8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ border:'1px solid var(--hud-hairline)', padding: 6, height: 50, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <HudMono size={7} tone="steel">QUAD·X{i+2}</HudMono>
            <div style={{ display:'flex', alignItems:'flex-end', gap: 1, height: 16 }}>
              {Array.from({ length: 20 }).map((_, j) => (
                <div key={j} style={{ flex: 1, height: `${30 + Math.random()*70}%`, background: j === 10 ? 'var(--hud-accent)' : 'var(--hud-ink-dim)' }} />
              ))}
            </div>
          </div>
        ))}
        {/* transport controls */}
        <div style={{ display:'flex', justifyContent:'center', gap: 14, border:'1px solid var(--hud-hairline)', padding: '4px 10px' }}>
          {['⏮','◀','■','▶','⏭'].map((s, i) => (
            <div key={i} style={{ color: i === 2 ? 'var(--hud-accent)' : 'var(--hud-ink)', fontSize: 16, lineHeight: 1.4 }}>{s}</div>
          ))}
        </div>
        <div style={{ textAlign:'right' }}>
          <HudLabel size={9} tone="steel">SCAV · ACTIVITY</HudLabel>
          <HudLabel size={9} tone="primary" style={{ display:'block' }}>REPORTING · POSITION</HudLabel>
          <HudMono size={9} tone="hot">126·2</HudMono>
        </div>
      </div>

      {/* TOP-RIGHT — side label column */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-around', borderLeft:'1px solid var(--hud-hairline)' }}>
        <HudLabel size={9} style={{ writingMode:'vertical-rl', transform:'rotate(180deg)' }}>CURRENT · LOCATION</HudLabel>
        <HudValue size={18}>C</HudValue>
        <HudValue size={18}>S</HudValue>
      </div>

      {/* MAIN CENTER — mission-event grid with TET viewport */}
      <div style={{ gridColumn:'1 / 3', border:'1px solid var(--hud-hairline-soft)', padding: 14, position:'relative', overflow:'hidden' }}>
        {/* subtle dot grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(200,195,180,0.08) 0.5px, transparent 0.6px)', backgroundSize:'14px 14px' }} />

        <div style={{ position:'relative', display:'grid', gridTemplateColumns: '240px 1fr', gridTemplateRows: '1fr 1fr', gap: 14, height:'100%' }}>

          {/* LEFT — event list */}
          <div style={{ gridRow:'1 / -1', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 70px', fontSize: 8, padding: '4px 2px', borderBottom: '1px solid var(--hud-hairline)' }}>
              <HudLabel size={8} style={{ marginRight: 8 }}>EV · ID</HudLabel>
              <HudLabel size={8}>STATUS</HudLabel>
              <HudLabel size={8}>DATE</HudLabel>
            </div>
            {events.slice(0, 10).map((e, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'auto 1fr 70px', padding: '4px 2px', alignItems:'center', borderBottom: '1px solid var(--hud-hairline-soft)', gap: 6 }}>
                <HudMono size={9} tone="steel" style={{ marginRight: 4 }}>{String(i+1).padStart(2,'0')}</HudMono>
                <HudChip tone={e.hot ? 'hot' : 'steel'} solid={e.hot}>{e.type}</HudChip>
                <HudMono size={8} tone={e.hot?'hot':'steel'}>{e.date.slice(5).replace('-','·')}</HudMono>
              </div>
            ))}
          </div>

          {/* RIGHT TOP — viewport */}
          <div style={{ position:'relative', border:'1px solid var(--hud-hairline)', background:'#000', overflow:'hidden' }}>
            <img src={apod.url} onError={(e)=>{ e.target.style.display='none'; }}
                 style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: 0.5 }} alt="" />
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7))' }} />

            {/* TET FEED header */}
            <div style={{ position:'absolute', top: 10, left: '50%', transform:'translateX(-50%)', display:'flex', gap: 4, alignItems:'center' }}>
              <HudChip tone="hot" solid>TET · FEED</HudChip>
              <HudChip tone="steel">7</HudChip>
            </div>

            {/* Central reticle with pointer */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}>
              <svg width="180" height="120" viewBox="0 0 180 120" fill="none" stroke="var(--hud-ink)" strokeWidth="1">
                <path d="M 10 30 Q 10 10 30 10 L 150 10 Q 170 10 170 30 L 170 90 Q 170 110 150 110 L 30 110 Q 10 110 10 90 Z" />
                <rect x="70" y="46" width="40" height="28" />
                <path d="M 86 60 L 86 50 M 86 70 L 86 60 M 82 60 L 94 60" />
                {/* arrow callout */}
                <polygon points="110,58 122,50 122,66" fill="var(--hud-accent)" stroke="none" />
              </svg>
            </div>

            {/* timecode */}
            <div style={{ position:'absolute', bottom: 10, left: '50%', transform:'translateX(-50%)' }}>
              <div style={{ border:'1px solid var(--hud-accent)', padding:'2px 8px', background:'rgba(0,0,0,0.5)' }}>
                <HudMono size={10} tone="hot">07:26:41:29</HudMono>
              </div>
            </div>

            {/* random scatter dots */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ position:'absolute',
                top: `${5 + (i*7)%90}%`, left: `${3 + (i*13)%92}%`,
                width: 3, height: 3,
                background: i%5 ? 'var(--hud-ink-dim)' : 'var(--hud-accent)' }} />
            ))}
          </div>

          {/* RIGHT BOTTOM — sparkbar quad */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 8 }}>
            {['QUAD·L4','QUAD·V7','QUAD·C8','QUAD·P3'].map((t, qi) => {
              const series = Array.from({ length: 24 }, (_, i) => Math.abs(Math.sin(i*0.5 + qi)*0.5) + Math.random()*0.5);
              return (
                <div key={qi} style={{ border:'1px solid var(--hud-hairline-soft)', padding: 6, display:'flex', flexDirection:'column' }}>
                  <HudLabel size={8}>{t}</HudLabel>
                  <div style={{ flex:1, display:'flex', alignItems:'flex-end', gap: 1, marginTop: 4, minHeight: 28 }}>
                    {qi < 2
                      ? series.map((v,i) => <div key={i} style={{ flex:1, height:`${v*100}%`, background: 'var(--hud-cool)' }} />)
                      : (() => {
                          const pts = series.map((v,i) => `${(i/(series.length-1))*100}%,${(1-v)*100}%`).join(' ');
                          return <svg width="100%" height="100%" preserveAspectRatio="none"><polyline points={pts} stroke="var(--hud-ink)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" /></svg>;
                        })()
                    }
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* RIGHT-MID column */}
      <div style={{ borderLeft:'1px solid var(--hud-hairline)', display:'flex', flexDirection:'column', alignItems:'center', gap: 14, padding: '8px 0' }}>
        <HudLabel size={8} style={{ writingMode:'vertical-rl', transform:'rotate(180deg)' }}>SOL·{mars.sol}</HudLabel>
        <HudValue size={22}>H</HudValue>
        <HudMono size={8} tone="steel">+</HudMono>
        <HudValue size={22}>M</HudValue>
        <div style={{ flex:1 }} />
        <HudMono size={9} tone="hot">{String(iss.orbit).slice(-2)}</HudMono>
      </div>

      {/* BOTTOM-LEFT */}
      <div style={{ display:'flex', flexDirection:'column', gap: 4, paddingTop: 8 }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudValue size={22}>MAR</HudValue>
          <HudValue size={22} tone="steel">14</HudValue>
          <HudValue size={22}>J</HudValue>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <HudValue size={28}>2072</HudValue>
          <HudMono size={10} tone="steel">4·9</HudMono>
        </div>
      </div>

      {/* BOTTOM-CENTER — fuel cell / small ring + legend */}
      <div style={{ display:'grid', gridTemplateColumns:'140px 1fr 260px', gap: 12, alignItems:'center', borderTop:'1px solid var(--hud-hairline)', paddingTop: 8 }}>
        <div>
          <HudLabel size={8}>FUEL·CELL</HudLabel>
          <HudLabel size={8} tone="primary" style={{ display:'block' }}>EXAMINATION·DATA</HudLabel>
          <div style={{ display:'flex', alignItems:'center', gap: 6, marginTop: 4 }}>
            <svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" fill="none" stroke="var(--hud-ink)" strokeDasharray="3 2" /><circle cx="17" cy="17" r="8" fill="none" stroke="var(--hud-accent)" /></svg>
            <HudMono size={9} tone="steel">PWR·NOM 118%</HudMono>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'flex-end', gap: 1, height: 40 }}>
          {Array.from({ length: 80 }).map((_, i) => {
            const v = 0.3 + Math.abs(Math.sin(i*0.4)) * 0.7;
            return <div key={i} style={{ flex:1, height:`${v*100}%`, background: i%12===0 ? 'var(--hud-accent)' : 'var(--hud-ink-dim)' }} />;
          })}
        </div>

        <div style={{ display:'flex', gap: 10, flexWrap:'wrap', justifyContent:'flex-end' }}>
          {[['AP','25','hot'],['NP','32'],['PE','27'],['MW','39'],['JC','20'],['JE','29']].map(([k,v,t]) => (
            <div key={k} style={{ display:'flex', gap: 4, alignItems:'center' }}>
              <div style={{ width: 6, height: 6, background: t==='hot' ? 'var(--hud-accent)' : 'var(--hud-ink-dim)' }} />
              <HudMono size={8} tone={t==='hot'?'hot':'steel'}>{k}·{v}</HudMono>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM-RIGHT */}
      <div style={{ borderTop:'1px solid var(--hud-hairline)', paddingTop: 8, display:'flex', flexDirection:'column', alignItems:'center' }}>
        <HudValue size={22}>X</HudValue>
        <HudMono size={8} tone="steel">26</HudMono>
        <HudValue size={22}>J</HudValue>
        <HudMono size={8} tone="hot" style={{ marginTop: 8 }}>8</HudMono>
      </div>
    </div>
  );
};

window.VariantTimeline = VariantTimeline;
