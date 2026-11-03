import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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

interface SlotOverlayBox {
  slotIndex: number;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
}

interface RibbonCard {
  i: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tex: THREE.CanvasTexture;
  geo: THREE.PlaneGeometry;
  mat: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  rect: GridRect | null;
}

interface VanteSectionProps {
  projects: VanteProjectItem[];
  onOpenProject: (project: VanteProjectItem) => void;
}

const TEX_W = 1050;
const TEX_H = 660;

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  zoom = 1
) {
  const iw = img.naturalWidth || img.width || TEX_W;
  const ih = img.naturalHeight || img.height || TEX_H;
  const ir = iw / ih;
  const dr = dw / dh;

  let rw = dw;
  let rh = dh;
  if (ir > dr) {
    rh = dh;
    rw = dh * ir;
  } else {
    rw = dw;
    rh = dw / ir;
  }
  rw *= zoom;
  rh *= zoom;

  const rx = dx + (dw - rw) * 0.5;
  const ry = dy + (dh - rh) * 0.5;
  ctx.drawImage(img, rx, ry, rw, rh);
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function VanteSection({ projects, onOpenProject }: VanteSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const l1Ref = useRef<HTMLDivElement>(null);
  const l2Ref = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const overlayLayerRef = useRef<HTMLDivElement>(null);

  const [pageOffset, setPageOffset] = useState(0);
  const [slotBoxes, setSlotBoxes] = useState<SlotOverlayBox[]>([]);

  const projectsRef = useRef(projects);
  const pageOffsetRef = useRef(pageOffset);
  const onOpenProjectRef = useRef(onOpenProject);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    pageOffsetRef.current = pageOffset;
  }, [pageOffset]);

  useEffect(() => {
    onOpenProjectRef.current = onOpenProject;
  }, [onOpenProject]);

  // Preload all project photos into HTMLImageElement cache
  useEffect(() => {
    const cache = imageCacheRef.current;
    for (const proj of projects) {
      const urls = [proj.images.col2Img, proj.images.col1Img1, proj.images.col1Img2].filter(Boolean);
      for (const url of urls) {
        if (!cache.has(url)) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.decoding = 'async';
          img.src = url;
          cache.set(url, img);
        }
      }
    }
  }, [projects]);

  useEffect(() => {
    const trackEl = trackRef.current;
    const stageEl = stageRef.current;
    const canvas = canvasRef.current;
    const l1El = l1Ref.current;
    const l2El = l2Ref.current;
    const capEl = capRef.current;
    const ruleEl = ruleRef.current;
    const nameEl = nameRef.current;
    const overlayLayerEl = overlayLayerRef.current;

    if (
      !trackEl ||
      !stageEl ||
      !canvas ||
      !l1El ||
      !l2El ||
      !capEl ||
      !ruleEl ||
      !nameEl ||
      !overlayLayerEl
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

    /* ---------- cards (all 10 portfolio projects) ---------- */
    const CARD_COUNT = Math.max(8, projectsRef.current.length || 10);
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
  gl_FragColor=vec4(mix(c,vec3(1.),edge*.12),a);
}`;

    const cards: RibbonCard[] = Array.from({ length: CARD_COUNT }, (_, i) => {
      const cardCanvas = document.createElement('canvas');
      cardCanvas.width = TEX_W;
      cardCanvas.height = TEX_H;
      const ctx = cardCanvas.getContext('2d')!;

      const tex = new THREE.CanvasTexture(cardCanvas);
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
          ready: { value: 1 },
          radius: { value: 0.018 },
        },
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;
      scene.add(mesh);
      return { i, canvas: cardCanvas, ctx, tex, geo, mat, mesh, rect: null };
    });

    const resolveMappedProject = (cardIdx: number): VanteProjectItem | undefined => {
      const list = projectsRef.current;
      if (!list || list.length === 0) return undefined;
      const idx = (pageOffsetRef.current + cardIdx) % list.length;
      return list[idx];
    };

    const getCachedImage = (url: string): HTMLImageElement | null => {
      if (!url) return null;
      const cache = imageCacheRef.current;
      let img = cache.get(url);
      if (!img) {
        img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.src = url;
        cache.set(url, img);
      }
      return img.complete && img.naturalWidth > 0 ? img : null;
    };

    // Draw a project's sliding photo gallery + clean HUD onto the card's 2D canvas
    function paintCardTexture(c: RibbonCard, timeSec: number) {
      const proj = resolveMappedProject(c.i);
      const { ctx } = c;

      ctx.fillStyle = '#0e1116';
      ctx.fillRect(0, 0, TEX_W, TEX_H);

      if (!proj) {
        c.tex.needsUpdate = true;
        return;
      }

      const photoUrls = [
        proj.images.col2Img,
        proj.images.col1Img1,
        proj.images.col1Img2,
      ].filter(Boolean);

      const loadedPhotos = photoUrls
        .map((u) => getCachedImage(u))
        .filter((img): img is HTMLImageElement => img !== null);

      const HOLD_SEC = 2.5;
      const SLIDE_SEC = 0.85;
      const STEP_SEC = HOLD_SEC + SLIDE_SEC;
      const localT = timeSec + c.i * 0.75;

      if (loadedPhotos.length > 0) {
        const count = loadedPhotos.length;
        const cycleIdx = Math.floor(localT / STEP_SEC);
        const phase = localT - cycleIdx * STEP_SEC;
        const curIdx = cycleIdx % count;
        const nextIdx = (curIdx + 1) % count;
        const slideT = count > 1 && phase > HOLD_SEC ? ease((phase - HOLD_SEC) / SLIDE_SEC) : 0;

        const curImg = loadedPhotos[curIdx];
        const nextImg = loadedPhotos[nextIdx];
        const zoomCur = 1.01 + 0.04 * clamp(phase / STEP_SEC, 0, 1);
        const zoomNext = 1.01;

        ctx.save();
        if (slideT <= 0.001) {
          drawCoverImage(ctx, curImg, 0, 0, TEX_W, TEX_H, zoomCur);
        } else {
          // Horizontal parallax slide transition between the project's photos
          const curOffsetX = -slideT * TEX_W * 0.42;
          const nextOffsetX = (1 - slideT) * TEX_W;

          drawCoverImage(ctx, curImg, curOffsetX, 0, TEX_W, TEX_H, zoomCur);

          // Dim outgoing image slightly as incoming photo slides over it
          ctx.fillStyle = `rgba(6, 8, 12, ${slideT * 0.45})`;
          ctx.fillRect(0, 0, TEX_W, TEX_H);

          ctx.save();
          ctx.beginPath();
          ctx.rect(nextOffsetX, 0, TEX_W, TEX_H);
          ctx.clip();
          drawCoverImage(ctx, nextImg, nextOffsetX * 0.25, 0, TEX_W, TEX_H, zoomNext);
          ctx.restore();

          // Glowing cyan seam line along the sliding photo edge
          ctx.fillStyle = 'rgba(0, 242, 254, 0.75)';
          ctx.fillRect(nextOffsetX - 2, 0, 3, TEX_H);
        }
        ctx.restore();
      } else {
        // Fallback grid while image finishes decoding
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
        ctx.lineWidth = 1;
        for (let gx = 0; gx < TEX_W; gx += 48) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, TEX_H);
          ctx.stroke();
        }
        for (let gy = 0; gy < TEX_H; gy += 48) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(TEX_W, gy);
          ctx.stroke();
        }
      }

      // Subtle top & bottom gradient scrims so text & badges are always crisp
      const topGrad = ctx.createLinearGradient(0, 0, 0, 130);
      topGrad.addColorStop(0, 'rgba(8, 9, 12, 0.78)');
      topGrad.addColorStop(1, 'rgba(8, 9, 12, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, TEX_W, 130);

      const botGrad = ctx.createLinearGradient(0, TEX_H - 190, 0, TEX_H);
      botGrad.addColorStop(0, 'rgba(8, 9, 12, 0)');
      botGrad.addColorStop(0.42, 'rgba(8, 9, 12, 0.76)');
      botGrad.addColorStop(1, 'rgba(8, 9, 12, 0.95)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, TEX_H - 190, TEX_W, 190);

      // Top-left category badge
      const badgeText = `${proj.num} · ${proj.category.toUpperCase()}`;
      ctx.font = '600 18px "IBM Plex Mono", monospace';
      const badgeMetrics = ctx.measureText(badgeText);
      const badgeW = badgeMetrics.width + 46;
      const badgeH = 38;
      drawRoundedRectPath(ctx, 28, 24, badgeW, badgeH, 19);
      ctx.fillStyle = 'rgba(10, 12, 16, 0.78)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 241, 234, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Cyan status dot inside badge
      ctx.beginPath();
      ctx.arc(46, 43, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00F2FE';
      ctx.fill();

      ctx.fillStyle = '#f4f1ea';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, 60, 44);

      // Top-right slide progress indicators (shows which of the 3 project photos is active)
      const slideCount = Math.max(1, photoUrls.length);
      const activeSlide = Math.floor(localT / STEP_SEC) % slideCount;
      for (let sIdx = 0; sIdx < slideCount; sIdx++) {
        const pillW = sIdx === activeSlide ? 34 : 14;
        const rightOffset = 28 + (slideCount - 1 - sIdx) * 24 + (sIdx === activeSlide ? 0 : 0);
        const px = TEX_W - rightOffset - pillW;
        drawRoundedRectPath(ctx, px, 38, pillW, 8, 4);
        ctx.fillStyle = sIdx === activeSlide ? '#00F2FE' : 'rgba(244, 241, 234, 0.35)';
        ctx.fill();
      }

      // Bottom-left project title & metric
      ctx.fillStyle = '#f4f1ea';
      ctx.font = '700 34px "Inter Tight", system-ui, sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(proj.name, 30, TEX_H - 64);

      const subLine = proj.metrics?.[0]
        ? `⚡ ${proj.metrics[0]}   ·   ${(proj.tech || []).slice(0, 3).join(' / ')}`
        : (proj.tech || []).slice(0, 4).join(' · ');
      ctx.fillStyle = '#00F2FE';
      ctx.font = '500 18px "IBM Plex Mono", monospace';
      ctx.fillText(subLine, 30, TEX_H - 30);

      // Subtle inner border
      ctx.strokeStyle = 'rgba(244, 241, 234, 0.18)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, TEX_W - 2, TEX_H - 2);

      c.tex.needsUpdate = true;
    }

    /* ---------- layout ---------- */
    const GZ = 8;
    let W = 1;
    let H = 1;
    let asp = 1;
    let cols = 3;
    let rows = 2;
    let tanH = 0.3153;

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

    function syncSlotOverlayBoxes() {
      const totalSlots = cols * rows;
      const boxes: SlotOverlayBox[] = [];
      for (let i = 0; i < totalSlots; i++) {
        const g = grid(i);
        const leftPct = ((g.x - g.w / 2) / g.vw + 0.5) * 100;
        const topPct = (0.5 - (g.y + g.h / 2) / g.vh) * 100;
        const widthPct = (g.w / g.vw) * 100;
        const heightPct = (g.h / g.vh) * 100;
        boxes.push({
          slotIndex: i,
          leftPct,
          topPct,
          widthPct,
          heightPct,
        });
      }
      setSlotBoxes(boxes);
    }

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
      syncSlotOverlayBoxes();
    }

    window.addEventListener('resize', resize);
    resize();
    buildPath();

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

    function render(timeSec: number) {
      const pp = p;
      // headline runs right across the page in opposite directions
      const rise = 1 - out(span(pp, 0, 0.12));
      const run = mix(-50, 76, span(pp, 0, 0.58));
      l1El!.style.transform = `translate3d(${run}vw,${rise * 34}vh,0)`;
      l2El!.style.transform = `translate3d(${-run}vw,${rise * 34}vh,0)`;
      const capA = 1 - span(pp, 0.52, 0.57);
      capEl!.style.opacity = String(capA);
      capEl!.style.transform = `translate(-50%,calc(-50% + ${rise * 34}vh))`;
      ruleEl!.style.transform = `scaleX(${ease(span(pp, 0.72, 0.86))})`;
      ruleEl!.style.top = '50%';

      // Show accessible HTML action links over each landed grid card once cards settle
      const gridAlpha = span(pp, 0.8, 0.9);
      overlayLayerEl!.style.opacity = String(gridAlpha);
      overlayLayerEl!.style.pointerEvents = pp > 0.82 ? 'auto' : 'none';

      // ribbon, then the grid
      const pr = span(pp, RIB_A, RIB_B);
      const head = mix(0, PATH_L + cards.length * STEP, pr);
      for (const c of cards) {
        const s = head - c.i * STEP;
        const end = PATH_L - CARD_W;
        if (s < end) {
          c.mesh.visible = s > CARD_W;
          c.rect = null;
          if (c.mesh.visible) {
            paintCardTexture(c, timeSec);
            poseRibbon(c, head);
          }
        } else if (c.i < cols * rows) {
          // each card flies to its slot the moment it leaves the rail
          const st = mix(RIB_A, RIB_B, (end + c.i * STEP) / (PATH_L + cards.length * STEP));
          const q = out(span(pp, st, st + 0.13));
          c.mesh.visible = q > 0.001;
          if (c.mesh.visible) {
            paintCardTexture(c, timeSec);
            poseGrid(c, q);
          }
        } else {
          c.mesh.visible = false;
          c.rect = null;
        }
      }
      renderer.render(scene, camera);
    }

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
          : `Project ${hit.i + 1}`;
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
      if ((e.target as HTMLElement).closest('a, button, .vante-pager, .vante-deck-bar, .vante-slot-links')) {
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
    const t0 = performance.now();
    // Initial paint for all cards
    for (const c of cards) {
      paintCardTexture(c, 0);
    }

    function loop(now: number) {
      readScroll();
      const timeSec = (now - t0) * 0.001;
      if (inView || Math.abs(target - p) > 0.0001) {
        p += (target - p) * 0.09;
        if (Math.abs(target - p) < 0.00005) p = target;
        render(timeSec);
      }
      rafId = requestAnimationFrame(loop);
    }
    render(0);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', readScroll);
      stageEl.removeEventListener('pointermove', onPointerMove);
      stageEl.removeEventListener('click', onStageClick);
      for (const c of cards) {
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
          --ink: #f4f1ea;
          --mid: #8d8b86;
          --line: rgba(244,241,234,.14);
          font-family: 'Inter Tight', system-ui, sans-serif;
          color: var(--ink);
          background: transparent;
          -webkit-font-smoothing: antialiased;
        }
        .vante-track {
          height: 820vh;
          position: relative;
        }
        .vante-stage {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100svh;
          overflow: hidden;
          background: transparent;
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
          pointer-events: none;
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
          width: 18em;
          text-align: center;
          font-size: clamp(9px, .74vw, 13px);
          font-weight: 500;
          line-height: 1.35;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: rgba(215, 226, 234, 0.85);
          pointer-events: none;
        }
        .vante-gl {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .vante-overlay-layer {
          position: absolute;
          inset: 0;
          z-index: 15;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .vante-slot-box {
          position: absolute;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-end;
          padding: 10px 12px;
          border-radius: 12px;
          transition: box-shadow 0.2s ease;
        }
        .vante-slot-box:hover {
          box-shadow: 0 0 0 1px rgba(0, 242, 254, 0.55), 0 12px 32px rgba(0, 0, 0, 0.55);
        }
        .vante-slot-hit {
          position: absolute;
          inset: 0;
          background: transparent;
          border: 0;
          cursor: pointer;
          border-radius: 12px;
        }
        .vante-slot-links {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .vante-slot-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 99px;
          font: 500 10px 'IBM Plex Mono', monospace;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          background: rgba(12, 12, 12, 0.88);
          color: var(--ink);
          border: 1px solid rgba(244, 241, 234, 0.35);
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .vante-slot-link:hover {
          background: #00F2FE;
          color: #0C0C0C;
          border-color: #00F2FE;
        }
        .vante-slot-link--primary {
          border-color: rgba(0, 242, 254, 0.55);
          color: #00F2FE;
        }
        .vante-grid-dock {
          position: absolute;
          left: 50%;
          bottom: 22px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 99px;
          background: rgba(12, 12, 12, 0.82);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65);
          font: 500 10.5px 'IBM Plex Mono', monospace;
          letter-spacing: 0.06em;
          z-index: 20;
        }
        .vante-dock-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 10px;
          border-radius: 99px;
          border: 1px solid rgba(0, 242, 254, 0.35);
          background: rgba(0, 242, 254, 0.08);
          color: #00F2FE;
          font: inherit;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .vante-dock-arrow:hover {
          background: #00F2FE;
          color: #0C0C0C;
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
          padding: 6px 12px;
          background: var(--ink);
          color: #0C0C0C;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: .04em;
          pointer-events: none;
          opacity: 0;
          transition: opacity .16s;
          white-space: nowrap;
          z-index: 30;
        }
        @media (max-width: 760px) {
          .vante-slot-link { padding: 4px 8px; font-size: 8.5px; }
          .vante-grid-dock .vante-dock-pill { display: none; }
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
            Flagship engineering systems, AI architectures &amp; interactive products.
          </div>
          <div className="vante-rule" ref={ruleRef} />
          <canvas className="vante-gl" ref={canvasRef} />

          {/* Accessible HTML Action Links & Click Targets aligned over the 3x2 landed project cards */}
          <div className="vante-overlay-layer" ref={overlayLayerRef}>
            {slotBoxes.map((box) => {
              const proj =
                projects.length > 0
                  ? projects[(pageOffset + box.slotIndex) % projects.length]
                  : undefined;
              if (!proj) return null;
              return (
                <div
                  key={`${box.slotIndex}-${proj.num}`}
                  className="vante-slot-box"
                  style={{
                    left: `${box.leftPct}%`,
                    top: `${box.topPct}%`,
                    width: `${box.widthPct}%`,
                    height: `${box.heightPct}%`,
                  }}
                >
                  <button
                    type="button"
                    className="vante-slot-hit"
                    onClick={() => onOpenProject(proj)}
                    aria-label={`Inspect ${proj.num} ${proj.name} project details`}
                    title={`Click to inspect ${proj.name}`}
                  />
                  <div className="vante-slot-links">
                    <button
                      type="button"
                      className="vante-slot-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject(proj);
                      }}
                    >
                      Details
                    </button>
                    {proj.githubUrl && proj.githubUrl !== proj.url && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="vante-slot-link"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`${proj.name} GitHub source code`}
                      >
                        GitHub ↗
                      </a>
                    )}
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="vante-slot-link vante-slot-link--primary"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Open ${proj.name} live project`}
                    >
                      Open Live ↗
                    </a>
                  </div>
                </div>
              );
            })}

            {/* Subtle floating pagination dock only visible when the grid has landed */}
            <div className="vante-grid-dock vante-deck-bar">
              <button
                type="button"
                className="vante-dock-arrow"
                onClick={() => cycleProjects(-1)}
                title="Previous 6 Projects"
              >
                ← PREV
              </button>
              {projects.map((proj, idx) => {
                const inCurrentGrid =
                  Array.from({ length: Math.min(6, projects.length) }, (_, k) => (pageOffset + k) % projects.length).includes(idx);
                return (
                  <button
                    key={proj.num}
                    type="button"
                    className="vante-dock-pill"
                    onClick={() => onOpenProject(proj)}
                    style={{
                      background: inCurrentGrid ? 'rgba(0, 242, 254, 0.14)' : 'transparent',
                      border: inCurrentGrid ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid transparent',
                      borderRadius: '99px',
                      color: inCurrentGrid ? '#00F2FE' : 'rgba(244, 241, 234, 0.55)',
                      font: 'inherit',
                      letterSpacing: 'inherit',
                      cursor: 'pointer',
                      padding: '3px 7px',
                    }}
                    title={`Inspect ${proj.num} — ${proj.name}`}
                  >
                    {proj.num}
                  </button>
                );
              })}
              <button
                type="button"
                className="vante-dock-arrow"
                onClick={() => cycleProjects(1)}
                title="Next 6 Projects"
              >
                NEXT →
              </button>
            </div>
          </div>

          <div className="vante-name" ref={nameRef} />
        </main>
      </div>
    </div>
  );
}
