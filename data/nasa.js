// NASA data — realistic placeholder values matching real API response shapes.
// Baked in so the hi-fi mock renders deterministically without hitting the API.
// Real API key is hot-wired too, but we render these by default.

window.NASA_KEY = '68bVIYTJKf2XWU8HNO7PeFLBWYzshcWlPCZazu6p';

window.NASA = {
  // APOD — Astronomy Picture of the Day
  apod: {
    date: '2026-04-18',
    title: 'NGC 1365: Barred Spiral Galaxy',
    explanation: 'Sixty million light-years distant in the constellation Fornax, NGC 1365 is a stunning member of the Fornax Cluster of Galaxies. The barred spiral is some 200,000 light-years across.',
    copyright: 'ESO / JWST',
    // Using a real JWST image URL; fallback handled in component
    hdurl: 'https://apod.nasa.gov/apod/image/2403/NGC1365_JamesWebb_2910.jpg',
    url: 'https://apod.nasa.gov/apod/image/2403/NGC1365_JamesWebb_960.jpg',
    media_type: 'image',
  },

  // EPIC — full-disk Earth images (DSCOVR, L1 Lagrange ~1M mi out)
  epic: {
    image: 'epic_1b_20260418003633',
    date: '2026-04-18 00:36:33',
    centroid_coordinates: { lat: 4.29, lon: -155.81 },
    dscovr_j2000_position: { x: -1283921.87, y: -669118.41, z: -130211.52 },
    lunar_j2000_position:  { x:  -345012.33, y:  -98234.11, z:   34981.22 },
    sun_j2000_position:    { x: 141812934.11, y: 46234591.22, z: 20041932.55 },
    attitude_quaternions:  { q0: -0.3621, q1: 0.7912, q2: 0.0412, q3: -0.4891 },
  },

  // ISS live position
  iss: {
    latitude: 23.6712,
    longitude: -147.4281,
    altitude_km: 408.3,
    velocity_kmh: 27583.4,
    visibility: 'daylight',
    orbit: 121482,
    crew: [
      { name: 'O. Kononenko',   craft: 'ISS', role: 'Commander',  mission_day: 342 },
      { name: 'N. Chub',        craft: 'ISS', role: 'Flight Eng', mission_day: 342 },
      { name: 'T. Dyson',       craft: 'ISS', role: 'Flight Eng', mission_day: 198 },
      { name: 'M. Maurer',      craft: 'ISS', role: 'Flight Eng', mission_day: 71 },
      { name: 'S. Ayers',       craft: 'ISS', role: 'Flight Eng', mission_day: 71 },
      { name: 'K. Nyberg',      craft: 'ISS', role: 'Flight Eng', mission_day: 71 },
      { name: 'L. Wang',        craft: 'Tiangong', role: 'Cmdr',  mission_day: 88 },
    ],
  },

  // NeoWs — near-Earth objects close approaches (next 7 days)
  neos: [
    { id: '2523656', name: '2023 FY14',  diameter_m: 142, velocity_kms: 18.32, miss_km: 4_281_992, miss_lunar: 11.14, hazard: false, date: '2026-04-18' },
    { id: '2001036', name: '1036 Ganymed', diameter_m: 37800, velocity_kms: 14.01, miss_km: 56_129_882, miss_lunar: 145.98, hazard: false, date: '2026-04-18' },
    { id: '3542519', name: '2010 PR10', diameter_m: 89,  velocity_kms: 9.17, miss_km: 1_892_441, miss_lunar: 4.92, hazard: false, date: '2026-04-19' },
    { id: '3799273', name: '2018 RC',   diameter_m: 24,  velocity_kms: 12.88, miss_km: 882_120,  miss_lunar: 2.29, hazard: false, date: '2026-04-19' },
    { id: '2011031', name: '2011 UL21', diameter_m: 2310, velocity_kms: 26.52, miss_km: 6_712_801, miss_lunar: 17.45, hazard: true,  date: '2026-04-20' },
    { id: '3102223', name: '2002 VX94', diameter_m: 512, velocity_kms: 21.73, miss_km: 3_118_442, miss_lunar: 8.11, hazard: false, date: '2026-04-20' },
    { id: '3726914', name: '2015 NU13', diameter_m: 61,  velocity_kms: 7.44, miss_km: 412_003,   miss_lunar: 1.07, hazard: true,  date: '2026-04-21' },
    { id: '3843641', name: '2019 OD',   diameter_m: 180, velocity_kms: 15.92, miss_km: 2_004_912, miss_lunar: 5.21, hazard: false, date: '2026-04-21' },
    { id: '2388945', name: '2005 WR1',  diameter_m: 920, velocity_kms: 19.41, miss_km: 8_891_204, miss_lunar: 23.12, hazard: false, date: '2026-04-22' },
    { id: '3455392', name: '2008 SV11', diameter_m: 47,  velocity_kms: 11.02, miss_km: 1_201_884, miss_lunar: 3.12, hazard: false, date: '2026-04-23' },
    { id: '3991122', name: '2021 NY1',  diameter_m: 160, velocity_kms: 9.81, miss_km: 1_522_309, miss_lunar: 3.96, hazard: false, date: '2026-04-24' },
    { id: '3726541', name: '2023 BU9',  diameter_m: 31,  velocity_kms: 6.25, miss_km: 298_441,   miss_lunar: 0.78, hazard: true,  date: '2026-04-24' },
  ],

  // DONKI — space weather notifications
  donki: [
    { id: '2026-04-17T22:14Z-FLR', type: 'FLR', class: 'M4.2', source_loc: 'S12W28', active_region: '13721', peak: '2026-04-17T22:14Z', intensity: 0.62 },
    { id: '2026-04-17T14:02Z-CME', type: 'CME', speed_kms: 812, half_angle: 34, direction: 'S04W12', note: 'Earth-directed component', intensity: 0.74 },
    { id: '2026-04-16T09:41Z-GST', type: 'GST', kp_index: 6, duration_h: 18, intensity: 0.58 },
    { id: '2026-04-16T03:12Z-FLR', type: 'FLR', class: 'X1.1', source_loc: 'N08E04', active_region: '13718', peak: '2026-04-16T03:12Z', intensity: 0.91 },
    { id: '2026-04-15T18:33Z-SEP', type: 'SEP', particle: 'proton', flux: 42, energy_mev: 10, intensity: 0.41 },
    { id: '2026-04-14T11:07Z-CME', type: 'CME', speed_kms: 421, half_angle: 22, direction: 'N22W41', note: 'Off-limb, no impact', intensity: 0.32 },
    { id: '2026-04-13T07:48Z-FLR', type: 'FLR', class: 'C8.4', source_loc: 'S18W62', active_region: '13715', peak: '2026-04-13T07:48Z', intensity: 0.28 },
    { id: '2026-04-12T23:19Z-RBE', type: 'RBE', location: 'outer-belt', intensity: 0.45 },
  ],

  // Exoplanet Archive — confirmed recent discoveries
  exoplanets: [
    { name: 'TOI-700 e',        host: 'TOI-700',        distance_ly: 101.4, radius_earth: 0.95, mass_earth: 0.82, period_days: 27.81, temp_k: 268, discovery: 2023, habitable: true },
    { name: 'Kepler-1649 c',    host: 'Kepler-1649',    distance_ly: 301.0, radius_earth: 1.06, mass_earth: 1.20, period_days: 19.54, temp_k: 234, discovery: 2020, habitable: true },
    { name: 'Proxima Cen b',    host: 'Proxima Cen',    distance_ly: 4.24,  radius_earth: 1.08, mass_earth: 1.27, period_days: 11.19, temp_k: 234, discovery: 2016, habitable: true },
    { name: 'K2-18 b',          host: 'K2-18',          distance_ly: 124.0, radius_earth: 2.61, mass_earth: 8.63, period_days: 32.94, temp_k: 265, discovery: 2015, habitable: true },
    { name: 'TRAPPIST-1 e',     host: 'TRAPPIST-1',     distance_ly: 40.7,  radius_earth: 0.92, mass_earth: 0.69, period_days: 6.10,  temp_k: 251, discovery: 2017, habitable: true },
    { name: 'HD 40307 g',       host: 'HD 40307',       distance_ly: 41.7,  radius_earth: 2.10, mass_earth: 7.09, period_days: 197.80, temp_k: 227, discovery: 2012, habitable: false },
    { name: 'Kepler-442 b',     host: 'Kepler-442',     distance_ly: 1206,  radius_earth: 1.34, mass_earth: 2.36, period_days: 112.30, temp_k: 233, discovery: 2015, habitable: true },
    { name: 'GJ 667C c',        host: 'GJ 667C',        distance_ly: 23.6,  radius_earth: 1.54, mass_earth: 3.80, period_days: 28.14, temp_k: 277, discovery: 2011, habitable: true },
    { name: 'LHS 1140 b',       host: 'LHS 1140',       distance_ly: 48.9,  radius_earth: 1.73, mass_earth: 6.98, period_days: 24.74, temp_k: 230, discovery: 2017, habitable: true },
    { name: 'Ross 128 b',       host: 'Ross 128',       distance_ly: 11.0,  radius_earth: 1.10, mass_earth: 1.35, period_days: 9.87,  temp_k: 269, discovery: 2017, habitable: true },
  ],

  // InSight Mars Weather (mission ended Dec 2022 — historical sol)
  mars: {
    sol: 3721,
    ls: 108.4,           // solar longitude
    season: 'Northern Summer',
    air_temp_c: { min: -96.4, max: -14.2, avg: -58.1 },
    pressure_pa: 748,
    wind_speed_ms: { min: 1.2, max: 22.8, avg: 6.4 },
    wind_dir_deg: 218,
    sunrise: '05:42:11',
    sunset:  '18:04:33',
  },

  // Mars Rover photos — fallback set (real NASA images-assets URLs)
  mars_photos: [
    { id: 'PIA22327', img_src: 'https://images-assets.nasa.gov/image/PIA22327/PIA22327~small.jpg', earth_date: '2018-06-04', sol: 2085, camera: 'Inlet Cover On the Curiosity Rover',     camera_code: 'MAHLI',   rover: 'Curiosity' },
    { id: 'PIA15106', img_src: 'https://images-assets.nasa.gov/image/PIA15106/PIA15106~small.jpg', earth_date: '2011-11-28', sol: 1,    camera: 'Head of Mast on Mars Rover Curiosity', camera_code: 'MAST_R',  rover: 'Curiosity' },
    { id: 'PIA17068', img_src: 'https://images-assets.nasa.gov/image/PIA17068/PIA17068~small.jpg', earth_date: '2013-06-05', sol: 308,  camera: 'Curiosity Drilling Second Rock',       camera_code: 'MAHLI',   rover: 'Curiosity' },
    { id: 'PIA13809', img_src: 'https://images-assets.nasa.gov/image/PIA13809/PIA13809~medium.jpg',earth_date: '2011-04-06', sol: 1,    camera: 'Remote Sensing Mast',                  camera_code: 'MAST_L',  rover: 'Curiosity' },
    { id: 'PIA16204', img_src: 'https://images-assets.nasa.gov/image/PIA16204/PIA16204~small.jpg', earth_date: '2012-09-19', sol: 44,   camera: 'Gale Crater Panorama',                  camera_code: 'MAST_R',  rover: 'Curiosity' },
    { id: 'PIA19912', img_src: 'https://images-assets.nasa.gov/image/PIA19912/PIA19912~small.jpg', earth_date: '2015-10-08', sol: 1126, camera: 'Mount Sharp Foothills',                 camera_code: 'MAST_L',  rover: 'Curiosity' },
    { id: 'PIA21145', img_src: 'https://images-assets.nasa.gov/image/PIA21145/PIA21145~small.jpg', earth_date: '2016-12-05', sol: 1551, camera: 'Mars Dune Surface',                     camera_code: 'MAHLI',   rover: 'Curiosity' },
    { id: 'PIA22210', img_src: 'https://images-assets.nasa.gov/image/PIA22210/PIA22210~small.jpg', earth_date: '2018-03-16', sol: 2005, camera: 'Vera Rubin Ridge View',                 camera_code: 'MAST_R',  rover: 'Curiosity' },
  ],

  // Curated deep-sky imagery — JWST + Hubble greatest hits. All URLs
  // verified against images-assets.nasa.gov (CORS-friendly, same CDN
  // that serves the Mars rover photos). <DeepSkyImage> falls through
  // to the SVG starfield if a URL ever stops resolving.
  deepsky: [
    {
      id: 'cosmic-cliffs',
      telescope: 'JWST', instrument: 'NIRCam',
      title: 'Cosmic Cliffs',
      target: 'NGC 3324 / Carina Nebula', target_type: 'Stellar nursery',
      constellation: 'Carina',
      distance: '7,600 ly', year: 2022,
      ra: '10h 36m 58s', dec: '−58° 38′',
      blurb: 'A "mountain range" of gas eroded by ultraviolet radiation from hot young stars above the frame. The tallest peaks rise 7 light-years from base to summit.',
      urls: ['https://images-assets.nasa.gov/image/carina_nebula/carina_nebula~orig.jpg',
             'https://images-assets.nasa.gov/image/carina_nebula/carina_nebula~medium.jpg'],
    },
    {
      id: 'webb-deep-field',
      telescope: 'JWST', instrument: 'NIRCam',
      title: "Webb's First Deep Field",
      target: 'SMACS 0723', target_type: 'Galaxy cluster',
      constellation: 'Volans',
      distance: '4.6 Gly', year: 2022,
      ra: '07h 23m 13s', dec: '−73° 27′',
      blurb: 'The deepest, sharpest infrared image of the distant universe ever taken — a 12.5-hour exposure of a patch of sky the size of a grain of sand held at arm\'s length. Galaxies in the field appear as they were 13.1 billion years ago.',
      urls: ['https://images-assets.nasa.gov/image/webb_first_deep_field/webb_first_deep_field~orig.jpg',
             'https://images-assets.nasa.gov/image/webb_first_deep_field/webb_first_deep_field~medium.jpg'],
    },
    {
      id: 'jwst-first-light',
      telescope: 'JWST', instrument: 'NIRCam',
      title: 'First Full-Color Images',
      target: 'JWST Press Release', target_type: 'Composite reveal',
      constellation: 'Multiple',
      distance: 'Variable', year: 2022,
      ra: '—', dec: '—',
      blurb: 'The July 2022 unveiling of Webb\'s first science-quality images — Carina, Stephan\'s Quintet, the Southern Ring Nebula, SMACS 0723, and the WASP-96b spectrum — released together in a single press event.',
      urls: ['https://images-assets.nasa.gov/image/NHQ202207120010/NHQ202207120010~orig.jpg',
             'https://images-assets.nasa.gov/image/NHQ202207120010/NHQ202207120010~medium.jpg'],
    },
    {
      id: 'pillars-hubble-2014',
      telescope: 'Hubble', instrument: 'WFC3',
      title: 'Pillars of Creation',
      target: 'Eagle Nebula (M16)', target_type: 'Star-forming region',
      constellation: 'Serpens',
      distance: '6,500 ly', year: 2014,
      ra: '18h 18m 48s', dec: '−13° 49′',
      blurb: 'Hubble\'s high-definition revisit of the iconic 1995 image. Same nebula, same pillars, twenty years of erosion captured in sharper visible-light detail and across a wider field of view.',
      urls: ['https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000842/GSFC_20171208_Archive_e000842~orig.jpg',
             'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000842/GSFC_20171208_Archive_e000842~medium.jpg'],
    },
    {
      id: 'xdf-hubble',
      telescope: 'Hubble', instrument: 'ACS + WFC3',
      title: 'eXtreme Deep Field',
      target: 'HUDF / Fornax field', target_type: 'Deep-field survey',
      constellation: 'Fornax',
      distance: 'Up to 13.2 Gly', year: 2012,
      ra: '03h 32m 39s', dec: '−27° 47′',
      blurb: 'Two million seconds of exposure stacked into one frame. Roughly 5,500 galaxies are visible in a patch of sky 1/10th the diameter of the full Moon — the farthest galaxies were already old when our Sun was born.',
      urls: ['https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001651/GSFC_20171208_Archive_e001651~orig.jpg',
             'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001651/GSFC_20171208_Archive_e001651~medium.jpg'],
    },
    {
      id: 'andromeda-hubble',
      telescope: 'Hubble', instrument: 'ACS',
      title: 'Andromeda Panorama',
      target: 'Messier 31 (Andromeda)', target_type: 'Spiral galaxy',
      constellation: 'Andromeda',
      distance: '2.5 Mly', year: 2015,
      ra: '00h 42m 44s', dec: '+41° 16′',
      blurb: 'A 1.5-billion-pixel mosaic of 411 Hubble pointings spanning 40,000 light-years across our nearest spiral neighbour. Individual stars are resolved across the disk.',
      urls: ['https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000833/GSFC_20171208_Archive_e000833~orig.jpg',
             'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000833/GSFC_20171208_Archive_e000833~medium.jpg'],
    },
    {
      id: 'horsehead-hubble',
      telescope: 'Hubble', instrument: 'WFC3',
      title: 'Horsehead Nebula',
      target: 'Barnard 33', target_type: 'Dark nebula',
      constellation: 'Orion',
      distance: '1,500 ly', year: 2013,
      ra: '05h 40m 59s', dec: '−02° 27′',
      blurb: 'Hubble\'s 23rd-anniversary image. Seen in infrared, the dense column of dust that hides this nebula in visible light becomes translucent and ghostly — a horse made of haze instead of silhouette.',
      urls: ['https://images-assets.nasa.gov/image/PIA16008/PIA16008~orig.jpg',
             'https://images-assets.nasa.gov/image/PIA16008/PIA16008~medium.jpg'],
    },
    {
      id: 'lmc-starbirth-hubble',
      telescope: 'Hubble', instrument: 'WFPC2',
      title: 'Star-Birth Region',
      target: 'NGC 2074 (LMC)', target_type: 'Stellar nursery',
      constellation: 'Dorado',
      distance: '170,000 ly', year: 2008,
      ra: '05h 39m 03s', dec: '−69° 30′',
      blurb: 'Captured on Hubble\'s 100,000th orbit around Earth. A turbulent star-forming region in the Large Magellanic Cloud, near the Tarantula Nebula — towering pillars of dust being eroded by young hot stars.',
      urls: ['https://images-assets.nasa.gov/image/PIA10957/PIA10957~orig.jpg',
             'https://images-assets.nasa.gov/image/PIA10957/PIA10957~medium.jpg'],
    },
  ],

  // CNEOS Fireballs — recent bolides
  fireballs: [
    { date: '2026-04-15T03:42:11Z', lat:  48.11, lon:  -104.22, alt_km: 31.4, vel_kms: 17.2, energy_kt: 0.42 },
    { date: '2026-04-11T22:08:54Z', lat: -22.47, lon:   142.88, alt_km: 38.1, vel_kms: 22.9, energy_kt: 0.18 },
    { date: '2026-04-08T14:19:02Z', lat:  55.92, lon:    -3.14, alt_km: 44.7, vel_kms: 14.1, energy_kt: 0.08 },
    { date: '2026-04-03T09:55:37Z', lat:  31.02, lon:   120.41, alt_km: 29.3, vel_kms: 19.8, energy_kt: 1.12 },
    { date: '2026-03-28T18:02:18Z', lat: -8.91,  lon:   -38.12, alt_km: 36.5, vel_kms: 16.0, energy_kt: 0.31 },
    { date: '2026-03-22T05:31:44Z', lat:  41.88, lon:    45.22, alt_km: 33.8, vel_kms: 21.4, energy_kt: 0.67 },
  ],
};
