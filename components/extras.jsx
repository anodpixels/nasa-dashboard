// ─────────────────────────────────────────────────────────────
// Extras — APODImage (robust url cascade), Tooltip + Info chips,
// and Drawer for click-to-learn-more interactions.
// ─────────────────────────────────────────────────────────────

// APOD image with a 3-step url cascade and a real visual fallback
const APODImage = ({ apod }) => {
  const urls = React.useMemo(() => {
    if (apod.media_type && apod.media_type !== 'image') {
      return [apod.thumbnail_url, window.NASA.apod.url].filter(Boolean);
    }
    return [apod.url, apod.hdurl, window.NASA.apod.url, window.NASA.apod.hdurl].filter(Boolean);
  }, [apod]);
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  if (failed || idx >= urls.length) {
    // Visual fallback — stylized galaxy starfield
    return (
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 50% at 60% 40%, #2a1a3a 0%, #0a0a1a 60%, #000 100%)', overflow:'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.85 }}>
          <defs>
            <radialGradient id="gx" cx="0.6" cy="0.45" r="0.4">
              <stop offset="0" stopColor="#ffd78a" stopOpacity="0.6" />
              <stop offset="0.3" stopColor="#e87a2a" stopOpacity="0.35" />
              <stop offset="1" stopColor="#1a0a2a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="600" cy="270" rx="320" ry="90" fill="url(#gx)" transform="rotate(-18 600 270)" />
          <ellipse cx="600" cy="270" rx="260" ry="40" fill="#ffd78a" opacity="0.12" transform="rotate(-18 600 270)" />
          <circle cx="600" cy="270" r="18" fill="#fff6d5" opacity="0.7" />
          {Array.from({ length: 220 }).map((_, i) => {
            const x = (i * 97) % 1000;
            const y = (i * 163) % 600;
            const r = (i % 7 === 0) ? 1.6 : 0.6;
            return <circle key={i} cx={x} cy={y} r={r} fill="#f5f1e8" opacity={0.3 + (i%5)*0.15} />;
          })}
        </svg>
      </div>
    );
  }

  return (
    <img
      key={urls[idx]}
      src={urls[idx]}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onError={() => {
        if (idx + 1 < urls.length) setIdx(idx + 1);
        else setFailed(true);
      }}
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: 0.85, filter:'contrast(1.08)' }}
      alt=""
    />
  );
};

// Deep-sky image with the same URL-cascade behavior as APOD.
// Accepts a curated `entry` from window.NASA.deepsky and falls
// through every URL before showing the procedural starfield.
const DeepSkyImage = ({ entry }) => {
  const urls = React.useMemo(() => (entry?.urls || []).filter(Boolean), [entry]);
  const [idx, setIdx] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => { setIdx(0); setFailed(false); }, [entry?.id]);

  if (failed || idx >= urls.length) {
    return (
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 50% at 60% 40%, #2a1a3a 0%, #0a0a1a 60%, #000 100%)', overflow:'hidden' }}>
        <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.85 }}>
          <defs>
            <radialGradient id="gxd" cx="0.6" cy="0.45" r="0.4">
              <stop offset="0" stopColor="#ffd78a" stopOpacity="0.6" />
              <stop offset="0.3" stopColor="#e87a2a" stopOpacity="0.35" />
              <stop offset="1" stopColor="#1a0a2a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="600" cy="270" rx="320" ry="90" fill="url(#gxd)" transform="rotate(-18 600 270)" />
          <ellipse cx="600" cy="270" rx="260" ry="40" fill="#ffd78a" opacity="0.12" transform="rotate(-18 600 270)" />
          <circle cx="600" cy="270" r="18" fill="#fff6d5" opacity="0.7" />
          {Array.from({ length: 220 }).map((_, i) => {
            const x = (i * 97) % 1000;
            const y = (i * 163) % 600;
            const r = (i % 7 === 0) ? 1.6 : 0.6;
            return <circle key={i} cx={x} cy={y} r={r} fill="#f5f1e8" opacity={0.3 + (i%5)*0.15} />;
          })}
        </svg>
      </div>
    );
  }

  return (
    <img
      key={urls[idx]}
      src={urls[idx]}
      referrerPolicy="no-referrer"
      onError={() => {
        if (idx + 1 < urls.length) setIdx(idx + 1);
        else setFailed(true);
      }}
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: 0.95, filter:'contrast(1.06)' }}
      alt={entry?.title || ''}
    />
  );
};

// ─────────────────────────────────────────────────────────────
// Tooltip — hover to reveal plain-English explanation
// Wrap any element and pass `info` string.
// ─────────────────────────────────────────────────────────────
const Tip = ({ info, children, style = {}, placement = 'top' }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <span
      style={{ position:'relative', display:'inline-block', ...style }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && info && (
        <span style={{
          position:'absolute',
          [placement]: '100%',
          left: '50%',
          transform: placement === 'top' ? 'translate(-50%, -4px)' : 'translate(-50%, 4px)',
          background:'rgba(10,10,10,0.96)',
          border:'1px solid var(--hud-accent)',
          color:'var(--hud-ink)',
          fontFamily:'Rajdhani, sans-serif',
          fontSize: 11,
          lineHeight: 1.45,
          padding:'8px 10px',
          width: 220,
          zIndex: 1000,
          pointerEvents:'none',
          boxShadow:'0 4px 20px rgba(0,0,0,0.8)',
          whiteSpace:'normal',
        }}>
          <div style={{ position:'absolute', top: placement === 'top' ? '100%' : 'auto', bottom: placement === 'bottom' ? '100%' : 'auto', left:'50%', transform:'translateX(-50%)', width: 0, height: 0,
            borderLeft:'5px solid transparent', borderRight:'5px solid transparent',
            [placement === 'top' ? 'borderTop' : 'borderBottom']:'5px solid var(--hud-accent)' }} />
          {info}
        </span>
      )}
    </span>
  );
};

// Small (?) info glyph — hover to show `info`.
const InfoDot = ({ info, style = {} }) => (
  <Tip info={info} style={style}>
    <span style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      width: 12, height: 12,
      border:'1px solid var(--hud-steel)',
      color:'var(--hud-steel)',
      fontFamily:'var(--font-mono)', fontSize: 9,
      cursor:'help',
      marginLeft: 4,
    }}>?</span>
  </Tip>
);

// ─────────────────────────────────────────────────────────────
// Drawer — slides in from right with detail panel.
// Global singleton controlled via DrawerCtx.
// ─────────────────────────────────────────────────────────────
const DrawerCtx = React.createContext({ open: () => {}, close: () => {} });

const DrawerProvider = ({ children }) => {
  const [content, setContent] = React.useState(null);
  const api = React.useMemo(() => ({
    open: (c) => setContent(c),
    close: () => setContent(null),
  }), []);
  return (
    <DrawerCtx.Provider value={api}>
      {children}
      {content && (
        <>
          <div onClick={() => setContent(null)} style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex: 900,
            animation: 'hud-fade-in 0.2s ease-out',
          }} />
          <div style={{
            position:'fixed', top: 0, right: 0, bottom: 0, width: 420,
            background:'#0a0a0a', borderLeft:'1px solid var(--hud-accent)',
            color:'var(--hud-ink)', zIndex: 901, padding: 24, overflowY:'auto',
            animation:'hud-slide-in 0.22s ease-out',
            boxShadow:'-10px 0 40px rgba(0,0,0,0.6)',
          }}>
            <button onClick={() => setContent(null)} style={{
              position:'absolute', top: 12, right: 12, background:'transparent',
              border:'1px solid var(--hud-hairline)', color:'var(--hud-ink-dim)',
              fontFamily:'var(--font-mono)', fontSize: 11, padding:'4px 8px', cursor:'pointer',
            }}>× CLOSE</button>
            {content}
          </div>
          <style>{`
            @keyframes hud-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
            @keyframes hud-fade-in { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
        </>
      )}
    </DrawerCtx.Provider>
  );
};

const useDrawer = () => React.useContext(DrawerCtx);

// ─────────────────────────────────────────────────────────────
// Glossary — plain-English explainers used by tooltips + drawers
// ─────────────────────────────────────────────────────────────
const GLOSSARY = {
  iss: "The International Space Station orbits Earth ~16 times/day at about 408 km altitude. Its position updates continuously as it circles the globe at 27,500 km/h.",
  lat: "Latitude — how far north (+) or south (−) of the equator, in degrees. 0° is the equator, ±90° is the poles.",
  lon: "Longitude — how far east (+) or west (−) of the Prime Meridian, in degrees. Ranges from −180° to +180°.",
  alt_km: "Altitude above mean sea level in kilometres. The ISS orbits between ~400–420 km; it loses a little altitude to drag and is re-boosted periodically.",
  vel_kmh: "Ground speed in km/h. The ISS travels at ~27,500 km/h — fast enough to orbit Earth every 92 minutes.",
  orbit: "Orbit number — total number of complete trips around Earth since the station was launched in 1998. Increases by ~16 per day.",
  crew: "Astronauts currently aboard the station, with their assigned spacecraft (ISS, Soyuz MS-25, etc.) and how many days they've been on this mission.",
  mission_day: "Mission Day — days since the crew launched. Long-duration missions typically last 6 months.",
  kp: "Kp index — global geomagnetic activity scale (0 quiet, 9 extreme storm). Kp ≥ 5 means a geomagnetic storm is underway; auroras move toward lower latitudes.",
  neo: "Near-Earth Object — an asteroid or comet whose orbit brings it close to Earth. NASA's NeoWs API lists every NEO making a close approach this week.",
  pha: "Potentially Hazardous Asteroid — an NEO at least 140 m across that passes within 0.05 AU (~7.5 million km) of Earth's orbit. 'Potentially' means orbit-class, not imminent risk.",
  miss_ld: "Miss distance in Lunar Distances. 1 LD = distance from Earth to the Moon (~384,400 km). A miss of 1 LD is very close; anything under ~20 LD gets tracked carefully.",
  v_kms: "Velocity relative to Earth, in km/s. Typical NEO relative speeds are 5–30 km/s — far faster than a bullet.",
  dia_m: "Estimated maximum diameter in metres. NEOs range from car-sized (~5 m, burn up in atmosphere) to kilometre-scale (extinction-event class).",
  flare: "Solar Flare — a sudden brightening on the Sun. Classified A, B, C, M, X in order of X-ray intensity. X-class can disrupt radio and GPS.",
  flare_class: "Flare class letter + number. C = minor, M = medium (10× more energetic than C), X = major (10× more than M). The number is a multiplier within the class.",
  cme: "Coronal Mass Ejection — a billion-tonne cloud of magnetized plasma blown off the Sun. Arrival at Earth (1–3 days later) can trigger geomagnetic storms and auroras.",
  cme_speed: "CME bulk speed in km/s. Slow CMEs are ~300 km/s; fast ones exceed 2000 km/s and can reach Earth in under a day.",
  gst: "Geomagnetic Storm — a disturbance in Earth's magnetosphere, usually caused by a CME hitting us. Measured by the Kp index.",
  apod: "Astronomy Picture of the Day — NASA has published a new image with a short astronomer-written caption every day since 1995.",
  epic: "EPIC (Earth Polychromatic Imaging Camera) — aboard DSCOVR at the Sun-Earth Lagrange-1 point, 1.5 million km from Earth, it takes full-disk photos of Earth's sunlit side every ~1–2 hours.",
  epic_centroid: "Centroid coordinates — the lat/lon point on Earth directly facing DSCOVR when the image was taken.",
  dscovr: "Deep Space Climate Observatory — NASA/NOAA satellite at Earth-Sun L1 that monitors solar wind and takes full-disk Earth imagery (EPIC).",
  quaternion: "Spacecraft orientation, expressed as a 4-component quaternion (q0, q1, q2, q3). Avoids the gimbal-lock problems of Euler angles.",
  j2000: "J2000 — a standard reference frame for solar-system coordinates, anchored to Earth's equator on Jan 1, 2000 12:00 TT.",
  exoplanet: "A planet orbiting a star other than the Sun. NASA's Exoplanet Archive lists 5,000+ confirmed worlds.",
  distance_ly: "Distance from Earth in light-years. 1 ly = ~9.46 trillion km. Proxima Centauri, our nearest neighbour star, is 4.24 ly away.",
  radius_earth: "Planet radius in Earth radii. 1 R⊕ = 6,371 km. Rocky planets are typically 0.5–2 R⊕; gas giants 4+ R⊕.",
  temp_k: "Equilibrium temperature in Kelvin, ignoring atmosphere. Earth = 255 K (−18 °C); habitable range is roughly 180–310 K.",
  habitable: "Located in the star's habitable zone — the orbital range where liquid water could exist on the surface, given the right atmosphere.",
  sol: "Sol — a Martian solar day. One sol = 24h 39m 35s Earth time. Mars missions count sols from landing.",
  ls: "Solar longitude — Mars's position in its orbit around the Sun, in degrees. 0° = northern spring equinox, 90° = northern summer solstice.",
  mars_pressure: "Atmospheric pressure at the surface, in Pascals. Mars's atmosphere is <1% as dense as Earth's — a typical surface pressure is 600–750 Pa.",
  dsn: "Deep Space Network — NASA's three antenna complexes (Goldstone CA, Madrid ES, Canberra AU) that talk to every interplanetary spacecraft. Spaced 120° apart so one is always facing deep space.",
  datalinks: "Number of active telemetry and downlink channels from spacecraft and observatories tracked by this session.",
  orbital_phase: "How far around its current orbit a tracked body is, expressed as 0–360°. 0° = starting reference point, 180° = halfway around.",
  session: "Session ID — a unique identifier for this monitoring session on Deep Space Network Station 14.",
  tet_vision: "TET·VISION — the visualization layer rendering this HUD. Version 2.4. (Tribute to the Tethys Exploration Terminal aesthetic.)",
  packet: "Packet ID — the identifier of the most recent telemetry packet received. Refreshes as new data arrives.",
  rx: "RX latency — round-trip time for the last acknowledged packet, in milliseconds. Higher = slower link.",
  crc: "Cyclic Redundancy Check — a checksum that confirms the received packet wasn't corrupted in transit.",
};

// ─────────────────────────────────────────────────────────────
// Detail components — rich drawer contents with plain-English
// explanations for every piece of data.
// ─────────────────────────────────────────────────────────────

const DrawerTitle = ({ kicker, title, sub }) => (
  <div style={{ marginBottom: 18, paddingRight: 60 }}>
    {kicker && <div style={{ fontFamily:'var(--font-display)', fontSize: 10, letterSpacing:'0.3em', color:'var(--hud-accent)', textTransform:'uppercase' }}>{kicker}</div>}
    <div style={{ fontFamily:'var(--font-display)', fontSize: 24, fontWeight: 300, letterSpacing:'0.06em', color:'var(--hud-ink)', marginTop: 4, textTransform:'uppercase' }}>{title}</div>
    {sub && <div style={{ fontFamily:'var(--font-mono)', fontSize: 10, color:'var(--hud-steel)', marginTop: 6, letterSpacing:'0.1em' }}>{sub}</div>}
  </div>
);

const DrawerRow = ({ label, value, tone = 'ink', info }) => (
  <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap: 10, padding:'8px 0', borderBottom:'1px solid var(--hud-hairline-soft)', alignItems:'center' }}>
    <div style={{ display:'flex', alignItems:'center' }}>
      <span style={{ fontFamily:'var(--font-display)', fontSize: 10, letterSpacing:'0.22em', color:'var(--hud-ink-dim)', textTransform:'uppercase' }}>{label}</span>
      {info && <InfoDot info={info} />}
    </div>
    <div style={{ fontFamily:'var(--font-mono)', fontSize: 13, color: tone === 'hot' ? 'var(--hud-accent)' : tone === 'cool' ? 'var(--hud-cool)' : 'var(--hud-ink)' }}>{value}</div>
  </div>
);

const DrawerNote = ({ children }) => (
  <div style={{ background:'rgba(232,122,42,0.06)', border:'1px solid var(--hud-hairline)', padding: 12, marginTop: 14, fontFamily:'Rajdhani, sans-serif', fontSize: 13, lineHeight: 1.5, color:'var(--hud-ink)' }}>
    {children}
  </div>
);

const ISSDetail = ({ iss }) => (
  <div>
    <DrawerTitle kicker="Live telemetry" title="International Space Station" sub={`${iss.crew.length} crew aboard · orbiting ${iss.orbit.toLocaleString()} times`} />
    <DrawerRow label="Latitude" value={`${iss.latitude.toFixed(4)}°`} tone="hot" info={GLOSSARY.lat} />
    <DrawerRow label="Longitude" value={`${iss.longitude.toFixed(4)}°`} tone="hot" info={GLOSSARY.lon} />
    <DrawerRow label="Altitude" value={`${iss.altitude_km.toFixed(2)} km`} tone="cool" info={GLOSSARY.alt_km} />
    <DrawerRow label="Velocity" value={`${iss.velocity_kmh.toFixed(1)} km/h`} tone="cool" info={GLOSSARY.vel_kmh} />
    <DrawerRow label="Orbit" value={iss.orbit.toLocaleString()} info={GLOSSARY.orbit} />
    <DrawerNote>{GLOSSARY.iss} At this altitude, the sky is black but the Earth fills half your view. A sunrise happens every 45 minutes.</DrawerNote>
  </div>
);

const APODDetail = ({ apod }) => (
  <div>
    <DrawerTitle kicker={`APOD · ${apod.date || '—'}`} title={apod.title || 'Loading'} sub={apod.copyright ? `© ${apod.copyright.replace(/\n/g,' ')}` : 'NASA / Public Domain'} />
    {apod.url && apod.media_type === 'image' && (
      <img src={apod.url} alt="" style={{ width:'100%', marginBottom: 14, border:'1px solid var(--hud-hairline)' }} />
    )}
    <div style={{ fontFamily:'Rajdhani, sans-serif', fontSize: 13, lineHeight: 1.55, color:'var(--hud-ink)' }}>
      {apod.explanation || 'Explanation unavailable.'}
    </div>
    <DrawerNote>{GLOSSARY.apod}</DrawerNote>
  </div>
);

const NEODetail = ({ neo }) => (
  <div>
    <DrawerTitle kicker={neo.hazard ? 'Potentially hazardous asteroid' : 'Near-Earth object'} title={neo.name} sub={`Close approach ${neo.date || 'today'}`} />
    <DrawerRow label="Diameter" value={`${neo.diameter_m} m`} tone="ink" info={GLOSSARY.dia_m} />
    <DrawerRow label="Velocity" value={`${neo.velocity_kms} km/s`} tone="cool" info={GLOSSARY.v_kms} />
    <DrawerRow label="Miss distance" value={`${neo.miss_km.toLocaleString()} km`} tone={neo.hazard?'hot':'ink'} />
    <DrawerRow label="In Lunar Dist." value={`${neo.miss_lunar.toFixed(2)} LD`} tone={neo.hazard?'hot':'cool'} info={GLOSSARY.miss_ld} />
    <DrawerRow label="Classification" value={neo.hazard ? 'PHA' : 'NEO'} tone={neo.hazard?'hot':'ink'} info={GLOSSARY.pha} />
    <DrawerNote>
      At {neo.velocity_kms} km/s, this object is moving about {Math.round(neo.velocity_kms * 3600)} km/h — roughly {(neo.velocity_kms / 0.34).toFixed(0)}× the speed of sound.
      {neo.hazard ? ' Its size + trajectory earn PHA status; orbit is monitored but no impact risk is current.' : ' Too small or too distant to be classified as hazardous.'}
    </DrawerNote>
  </div>
);

const CrewDetail = ({ crew }) => (
  <div>
    <DrawerTitle kicker="Active astronaut" title={crew.name} sub={`Aboard ${crew.craft} · Mission Day ${crew.mission_day}`} />
    <DrawerRow label="Spacecraft" value={crew.craft} />
    <DrawerRow label="Mission Day" value={crew.mission_day} info={GLOSSARY.mission_day} />
    <DrawerNote>
      After {crew.mission_day} days in microgravity, this astronaut's body has adapted significantly: fluid has shifted upward (puffy face, thinner legs), bone density has decreased in weight-bearing areas, and they've grown up to 5 cm taller.
    </DrawerNote>
  </div>
);

const SpaceWxDetail = ({ donki }) => {
  const major = donki.filter(d => d.intensity > 0.6);
  return (
    <div>
      <DrawerTitle kicker="Space weather · last 30 days" title="Solar activity" sub={`${donki.length} events logged · ${major.length} major`} />
      <DrawerRow label="Solar flares" value={donki.filter(d=>d.type==='FLR').length} info={GLOSSARY.flare} />
      <DrawerRow label="CMEs" value={donki.filter(d=>d.type==='CME').length} info={GLOSSARY.cme} />
      <DrawerRow label="Geo storms" value={donki.filter(d=>d.type==='GST').length} info={GLOSSARY.gst} />
      <DrawerNote>
        Solar flares release energy as X-rays that arrive at Earth in 8 minutes. CMEs are the slow, heavy plasma clouds that follow — they take 1–3 days to arrive and cause the geomagnetic storms that disrupt power grids and paint the sky with auroras.
      </DrawerNote>
    </div>
  );
};

const DonkiDetail = ({ event }) => {
  const isFlare = event.type === 'FLR';
  const isCME = event.type === 'CME';
  const isGST = event.type === 'GST';
  return (
    <div>
      <DrawerTitle kicker={event.type === 'FLR' ? 'Solar flare' : event.type === 'CME' ? 'Coronal mass ejection' : 'Geomagnetic storm'}
                   title={event.class || (event.speed_kms && `${event.speed_kms} km/s`) || (event.kp_index && `Kp ${event.kp_index}`) || event.type}
                   sub={event.peak || event.id} />
      {isFlare && <>
        <DrawerRow label="Class" value={event.class} tone="hot" info={GLOSSARY.flare_class} />
        <DrawerRow label="Active region" value={event.active_region} />
        <DrawerRow label="Source" value={event.source_loc} />
        <DrawerRow label="Intensity" value={`${(event.intensity*100).toFixed(0)}%`} tone="cool" />
        <DrawerNote>{GLOSSARY.flare}</DrawerNote>
      </>}
      {isCME && <>
        <DrawerRow label="Speed" value={`${event.speed_kms} km/s`} tone="cool" info={GLOSSARY.cme_speed} />
        <DrawerRow label="Half angle" value={`${event.half_angle}°`} />
        <DrawerRow label="Direction" value={event.direction} />
        <DrawerNote>{GLOSSARY.cme} Travel time to Earth ≈ {Math.round(150e6 / event.speed_kms / 3600)} hours.</DrawerNote>
      </>}
      {isGST && <>
        <DrawerRow label="Kp index" value={event.kp_index} tone="hot" info={GLOSSARY.kp} />
        <DrawerRow label="Duration" value={`${event.duration_h} h`} />
        <DrawerNote>{GLOSSARY.gst} Kp {event.kp_index} means a G{Math.max(1, event.kp_index-4)} storm — likely aurora sightings at lower latitudes than usual.</DrawerNote>
      </>}
    </div>
  );
};

const ExoplanetDetail = ({ planet }) => (
  <div>
    <DrawerTitle kicker={planet.habitable ? 'Habitable-zone candidate' : 'Confirmed exoplanet'} title={planet.name} sub={`${planet.distance_ly} light-years from Earth`} />
    <DrawerRow label="Distance" value={`${planet.distance_ly} ly`} tone="cool" info={GLOSSARY.distance_ly} />
    <DrawerRow label="Radius" value={`${planet.radius_earth} R⊕`} info={GLOSSARY.radius_earth} />
    <DrawerRow label="Equilibrium temp" value={`${planet.temp_k} K (${planet.temp_k - 273} °C)`} info={GLOSSARY.temp_k} />
    <DrawerRow label="In habitable zone" value={planet.habitable ? 'Yes' : 'No'} tone={planet.habitable?'hot':'ink'} info={GLOSSARY.habitable} />
    <DrawerNote>
      Travelling at the speed of the fastest probe we've ever launched (~17 km/s), reaching {planet.name} would take about {Math.round(planet.distance_ly * 9.46e12 / (17 * 3600 * 24 * 365)).toLocaleString()} years. Light from this planet we see today left it when Earth was {planet.distance_ly > 1000 ? 'very different' : planet.distance_ly > 100 ? 'before modern cities existed' : 'recent history'}.
    </DrawerNote>
  </div>
);

const MarsDetail = ({ mars }) => (
  <div>
    <DrawerTitle kicker="Elysium Planitia" title={`Mars · Sol ${mars.sol}`} sub={`${mars.season} · Ls ${mars.ls}°`} />
    <DrawerRow label="Temp avg" value={`${mars.air_temp_c.avg} °C`} tone="cool" />
    <DrawerRow label="Temp min" value={`${mars.air_temp_c.min} °C`} tone="cool" />
    <DrawerRow label="Temp max" value={`${mars.air_temp_c.max} °C`} tone="hot" />
    <DrawerRow label="Pressure" value={`${mars.pressure_pa} Pa`} info={GLOSSARY.mars_pressure} />
    <DrawerRow label="Wind avg" value={`${mars.wind_speed_ms.avg} m/s`} />
    <DrawerRow label="Sol" value={mars.sol} info={GLOSSARY.sol} />
    <DrawerRow label="Ls (season)" value={`${mars.ls}°`} info={GLOSSARY.ls} />
    <DrawerNote>
      Mars is about half Earth's size with 38% of our gravity. A sol is 39 minutes longer than an Earth day; a Martian year is 687 Earth days. Even on a "warm" day, you'd need a pressure suit — the atmosphere is too thin for unprotected lungs.
    </DrawerNote>
  </div>
);

const EarthDetail = ({ iss, epic }) => (
  <div>
    <DrawerTitle kicker="Home" title="Planet Earth" sub={`ISS at ${iss.latitude.toFixed(2)}°N, ${iss.longitude.toFixed(2)}°E`} />
    <DrawerRow label="Radius" value="6,371 km" />
    <DrawerRow label="Atmosphere" value="78% N₂ · 21% O₂" />
    <DrawerRow label="Mean surface temp" value="14 °C" tone="cool" />
    <DrawerRow label="EPIC last frame" value={epic.meta?.date || '—'} info={GLOSSARY.epic} />
    <DrawerRow label="EPIC centroid lat" value={`${epic.meta?.centroid_coordinates?.lat?.toFixed?.(2) || '—'}°`} info={GLOSSARY.epic_centroid} />
    <DrawerRow label="EPIC centroid lon" value={`${epic.meta?.centroid_coordinates?.lon?.toFixed?.(2) || '—'}°`} />
    <DrawerNote>{GLOSSARY.epic} Pressure highs (H) and lows (L) on the contour view drive the global weather circulation — air flows clockwise out of highs, counter-clockwise into lows in the northern hemisphere (opposite in the south).</DrawerNote>
  </div>
);

const RoverPhotoDetail = ({ photo }) => (
  <div>
    <DrawerTitle kicker={`${photo.rover} · Sol ${photo.sol}`} title={photo.camera} sub={`Earth date ${photo.earth_date} · Frame ${photo.id}`} />
    <img src={photo.img_src} alt="" style={{ width:'100%', marginBottom: 14, border:'1px solid var(--hud-hairline)' }} />
    <DrawerRow label="Camera" value={`${photo.camera_code} — ${photo.camera}`} />
    <DrawerRow label="Sol" value={photo.sol} info={GLOSSARY.sol} />
    <DrawerRow label="Earth date" value={photo.earth_date} />
    <DrawerRow label="Frame ID" value={photo.id} />
    <DrawerNote>
      This photo was taken by Curiosity on the surface of Mars, radioed to an orbiter, then relayed to Earth via the Deep Space Network. Signal travel time between Earth and Mars varies from 3 to 22 minutes each way, depending on planetary alignment.
    </DrawerNote>
  </div>
);

const DeepSkyDetail = ({ entry }) => (
  <div>
    <DrawerTitle kicker={`${entry.telescope} · ${entry.instrument}`} title={entry.title} sub={`${entry.target} · ${entry.year}`} />
    {entry.urls?.[0] && (
      <img src={entry.urls[0]} alt="" referrerPolicy="no-referrer"
           style={{ width:'100%', marginBottom: 14, border:'1px solid var(--hud-hairline)' }} />
    )}
    <DrawerRow label="Target" value={entry.target} />
    <DrawerRow label="Type" value={entry.target_type} />
    <DrawerRow label="Constellation" value={entry.constellation} />
    <DrawerRow label="Distance" value={entry.distance} tone="cool" />
    <DrawerRow label="Right ascension" value={entry.ra} />
    <DrawerRow label="Declination" value={entry.dec} />
    <DrawerRow label="Telescope" value={`${entry.telescope} · ${entry.instrument}`} tone="hot" />
    <DrawerRow label="Year" value={entry.year} />
    <DrawerNote>{entry.blurb}</DrawerNote>
  </div>
);

Object.assign(window, {
  APODImage, DeepSkyImage, Tip, InfoDot, DrawerProvider, DrawerCtx, useDrawer, GLOSSARY,
  DrawerTitle, DrawerRow, DrawerNote,
  ISSDetail, APODDetail, NEODetail, CrewDetail, SpaceWxDetail, DonkiDetail, ExoplanetDetail, MarsDetail, RoverPhotoDetail, EarthDetail, DeepSkyDetail,
});
