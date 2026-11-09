// three.js engine for LedgerScene. Loaded lazily (dynamic import) so first paint is not blocked.
// Story: money records (crates) are made on the phone, queue in the outbox lane, and are replayed
// over the link to the server database. Offline: the link breaks and the outbox fills up.
import * as THREE from "three";

export interface SceneOptions {
  reduced: boolean;
  /** undefined means "auto demo an offline -> online cycle" */
  getOffline: () => boolean | undefined;
}

export interface SceneHandle {
  resize(): void;
  refreshColors(): void;
  setRunning(run: boolean): void;
  dispose(): void;
}

const TOKENS = ["--bg", "--panel", "--panel-2", "--line", "--text", "--dim", "--amber", "--mint", "--rose", "--ice"] as const;
type Token = (typeof TOKENS)[number];

// World layout (x runs phone -> server)
const PHONE_X = -6.6;
const LANE_START = -3.3;
const LANE_END = 2.1;
const LANE_TOP = 0.34;
const CAP = 9; // crates per lane row
const SLOT = 0.6;
const LINK_X0 = 2.6;
const LINK_X1 = 5.0;
const DB_X = 6.6;
const DB_H = 2.5;
const POOL = 44;
const MAX_PENDING = 30;
const CRATE = 0.46;
const AUTO_PERIOD = 12.5;

type CState = "free" | "born" | "hop" | "queued" | "send";
interface Crate {
  state: CState;
  t: number;
  pos: THREE.Vector3;
  from: THREE.Vector3;
  scale: number;
  mint: number;
}

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function createScene(container: HTMLElement, opts: SceneOptions): SceneHandle {
  const narrow = () => container.clientWidth < 700;
  const renderer = new THREE.WebGLRenderer({
    antialias: !narrow(),
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 200);

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

  // ---- helpers ----------------------------------------------------------
  const disposables: Array<{ dispose(): void }> = [];
  const root = new THREE.Group();
  scene.add(root);

  const lineMats: THREE.LineBasicMaterial[] = [];
  const solid = (
    geo: THREE.BufferGeometry,
    token: Token,
    pos: [number, number, number],
    edge: Token | null = "--dim",
    parent: THREE.Object3D = root,
  ) => {
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    bind(() => mat.color.copy(col[token]));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    parent.add(mesh);
    disposables.push(geo, mat);
    if (edge) {
      const eg = new THREE.EdgesGeometry(geo, 25);
      const lm = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
      bind(() => lm.color.copy(col[edge]));
      lineMats.push(lm);
      mesh.add(new THREE.LineSegments(eg, lm));
      disposables.push(eg, lm);
    }
    return mesh;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ---- board footprint (thin outline, the "diagram sheet") -------------------
  {
    const pts = [
      new THREE.Vector3(-9.2, 0, -2.6),
      new THREE.Vector3(8.6, 0, -2.6),
      new THREE.Vector3(8.6, 0, 2.6),
      new THREE.Vector3(-9.2, 0, 2.6),
    ];
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.25, gapSize: 0.2, transparent: true, opacity: 0.55 });
    bind(() => m.color.copy(col["--line"]));
    const loop = new THREE.LineLoop(g, m);
    loop.computeLineDistances();
    root.add(loop);
    disposables.push(g, m);
  }

  // ---- phone slab -------------------------------------------------------
  const phone = new THREE.Group();
  phone.position.set(PHONE_X, 0, 0);
  root.add(phone);
  solid(box(2.7, 0.3, 3.5), "--panel-2", [0, 0.15, 0], "--dim", phone);
  const screenMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  bind(() => screenMat.color.copy(col["--panel"]));
  const screen = new THREE.Mesh(box(2.3, 0.04, 3.1), screenMat);
  screen.position.set(0, 0.32, 0);
  phone.add(screen);
  disposables.push(screen.geometry, screenMat);
  // list rows on the screen
  const rowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  bind(() => rowMat.color.copy(col["--dim"]));
  disposables.push(rowMat);
  for (let i = 0; i < 4; i++) {
    const g = box(1.6 - (i % 2) * 0.35, 0.02, 0.12);
    const r = new THREE.Mesh(g, rowMat);
    r.position.set(0.1 - (i % 2) * 0.17, 0.35, -1.2 + i * 0.42);
    phone.add(r);
    disposables.push(g);
  }
  // status LED
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.2), ledMat);
  led.position.set(0.95, 0.37, 1.35);
  phone.add(led);
  disposables.push(led.geometry, ledMat);

  // ---- outbox lane (trough) -----------------------------------------------
  const laneLen = LANE_END - LANE_START + 0.7;
  const laneMid = (LANE_END + LANE_START) / 2;
  solid(box(laneLen, 0.2, 1.1), "--panel-2", [laneMid, 0.1, 0]);
  solid(box(laneLen, 0.28, 0.08), "--panel-2", [laneMid, 0.3, -0.55]);
  solid(box(laneLen, 0.28, 0.08), "--panel-2", [laneMid, 0.3, 0.55]);
  // slot ticks on the lane floor
  const tickMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  bind(() => tickMat.color.copy(col["--line"]));
  disposables.push(tickMat);
  for (let i = 0; i < CAP; i++) {
    const g = box(0.04, 0.01, 0.8);
    const m = new THREE.Mesh(g, tickMat);
    m.position.set(LANE_END - i * SLOT - SLOT / 2, 0.21, 0);
    root.add(m);
    disposables.push(g);
  }
  // hand-off pad between phone and lane
  solid(box(0.7, 0.12, 0.7), "--panel-2", [(PHONE_X + 1.35 + LANE_START) / 2, 0.06, 0]);

  // ---- link between outbox and server -------------------------------------
  const linkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const linkSegs: THREE.Mesh[] = [];
  const LINK_N = 8;
  const linkGeo = box(0.22, 0.1, 0.16);
  disposables.push(linkMat, linkGeo);
  for (let i = 0; i < LINK_N; i++) {
    const m = new THREE.Mesh(linkGeo, linkMat);
    root.add(m);
    linkSegs.push(m);
  }
  // break marker: two crossed bars
  const xMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const xGeo = box(0.9, 0.1, 0.1);
  disposables.push(xMat, xGeo);
  const xMark = new THREE.Group();
  for (const s of [1, -1]) {
    const b = new THREE.Mesh(xGeo, xMat);
    b.rotation.y = s * (Math.PI / 4);
    xMark.add(b);
  }
  xMark.position.set((LINK_X0 + LINK_X1) / 2, 0.45, 0);
  root.add(xMark);
  // link pillar stubs at each end
  solid(box(0.18, 0.5, 0.18), "--panel-2", [LINK_X0 - 0.05, 0.25, 0]);
  solid(box(0.18, 0.5, 0.18), "--panel-2", [LINK_X1 + 0.05, 0.25, 0]);

  // ---- database cylinder (server) -------------------------------------------
  const db = new THREE.Group();
  db.position.set(DB_X, 0, 0);
  root.add(db);
  solid(new THREE.CylinderGeometry(1.5, 1.5, 0.18, 40), "--panel-2", [0, 0.09, 0], "--dim", db);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  bind(() => bodyMat.color.copy(col["--panel-2"]));
  const bodyGeo = new THREE.CylinderGeometry(1.25, 1.25, DB_H, 40);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.18 + DB_H / 2;
  db.add(body);
  disposables.push(bodyGeo, bodyMat);
  const bands: THREE.Mesh[] = [];
  const bandMats: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.CylinderGeometry(1.29, 1.29, 0.07, 40);
    const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    const b = new THREE.Mesh(g, m);
    b.position.y = 0.18 + DB_H * (0.2 + i * 0.3);
    db.add(b);
    bands.push(b);
    bandMats.push(m);
    disposables.push(g, m);
  }
  const topGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.06, 40);
  const topMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  bind(() => topMat.color.copy(col["--panel"]));
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 0.18 + DB_H + 0.03;
  db.add(top);
  disposables.push(topGeo, topMat);
  const rimGeo = new THREE.EdgesGeometry(topGeo, 25);
  const rimMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  bind(() => rimMat.color.copy(col["--dim"]));
  top.add(new THREE.LineSegments(rimGeo, rimMat));
  disposables.push(rimGeo, rimMat);
  const bodyEdge = new THREE.EdgesGeometry(bodyGeo, 25);
  body.add(new THREE.LineSegments(bodyEdge, rimMat));
  disposables.push(bodyEdge);
  const dbTopY = 0.18 + DB_H + 0.06;

  // ---- crates (instanced) -----------------------------------------------------
  const crateGeo = box(CRATE, CRATE, CRATE);
  const crateMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const crates = new THREE.InstancedMesh(crateGeo, crateMat, POOL);
  crates.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  crates.frustumCulled = false;
  crates.setColorAt(0, new THREE.Color());
  root.add(crates);
  // crate outlines: slightly larger back-faced hull, drawn as instanced too
  const hullMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
  bind(() => hullMat.color.copy(col["--bg"]));
  const hull = new THREE.InstancedMesh(crateGeo, hullMat, POOL);
  hull.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  hull.frustumCulled = false;
  root.add(hull);
  disposables.push(crateGeo, crateMat, hullMat);

  const pool: Crate[] = [];
  for (let i = 0; i < POOL; i++)
    pool.push({ state: "free", t: 0, pos: new THREE.Vector3(), from: new THREE.Vector3(), scale: 0, mint: 0 });
  const queue: Crate[] = [];

  // ---- HTML labels ------------------------------------------------------------
  const mkLabel = () => {
    const el = document.createElement("div");
    el.style.cssText =
      "position:absolute;left:0;top:0;white-space:nowrap;font:500 12px/1.2 var(--font-mono);color:var(--dim);transform:translate(-50%,0);pointer-events:none;will-change:transform;";
    container.appendChild(el);
    return el;
  };
  const lblPhone = mkLabel();
  const lblQueue = mkLabel();
  const lblServer = mkLabel();
  const lblLink = mkLabel();
  lblPhone.textContent = "phone / local db";
  lblServer.textContent = "server";
  const labelAnchors: Array<[HTMLElement, THREE.Vector3, number, number?]> = [
    [lblPhone, new THREE.Vector3(PHONE_X, 0, 2.6), 6],
    [lblQueue, new THREE.Vector3(laneMid, 0, 1.5), 6],
    [lblServer, new THREE.Vector3(DB_X, 0, 2.1), 6],
    [lblLink, new THREE.Vector3((LINK_X0 + LINK_X1) / 2, 1.6, 0), -26, -70],
  ];
  let lastQueueText = "";
  let lastLinkText = "";

  // ---- camera framing ---------------------------------------------------------
  const bounds = new THREE.Box3(new THREE.Vector3(-9.2, 0, -2.6), new THREE.Vector3(8.6, 4.2, 2.6));
  const target = new THREE.Vector3(-0.3, 0.8, 0);
  let phi = 0.78; // radians between camera heading and +z
  let portrait = false;
  let vw = 20;
  let vh = 12;
  let width = 1;
  let height = 1;

  const placeCamera = (drift: number) => {
    const a = phi + drift;
    const dist = 40;
    const elev = 0.55;
    camera.position.set(
      target.x - Math.sin(a) * dist * Math.cos(elev),
      target.y + Math.sin(elev) * dist,
      target.z + Math.cos(a) * dist * Math.cos(elev),
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
  };

  const frame = () => {
    portrait = width / height < 1.0;
    phi = portrait ? 0.62 : 0.8;
    placeCamera(0);
    // project the scene box into camera space
    const inv = camera.matrixWorldInverse;
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) {
          const v = new THREE.Vector3(x, y, z).applyMatrix4(inv);
          minX = Math.min(minX, v.x);
          maxX = Math.max(maxX, v.x);
          minY = Math.min(minY, v.y);
          maxY = Math.max(maxY, v.y);
        }
    const bw = maxX - minX;
    const bh = maxY - minY;
    const aspect = width / height;
    // where the scene's center sits in the canvas (fraction from left / from top)
    let fx: number, fy: number, share: number;
    if (portrait) {
      share = 0.96;
      fx = 0.5;
      fy = 0.5;
    } else {
      share = 0.55;
      fx = 0.755;
      fy = 0.52;
    }
    vw = bw / share;
    vh = vw / aspect;
    if (!portrait && bh > vh * 0.78) {
      vh = bh / 0.78;
      vw = vh * aspect;
      fx = Math.min(fx, 1 - (bw / vw) / 2 - 0.02);
    }
    if (portrait) {
      // tuck the scene into the bottom strip, text keeps the top
      const half = bh / vh / 2;
      fy = Math.max(0.5, 1 - half - 0.035);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    camera.left = cx - fx * vw;
    camera.right = camera.left + vw;
    camera.top = cy + fy * vh;
    camera.bottom = camera.top - vh;
    camera.updateProjectionMatrix();
  };

  const resize = () => {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    const cap = width < 700 ? 1.25 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    renderer.setSize(width, height, false);
    frame();
    renderOnce();
  };

  // ---- simulation -------------------------------------------------------------
  let time = 0;
  let spawnT = 0.4;
  let sendT = 0;
  let broken = 0; // 0 intact, 1 broken (smoothed)
  let dbFlash = 0;
  let offlineNow = false;
  let forced: boolean | undefined;

  const allocate = () => pool.find((c) => c.state === "free");
  const slotPos = (i: number, out: THREE.Vector3) => {
    const col_ = i % CAP;
    const layer = Math.floor(i / CAP);
    out.set(LANE_END - SLOT / 2 - col_ * SLOT, LANE_TOP + CRATE / 2 + 0.06 + layer * (CRATE + 0.04), 0);
    return out;
  };
  const tmp = new THREE.Vector3();

  const isOffline = () => {
    if (forced !== undefined) return forced;
    const p = opts.getOffline();
    if (p !== undefined) return p;
    const c = time % AUTO_PERIOD;
    return c > 3.6 && c < 9.2;
  };

  const step = (dt: number) => {
    time += dt;
    offlineNow = isOffline();
    const target_ = offlineNow ? 1 : 0;
    broken += (target_ - broken) * Math.min(1, dt * 5);

    // spawn
    spawnT -= dt;
    let pending = 0;
    for (const c of pool) if (c.state === "born" || c.state === "hop" || c.state === "queued") pending++;
    if (spawnT <= 0) {
      spawnT = (offlineNow ? 0.62 : 0.95) + Math.random() * 0.2;
      const c = pending < MAX_PENDING ? allocate() : undefined;
      if (c) {
        c.state = "born";
        c.t = 0;
        c.mint = 0;
        c.scale = 0;
        c.pos.set(PHONE_X + (Math.random() - 0.5) * 0.8, 0.34 + CRATE / 2 + 0.02, (Math.random() - 0.5) * 1.2);
        c.from.copy(c.pos);
      }
    }

    // flush head of queue when the link is up
    sendT += dt;
    if (!offlineNow && broken < 0.15 && queue.length && sendT > 0.3) {
      sendT = 0;
      const c = queue.shift()!;
      c.state = "send";
      c.t = 0;
      c.from.copy(c.pos);
    }

    for (const c of pool) {
      switch (c.state) {
        case "born": {
          c.t += dt / 0.55;
          c.scale = ease(clamp01(c.t));
          c.pos.y = c.from.y + ease(clamp01(c.t)) * 0.9;
          if (c.t >= 1) {
            c.state = "hop";
            c.t = 0;
            c.from.copy(c.pos);
          }
          break;
        }
        case "hop": {
          c.t += dt / 0.95;
          const k = ease(clamp01(c.t));
          const entry = tmp.set(LANE_START + SLOT / 2, LANE_TOP + CRATE / 2 + 0.06, 0);
          c.pos.x = c.from.x + (entry.x - c.from.x) * k;
          c.pos.z = c.from.z + (0 - c.from.z) * k;
          c.pos.y = c.from.y + (entry.y - c.from.y) * k + Math.sin(k * Math.PI) * 0.7;
          if (c.t >= 1) {
            c.state = "queued";
            queue.push(c);
          }
          break;
        }
        case "queued": {
          const i = queue.indexOf(c);
          slotPos(i < 0 ? 0 : i, tmp);
          const f = 1 - Math.exp(-dt * 7);
          c.pos.x += (tmp.x - c.pos.x) * f;
          c.pos.y += (tmp.y - c.pos.y) * f;
          c.pos.z += (tmp.z - c.pos.z) * f;
          break;
        }
        case "send": {
          c.t += dt / 1.7;
          const t = clamp01(c.t);
          const kx = ease(clamp01(t / 0.82));
          c.pos.x = c.from.x + (DB_X - c.from.x) * kx;
          c.pos.z = c.from.z * (1 - kx);
          const cruise = LANE_TOP + 0.75;
          const lift = ease(clamp01(t / 0.2));
          let y = c.from.y + (cruise - c.from.y) * lift;
          if (t > 0.78) {
            const d = ease((t - 0.78) / 0.22);
            y = cruise + (dbTopY + 0.1 - cruise) * d;
            c.scale = 1 - d;
          }
          c.pos.y = y;
          c.mint = clamp01((t - 0.35) / 0.2);
          if (c.t >= 1) {
            c.state = "free";
            c.scale = 0;
            dbFlash = 1;
          }
          break;
        }
        default:
          break;
      }
    }
    dbFlash = Math.max(0, dbFlash - dt * 2.2);
  };

  // ---- drawing ----------------------------------------------------------------
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const sv = new THREE.Vector3();
  const colTmp = new THREE.Color();
  const v3 = new THREE.Vector3();

  const draw = () => {
    // crates
    for (let i = 0; i < POOL; i++) {
      const c = pool[i];
      const s = c.state === "free" ? 0 : Math.max(0.0001, c.state === "born" || c.state === "send" ? c.scale : 1);
      sv.setScalar(s);
      m4.compose(c.pos, q, sv);
      crates.setMatrixAt(i, m4);
      sv.setScalar(s * 1.18);
      m4.compose(c.pos, q, sv);
      hull.setMatrixAt(i, m4);
      colTmp.copy(col["--amber"]).lerp(col["--mint"], c.mint);
      crates.setColorAt(i, colTmp);
    }
    crates.instanceMatrix.needsUpdate = true;
    hull.instanceMatrix.needsUpdate = true;
    if (crates.instanceColor) crates.instanceColor.needsUpdate = true;

    // link segments
    const span = LINK_X1 - LINK_X0;
    for (let i = 0; i < LINK_N; i++) {
      const m = linkSegs[i];
      const u = i / (LINK_N - 1);
      const baseX = LINK_X0 + u * span;
      const mid = Math.abs(u - 0.5) * 2; // 0 in the middle, 1 at the ends
      // broken: segments pull back from the middle, droop and tilt
      const side = u < 0.5 ? -1 : 1;
      const pull = broken * (1 - mid) * 0.5 * side;
      m.position.set(baseX + pull, 0.42 - broken * (1 - mid) * 0.34, 0);
      m.rotation.set(0, 0, broken * side * -(1 - mid) * 0.9);
      const gap = broken > 0.5 && mid < 0.2;
      m.visible = !gap;
      if (!opts.reduced && broken < 0.5) {
        // pulse travels along the link while online
        const ph = (time * 1.6 - u * 2.2) % 3;
        m.scale.y = 1 + (ph > 0 && ph < 0.5 ? 1.4 : 0);
      } else m.scale.y = 1;
    }
    linkMat.color.copy(col["--mint"]).lerp(col["--rose"], clamp01(broken * 1.6));
    xMat.color.copy(col["--rose"]);
    xMark.visible = broken > 0.55;
    xMark.scale.setScalar(clamp01((broken - 0.55) / 0.3));
    ledMat.color.copy(offlineNow ? col["--rose"] : col["--mint"]);

    // db bands pulse on arrival
    for (const m of bandMats) {
      m.color.copy(col["--dim"]).lerp(col["--mint"], dbFlash);
      m.opacity = 0.55 + dbFlash * 0.4;
    }

    // labels
    const w = width;
    const h = height;
    for (const [el, anchor, dy, dx = 0] of labelAnchors) {
      v3.copy(anchor).project(camera);
      el.style.transform = `translate(-50%,0) translate(${((v3.x + 1) / 2) * w + dx}px,${((1 - v3.y) / 2) * h + dy}px)`;
    }
    const qt = queue.length ? `outbox: ${queue.length} queued` : "outbox: empty";
    if (qt !== lastQueueText) {
      lastQueueText = qt;
      lblQueue.textContent = qt;
    }
    const lt = offlineNow ? "link down, holding" : "link up, synced";
    if (lt !== lastLinkText) {
      lastLinkText = lt;
      lblLink.textContent = lt;
    }
    lblLink.style.color = offlineNow ? "var(--rose)" : "var(--mint)";
    lblQueue.style.color = queue.length && offlineNow ? "var(--amber)" : "var(--dim)";
  };

  function renderOnce() {
    draw();
    renderer.render(scene, camera);
  }

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
    if (!opts.reduced) {
      const d = Math.sin(time * 0.13) * 0.035;
      placeCamera(d);
    }
    renderOnce();
  };

  const applyColors = () => {
    readColors();
    for (const b of bound) b.apply();
    renderOnce();
  };

  // reduced motion: simulate a stretch offline, then show one calm frame
  if (opts.reduced) {
    const p = opts.getOffline();
    forced = p === undefined ? true : p;
    for (let i = 0; i < 260; i++) step(1 / 30);
  }

  width = Math.max(1, container.clientWidth);
  height = Math.max(1, container.clientHeight);
  resize();

  return {
    resize,
    refreshColors: applyColors,
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
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      for (const d of disposables) d.dispose();
      crates.dispose();
      hull.dispose();
      renderer.dispose();
      canvas.remove();
      for (const [el] of labelAnchors) el.remove();
    },
  };
}
