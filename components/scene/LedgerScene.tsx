"use client";
import { useEffect, useRef, useState } from "react";
import type { SceneHandle } from "./engine";

/**
 * Background scene for the hero: a phone makes money records (crates), they queue in an
 * outbox lane and are replayed over a link to the server database. Offline: the link breaks
 * and the outbox fills. Online: it flushes. Decorative, so aria-hidden.
 */
export default function LedgerScene({ className, offline }: { className?: string; offline?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const offlineRef = useRef<boolean | undefined>(offline);
  offlineRef.current = offline;
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // a static frame is simulated once, so a changed prop needs a rebuild
  const rebuildKey = reduced ? String(offline) : "live";

  useEffect(() => {
    if (reduced === null) return;
    const host = ref.current;
    if (!host) return;
    let disposed = false;
    let handle: SceneHandle | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let visible = true;
    const mqs = [window.matchMedia("(prefers-color-scheme: light)")];

    const sync = () => handle?.setRunning(visible && !document.hidden);
    const onScheme = () => handle?.refreshColors();
    const onVis = () => sync();

    import("./engine")
      .then(({ createScene }) => {
        if (disposed) return;
        try {
          handle = createScene(host, { reduced, getOffline: () => offlineRef.current });
        } catch {
          setFailed(true);
          return;
        }
        ro = new ResizeObserver(() => handle?.resize());
        ro.observe(host);
        io = new IntersectionObserver((e) => {
          visible = e[e.length - 1].isIntersecting;
          sync();
        });
        io.observe(host);
        for (const m of mqs) m.addEventListener("change", onScheme);
        document.addEventListener("visibilitychange", onVis);
        sync();
      })
      .catch(() => !disposed && setFailed(true));

    return () => {
      disposed = true;
      io?.disconnect();
      ro?.disconnect();
      for (const m of mqs) m.removeEventListener("change", onScheme);
      document.removeEventListener("visibilitychange", onVis);
      handle?.dispose();
    };
  }, [reduced, rebuildKey]);

  return (
    <div
      ref={ref}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      {failed && <StaticFallback offline={offline ?? true} />}
    </div>
  );
}

/** No-WebGL fallback: the same story as a flat diagram, colors from CSS variables. */
function StaticFallback({ offline }: { offline: boolean }) {
  const link = offline ? "var(--rose)" : "var(--mint)";
  return (
    <>
      <style>{`.lsf{position:absolute;right:2%;top:50%;width:54%;height:auto;transform:translateY(-50%)}
@media (max-aspect-ratio:1/1){.lsf{right:2%;left:2%;width:96%;top:auto;bottom:6%;transform:none}}`}</style>
      <svg className="lsf" viewBox="0 0 640 260" fill="none" strokeWidth="1.5" role="presentation">
        <g stroke="var(--dim)" fill="var(--panel-2)">
          <rect x="14" y="70" width="86" height="130" rx="8" />
          <rect x="150" y="150" width="270" height="46" />
          <ellipse cx="548" cy="92" rx="52" ry="14" fill="var(--panel)" />
          <path d="M496 92v100c0 8 23 15 52 15s52-7 52-15V92" />
        </g>
        <g stroke="var(--bg)" fill="var(--amber)">
          <rect x="34" y="96" width="24" height="24" />
          {[0, 1, 2, 3, 4, 5].slice(0, offline ? 6 : 2).map((i) => (
            <rect key={i} x={392 - i * 30} y="120" width="24" height="24" />
          ))}
        </g>
        <g stroke={link} strokeDasharray="10 8" strokeWidth="3">
          {offline ? (
            <>
              <path d="M424 172h22" />
              <path d="M480 190h14" />
            </>
          ) : (
            <path d="M424 172h72" />
          )}
        </g>
        {offline && <path d="M454 160l16 24m0-24l-16 24" stroke="var(--rose)" strokeWidth="3" />}
        <g fill="var(--dim)" fontFamily="var(--font-mono)" fontSize="13" stroke="none">
          <text x="14" y="228">phone / local db</text>
          <text x="190" y="228">{offline ? "outbox: queued" : "outbox: empty"}</text>
          <text x="520" y="240">server</text>
        </g>
      </svg>
    </>
  );
}
