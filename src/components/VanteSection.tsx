import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const R2 = 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/';
const WORK: [string, string][] = [
  ['Roadster 3D', 'designs/roadster-3d-car-landing.mp4'],
  ['Living Portrait', 'aaaf/living-portrait-hero.mp4'],
  ['Particle Self', 'aaaf/oraciteslArea.mp4'],
  ['Robot Jellyfish', 'aaaf/medusa-jellyfish-hero.mp4'],
  ['Ink Reveal', 'designs/ink-reveal-hover.mp4'],
  ['Space Voyage', 'designs/space-voyage-video.mp4'],
  ['Helion Dispatch', 'designs/helion-dispatch-landing.mp4'],
  ['Honey Bee', 'designs/honey-bee-melli-landing.mp4'],
];

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const out = (t: number) => 1 - (1 - t) ** 3;
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

export interface VanteProjectItem {
  num: string;
  name: string;
  category: string;
  url: string;
  githubUrl?: string;
  description?: string;
  tech?: string[];
  metrics?: string[];
  images: {
    col1Img1: string;
    col1Img2: string;
    col2Img: string;
  };
}

interface GridRect {
  x: number;
  y: number;
  w: number;
  h: number;
  vw: number;
  vh: number;
  c: number;
  r: number;
}

interface RibbonCard {
  i: number;
  title: string;
  v: HTMLVideoElement;
  tex: THREE.VideoTexture;
  geo: THREE.PlaneGeometry;
  mat: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  rect: GridRect | null;
}

interface VanteSectionProps {
  projects: VanteProjectItem[];
  onOpenProject: (project: VanteProjectItem) => void;
}

export default function VanteSection({ projects, onOpenProject }: VanteSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const l2Ref = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  const [pageOffset, setPageOffset] = useState(0);
  const projectsRef = useRef(projects);
  const pageOffsetRef = useRef(pageOffset);
  const onOpenProjectRef = useRef(onOpenProject);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    pageOffsetRef.current = pageOffset;
  }, [pageOffset]);

  useEffect(() => {
    onOpenProjectRef.current = onOpenProject;
  }, [onOpenProject]);

  useEffect(() => {
    const trackEl = trackRef.current;
    const stageEl = stageRef.current;
    const canvas = canvasRef.current;
    const l1El = l1Ref.current;
    const l2El = l2Ref.current;
    const capEl = capRef.current;
    const glowEl = glowRef.current;
    const crossEl = crossRef.current;
    const ruleEl = ruleRef.current;
    const hintEl = hintRef.current;
    const pagerEl = pagerRef.current;
    const nameEl = nameRef.current;

    if (
      !trackEl ||
      !stageEl ||
      !canvas ||
      !l1El ||
      !l2El ||
      !capEl ||
      !glowEl ||
      !crossEl ||
      !ruleEl ||
      !hintEl ||
      !pagerEl ||
      !nameEl
    ) {
      return;
    }

    /* ---------- renderer ---------- */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const scene = new THREE.Scene();
    const FOV = 35;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

    /* ---------- ribbon path ---------- */
    let path: THREE.CatmullRomCurve3;
    let PATH_L = 1;
    const SAMPLES = 1200;
    const pathP: THREE.Vector3[] = [];
    const pathT: THREE.Vector3[] = [];
    const PH0 = -1.5;
    const PH1 = Math.PI * 2 + 1.35;

    function buildPath() {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 160; i++) {
        const t = i / 160;
        const ph = mix(PH0, PH1, t);
        const cs = Math.cos(ph);
        const u = 2 * t - 1;
        // a shallow arc close to the camera, then long runs far behind it
        const depth = cs > 0 ? 7.6 + 16.4 * cs ** 0.9 : 7.6 + 2.2 * cs;
        const edge = 0.84 + 0.5 * span(0.14 - t, 0, 0.14) + 0.8 * span(t, 0.84, 1);
        pts.push(
          new THREE.Vector3(
            edge * Math.sin(ph) * depth * 0.561,
            0.5 * Math.sign(u) * Math.abs(u) ** 1.4 * depth * 0.63,
            -depth
          )
        );
      }
      path = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      path.arcLengthDivisions = 1500;
      PATH_L = path.getLength();
      pathP.length = 0;
      pathT.length = 0;
      for (let i = 0; i <= SAMPLES; i++) {
        const u = i / SAMPLES;
        pathP.push(path.getPointAt(u));
        pathT.push(path.getTangentAt(u));
      }
    }

    const at = (s: number, op: THREE.Vector3, ot: THREE.Vector3) => {
      const f = clamp(s / PATH_L) * SAMPLES;
      const i = Math.min(SAMPLES - 1, Math.floor(f));
      const k = f - i;
      op.lerpVectors(pathP[i], pathP[i + 1], k);
      ot.lerpVectors(pathT[i], pathT[i + 1], k).normalize();
    };

    /* ---------- cards ---------- */
    const CARD_W = 2.1;
    const CARD_H = 1.32;
    const GAP = 0.03;
    const STEP = CARD_W + GAP;
    const NX = 28;
    const NY = 3;

    const vs = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
    const fs = `uniform sampler2D map;uniform vec2 cover;uniform float aspect,ready,radius;varying vec2 vUv;
void main(){
  vec2 q=(abs(vUv-.5)-.5)*vec2(aspect,1.)+radius;
  float d=length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
  float px=fwidth(d),a=1.-smoothstep(-px,px,d);
  if(a<.01)discard;
  vec2 uv=vUv;if(!gl_FrontFacing)uv.x=1.-uv.x;
  vec3 c=mix(vec3(.075),texture2D(map,(uv-.5)*cover+.5).rgb,ready);
  float edge=smoothstep(-.012-px,-.012,d);
  gl_FragColor=vec4(mix(c,vec3(1.),edge*.1),a);
}`;

    const cards: RibbonCard[] = WORK.map(([title, src], i) => {
      const v = document.createElement('video');
      Object.assign(v, {
        crossOrigin: 'anonymous',
        muted: true,
        loop: true,
        playsInline: true,
        preload: 'auto',
        src: R2 + src,
      });
      v.setAttribute('playsinline', '');
      const tex = new THREE.VideoTexture(v);
      tex.colorSpace = THREE.NoColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      const geo = new THREE.PlaneGeometry(1, 1, NX, NY);
      const mat = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          map: { value: tex },
          cover: { value: new THREE.Vector2(1, 1) },
          aspect: { value: CARD_W / CARD_H },
          ready: { value: 0 },
          radius: { value: 0.018 },
        },
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      scene.add(mesh);
      const c: RibbonCard = { i, title, v, tex, geo, mat, mesh, rect: null };
      v.addEventListener('loadeddata', () => {
        const va = v.videoWidth / v.videoHeight;
        const ca = CARD_W / CARD_H;
        mat.uniforms.cover.value.set(va > ca ? ca / va : 1, va > ca ? 1 : va / ca);
        mat.uniforms.ready.value = 1;
      });
      return c;
    });

    /* ---------- layout ---------- */
    const GZ = 8;
    let W = 1;
    let H = 1;
    let asp = 1;
    let cols = 3;
    let rows = 2;
    let tanH = 0.3153;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      asp = W / H;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H, false);
      camera.aspect = asp;
      camera.fov = asp < 16 / 9 ? (Math.atan(0.561 / asp) * 360) / Math.PI : FOV;
      camera.updateProjectionMatrix();
      tanH = Math.tan((camera.fov * Math.PI) / 360);
      cols = asp < 0.9 ? 2 : 3;
      rows = asp < 0.9 ? 3 : 2;
    }

    window.addEventListener('resize', resize);
    resize();
    buildPath();

    function grid(i: number): GridRect {
      const vh = 2 * GZ * tanH;
      const vw = vh * asp;
      const gw = vw * (cols === 3 ? 0.74 : 0.88);
      const gap = gw * 0.017;
      const cw = (gw - gap * (cols - 1)) / cols;
      const ch = cw / (CARD_W / CARD_H);
      const gh = ch * rows + gap * 1.6 * (rows - 1);
      const c = i % cols;
      const r = Math.floor(i / cols);
      return {
        x: -gw / 2 + cw / 2 + c * (cw + gap),
        y: gh / 2 - ch / 2 - r * (ch + gap * 1.6),
        w: cw,
        h: ch,
        vw,
        vh,
        c,
        r,
      };
    }

    /* ---------- scroll ---------- */
    let target = 0;
    let p = 0;
    let inView = false;

    const readScroll = () => {
      if (!trackEl) return;
      const rect = trackEl.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      target = clamp(-rect.top / scrollable);
      inView = rect.bottom > -200 && rect.top < window.innerHeight + 200;
    };
    window.addEventListener('scroll', readScroll, { passive: true });
    readScroll();

    /* ---------- pose ---------- */
    const op = new THREE.Vector3();
    const ot = new THREE.Vector3();
    const up = new THREE.Vector3();
    const Y = new THREE.Vector3(0, 1, 0);
    const vp = new THREE.Vector3();

    function poseRibbon(c: RibbonCard, head: number) {
      const pos = c.geo.attributes.position;
      const centre = head - c.i * STEP;
      for (let iy = 0; iy <= NY; iy++) {
        for (let ix = 0; ix <= NX; ix++) {
          const k = iy * (NX + 1) + ix;
          const lu = ix / NX - 0.5;
          const lv = 0.5 - iy / NY;
          at(centre + lu * CARD_W, op, ot);
          // keep the sheet upright, leaning a little into the turn
          up.copy(Y).addScaledVector(ot, -Y.dot(ot)).normalize();
          vp.copy(op).addScaledVector(up, lv * CARD_H);
          pos.setXYZ(k, vp.x, vp.y, vp.z);
        }
      }
      pos.needsUpdate = true;
    }

    function poseGrid(c: RibbonCard, q: number) {
      const g = grid(c.i);
      const pos = c.geo.attributes.position;
      const dx = (g.c - (cols - 1) / 2) * 1.2 + (cols === 3 && g.c === 1 ? 0 : 0);
      const dy = g.r < rows / 2 ? 1 : -1;
      const ox = dx * g.vw * 0.62 * (1 - q);
      const oy = dy * g.vh * (g.c === 1 ? 0.95 : 0.34) * (1 - q);
      const tilt = (1 - q) * 0.22 * (g.c - 1 || 0.5) * dy;
      const cs = Math.cos(tilt);
      const sn = Math.sin(tilt);
      for (let iy = 0; iy <= NY; iy++) {
        for (let ix = 0; ix <= NX; ix++) {
          const k = iy * (NX + 1) + ix;
          const x = (ix / NX - 0.5) * g.w;
          const y = (0.5 - iy / NY) * g.h;
          pos.setXYZ(
            k,
            g.x + ox + x * cs - y * sn,
            g.y + oy + x * sn + y * cs,
            -GZ - (1 - q) * 0.6 * Math.sin((ix / NX) * Math.PI)
          );
        }
      }
      pos.needsUpdate = true;
      c.rect = g;
    }

    const RIB_A = 0.14;
    const RIB_B = 0.63;

    function render() {
      const pp = p;
      // headline runs right across the page in opposite directions
      const rise = 1 - out(span(pp, 0, 0.12));
      const run = mix(-50, 76, span(pp, 0, 0.58));
      l1El!.style.transform = `translate3d(${run}vw,${rise * 34}vh,0)`;
      l2El!.style.transform = `translate3d(${-run}vw,${rise * 34}vh,0)`;
      const capA = 1 - span(pp, 0.52, 0.57);
      capEl!.style.opacity = String(capA);
      capEl!.style.transform = `translate(-50%,calc(-50% + ${rise * 34}vh))`;
      const intro = String(1 - span(pp, 0, 0.05));
      hintEl!.style.opacity = intro;
      pagerEl!.style.opacity = intro;
      crossEl!.style.opacity = intro;
      glowEl!.style.opacity = intro;
      ruleEl!.style.transform = `scaleX(${ease(span(pp, 0.72, 0.86))})`;
      ruleEl!.style.top = '50%';

      // ribbon, then the grid
      const pr = span(pp, RIB_A, RIB_B);
      const head = mix(0, PATH_L + cards.length * STEP, pr);
      for (const c of cards) {
        const s = head - c.i * STEP;
        const end = PATH_L - CARD_W;
        if (s < end) {
          c.mesh.visible = s > CARD_W;
          c.rect = null;
          if (c.mesh.visible) poseRibbon(c, head);
        } else if (c.i < cols * rows) {
          // each card flies to its slot the moment it leaves the rail
          const st = mix(RIB_A, RIB_B, (end + c.i * STEP) / (PATH_L + cards.length * STEP));
          const q = out(span(pp, st, st + 0.13));
          c.mesh.visible = q > 0.001;
          if (c.mesh.visible) poseGrid(c, q);
        } else {
          c.mesh.visible = false;
          c.rect = null;
        }
      }
      renderer.render(scene, camera);
    }

    const resolveMappedProject = (cardIdx: number): VanteProjectItem | undefined => {
      const list = projectsRef.current;
      if (!list || list.length === 0) return undefined;
      const idx = (pageOffsetRef.current + cardIdx) % list.length;
      return list[idx];
    };

    /* ---------- hover & click ---------- */
    const findHitCard = (clientX: number, clientY: number): RibbonCard | null => {
      if (p <= 0.72) return null;
      const rect = stageEl.getBoundingClientRect();
      const cx = clientX - rect.left;
      const cy = clientY - rect.top;
      const nx = cx / W - 0.5;
      const ny = 0.5 - cy / H;
      for (const c of cards) {
        const g = c.rect;
        if (!g) continue;
        const x = nx * g.vw;
        const y = ny * g.vh;
        if (Math.abs(x - g.x) < g.w / 2 && Math.abs(y - g.y) < g.h / 2) {
          return c;
        }
      }
      return null;
    };

    const onPointerMove = (e: PointerEvent) => {
      const hit = findHitCard(e.clientX, e.clientY);
      if (hit && p > 0.72) {
        const rect = stageEl.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const proj = resolveMappedProject(hit.i);
        const label = proj
          ? `${proj.num} · ${proj.name}${proj.metrics?.[0] ? ` — ⚡ ${proj.metrics[0]}` : ''}`
          : hit.title;
        nameEl.textContent = label;
        nameEl.style.opacity = '1';
        nameEl.style.transform = `translate(${cx + 14}px,${cy + 16}px)`;
        stageEl.style.cursor = 'pointer';
      } else {
        nameEl.style.opacity = '0';
        stageEl.style.cursor = 'default';
      }
    };

    const onStageClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, .vante-pager, .vante-deck-bar')) {
        return;
      }
      const hit = findHitCard(e.clientX, e.clientY);
      if (hit) {
        const proj = resolveMappedProject(hit.i);
        if (proj) {
          onOpenProjectRef.current(proj);
        }
      }
    };

    stageEl.addEventListener('pointermove', onPointerMove);
    stageEl.addEventListener('click', onStageClick);

    /* ---------- loop ---------- */
    let rafId = 0;
    function loop() {
      if (inView || Math.abs(target - p) > 0.0001) {
        p += (target - p) * 0.09;
        if (Math.abs(target - p) < 0.00005) p = target;
        for (const c of cards) {
          if (inView && c.mesh.visible && c.v.paused) {
            c.v.play().catch(() => {});
          } else if ((!inView || !c.mesh.visible) && !c.v.paused) {
            c.v.pause();
          }
        }
        render();
      }
      rafId = requestAnimationFrame(loop);
    }
    render();
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', readScroll);
      stageEl.removeEventListener('pointermove', onPointerMove);
      stageEl.removeEventListener('click', onStageClick);
      for (const c of cards) {
        c.v.pause();
        c.v.removeAttribute('src');
        c.v.load();
        c.tex.dispose();
        c.geo.dispose();
        c.mat.dispose();
      }
      renderer.dispose();
    };
  }, []);

  const cycleProjects = (dir: number) => {
    if (!projects.length) return;
    setPageOffset((prev) => (prev + dir * 4 + projects.length) % projects.length);
  };

  return (
    <div className="vante-root relative z-20">
      <style>{`
        .vante-root {
          --bg: #0a0a0b;
          --ink: #f4f1ea;
          --mid: #8d8b86;
          --line: rgba(244,241,234,.14);
          font-family: 'Inter Tight', system-ui, sans-serif;
          color: var(--ink);
          background: var(--bg);
          -webkit-font-smoothing: antialiased;
        }
        .vante-track {
          height: 900vh;
          position: relative;
        }
        .vante-stage {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
          background: var(--bg);
        }
        .vante-hl {
          position: absolute;
          left: 0;
          right: 0;
          font-weight: 400;
          font-size: clamp(40px, 6.7vw, 130px);
          line-height: 1;
          letter-spacing: -.055em;
          white-space: nowrap;
          text-align: center;
          will-change: transform;
          color: var(--ink);
        }
        .vante-l1 { top: calc(50% - .98em); }
        .vante-l2 { top: calc(50% + .03em); }
        .vante-l1 span, .vante-l2 span { display: inline-block; }
        .vante-l1 span { margin-right: 15vw; }
        .vante-l2 span { margin-left: 15vw; }
        .vante-cap {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 15em;
          text-align: center;
          font-size: clamp(9px, .74vw, 13px);
          font-weight: 500;
          line-height: 1.3;
          letter-spacing: .03em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .vante-gl {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .vante-top {
          position: absolute;
          left: 32px;
          right: 32px;
          top: 26px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          pointer-events: none;
          z-index: 10;
        }
        .vante-acts {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 7px;
          pointer-events: auto;
        }
        .vante-pager {
          display: flex;
          margin: -26px 0 0 28px;
          pointer-events: auto;
        }
        .vante-pager span {
          display: grid;
          place-items: center;
          width: 44px;
          height: 50px;
          border: 1px solid var(--line);
          border-top: 0;
          margin-left: -1px;
          font: 400 11px 'IBM Plex Mono', monospace;
          color: var(--mid);
          cursor: pointer;
          transition: color .2s, background .2s;
        }
        .vante-pager span:hover {
          color: var(--ink);
          background: rgba(244,241,234,.06);
        }
        .vante-glow {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 42%;
          background: linear-gradient(rgba(244,241,234,.1), rgba(244,241,234,0));
          pointer-events: none;
        }
        .vante-cross {
          position: absolute;
          left: 32px;
          right: 32px;
          top: 37.5%;
          height: 1px;
          background: var(--line);
          pointer-events: none;
        }
        .vante-cross i {
          position: absolute;
          left: 50%;
          top: -.62em;
          margin-left: -.3em;
          font: 400 13px 'IBM Plex Mono', monospace;
          color: var(--mid);
          background: var(--bg);
          padding: 0 .3em;
          line-height: 1.2;
          font-style: normal;
        }
        .vante-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 19px;
          font-weight: 600;
          letter-spacing: .09em;
          color: var(--ink);
        }
        .vante-logo svg {
          width: 22px;
          height: 18px;
          fill: var(--ink);
        }
        .vante-acts a, .vante-acts button {
          display: flex;
          align-items: center;
          gap: 9px;
          height: 32px;
          padding: 0 15px;
          border: 1px solid rgba(244,241,234,.55);
          border-radius: 99px;
          background: transparent;
          color: var(--ink);
          text-decoration: none;
          font-family: 'Inter Tight', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: .06em;
          cursor: pointer;
          transition: background .2s, color .2s;
        }
        .vante-acts a:hover, .vante-acts button:hover {
          background: var(--ink);
          color: var(--bg);
        }
        .vante-acts a i, .vante-acts button i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .vante-acts a b, .vante-acts button b {
          display: block;
          width: 13px;
          height: 7px;
          border-top: 1px solid currentColor;
          border-bottom: 1px solid currentColor;
        }
        .vante-hint {
          position: absolute;
          left: 50%;
          top: 33px;
          transform: translateX(-50%);
          font: 400 11.5px 'IBM Plex Mono', monospace;
          letter-spacing: .06em;
          color: var(--ink);
          padding-bottom: 6px;
          border-bottom: 1px solid var(--line);
          z-index: 10;
        }
        .vante-bot {
          position: absolute;
          left: 32px;
          right: 32px;
          bottom: 26px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          font-size: 12.5px;
          line-height: 1.35;
          pointer-events: none;
          z-index: 10;
        }
        .vante-bot p {
          color: var(--ink);
          max-width: 21em;
        }
        .vante-bot .vante-mid {
          font: 400 11.5px 'IBM Plex Mono', monospace;
          letter-spacing: .06em;
          color: var(--ink);
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
          pointer-events: auto;
        }
        .vante-bot .vante-mid s {
          text-decoration: none;
          color: var(--mid);
          margin: 0 .6em;
        }
        .vante-bot .vante-r {
          justify-self: end;
          display: flex;
          gap: 12px;
          align-items: center;
          font: 400 11.5px 'IBM Plex Mono', monospace;
          letter-spacing: .06em;
          color: var(--ink);
          background: transparent;
          border: 0;
          cursor: pointer;
          pointer-events: auto;
        }
        .vante-bot .vante-r:after {
          content: "";
          width: 22px;
          height: 1px;
          background: var(--ink);
        }
        .vante-rule {
          position: absolute;
          left: 3.5vw;
          right: 3.5vw;
          top: 50%;
          height: 1px;
          background: var(--line);
          transform-origin: left;
          transform: scaleX(0);
          pointer-events: none;
        }
        .vante-name {
          position: absolute;
          left: 0;
          top: 0;
          padding: 6px 11px;
          background: var(--ink);
          color: var(--bg);
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: .04em;
          pointer-events: none;
          opacity: 0;
          transition: opacity .16s;
          white-space: nowrap;
          z-index: 20;
        }
        @media (max-width: 760px) {
          .vante-top { left: 18px; right: 18px; top: 18px; }
          .vante-bot { left: 18px; right: 18px; bottom: 18px; grid-template-columns: 1fr auto; }
          .vante-bot .vante-mid { display: none; }
          .vante-hint, .vante-pager { display: none; }
          .vante-bot p { max-width: 17em; font-size: 11px; }
        }
      `}</style>

      <div className="vante-track" ref={trackRef}>
        <main className="vante-stage" ref={stageRef}>
          <h2 aria-label="Craft in motion">
            <div className="vante-hl vante-l1" ref={l1Ref} aria-hidden="true">
              <span>CRAFT IN</span>
            </div>
            <div className="vante-hl vante-l2" ref={l2Ref} aria-hidden="true">
              <span>MOTION</span>
            </div>
          </h2>
          <div className="vante-cap" ref={capRef}>
            Exploring ideas through daily design practice.
          </div>
          <div className="vante-glow" ref={glowRef} />
          <div className="vante-cross" ref={crossRef}>
            <i>+</i>
          </div>
          <div className="vante-rule" ref={ruleRef} />
          <canvas className="vante-gl" ref={canvasRef} />
          <div className="vante-hint" ref={hintRef}>
            START A PROJECT &nbsp;→
          </div>
          <header className="vante-top">
            <div className="vante-logo">
              <svg viewBox="0 0 22 18">
                <path d="M11 0l11 18h-6.200L11 9.600 6.200 18H0z" />
              </svg>
              VANTE
            </div>
            <div className="vante-pager" ref={pagerRef}>
              <span onClick={() => cycleProjects(-1)} title="Previous Projects Batch">
                ←
              </span>
              <span onClick={() => cycleProjects(1)} title="Next Projects Batch">
                →
              </span>
            </div>
            <nav className="vante-acts">
              <a href="#contact">
                <i />
                LET&apos;S TALK
              </a>
              <button type="button" onClick={() => cycleProjects(1)} title="Cycle Flagship Projects in Grid">
                PROJECTS ({pageOffset + 1}–{((pageOffset + 5) % projects.length) + 1}/{projects.length})
                <b />
              </button>
            </nav>
          </header>
          <footer className="vante-bot">
            <p>Concepts, explorations and interface experiments shared openly as part of our creative process.</p>
            <div className="vante-mid vante-deck-bar">
              {projects.map((proj, idx) => (
                <button
                  key={proj.num}
                  type="button"
                  onClick={() => onOpenProject(proj)}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: 'inherit',
                    font: 'inherit',
                    letterSpacing: 'inherit',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    opacity:
                      idx >= pageOffset && idx < pageOffset + 6
                        ? 1
                        : 0.45,
                  }}
                  title={`Inspect ${proj.num} — ${proj.name}`}
                >
                  {proj.num}·{proj.name.split(' ')[0].toUpperCase()}
                  {idx < projects.length - 1 && <s>/</s>}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => cycleProjects(1)}
              className="vante-r"
              title="Cycle Grid Projects"
            >
              VIEW SHOWREEL
            </button>
          </footer>
          <div className="vante-name" ref={nameRef} />
        </main>
      </div>
    </div>
  );
}
