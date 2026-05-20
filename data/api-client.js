// ─────────────────────────────────────────────────────────────
// Live NASA API client (browser-side). Falls back to baked data.
// ─────────────────────────────────────────────────────────────
const NASA_KEY = '68bVIYTJKf2XWU8HNO7PeFLBWYzshcWlPCZazu6p';
const API = 'https://api.nasa.gov';

async function safeFetch(url, timeout = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

async function fetchAPOD() {
  try { return await safeFetch(`${API}/planetary/apod?api_key=${NASA_KEY}`); }
  catch { return window.NASA.apod; }
}

async function fetchNEOs(days = 7) {
  try {
    const span = Math.min(7, Math.max(1, days)) - 1;
    const today = new Date();
    const end = new Date(today.getTime() + span * 86400000);
    const startStr = today.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const j = await safeFetch(`${API}/neo/rest/v1/feed?start_date=${startStr}&end_date=${endStr}&api_key=${NASA_KEY}`);
    const arr = [];
    Object.values(j.near_earth_objects || {}).forEach(day => day.forEach(n => {
      const ca = n.close_approach_data?.[0];
      arr.push({
        id: n.id,
        name: n.name.replace(/[()]/g,''),
        diameter_m: Math.round(n.estimated_diameter?.meters?.estimated_diameter_max || 0),
        velocity_kms: +(+(ca?.relative_velocity?.kilometers_per_second || 0)).toFixed(2),
        miss_km: Math.round(+(ca?.miss_distance?.kilometers || 0)),
        miss_lunar: +(+(ca?.miss_distance?.lunar || 0)).toFixed(2),
        hazard: n.is_potentially_hazardous_asteroid,
        date: ca?.close_approach_date || today,
        epoch: ca?.epoch_date_close_approach ? +ca.epoch_date_close_approach : null,
        jpl_url: n.nasa_jpl_url || null,
      });
    }));
    return arr.length ? arr.slice(0, 14) : window.NASA.neos;
  } catch { return window.NASA.neos; }
}

async function fetchDONKI() {
  try {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 864e5);
    const fmt = d => d.toISOString().slice(0,10);
    const [flr, cme, gst] = await Promise.all([
      safeFetch(`${API}/DONKI/FLR?startDate=${fmt(start)}&endDate=${fmt(end)}&api_key=${NASA_KEY}`).catch(()=>[]),
      safeFetch(`${API}/DONKI/CME?startDate=${fmt(start)}&endDate=${fmt(end)}&api_key=${NASA_KEY}`).catch(()=>[]),
      safeFetch(`${API}/DONKI/GST?startDate=${fmt(start)}&endDate=${fmt(end)}&api_key=${NASA_KEY}`).catch(()=>[]),
    ]);
    const events = [];
    (flr || []).forEach(f => {
      const cls = f.classType || 'C1.0';
      const major = cls[0];
      const intensity = major === 'X' ? 0.95 : major === 'M' ? 0.6 : major === 'C' ? 0.3 : 0.15;
      events.push({ id: f.flrID, type:'FLR', class: cls, source_loc: f.sourceLocation || '—', active_region: f.activeRegionNum || '—', peak: f.peakTime, intensity });
    });
    (cme || []).forEach(c => {
      const a = c.cmeAnalyses?.[0];
      const speed = a?.speed || 400;
      events.push({ id: c.activityID, type:'CME', speed_kms: speed, half_angle: a?.halfAngle || 20, direction: `${a?.latitude||0}/${a?.longitude||0}`, note: c.note?.slice(0,60), intensity: Math.min(1, speed/1500) });
    });
    (gst || []).forEach(g => {
      const kp = g.allKpIndex?.[0]?.kpIndex || 4;
      events.push({ id: g.gstID, type:'GST', kp_index: kp, duration_h: 12, intensity: Math.min(1, kp/9) });
    });
    events.sort((a,b) => (b.peak||b.id) > (a.peak||a.id) ? 1 : -1);
    return events.length ? events.slice(0, 12) : window.NASA.donki;
  } catch { return window.NASA.donki; }
}

async function fetchEPIC() {
  try {
    const list = await safeFetch(`${API}/EPIC/api/natural?api_key=${NASA_KEY}`);
    if (!list?.length) return { meta: window.NASA.epic, url: null };
    const latest = list[list.length - 1];
    const [Y, M, D] = latest.date.split(' ')[0].split('-');
    const url = `https://epic.gsfc.nasa.gov/archive/natural/${Y}/${M}/${D}/png/${latest.image}.png?api_key=${NASA_KEY}`;
    return { meta: { ...latest, centroid_coordinates: latest.centroid_coordinates }, url };
  } catch { return { meta: window.NASA.epic, url: null }; }
}

async function fetchMarsPhotos() {
  // The /mars-photos/ rover endpoint is chronically flaky (gateway 404s).
  // Use the NASA Image Library instead — much more reliable, CORS-friendly.
  try {
    const j = await safeFetch(`https://images-api.nasa.gov/search?q=mars%20surface%20curiosity&media_type=image&page_size=40`);
    const items = (j.collection?.items || [])
      .filter(it => it.links?.[0]?.href && it.data?.[0])
      .slice(0, 12)
      .map((it, i) => {
        const d = it.data[0];
        const title = d.title || 'Mars Surface';
        // Derive a fake camera code from the title for flavor
        const code = /mastcam|mast/i.test(title) ? 'MAST_R'
                   : /navcam|navigation/i.test(title) ? 'NAV_L'
                   : /hazcam|hazard/i.test(title) ? 'FHAZ'
                   : /mahli|arm/i.test(title) ? 'MAHLI'
                   : /chemcam|laser/i.test(title) ? 'CHEMCAM'
                   : /drill/i.test(title) ? 'MAHLI'
                   : 'MAST_L';
        const earthDate = (d.date_created || '').slice(0, 10);
        // Fake sol number from date (sol 0 = Aug 6 2012 for Curiosity)
        const sol = earthDate
          ? Math.max(1, Math.round((new Date(earthDate) - new Date('2012-08-06')) / 88775244))
          : 1000 + i;
        return {
          id: d.nasa_id || `p-${i}`,
          img_src: it.links[0].href,
          earth_date: earthDate || '—',
          sol,
          camera: title.length > 40 ? title.slice(0, 40) + '…' : title,
          camera_code: code,
          rover: 'Curiosity',
        };
      });
    return items.length ? items.slice(0, 8) : window.NASA.mars_photos;
  } catch { return window.NASA.mars_photos; }
}

// Per-NEO orbital data, cached for the session so repeat drawer opens cost nothing.
const __orbCache = new Map();
async function fetchNeoOrbitalData(id) {
  if (!id) return null;
  if (__orbCache.has(id)) return __orbCache.get(id);
  try {
    const j = await safeFetch(`${API}/neo/rest/v1/neo/${id}?api_key=${NASA_KEY}`);
    const od = j.orbital_data || {};
    const out = {
      class: od.orbit_class?.orbit_class_type || null,
      class_desc: od.orbit_class?.orbit_class_description || null,
      ecc: od.eccentricity != null ? +(+od.eccentricity).toFixed(3) : null,
      inc: od.inclination != null ? +(+od.inclination).toFixed(2) : null,
      a:   od.semi_major_axis != null ? +(+od.semi_major_axis).toFixed(3) : null,
      period_d: od.orbital_period != null ? +(+od.orbital_period).toFixed(1) : null,
      first_obs: od.first_observation_date || null,
      last_obs:  od.last_observation_date || null,
      jpl_url:   j.nasa_jpl_url || null,
    };
    __orbCache.set(id, out);
    return out;
  } catch { __orbCache.set(id, null); return null; }
}

// JPL Sentry — impact-risk listed objects, indexed by designation.
let __sentryCache = null;
async function fetchSentryAll() {
  if (__sentryCache) return __sentryCache;
  try {
    const j = await safeFetch('https://ssd-api.jpl.nasa.gov/sentry.api?all=1');
    const out = {};
    (j.data || []).forEach(row => {
      const key = (row.des || '').trim();
      if (!key) return;
      out[key] = {
        ip: +row.ip,
        ps: +row.ps_cum,
        ts: row.ts_max ? +row.ts_max : 0,
        range: row.range || '',
      };
    });
    __sentryCache = out;
    return out;
  } catch { __sentryCache = {}; return __sentryCache; }
}

window.NASA_API = { fetchAPOD, fetchNEOs, fetchDONKI, fetchEPIC, fetchMarsPhotos, fetchNeoOrbitalData, fetchSentryAll };
