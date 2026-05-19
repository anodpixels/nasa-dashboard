// ─────────────────────────────────────────────────────────────
// Globe3D — Three.js sphere with two render modes:
//   mode="contour" → ShaderMaterial with procedural topo isolines
//   mode="photo"   → Texture wrap (Blue Marble for Earth)
// Drag to rotate · auto-spins when idle · HTML overlay markers
// anchored to lat/lon, projected to screen each frame.
// ─────────────────────────────────────────────────────────────

const SIMPLEX_3D = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const CONTOUR_VERT = `
varying vec3 vLocalPos;
varying vec3 vWorldNormal;
void main() {
  vLocalPos = position;
  vWorldNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CONTOUR_FRAG = `
${SIMPLEX_3D}
varying vec3 vLocalPos;
varying vec3 vWorldNormal;
uniform vec3 uColor;
uniform float uSeed;
uniform float uContours;
uniform float uScale;

float terrain(vec3 p) {
  float h = 0.0;
  float a = 1.0;
  for (int i = 0; i < 5; i++) {
    h += a * snoise(p);
    p *= 2.05;
    a *= 0.5;
  }
  return h;
}

void main() {
  vec3 p = normalize(vLocalPos) * uScale + vec3(uSeed);
  float h = terrain(p);
  // contour lines
  float c = abs(fract(h * uContours) - 0.5);
  float line = 1.0 - smoothstep(0.0, 0.05, c);
  // emphasis every 5th line (slightly bolder)
  float c5 = abs(fract(h * uContours * 0.2) - 0.5);
  float emp = 1.0 - smoothstep(0.0, 0.04, c5);
  float intensity = max(line * 0.55, emp * 0.95);
  // rim/silhouette fade — sphere face is bright, edge fades
  float face = max(0.0, vWorldNormal.z);
  intensity *= mix(0.35, 1.0, face);
  if (intensity < 0.04) discard;
  gl_FragColor = vec4(uColor, intensity);
}
`;

// lat (deg) / lon (deg) → unit-sphere vector. Lat = N+/S-, Lon = E+/W-.
function latLonToVec3(THREE, lat, lon, r = 1) {
  const latR = (lat * Math.PI) / 180;
  const lonR = (lon * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(latR) * Math.sin(lonR),
    r * Math.sin(latR),
    r * Math.cos(latR) * Math.cos(lonR),
  );
}

const Globe3D = ({
  mode = 'contour',
  markers = [],
  size = 480,
  color = '#f5f1e8',
  seed = 13.3,
  contours = 9,
  scale = 2.4,
  photoUrl,
  autoSpin = true,
  className = '',
  style = {},
  onReady,
}) => {
  const containerRef = React.useRef(null);
  const markerRefs = React.useRef({});
  const stateRef = React.useRef({});

  React.useEffect(() => {
    const THREE = window.THREE;
    if (!THREE) { console.warn('THREE not loaded'); return; }
    const container = containerRef.current;
    if (!container) return;

    // Scene / camera / renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 3.55; // a bit further than 3.0 — adds visual padding around the sphere

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';

    // Geometry + material
    const geometry = new THREE.SphereGeometry(1, 96, 96);
    let material;
    if (mode === 'contour') {
      material = new THREE.ShaderMaterial({
        uniforms: {
          uColor:    { value: new THREE.Color(color) },
          uSeed:     { value: seed },
          uContours: { value: contours },
          uScale:    { value: scale },
        },
        vertexShader: CONTOUR_VERT,
        fragmentShader: CONTOUR_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      });
    } else {
      // photo mode — try to load texture, fall back to a procedural blue planet
      material = new THREE.MeshBasicMaterial({ color: 0x1a3a5a });
      if (photoUrl) {
        new THREE.TextureLoader().load(
          photoUrl,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            material.map = tex;
            material.color.set(0xffffff);
            material.needsUpdate = true;
          },
          undefined,
          () => { /* keep blue fallback */ },
        );
      }
    }

    const sphere = new THREE.Mesh(geometry, material);
    // tilt earth-ish on x-axis
    sphere.rotation.x = -0.25;
    scene.add(sphere);

    // ── Drag-rotate ─────────────────────────────────────────────
    let dragging = false;
    let prev = { x: 0, y: 0 };
    const dom = renderer.domElement;
    dom.style.cursor = 'grab';
    const onDown = (e) => {
      dragging = true;
      prev = { x: e.clientX, y: e.clientY };
      dom.style.cursor = 'grabbing';
      try { dom.setPointerCapture(e.pointerId); } catch {}
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      sphere.rotation.y += dx * 0.007;
      sphere.rotation.x += dy * 0.007;
      sphere.rotation.x = Math.max(-Math.PI / 2 + 0.2, Math.min(Math.PI / 2 - 0.2, sphere.rotation.x));
      prev = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e) => {
      dragging = false;
      dom.style.cursor = 'grab';
      try { dom.releasePointerCapture(e.pointerId); } catch {}
    };
    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointermove', onMove);
    dom.addEventListener('pointerup', onUp);
    dom.addEventListener('pointercancel', onUp);
    dom.addEventListener('pointerleave', onUp);

    // ── Animate ─────────────────────────────────────────────────
    const tmpV = new THREE.Vector3();
    let raf;
    const animate = () => {
      if (autoSpin && !dragging) {
        sphere.rotation.y += 0.0014;
      }
      // Project marker lat/lon → screen
      markers.forEach((m) => {
        const el = markerRefs.current[m.id];
        if (!el) return;
        tmpV.copy(latLonToVec3(THREE, m.lat, m.lon, 1));
        tmpV.applyMatrix4(sphere.matrixWorld);
        // Visibility: dot of marker world-position direction vs camera-forward
        const dx = tmpV.x - camera.position.x;
        const dy = tmpV.y - camera.position.y;
        const dz = tmpV.z - camera.position.z;
        // Marker is in front if camera-to-marker vector projects negative onto camera-to-origin
        const facing = tmpV.clone().normalize().dot(new THREE.Vector3(0, 0, 1));
        const visible = facing > -0.05;
        // Project to NDC
        tmpV.project(camera);
        const x = (tmpV.x * 0.5 + 0.5) * size;
        const y = (-tmpV.y * 0.5 + 0.5) * size;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        el.style.opacity = visible ? Math.min(1, 0.3 + facing) : 0;
      });
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    stateRef.current = { THREE, scene, camera, renderer, sphere, material };
    // Expose imperative API: reset rotation + rotate to a given lat/lon
    const baseRotX = -0.25, baseRotY = 0, baseRotZ = 0;
    const api = {
      reset: () => {
        sphere.rotation.set(baseRotX, baseRotY, baseRotZ);
      },
      rotateTo: (lat, lon) => {
        // To put (lat, lon) at the front of the camera (the +z side after the
        // tilt baseRotX), we need: rotation.y = -lon (deg→rad), rotation.x = lat.
        const latR = (lat * Math.PI) / 180;
        const lonR = (lon * Math.PI) / 180;
        sphere.rotation.x = baseRotX + latR;
        sphere.rotation.y = -lonR;
      },
    };
    if (onReady) onReady(api);

    return () => {
      cancelAnimationFrame(raf);
      dom.removeEventListener('pointerdown', onDown);
      dom.removeEventListener('pointermove', onMove);
      dom.removeEventListener('pointerup', onUp);
      dom.removeEventListener('pointercancel', onUp);
      dom.removeEventListener('pointerleave', onUp);
      geometry.dispose();
      material.dispose?.();
      if (material.map) material.map.dispose?.();
      renderer.dispose();
      if (dom.parentNode) dom.parentNode.removeChild(dom);
    };
    // eslint-disable-next-line
  }, [mode, size, color, seed, contours, scale, photoUrl, autoSpin]);

  return (
    <div className={className} style={{ position:'relative', width: size, height: size, ...style }}>
      <div ref={containerRef} style={{ width: size, height: size }} />
      {/* Crosshair axes overlay */}
      <svg style={{ position:'absolute', inset: 0, pointerEvents:'none' }} width={size} height={size}>
        <line x1={size/2} y1="0"      x2={size/2} y2={size*0.08} stroke="var(--hud-ink)" strokeWidth="2" />
        <line x1={size/2} y1={size*0.92} x2={size/2} y2={size}     stroke="var(--hud-ink)" strokeWidth="2" />
        <line x1="0"      y1={size/2} x2={size*0.08} y2={size/2} stroke="var(--hud-ink)" strokeWidth="2" />
        <line x1={size*0.92} y1={size/2} x2={size}     y2={size/2} stroke="var(--hud-ink)" strokeWidth="2" />
        {/* outer dashed ring */}
        <circle cx={size/2} cy={size/2} r={size/2 - 6} fill="none" stroke="var(--hud-hairline)" strokeDasharray="2 6" />
        {/* sparse tick marks */}
        {Array.from({ length: 40 }).map((_, i) => {
          if (i % 3 === 0) return null;
          const a = (i / 40) * Math.PI * 2 - Math.PI / 2;
          const r1 = size / 2 - 2;
          const r2 = size / 2 - 16;
          return <line key={i}
            x1={size/2 + Math.cos(a) * r1} y1={size/2 + Math.sin(a) * r1}
            x2={size/2 + Math.cos(a) * r2} y2={size/2 + Math.sin(a) * r2}
            stroke="var(--hud-ink-dim)" strokeWidth="1" opacity="0.55" />;
        })}
      </svg>
      {/* Markers (positioned in animation loop via refs) */}
      {markers.map((m) => (
        <div
          key={m.id}
          ref={(el) => { markerRefs.current[m.id] = el; }}
          style={{
            position:'absolute', top: 0, left: 0,
            pointerEvents:'none',
            fontFamily: m.font || 'var(--font-display)',
            fontSize: m.size || 28,
            fontWeight: m.weight || 300,
            color: m.color || 'var(--hud-ink)',
            letterSpacing: '0.04em',
            whiteSpace:'nowrap',
            textShadow:'0 0 4px rgba(0,0,0,0.8)',
            willChange:'transform, opacity',
          }}
        >{m.label}</div>
      ))}
    </div>
  );
};

window.Globe3D = Globe3D;
window.latLonToVec3 = latLonToVec3;
