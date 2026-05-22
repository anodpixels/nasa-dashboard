// ─────────────────────────────────────────────────────────────
// Oblivion HUD — shared primitive components
// ─────────────────────────────────────────────────────────────
// Usage: <script type="text/babel" src="components/hud.jsx"></script>
// Exports on window: Corner, Ring, Reticle, Ticks, Bar, DataRow,
// Header, Panel, Chip, Mono, Label, Value, Sparkline, Crosshair

// 1) CORNER — four L-brackets around content
const HudCorner = ({ size = 8, color = 'var(--hud-ink)', inset = 0, children, style = {}, className = '' }) => (
  <div style={{ position: 'relative', ...style }} className={className}>
    {['tl','tr','bl','br'].map(p => {
      const s = { position:'absolute', width: size, height: size, pointerEvents:'none' };
      if (p.includes('t')) s.top = inset; else s.bottom = inset;
      if (p.includes('l')) s.left = inset; else s.right = inset;
      s.borderTop    = p[0] === 't' ? `1px solid ${color}` : 'none';
      s.borderBottom = p[0] === 'b' ? `1px solid ${color}` : 'none';
      s.borderLeft   = p[1] === 'l' ? `1px solid ${color}` : 'none';
      s.borderRight  = p[1] === 'r' ? `1px solid ${color}` : 'none';
      return <div key={p} style={s} />;
    })}
    {children}
  </div>
);

// 2) LABEL / VALUE — wide-tracked uppercase label + condensed numeric value
const HudLabel = ({ children, tone = 'steel', size = 10, track = 0.24, className, style = {} }) => (
  <span
    className={className}
    style={{
      fontFamily: 'var(--font-display)',
      fontSize: size,
      fontWeight: 400,
      letterSpacing: `${track}em`,
      textTransform: 'uppercase',
      color: tone === 'ink' ? 'var(--hud-ink-dim)'
           : tone === 'hot' ? 'var(--hud-accent)'
           : tone === 'cool' ? 'var(--hud-cool)'
           : tone === 'primary' ? 'var(--hud-ink)'
           : 'var(--hud-steel)',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >{children}</span>
);

const HudValue = ({ children, size = 32, weight = 300, tone = 'ink', style = {} }) => (
  <span style={{
    fontFamily: 'var(--font-display)',
    fontSize: size,
    fontWeight: weight,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em',
    lineHeight: 1,
    color: tone === 'hot' ? 'var(--hud-accent)'
         : tone === 'cool' ? 'var(--hud-cool)'
         : tone === 'steel' ? 'var(--hud-steel)'
         : 'var(--hud-ink)',
    ...style,
  }}>{children}</span>
);

const HudMono = ({ children, size = 10, tone = 'ink-dim', style = {} }) => (
  <span style={{
    fontFamily: 'var(--font-mono)',
    fontSize: size,
    fontWeight: 300,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em',
    color: tone === 'hot' ? 'var(--hud-accent)'
         : tone === 'cool' ? 'var(--hud-cool)'
         : tone === 'steel' ? 'var(--hud-steel)'
         : tone === 'ink' ? 'var(--hud-ink)'
         : 'var(--hud-ink-dim)',
    ...style,
  }}>{children}</span>
);

// 3) TICK STRIPS — repeating vertical lines
const HudTicks = ({ count = 40, height = 10, emphasis = 5, color = 'var(--hud-hairline)', emphasisColor = 'var(--hud-ink)', style = {} }) => (
  <div style={{ display:'flex', gap: 0, alignItems:'flex-end', height, ...style }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        width: 1,
        height: (i % emphasis === 0) ? '100%' : '55%',
        marginRight: 3,
        background: (i % emphasis === 0) ? emphasisColor : color,
      }} />
    ))}
  </div>
);

// 4) SEGMENTED BAR (for fuel/energy/level)
const HudBar = ({ value = 0.5, segments = 20, color = 'var(--hud-ink)', dim = 'var(--hud-steel-dim)', height = 8, style = {} }) => {
  const lit = Math.round(segments * value);
  return (
    <div style={{ display:'flex', gap: 2, height, ...style }}>
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: i < lit ? color : dim }} />
      ))}
    </div>
  );
};

// 5) DATA ROW — label : value pair, Oblivion style
const HudDataRow = ({ label, value, unit, tone = 'ink', labelWidth = 'auto', style = {} }) => (
  <div style={{ display:'flex', alignItems:'baseline', gap: 12, ...style }}>
    <HudLabel style={{ width: labelWidth }}>{label}</HudLabel>
    <div style={{ flex:1, borderBottom: '1px dotted var(--hud-hairline-soft)', transform: 'translateY(-3px)', height: 1 }} />
    <HudMono size={11} tone={tone}>{value}{unit && <span style={{ marginLeft: 4, opacity: 0.6 }}>{unit}</span>}</HudMono>
  </div>
);

// 6) PANEL HEADER — title bar with caret + tiny id
const HudHeader = ({ title, id, right, tone = 'ink', style = {} }) => (
  <div style={{
    display:'flex', alignItems:'center', justifyContent:'space-between',
    borderBottom: '1px solid var(--hud-hairline)',
    padding: '6px 10px',
    ...style,
  }}>
    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
      <div style={{
        width: 0, height: 0,
        borderTop: '4px solid transparent',
        borderBottom: '4px solid transparent',
        borderLeft: '5px solid var(--hud-ink)',
      }} />
      <HudLabel tone={tone === 'hot' ? 'hot' : 'primary'} size={11}>{title}</HudLabel>
      {id && <HudMono tone="steel" size={9} style={{ marginLeft: 4 }}>{id}</HudMono>}
    </div>
    {right && <div>{right}</div>}
  </div>
);

// 7) CHIP — pill-less uppercase tag
const HudChip = ({ children, tone = 'ink', solid = false, style = {} }) => {
  const color = tone === 'hot' ? 'var(--hud-accent)'
              : tone === 'cool' ? 'var(--hud-cool)'
              : tone === 'steel' ? 'var(--hud-steel)'
              : 'var(--hud-ink)';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: 4,
      padding: '1px 6px',
      fontFamily:'var(--font-display)', fontSize: 9, fontWeight: 500,
      letterSpacing: '0.22em', textTransform:'uppercase',
      border: `1px solid ${color}`,
      color: solid ? 'var(--hud-bg)' : color,
      background: solid ? color : 'transparent',
      whiteSpace:'nowrap',
      ...style,
    }}>{children}</span>
  );
};

// 8) RING — concentric SVG ring w/ tick marks + optional rotation
const HudRing = ({ size = 200, innerRadius = 60, rings = 3, ticks = 60, tickLength = 4, spin = 0, color = 'var(--hud-ink)', dim = 'var(--hud-hairline)', fillPct = 0, children, style = {} }) => {
  const cx = size / 2, cy = size / 2;
  const outer = size / 2 - 2;
  const gap = (outer - innerRadius) / (rings - 1 || 1);
  const circ = 2 * Math.PI * (innerRadius + gap * (rings - 1));
  return (
    <div style={{ position:'relative', width: size, height: size, ...style }}>
      <svg width={size} height={size} style={{ position:'absolute', inset: 0, ...(spin ? { animation: `hud-rot ${spin}s linear infinite` } : {}) }}>
        {/* rings */}
        {Array.from({ length: rings }).map((_, i) => (
          <circle key={i} cx={cx} cy={cy} r={innerRadius + gap * i} fill="none" stroke={i === rings - 1 ? color : dim} strokeWidth="1" />
        ))}
        {/* ticks around outer */}
        {Array.from({ length: ticks }).map((_, i) => {
          const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
          const r1 = outer;
          const r2 = outer - (i % 5 === 0 ? tickLength * 1.6 : tickLength);
          const x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1;
          const x2 = cx + Math.cos(a) * r2, y2 = cy + Math.sin(a) * r2;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 5 === 0 ? color : dim} strokeWidth="1" />;
        })}
        {/* filled arc */}
        {fillPct > 0 && (() => {
          const a = fillPct * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * (innerRadius + gap * (rings - 1));
          const y = cy + Math.sin(a) * (innerRadius + gap * (rings - 1));
          const large = fillPct > 0.5 ? 1 : 0;
          const r = innerRadius + gap * (rings - 1);
          return (
            <path
              d={`M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y}`}
              fill="none" stroke="var(--hud-accent)" strokeWidth="2"
            />
          );
        })()}
      </svg>
      {/* center content (doesn't spin) */}
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {children}
      </div>
    </div>
  );
};

// 9) RETICLE — crosshair inside square with small notches
const HudReticle = ({ size = 80, color = 'var(--hud-ink)', style = {} }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="1">
    <rect x="4" y="4" width="92" height="92" />
    <line x1="50" y1="0"  x2="50" y2="18" />
    <line x1="50" y1="82" x2="50" y2="100" />
    <line x1="0"  y1="50" x2="18" y2="50" />
    <line x1="82" y1="50" x2="100" y2="50" />
    <circle cx="50" cy="50" r="3" fill={color} />
    <circle cx="50" cy="50" r="14" />
    {/* corner marks */}
    <path d="M 4 14 L 4 4 L 14 4 M 86 4 L 96 4 L 96 14 M 96 86 L 96 96 L 86 96 M 14 96 L 4 96 L 4 86" />
  </svg>
);

// 10) SPARKLINE — tiny line chart
const HudSparkline = ({ data = [], width = 120, height = 32, color = 'var(--hud-ink)', fill = 'none', style = {} }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={style}>
      <polyline points={pts} fill={fill} stroke={color} strokeWidth="1" />
    </svg>
  );
};

// 11) BAR HISTOGRAM
const HudBars = ({ data = [], width = 120, height = 32, color = 'var(--hud-ink)', dim = 'var(--hud-steel-dim)', threshold, style = {} }) => {
  const max = Math.max(...data, 1);
  const bw = width / data.length;
  return (
    <svg width={width} height={height} style={style}>
      {data.map((v, i) => {
        const h = (v / max) * height;
        const hot = threshold != null && v >= threshold;
        return <rect key={i} x={i * bw} y={height - h} width={bw - 1} height={h} fill={hot ? 'var(--hud-accent)' : color} />;
      })}
    </svg>
  );
};

// 12) RADAR — polar plot, plot points by (angle, r) 0..1.
// `spin` = seconds per revolution for the rings/sectors (labels stay horizontal).
const HudRadar = ({ size = 220, points = [], rings = 4, sectors = 12, color = 'var(--hud-ink)', dim = 'var(--hud-hairline)', centerLabel, spin = 0, ringLabels = null, customRings = null, style = {} }) => {
  const cx = size / 2, cy = size / 2, R = size / 2 - 8;
  const ringRadii = customRings || Array.from({ length: rings }, (_, i) => (R / rings) * (i + 1));
  const spinStyle = spin > 0 ? { animation: `hud-rot ${spin}s linear infinite`, transformOrigin: `${cx}px ${cy}px`, transformBox: 'fill-box' } : {};
  return (
    <svg width={size} height={size} style={style}>
      {/* Rotating layer — rings + sector spokes only */}
      <g style={spinStyle}>
        {ringRadii.map((rr, i) => (
          <circle key={i} cx={cx} cy={cy} r={rr} fill="none" stroke={dim} strokeWidth="1" />
        ))}
        {Array.from({ length: sectors }).map((_, i) => {
          const a = (i / sectors) * Math.PI * 2 - Math.PI / 2;
          return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * R} y2={cy + Math.sin(a) * R} stroke={dim} strokeWidth="1" />;
        })}
      </g>
      {/* Ring labels — non-rotating */}
      {ringLabels && ringRadii.map((rr, i) => ringLabels[i] && (
        <text key={`rl${i}`} x={cx + 2} y={cy - rr - 2} fill="var(--hud-steel)" fontSize="7" fontFamily="var(--font-mono)" letterSpacing="0.5">{ringLabels[i]}</text>
      ))}
      {/* Non-rotating layer — points + labels stay readable */}
      {points.map((p, i) => {
        const a = (p.angle || 0) * Math.PI * 2 - Math.PI / 2;
        const r = (p.r || 0) * R;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        return <g key={i}>
          {p.trailFrom && (() => {
            const a0 = (p.trailFrom.angle || 0) * Math.PI * 2 - Math.PI / 2;
            const r0 = (p.trailFrom.r || 0) * R;
            const x0 = cx + Math.cos(a0) * r0, y0 = cy + Math.sin(a0) * r0;
            return <line x1={x0} y1={y0} x2={x} y2={y} stroke={dim} strokeWidth="1" strokeDasharray="1 3" opacity="0.6" />;
          })()}
          {(() => {
            const s = Math.max(4, Math.min(16, p.size || 6));
            const stroke = p.selected ? 'var(--hud-accent)' : 'transparent';
            const fill = p.hot ? 'var(--hud-accent)' : color;
            return <rect x={x - s/2} y={y - s/2} width={s} height={s} fill={fill} stroke={stroke} strokeWidth={p.selected ? 1.5 : 0} />;
          })()}
          {p.label && <text x={x + 6} y={y + 3} fill="var(--hud-ink-dim)" fontSize="8" fontFamily="var(--font-mono)">{p.label}</text>}
          {p.id !== undefined && p.onClick && (
            <rect x={x - 10} y={y - 10} width={20} height={20} fill="transparent" style={{ cursor:'pointer' }}
                  onClick={() => p.onClick(p.id)} />
          )}
        </g>;
      })}
      <circle cx={cx} cy={cy} r="2" fill={color} />
      {centerLabel && <text x={cx} y={cy - 8} fill="var(--hud-steel)" fontSize="8" fontFamily="var(--font-display)" textAnchor="middle" letterSpacing="2">{centerLabel}</text>}
    </svg>
  );
};

// 12b) SCATTER — Cartesian plot for energy/miss view
const HudScatter = ({ size = 420, points = [], xLabel, yLabel, xRange = [0, 1], yRange = [0, 1], xTicks = null, yTicks = null, style = {} }) => {
  const pad = 32; const W = size, H = size; const innerW = W - pad*2, innerH = H - pad*2;
  const sx = (v) => pad + ((v - xRange[0]) / (xRange[1] - xRange[0])) * innerW;
  const sy = (v) => H - pad - ((v - yRange[0]) / (yRange[1] - yRange[0])) * innerH;
  return (
    <svg width={W} height={H} style={style}>
      <line x1={pad} y1={H-pad} x2={W-pad} y2={H-pad} stroke="var(--hud-hairline)" />
      <line x1={pad} y1={pad} x2={pad} y2={H-pad} stroke="var(--hud-hairline)" />
      {xTicks && xTicks.map((t, i) => (
        <g key={`xt${i}`}>
          <line x1={sx(t.v)} y1={H-pad} x2={sx(t.v)} y2={H-pad+4} stroke="var(--hud-steel)" />
          <text x={sx(t.v)} y={H-pad+14} fill="var(--hud-steel)" fontSize="7" fontFamily="var(--font-mono)" textAnchor="middle">{t.label}</text>
          <line x1={sx(t.v)} y1={pad} x2={sx(t.v)} y2={H-pad} stroke="var(--hud-hairline-soft)" strokeDasharray="2 3" />
        </g>
      ))}
      {yTicks && yTicks.map((t, i) => (
        <g key={`yt${i}`}>
          <line x1={pad-4} y1={sy(t.v)} x2={pad} y2={sy(t.v)} stroke="var(--hud-steel)" />
          <text x={pad-6} y={sy(t.v)+3} fill="var(--hud-steel)" fontSize="7" fontFamily="var(--font-mono)" textAnchor="end">{t.label}</text>
          <line x1={pad} y1={sy(t.v)} x2={W-pad} y2={sy(t.v)} stroke="var(--hud-hairline-soft)" strokeDasharray="2 3" />
        </g>
      ))}
      {points.map((p, i) => {
        const s = Math.max(4, Math.min(16, p.size || 6));
        const fill = p.hot ? 'var(--hud-accent)' : 'var(--hud-ink)';
        const stroke = p.selected ? 'var(--hud-accent)' : 'transparent';
        return (
          <g key={i}>
            <rect x={sx(p.x) - s/2} y={sy(p.y) - s/2} width={s} height={s} fill={fill} stroke={stroke} strokeWidth={p.selected ? 1.5 : 0} />
            {p.label && <text x={sx(p.x) + s/2 + 3} y={sy(p.y) + 3} fontSize="8" fontFamily="var(--font-mono)" fill="var(--hud-ink-dim)">{p.label}</text>}
            {p.id !== undefined && p.onClick && (
              <rect x={sx(p.x) - 10} y={sy(p.y) - 10} width={20} height={20} fill="transparent" style={{ cursor:'pointer' }}
                    onClick={() => p.onClick(p.id)} />
            )}
          </g>
        );
      })}
      {xLabel && <text x={W-pad} y={H-6} fontSize="8" textAnchor="end" fontFamily="var(--font-display)" fill="var(--hud-steel)" letterSpacing="2">{xLabel}</text>}
      {yLabel && <text x={pad+2} y={pad-8} fontSize="8" fontFamily="var(--font-display)" fill="var(--hud-steel)" letterSpacing="2">{yLabel}</text>}
    </svg>
  );
};

// 13) HAIRLINE DIVIDER
const HudDivider = ({ style = {} }) => (
  <div style={{ height: 1, background: 'var(--hud-hairline)', ...style }} />
);

// 14) SCAN LINE OVERLAY
const HudScanline = ({ style = {} }) => (
  <div className="hud-scan" style={style} />
);

// 15) LIVE CLOCK — ticking UTC readout
const HudClock = ({ style = {}, size = 22, tone = 'ink' }) => {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  const h = pad(now.getUTCHours()), m = pad(now.getUTCMinutes()), s = pad(now.getUTCSeconds());
  return (
    <HudValue size={size} tone={tone} style={style}>
      {h}<span className="hud-cursor" style={{ opacity: 0.6 }}>:</span>{m}<span className="hud-cursor" style={{ opacity: 0.6 }}>:</span>{s}
    </HudValue>
  );
};

// 16) MISSION DAY counter (days since Apollo 11 as a fun baseline)
const HudMissionDay = () => {
  const start = new Date('1969-07-20T20:17:00Z');
  const days = Math.floor((Date.now() - start) / 86400000);
  return <>{days.toLocaleString()}</>;
};

Object.assign(window, {
  HudCorner, HudLabel, HudValue, HudMono, HudTicks, HudBar, HudDataRow,
  HudHeader, HudChip, HudRing, HudReticle, HudSparkline, HudBars,
  HudRadar, HudScatter, HudDivider, HudScanline, HudClock, HudMissionDay,
});
