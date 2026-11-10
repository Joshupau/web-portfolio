// three.js engine for LoanDemo. Loaded lazily (dynamic import) so first paint is not blocked.
// A row of stacked bars, one per month: principal below, interest on top, and a ribbon in
// front that follows the remaining balance down to zero. It is a chart, so it stays still
// unless something changes: frames are only drawn while bars, the drag spring or the
// highlight are moving.
import * as THREE from "three";

export interface LoanBar {
  principal: number;
  interest: number;
  /** what is still owed after this month */
  balance: number;
}

export interface LoanData {
  bars: LoanBar[];
  /** the payment that should reach the full chart height */
  max: number;
  /** the starting balance */
  loan: number;
}

export interface LoanOptions {
  reduced: boolean;
  /** called with the highlighted month index (0-based), or null */
  onPick(index: number | null): void;
}

export interface LoanHandle {
  resize(): void;
  refreshColors(): void;
  setRunning(run: boolean): void;
  setData(data: LoanData): void;
  dispose(): void;
}

const TOKENS = ["--bg", "--panel", "--panel-2", "--line", "--text", "--dim", "--amber", "--mint", "--rose", "--ice", "--violet"] as const;
type Token = (typeof TOKENS)[number];

const MAX = 60;
/** row length in world units */
const ROW = 10;
const YAW = 0.44;
/** depth is drawn as a rise on screen (a shear, not a tilt), so the bars stay upright */
const RISE = 0.32;
const GROW = 0.55; // seconds for one bar to reach its new height
const STAGGER = 0.4; // seconds between the first and the last bar starting
const LIFT = 0.16;
/** how far a drag can turn the chart, in radians */
const DRAG_MAX = 0.2;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function createLoanChart(container: HTMLElement, opts: LoanOptions): LoanHandle {
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
  const FOV = 20;
  const TAN = Math.tan((FOV * Math.PI) / 360);
  const camera = new THREE.PerspectiveCamera(FOV, 1.6, 0.1, 900);

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
  outer.matrixAutoUpdate = false;
  outer.matrix.set(1, 0, 0, 0, 0, 1, -RISE, 0, 0, 0, 1, 0, 0, 0, 0, 1);

  // ---- objects ------------------------------------------------------------
  // unit box standing on y = 0, so a bar is only a scale and a position
  const boxGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const barMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  // instance 2i is the principal part of month i, 2i + 1 the interest part
  const bars = new THREE.InstancedMesh(boxGeo, barMat, MAX * 2);
  bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bars.frustumCulled = false;
  spin.add(bars);
  disposables.push(boxGeo, barMat);

  const edgeGeo = new THREE.EdgesGeometry(boxGeo);
  const outlineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  bind(() => outlineMat.color.copy(col["--text"]));
  const outline = new THREE.LineSegments(edgeGeo, outlineMat);
  outline.frustumCulled = false;
  outline.visible = false;
  spin.add(outline);
  disposables.push(edgeGeo, outlineMat);

  const floorMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  bind(() => floorMat.color.copy(col["--panel-2"]));
  const floorEdgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
  bind(() => floorEdgeMat.color.copy(col["--dim"]));
  const FLOOR_H = 0.1;
  const FLOOR_Z0 = -0.75;
  const FLOOR_Z1 = 1.0;
  const floor = new THREE.Mesh(boxGeo, floorMat);
  floor.scale.set(ROW + 0.5, FLOOR_H, FLOOR_Z1 - FLOOR_Z0);
  floor.position.set(0, -FLOOR_H, (FLOOR_Z0 + FLOOR_Z1) / 2);
  floor.add(new THREE.LineSegments(edgeGeo, floorEdgeMat));
  spin.add(floor);
  disposables.push(floorMat, floorEdgeMat);

  // balance ribbon: two vertices per point, month 0 (the full loan) to the last month
  const RIBBON_Z = 0.62;
  const ribbonPos = new Float32Array((MAX + 1) * 2 * 3);
  const ribbonGeo = new THREE.BufferGeometry();
  const ribbonAttr = new THREE.BufferAttribute(ribbonPos, 3);
  ribbonAttr.setUsage(THREE.DynamicDrawUsage);
  ribbonGeo.setAttribute("position", ribbonAttr);
  {
    const idx: number[] = [];
    for (let k = 0; k < MAX; k++) {
      const a = k * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    ribbonGeo.setIndex(idx);
  }
  const iceMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  bind(() => iceMat.color.copy(col["--ice"]));
  const ribbon = new THREE.Mesh(ribbonGeo, iceMat);
  ribbon.frustumCulled = false;
  spin.add(ribbon);
  const dotGeo = new THREE.SphereGeometry(1, 16, 12);
  const dot = new THREE.Mesh(dotGeo, iceMat);
  dot.visible = false;
  spin.add(dot);
  disposables.push(ribbonGeo, iceMat, dotGeo);

  // ---- data: heights as a share of the chart height, eased per bar ---------------
  let count = 0;
  const cur = new Float32Array(MAX * 3); // principal, interest, balance
  const from = new Float32Array(MAX * 3);
  const to = new Float32Array(MAX * 3);
  const clock = new Float32Array(MAX).fill(GROW); // < 0 waiting, 0..GROW growing
  const lift = new Float32Array(MAX);
  let hover: number | null = null;
  let pinned: number | null = null;
  let shown: number | null = null;
  const active = () => (hover !== null ? hover : pinned);
  const emit = () => {
    const a = active();
    if (a === shown) return;
    shown = a;
    opts.onPick(a);
  };

  // ---- layout ---------------------------------------------------------------
  let width = 1;
  let height = 1;
  let chartH = 3.6; // world height of a full bar; follows the box shape
  let pxPerUnit = 30;
  const rot = new THREE.Matrix4();
  const tmpM = new THREE.Matrix4();
  const v = new THREE.Vector3();
  const fit = () => {
    const padX = narrow() ? 10 : 18;
    const top = 34; // room for the colour key
    const bottom = 12;
    const freeW = Math.max(40, width - padX * 2);
    const freeH = Math.max(40, height - top - bottom);
    chartH = clamp(ROW * (freeH / freeW) * 0.66, 2.2, 6.2);
    const x1 = ROW / 2 + 0.3;
    const y0 = -FLOOR_H;
    const y1 = chartH + LIFT + 0.1;
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    const extents = (d: number) => {
      minX = minY = Infinity;
      maxX = maxY = -Infinity;
      // the chart has to stay in the box at both ends of a drag as well as at rest
      for (let turn = -1; turn <= 1; turn++) {
        rot.copy(outer.matrix).multiply(tmpM.makeRotationY(YAW + turn * DRAG_MAX));
        for (let i = 0; i < 8; i++) {
          v.set(i & 1 ? x1 : -x1, i & 2 ? y1 : y0, i & 4 ? FLOOR_Z1 : FLOOR_Z0).applyMatrix4(rot);
          const k = height / 2 / ((d - v.z) * TAN);
          minX = Math.min(minX, v.x * k);
          maxX = Math.max(maxX, v.x * k);
          minY = Math.min(minY, v.y * k);
          maxY = Math.max(maxY, v.y * k);
        }
      }
      return maxX - minX <= freeW && maxY - minY <= freeH;
    };
    let lo = 12;
    let hi = 600;
    for (let i = 0; i < 26; i++) {
      const mid = (lo + hi) / 2;
      if (extents(mid)) hi = mid;
      else lo = mid;
    }
    extents(hi);
    pxPerUnit = height / 2 / (hi * TAN);
    camera.position.set(0, 0, hi);
    camera.aspect = width / height;
    // slide the picture so the chart sits in the free area, not the box centre
    const ox = width / 2 + (minX + maxX) / 2 - (padX + freeW / 2);
    const oy = height / 2 - (minY + maxY) / 2 - (top + freeH / 2);
    camera.setViewOffset(width, height, ox, oy, width, height);
  };

  // ---- motion ----------------------------------------------------------------
  let yaw = 0; // extra turn from dragging, springs back to 0
  let yawVel = 0;
  let dragging = false;

  /** advance; returns true while anything is still moving */
  const step = (dt: number) => {
    let busy = false;
    for (let i = 0; i < count; i++) {
      if (clock[i] < GROW) {
        clock[i] = Math.min(GROW, clock[i] + dt);
        const k = easeOutCubic(clamp(clock[i] / GROW, 0, 1));
        for (let j = i * 3; j < i * 3 + 3; j++) cur[j] = from[j] + (to[j] - from[j]) * k;
        if (clock[i] < GROW) busy = true;
      }
    }
    const a = active();
    const f = 1 - Math.exp(-dt * 16);
    for (let i = 0; i < count; i++) {
      const goal = i === a ? 1 : 0;
      if (lift[i] !== goal) {
        lift[i] += (goal - lift[i]) * f;
        if (Math.abs(goal - lift[i]) < 0.004) lift[i] = goal;
        else busy = true;
      }
    }
    if (!dragging && (yaw !== 0 || yawVel !== 0)) {
      yawVel += (-120 * yaw - 15 * yawVel) * dt;
      yaw += yawVel * dt;
      if (Math.abs(yaw) < 0.0006 && Math.abs(yawVel) < 0.004) yaw = yawVel = 0;
      else busy = true;
    }
    return busy || dragging;
  };

  /** jump every transition to its end */
  const snap = () => {
    for (let i = 0; i < count; i++) {
      clock[i] = GROW;
      for (let j = i * 3; j < i * 3 + 3; j++) cur[j] = to[j];
      lift[i] = i === active() ? 1 : 0;
    }
    if (!dragging) yaw = yawVel = 0;
  };

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const sv = new THREE.Vector3();
  const tint = new THREE.Color();
  const barX = (i: number) => -ROW / 2 + (ROW / count) * (i + 0.5);
  const barW = () => Math.min((ROW / Math.max(1, count)) * 0.74, 1.3);
  const barD = () => clamp(barW(), 0.22, 0.6);

  const draw = () => {
    spin.rotation.y = YAW + yaw;
    ribbon.visible = count > 0;
    if (!count) return;
    const w = barW();
    const d = barD();
    const a = active();
    for (let i = 0; i < count; i++) {
      const x = barX(i);
      const ph = cur[i * 3] * chartH;
      const ih = cur[i * 3 + 1] * chartH;
      const y = lift[i] * LIFT;
      const k = lift[i] * 0.22;
      // a part with no height is scaled away entirely, so it leaves no sliver on the bar
      m4.compose(pos.set(x, y, 0), q, ph > 1e-4 ? sv.set(w, ph, d) : sv.setScalar(0));
      bars.setMatrixAt(i * 2, m4);
      bars.setColorAt(i * 2, tint.copy(col["--mint"]).lerp(col["--text"], k));
      m4.compose(pos.set(x, y + ph, 0), q, ih > 1e-4 ? sv.set(w, ih, d) : sv.setScalar(0));
      bars.setMatrixAt(i * 2 + 1, m4);
      bars.setColorAt(i * 2 + 1, tint.copy(col["--amber"]).lerp(col["--text"], k));
    }
    bars.count = count * 2;
    bars.instanceMatrix.needsUpdate = true;
    if (bars.instanceColor) bars.instanceColor.needsUpdate = true;

    // ribbon thickness is held near 2.5 css px whatever the box size
    const t = Math.max(0.05, 2.5 / pxPerUnit);
    for (let k = 0; k <= count; k++) {
      const x = -ROW / 2 + (ROW / count) * k; // the balance once that month is paid, at the month's right edge
      const y = (k === 0 ? (count ? 1 : 0) : cur[(k - 1) * 3 + 2]) * chartH;
      const o = k * 6;
      ribbonPos[o] = ribbonPos[o + 3] = x;
      ribbonPos[o + 1] = y;
      ribbonPos[o + 4] = y + t;
      ribbonPos[o + 2] = ribbonPos[o + 5] = RIBBON_Z;
    }
    ribbonAttr.needsUpdate = true;
    ribbonGeo.setDrawRange(0, count * 6);

    const on = a !== null && a < count;
    outline.visible = on;
    dot.visible = on;
    if (a !== null && on) {
      const total = (cur[a * 3] + cur[a * 3 + 1]) * chartH;
      const e = 1.5 / pxPerUnit;
      outline.position.set(barX(a), lift[a] * LIFT, 0);
      outline.scale.set(w + e, Math.max(total, 1e-4) + e, d + e);
      dot.position.set(-ROW / 2 + (ROW / count) * (a + 1), cur[a * 3 + 2] * chartH + t / 2, RIBBON_Z);
      dot.scale.setScalar(Math.max(0.09, 4.5 / pxPerUnit));
    }
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
    fit();
    renderOnce();
  };

  // ---- loop: runs only while something moves -----------------------------------
  let raf = 0;
  let allowed = false;
  let last = 0;
  const loop = (now: number) => {
    raf = 0;
    if (!allowed) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const busy = step(dt);
    renderOnce();
    if (busy) raf = requestAnimationFrame(loop);
  };
  /** something changed: reduced motion shows the end state at once, otherwise animate */
  const wake = () => {
    if (opts.reduced) {
      snap();
      renderOnce();
    } else if (allowed && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };

  // ---- picking ------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pick = (px: number, py: number): number | null => {
    if (!count) return null;
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    bars.computeBoundingSphere();
    ndc.set((px / width) * 2 - 1, -(py / height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObject(bars, false)[0];
    if (hit && hit.instanceId !== undefined) return hit.instanceId >> 1;
    // thin bars are hard to hit with a finger: fall back to the nearest column
    let best: number | null = null;
    let bestD = Math.max(12, (ROW / count) * pxPerUnit * 0.8);
    for (let i = 0; i < count; i++) {
      const total = (cur[i * 3] + cur[i * 3 + 1]) * chartH;
      v.set(barX(i), 0, 0).applyMatrix4(spin.matrixWorld).project(camera);
      const bx = ((v.x + 1) / 2) * width;
      const by = ((1 - v.y) / 2) * height;
      v.set(barX(i), total, 0).applyMatrix4(spin.matrixWorld).project(camera);
      const tx = ((v.x + 1) / 2) * width;
      const ty = ((1 - v.y) / 2) * height;
      if (py < ty - 14 || py > by + 16) continue;
      const dx = Math.abs(px - (bx + tx) / 2);
      if (dx < bestD) {
        bestD = dx;
        best = i;
      }
    }
    return best;
  };

  // ---- pointer ------------------------------------------------------------
  let down = false;
  let decided = false;
  let pid = -1;
  let sx = 0;
  let sy = 0;
  let downT = 0;
  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  const setHover = (i: number | null) => {
    if (i === hover) return;
    hover = i;
    emit();
    wake();
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
      wake();
    }
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    down = true;
    decided = false;
    pid = e.pointerId;
    sx = e.clientX;
    sy = e.clientY;
    downT = performance.now();
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && !dragging) {
      const [px, py] = local(e);
      setHover(pick(px, py));
    }
    if (!down || e.pointerId !== pid) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (!decided) {
      if (Math.hypot(dx, dy) < 6) return;
      decided = true;
      // only mostly-horizontal movement turns the chart; vertical stays a page scroll
      if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragging = true;
        hover = null;
        emit();
        sx = e.clientX;
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
    // a little turn only, easing into the limit
    yaw = DRAG_MAX * Math.tanh((e.clientX - sx) * 0.006);
    yawVel = 0;
    if (opts.reduced) renderOnce();
    else wake();
  };
  const onUp = (e: PointerEvent) => {
    if (!down || e.pointerId !== pid) return;
    if (!decided && performance.now() - downT < 600) {
      const [px, py] = local(e);
      const i = pick(px, py);
      pinned = i === null || i === pinned ? null : i;
      if (e.pointerType !== "mouse") hover = null;
      else hover = i;
      emit();
      wake();
    }
    endDrag();
  };
  const onCancel = () => endDrag();
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    setHover(null);
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);
  canvas.addEventListener("pointerleave", onLeave);

  resize();

  return {
    resize,
    refreshColors() {
      readColors();
      for (const b of bound) b.apply();
      renderOnce();
    },
    setRunning(run: boolean) {
      if (opts.reduced) {
        renderOnce();
        return;
      }
      allowed = run;
      if (run) wake();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    setData(data: LoanData) {
      const n = Math.min(MAX, data.bars.length);
      if (n !== count) {
        // a different term is a different set of months: drop the highlight
        hover = null;
        pinned = null;
        emit();
      }
      const max = data.max > 0 ? data.max : 1;
      const loan = data.loan > 0 ? data.loan : 1;
      for (let i = 0; i < MAX; i++) {
        const j = i * 3;
        if (i >= count) cur[j] = cur[j + 1] = cur[j + 2] = 0; // new months grow from the floor
        if (i >= n) continue;
        const b = data.bars[i];
        from[j] = cur[j];
        from[j + 1] = cur[j + 1];
        from[j + 2] = cur[j + 2];
        to[j] = b.principal / max;
        to[j + 1] = b.interest / max;
        to[j + 2] = b.balance / loan;
        clock[i] = -(n > 1 ? i / (n - 1) : 0) * STAGGER;
        lift[i] = i < count ? lift[i] : 0;
      }
      count = n;
      wake();
      if (!opts.reduced && !allowed) renderOnce();
    },
    dispose() {
      allowed = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      canvas.removeEventListener("pointerleave", onLeave);
      for (const d of disposables) d.dispose();
      bars.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
