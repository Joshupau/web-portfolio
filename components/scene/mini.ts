// three.js engine for MiniScene. Loaded lazily (dynamic import) so first paint is not blocked.
// Two small interactive objects that share one shell (renderer, camera fit, drag, colours):
//   cube  - a 3x3x3 cube of modules that can be taken apart and re-lit per business type
//   token - a hexagonal token that can be minted, listed and bought
import * as THREE from "three";

export type MiniKind = "cube" | "token";
export type Biz = "pharmacy" | "retail" | "resort";
export type MiniAction = "toggle" | Biz | "mint" | "trade";

export interface MiniState {
  exploded: boolean;
  biz: Biz;
  listed: boolean;
}

export interface MiniOptions {
  kind: MiniKind;
  reduced: boolean;
  /** caption line the engine writes to */
  caption: HTMLElement;
  /** button row overlaid on the box; the object is framed clear of it */
  controls: HTMLElement | null;
  onState(state: MiniState): void;
}

export interface MiniHandle {
  resize(): void;
  refreshColors(): void;
  setRunning(run: boolean): void;
  act(action: MiniAction): void;
  dispose(): void;
}

const TOKENS = ["--bg", "--panel", "--panel-2", "--line", "--text", "--dim", "--amber", "--mint", "--rose", "--ice", "--violet"] as const;
type Token = (typeof TOKENS)[number];

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

interface Ctx {
  col: Record<Token, THREE.Color>;
  bind(fn: () => void): void;
  disposables: Array<{ dispose(): void }>;
  /** tilts toward the pointer; does not spin */
  outer: THREE.Group;
  /** spins with drag / idle rotation */
  spin: THREE.Group;
  reduced: boolean;
  setCaption(text: string): void;
  emit(): void;
  state: MiniState;
}

interface Model {
  /** world radius the camera must keep in frame */
  fitR(): number;
  idleSpeed: number;
  baseTilt: number;
  startYaw: number;
  step(dt: number, time: number): void;
  draw(time: number): void;
  /** jump colour transitions to their targets (theme change while paused) */
  snapColors(): void;
  act(a: MiniAction): void;
  click(): void;
  dispose(): void;
}

const MODULES: Record<Biz, string> = {
  pharmacy: "sales counter, inventory, batch and expiry tracking, branch sync",
  retail: "sales counter, inventory, suppliers, reports",
  resort: "bookings, sales counter, housekeeping, reports",
};
const BIZ_TOKEN: Record<Biz, Token> = { pharmacy: "--mint", retail: "--amber", resort: "--ice" };

// ---------------------------------------------------------------------------------
// cube: 27 modules. A fixed core stays lit for every business type.
// ---------------------------------------------------------------------------------
function buildCube(ctx: Ctx): Model {
  const { col, bind, disposables, spin } = ctx;
  const SIZE = 0.86;
  const SPREAD = 0.8;

  const geo = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const inst = new THREE.InstancedMesh(geo, mat, 27);
  inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  inst.frustumCulled = false;
  spin.add(inst);
  const edgeGeo = new THREE.EdgesGeometry(geo, 25);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  bind(() => edgeMat.color.copy(col["--dim"]));
  disposables.push(geo, mat, edgeGeo, edgeMat);

  interface Cell {
    off: THREE.Vector3;
    far: number; // 0 centre .. 1 corner
    core: boolean;
    sets: Record<Biz, boolean>;
    cur: THREE.Color;
    pop: number; // <0 waiting, 0..1 popping, >=1 idle
    line: THREE.LineSegments;
  }
  const cells: Cell[] = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        const cross = x === 0 || z === 0;
        const corner = x !== 0 && y !== 0 && z !== 0;
        const line = new THREE.LineSegments(edgeGeo, edgeMat);
        line.frustumCulled = false;
        spin.add(line);
        cells.push({
          off: new THREE.Vector3(x, y, z),
          far: Math.sqrt(x * x + y * y + z * z) / Math.sqrt(3),
          core: y === 0 && cross,
          sets: {
            // a plus sign on the top face, and two feet
            pharmacy: (y === 1 && cross) || (y === -1 && x === z && x !== 0),
            // all eight corners
            retail: corner,
            // two opposite towers and a roof piece
            resort: (x !== 0 && x === -z) || (y === 1 && x === 0 && z === 0),
          },
          cur: new THREE.Color(),
          pop: 1,
          line,
        });
      }

  let explodeT = 0;
  const target = new THREE.Color();
  const targetFor = (c: Cell, out: THREE.Color) => {
    if (c.core) out.copy(col["--dim"]).lerp(col["--text"], 0.6);
    else if (c.sets[ctx.state.biz]) out.copy(col[BIZ_TOKEN[ctx.state.biz]]);
    else out.copy(col["--panel-2"]);
    return out;
  };
  const snapColors = () => {
    for (const c of cells) targetFor(c, c.cur);
  };
  snapColors();
  const caption = () => ctx.setCaption(`${ctx.state.biz}: ${MODULES[ctx.state.biz]}`);
  caption();

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const sv = new THREE.Vector3();

  return {
    idleSpeed: 0.32,
    baseTilt: 0.5,
    startYaw: 0.62,
    fitR: () => 2.35 + 1.3 * ease(explodeT),
    step(dt) {
      const goal = ctx.state.exploded ? 1 : 0;
      if (explodeT !== goal) {
        const d = dt / 0.9;
        explodeT = goal > explodeT ? Math.min(goal, explodeT + d) : Math.max(goal, explodeT - d);
      }
      const f = 1 - Math.exp(-dt * 9);
      for (const c of cells) {
        if (c.pop < 1) c.pop += dt / (c.pop < 0 ? 1 : 0.45);
        c.cur.lerp(targetFor(c, target), f);
      }
    },
    draw() {
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        // corners leave first and come home last
        const k = easeInOutCubic(clamp01(explodeT * 1.45 - (1 - c.far) * 0.45));
        pos.copy(c.off).multiplyScalar(1 + SPREAD * k);
        const pop = c.pop > 0 && c.pop < 1 ? Math.sin(Math.PI * c.pop) * 0.26 : 0;
        sv.setScalar(1 + pop);
        m4.compose(pos, q, sv);
        inst.setMatrixAt(i, m4);
        inst.setColorAt(i, c.cur);
        c.line.position.copy(pos);
        c.line.scale.copy(sv);
      }
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    },
    snapColors,
    act(a) {
      if (a === "toggle") {
        ctx.state.exploded = !ctx.state.exploded;
        ctx.emit();
      } else if (a === "pharmacy" || a === "retail" || a === "resort") {
        if (a === ctx.state.biz) return;
        const prev = ctx.state.biz;
        ctx.state.biz = a;
        for (const c of cells) {
          if (c.core) continue;
          if (c.sets[prev] || c.sets[a]) c.pop = -(1 - c.far) * 0.16 - (c.sets[a] ? 0.05 : 0);
        }
        caption();
        ctx.emit();
      }
    },
    click() {
      this.act("toggle");
    },
    dispose() {
      inst.dispose();
    },
  };
}

// ---------------------------------------------------------------------------------
// token: hexagonal token with a pixel gem on each face
// ---------------------------------------------------------------------------------
const ACCENTS: Token[] = ["--amber", "--mint", "--ice", "--violet"];
const GLYPH = ["..ooo..", ".oxxxx.", "oxxxxxx", ".xxxxx.", "..xxx..", "...x..."];

function buildToken(ctx: Ctx): Model {
  const { col, bind, disposables, spin, outer } = ctx;
  const R = 1.5;
  const H = 0.42;
  const RING_R = 2.08;

  const tok = new THREE.Group();
  spin.add(tok);

  const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  bind(() => edgeMat.color.copy(col["--dim"]));
  disposables.push(edgeMat);
  const slab = (geo: THREE.BufferGeometry, token: Token, z: number) => {
    const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
    bind(() => m.color.copy(col[token]));
    const mesh = new THREE.Mesh(geo, m);
    mesh.rotation.x = Math.PI / 2; // hexagon faces the camera, a point at the top
    mesh.position.z = z;
    const eg = new THREE.EdgesGeometry(geo, 25);
    mesh.add(new THREE.LineSegments(eg, edgeMat));
    tok.add(mesh);
    disposables.push(m, eg);
    return mesh;
  };
  const bodyGeo = new THREE.CylinderGeometry(R, R, H, 6);
  const plateGeo = new THREE.CylinderGeometry(1.06, 1.06, 0.06, 6);
  disposables.push(bodyGeo, plateGeo);
  slab(bodyGeo, "--panel-2", 0);
  slab(plateGeo, "--panel", H / 2 + 0.03);
  slab(plateGeo, "--panel", -(H / 2 + 0.03));

  // accent ring set into each face
  const accentMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const ringGeo = new THREE.RingGeometry(1.19, 1.33, 6, 1, Math.PI / 2);
  disposables.push(accentMat, ringGeo);
  for (const s of [1, -1]) {
    const r = new THREE.Mesh(ringGeo, accentMat);
    r.position.z = s * (H / 2 + 0.006);
    if (s < 0) r.rotation.y = Math.PI;
    tok.add(r);
  }

  // raised pixel gem, both faces
  const PX = 0.2;
  const pixGeo = new THREE.BoxGeometry(PX * 0.9, PX * 0.9, 0.09);
  const pixMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const pixels: Array<{ x: number; y: number; light: boolean }> = [];
  GLYPH.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch !== ".") pixels.push({ x: (c - 3) * PX, y: (2.5 - r) * PX - 0.02, light: ch === "o" });
    }
  });
  const glyph = new THREE.InstancedMesh(pixGeo, pixMat, pixels.length * 2);
  glyph.frustumCulled = false;
  {
    const m4 = new THREE.Matrix4();
    const zf = H / 2 + 0.06 + 0.04;
    pixels.forEach((p, i) => {
      glyph.setMatrixAt(i * 2, m4.makeTranslation(p.x, p.y, zf));
      glyph.setMatrixAt(i * 2 + 1, m4.makeTranslation(-p.x, p.y, -zf));
    });
    glyph.instanceMatrix.needsUpdate = true;
  }
  tok.add(glyph);
  disposables.push(pixGeo, pixMat);

  // "listed" orbit ring with a small price tag riding on it
  const orbit = new THREE.Group();
  orbit.rotation.set(Math.PI / 2 - 0.36, 0, 0.16, "ZXY");
  outer.add(orbit);
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
  const orbitGeo = new THREE.TorusGeometry(RING_R, 0.024, 6, 72);
  const tagGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const tag = new THREE.Mesh(tagGeo, orbitMat);
  orbit.add(new THREE.Mesh(orbitGeo, orbitMat), tag);
  disposables.push(orbitMat, orbitGeo, tagGeo);

  let count = 1;
  let accent = 0;
  let mintT = -1; // 0..1 while a mint is playing
  let swapped = true;
  let flipT = -1;
  let ringK = 0;
  let sold = 0;
  const label = () => `token #${String(count).padStart(4, "0")}`;
  ctx.setCaption(`${label()} minted`);

  const light = new THREE.Color();
  const SWAP = 0.2;

  return {
    idleSpeed: 0.55,
    baseTilt: 0.14,
    startYaw: 0.55,
    fitR: () => 2.3,
    step(dt) {
      if (mintT >= 0) {
        mintT += dt / 1.0;
        if (!swapped && mintT >= SWAP) {
          swapped = true;
          accent = (count - 1) % ACCENTS.length;
        }
        if (mintT >= 1) mintT = -1;
      }
      if (flipT >= 0) {
        flipT += dt / 0.85;
        if (flipT >= 1) flipT = -1;
      }
      ringK += ((ctx.state.listed ? 1 : 0) - ringK) * (1 - Math.exp(-dt * 6));
      sold = Math.max(0, sold - dt * 0.9);
    },
    draw(time) {
      let s = 1;
      let y = ctx.reduced ? 0 : Math.sin(time * 1.5) * 0.07;
      let yaw = 0;
      if (mintT >= 0) {
        if (mintT < SWAP) {
          // the old token sinks away
          const a = ease(mintT / SWAP);
          s = Math.max(0.0001, 1 - a);
          y -= a * 0.5;
        } else {
          // the new one drops in with a quick spin
          const b = clamp01((mintT - SWAP) / (1 - SWAP));
          s = Math.max(0.0001, easeOutBack(b));
          y += (1 - easeOutCubic(b)) * 1.5;
          yaw = (1 - easeOutCubic(b)) * -Math.PI * 3;
        }
      }
      let rx = 0;
      if (flipT >= 0) {
        rx = easeInOutCubic(flipT) * Math.PI * 2;
        y += Math.sin(Math.PI * flipT) * 0.3;
      }
      tok.scale.setScalar(s);
      tok.position.y = y;
      tok.rotation.set(rx, yaw, 0);

      const a = col[ACCENTS[accent]];
      accentMat.color.copy(a);
      light.copy(a).lerp(col["--text"], 0.5);
      for (let i = 0; i < pixels.length; i++) {
        const c = pixels[i].light ? light : a;
        glyph.setColorAt(i * 2, c);
        glyph.setColorAt(i * 2 + 1, c);
      }
      if (glyph.instanceColor) glyph.instanceColor.needsUpdate = true;

      orbit.visible = ringK > 0.02;
      orbit.scale.setScalar(0.72 + 0.28 * ease(clamp01(ringK)));
      orbitMat.opacity = clamp01(ringK * 1.2);
      orbitMat.color.copy(col["--amber"]).lerp(col["--mint"], clamp01(sold));
      const ta = time * 0.9;
      tag.position.set(Math.cos(ta) * RING_R, Math.sin(ta) * RING_R, 0);
      tag.rotation.z = ta;
    },
    snapColors() {},
    act(a) {
      if (a === "mint") {
        if (mintT >= 0 && mintT < SWAP) return;
        count += 1;
        mintT = 0;
        swapped = false;
        flipT = -1;
        sold = 0;
        ctx.setCaption(`${label()} minted`);
        if (ctx.state.listed) {
          ctx.state.listed = false;
          ctx.emit();
        }
      } else if (a === "trade") {
        if (!ctx.state.listed) {
          ctx.state.listed = true;
          sold = 0;
          ctx.setCaption("listed for 0.05 ETH");
        } else {
          ctx.state.listed = false;
          sold = 1;
          flipT = 0;
          ctx.setCaption("sold, owner changed");
        }
        ctx.emit();
      }
    },
    click() {
      this.act("mint");
    },
    dispose() {
      glyph.dispose();
    },
  };
}

// ---------------------------------------------------------------------------------
// shell
// ---------------------------------------------------------------------------------
export function createMini(container: HTMLElement, opts: MiniOptions): MiniHandle {
  const narrow = () => container.clientWidth < 700;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const FOV = 30;
  const TAN = Math.tan((FOV * Math.PI) / 360);
  const camera = new THREE.PerspectiveCamera(FOV, 1.6, 0.1, 200);

  // ---- colors -----------------------------------------------------------
  const col = {} as Record<Token, THREE.Color>;
  for (const k of TOKENS) col[k] = new THREE.Color();
  const bound: Array<{ apply: () => void }> = [];
  const bind = (fn: () => void) => {
    bound.push({ apply: fn });
    fn();
  };
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    for (const k of TOKENS) {
      const v = cs.getPropertyValue(k).trim();
      if (v) col[k].set(v);
    }
  };
  readColors();

  // ---- lights -----------------------------------------------------------
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 2.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.9);
  sun.position.set(-6, 10, 5);
  scene.add(sun);

  const disposables: Array<{ dispose(): void }> = [];
  const outer = new THREE.Group();
  const spin = new THREE.Group();
  outer.add(spin);
  scene.add(outer);

  // ---- layout: keep the object clear of the buttons and the caption -----------
  let width = 1;
  let height = 1;
  let halfT = 60; // target half-size of the object in px
  let cyT = 60; // target centre (px from top)
  let half = -1;
  let cy = -1;
  const layout = () => {
    const W = width;
    const H = height;
    const host = container.getBoundingClientRect();
    const capTop = opts.caption.offsetHeight ? opts.caption.getBoundingClientRect().top - host.top : H;
    const bottom = Math.max(10, H - capTop + 4);
    let top = 10;
    let free = H - top - bottom;
    if (opts.controls) {
      let left = Infinity;
      let low = 0;
      for (const b of Array.from(opts.controls.querySelectorAll("button"))) {
        const r = b.getBoundingClientRect();
        left = Math.min(left, r.left - host.left);
        low = Math.max(low, r.bottom - host.top);
      }
      const half0 = (Math.min(free, W - 16) / 2) * 0.94;
      if (left < W / 2 + half0 + 8 && low > 0) {
        top = low + 6;
        free = H - top - bottom;
      }
    }
    free = Math.max(free, 56);
    halfT = (Math.min(free, W - 16) / 2) * 0.94;
    cyT = top + free / 2;
    if (half < 0 || opts.reduced) {
      half = halfT;
      cy = cyT;
    }
  };

  let lastCaption = "";
  let ready = false;
  const state: MiniState = { exploded: false, biz: "pharmacy", listed: false };
  const ctx: Ctx = {
    col,
    bind,
    disposables,
    outer,
    spin,
    reduced: opts.reduced,
    state,
    setCaption(text) {
      if (text === lastCaption) return;
      lastCaption = text;
      opts.caption.textContent = text;
      if (ready) layout(); // the caption may have changed its line count
    },
    emit() {
      opts.onState({ ...state });
    },
  };
  const model = opts.kind === "cube" ? buildCube(ctx) : buildToken(ctx);

  // ---- motion state -------------------------------------------------------
  let time = 0;
  let yaw = model.startYaw;
  let yawVel = opts.reduced ? 0 : model.idleSpeed;
  let tiltX = 0;
  let tiltY = 0;
  let hoverX = 0;
  let hoverY = 0;
  let dragging = false;

  const step = (dt: number) => {
    time += dt;
    if (!dragging) {
      const idle = opts.reduced ? 0 : model.idleSpeed;
      yawVel += (idle - yawVel) * (1 - Math.exp(-dt * 1.7));
      yaw += yawVel * dt;
    }
    const f = 1 - Math.exp(-dt * 6);
    tiltX += (hoverY * 0.2 - tiltX) * f;
    tiltY += (hoverX * 0.28 - tiltY) * f;
    const g = 1 - Math.exp(-dt * 8);
    half += (halfT - half) * g;
    cy += (cyT - cy) * g;
    model.step(dt, time);
  };

  const draw = () => {
    spin.rotation.y = yaw;
    outer.rotation.set(model.baseTilt + tiltX, tiltY, 0);
    model.draw(time);
    const dist = (model.fitR() * (height / 2)) / (TAN * Math.max(8, half));
    camera.position.set(0, 0, dist);
    camera.aspect = width / height;
    // slide the picture so the object sits in the free area, not the box centre
    camera.setViewOffset(width, height, 0, -(cy - height / 2), width, height);
  };

  function renderOnce() {
    draw();
    renderer.render(scene, camera);
  }

  const resize = () => {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    const cap = narrow() ? 1.25 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    renderer.setSize(width, height, false);
    layout();
    renderOnce();
  };

  // ---- loop -------------------------------------------------------------------
  let raf = 0;
  let running = false;
  let last = 0;
  const loop = (now: number) => {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    step(dt);
    renderOnce();
  };

  /** reduced motion: play the change to its end unseen, then show one frame */
  const settle = () => {
    for (let i = 0; i < 150; i++) step(1 / 30);
    model.snapColors();
    half = halfT;
    cy = cyT;
    renderOnce();
  };

  // ---- pointer ------------------------------------------------------------
  const DRAG = 0.011;
  let down = false;
  let decided = false;
  let pid = -1;
  let sx = 0;
  let sy = 0;
  let lx = 0;
  let lt = 0;
  let downT = 0;
  let vel = 0;
  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  const endDrag = () => {
    down = false;
    if (dragging) {
      dragging = false;
      canvas.style.cursor = "";
      try {
        canvas.releasePointerCapture(pid);
      } catch {
        /* already released */
      }
    }
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    down = true;
    decided = false;
    pid = e.pointerId;
    sx = lx = e.clientX;
    sy = e.clientY;
    lt = downT = performance.now();
    vel = 0;
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && !dragging) {
      const [px, py] = local(e);
      hoverX = Math.max(-1, Math.min(1, (px - width / 2) / (width / 2)));
      hoverY = Math.max(-1, Math.min(1, (py - cy) / (height / 2)));
      if (opts.reduced) {
        tiltX = hoverY * 0.2;
        tiltY = hoverX * 0.28;
        renderOnce();
      }
    }
    if (!down || e.pointerId !== pid) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (!decided) {
      if (Math.hypot(dx, dy) < 6) return;
      decided = true;
      // only mostly-horizontal movement turns the object; vertical stays a page scroll
      if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragging = true;
        lx = e.clientX;
        lt = performance.now();
        canvas.style.cursor = "grabbing";
        try {
          canvas.setPointerCapture(pid);
        } catch {
          /* pointer already gone */
        }
      }
      return;
    }
    if (!dragging) return;
    const now = performance.now();
    const d = (e.clientX - lx) * DRAG;
    const ms = Math.max(1, now - lt);
    yaw += d;
    vel = vel * 0.6 + ((d / ms) * 1000) * 0.4;
    lx = e.clientX;
    lt = now;
    if (opts.reduced) renderOnce();
  };
  const onUp = (e: PointerEvent) => {
    if (!down || e.pointerId !== pid) return;
    const now = performance.now();
    if (!decided && now - downT < 600) {
      const [px, py] = local(e);
      if (Math.hypot(px - width / 2, py - cy) < half * 0.92) {
        model.click();
        if (opts.reduced) settle();
      }
    } else if (dragging && !opts.reduced) {
      // a pause before letting go means no throw
      yawVel = now - lt > 90 ? 0 : Math.max(-9, Math.min(9, vel));
    }
    endDrag();
  };
  const onCancel = () => endDrag();
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    hoverX = 0;
    hoverY = 0;
    if (opts.reduced) {
      tiltX = 0;
      tiltY = 0;
      renderOnce();
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);
  canvas.addEventListener("pointerleave", onLeave);

  ready = true;
  resize();
  ctx.emit();

  return {
    resize,
    refreshColors() {
      readColors();
      for (const b of bound) b.apply();
      if (!running) model.snapColors();
      renderOnce();
    },
    setRunning(run: boolean) {
      if (opts.reduced) {
        renderOnce();
        return;
      }
      if (run && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!run && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    },
    act(action: MiniAction) {
      model.act(action);
      if (opts.reduced) settle();
      else if (!running) renderOnce();
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      canvas.removeEventListener("pointerleave", onLeave);
      for (const d of disposables) d.dispose();
      model.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
