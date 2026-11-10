"use client";
import { useEffect, useRef, useState } from "react";
import type { Biz, MiniAction, MiniHandle, MiniState } from "./mini";

type Kind = "cube" | "token";

const BIZ: Array<{ id: Biz; label: string; accent: string }> = [
  { id: "pharmacy", label: "Pharmacy", accent: "var(--mint)" },
  { id: "retail", label: "Retail", accent: "var(--amber)" },
  { id: "resort", label: "Resort", accent: "var(--ice)" },
];

const LABEL: Record<Kind, string> = {
  cube: "Interactive model: a cube built from business modules",
  token: "Interactive model: a marketplace token",
};
const FALLBACK_CAPTION: Record<Kind, string> = {
  cube: "same core, different modules per business",
  token: "mint, list, buy",
};

const CSS = `.mini3d{position:relative;box-sizing:border-box;width:100%;min-width:0;aspect-ratio:16/10;min-height:280px;max-height:340px;border:1px solid var(--line);border-radius:var(--radius);background:var(--panel);overflow:hidden;touch-action:pan-y;cursor:grab}
.mini3d-stage{position:absolute;inset:0}
.mini3d-ctl{position:absolute;z-index:1;top:8px;right:8px;left:8px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;pointer-events:none}
.mini3d-grp{display:flex;gap:6px}
.mini3d-ctl button{pointer-events:auto;box-sizing:border-box;min-height:40px;min-width:40px;margin:0;padding:0 10px;font:500 12px/1 var(--font-mono);white-space:nowrap;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text);cursor:pointer;-webkit-tap-highlight-color:transparent}
.mini3d-ctl button:hover{border-color:var(--amber)}
.mini3d-ctl button:focus-visible{outline:2px solid var(--ice);outline-offset:2px}
.mini3d-ctl button[aria-pressed="true"]{border-color:var(--acc,var(--amber));color:var(--acc,var(--amber))}
.mini3d-cap{position:absolute;z-index:1;left:10px;right:10px;bottom:8px;max-width:46ch;margin:0;font:500 12px/1.45 var(--font-mono);color:var(--dim);overflow-wrap:anywhere;pointer-events:none}
.mini3d-fb{position:absolute;left:50%;top:46%;width:min(46%,200px);height:auto;transform:translate(-50%,-50%)}
@media (prefers-reduced-motion:no-preference){.mini3d-ctl button{transition:border-color .15s,color .15s}}`;

/**
 * A small interactive three.js object in a bordered box.
 * cube: "Kkyubbi", a cube of modules that can be taken apart and re-lit per business type.
 * token: "Kofi", a marketplace token that can be minted, listed and bought.
 */
export default function MiniScene({ kind, className }: { kind: Kind; className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const ctlRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);
  const handleRef = useRef<MiniHandle | null>(null);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [ui, setUi] = useState<MiniState>({ exploded: false, biz: "pharmacy", listed: false });

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced === null) return;
    const host = stageRef.current;
    const caption = capRef.current;
    if (!host || !caption) return;
    let disposed = false;
    let handle: MiniHandle | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let visible = true;
    const mqs = [window.matchMedia("(prefers-color-scheme: light)")];

    const sync = () => handle?.setRunning(visible && !document.hidden);
    const onScheme = () => handle?.refreshColors();
    const onVis = () => sync();

    import("./mini")
      .then(({ createMini }) => {
        if (disposed) return;
        try {
          handle = createMini(host, {
            kind,
            reduced,
            caption,
            controls: ctlRef.current,
            onState: (s) => !disposed && setUi(s),
          });
        } catch {
          setFailed(true);
          return;
        }
        handleRef.current = handle;
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
      handleRef.current = null;
      io?.disconnect();
      ro?.disconnect();
      for (const m of mqs) m.removeEventListener("change", onScheme);
      document.removeEventListener("visibilitychange", onVis);
      handle?.dispose();
    };
  }, [reduced, kind]);

  const act = (a: MiniAction) => handleRef.current?.act(a);

  return (
    <div className={className ? `mini3d ${className}` : "mini3d"} role="group" aria-label={LABEL[kind]}>
      <style>{CSS}</style>
      <div ref={stageRef} className="mini3d-stage">
        {failed && <StaticFallback kind={kind} />}
      </div>
      {!failed && (
        <div ref={ctlRef} className="mini3d-ctl">
          {kind === "cube" ? (
            <>
              <button type="button" onClick={() => act("toggle")}>
                {ui.exploded ? "Assemble" : "Take apart"}
              </button>
              <div className="mini3d-grp" role="group" aria-label="Business type">
                {BIZ.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    aria-pressed={ui.biz === b.id}
                    style={{ ["--acc" as string]: b.accent }}
                    onClick={() => act(b.id)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button type="button" onClick={() => act("trade")}>
                {ui.listed ? "Buy" : "List for sale"}
              </button>
              <button type="button" onClick={() => act("mint")}>
                Mint
              </button>
            </>
          )}
        </div>
      )}
      <p ref={capRef} className="mini3d-cap" aria-live="polite">
        {failed ? FALLBACK_CAPTION[kind] : null}
      </p>
    </div>
  );
}

/** No-WebGL fallback: a flat drawing of the same object, colors from CSS variables. */
function StaticFallback({ kind }: { kind: Kind }) {
  return (
    <svg className="mini3d-fb" viewBox="0 0 200 156" fill="none" strokeWidth="1.5" strokeLinejoin="round" role="presentation">
      {kind === "cube" ? (
        <>
          <g stroke="var(--dim)" fill="var(--panel-2)">
            <path d="M100 18l52 30-52 30-52-30z" />
            <path d="M48 48l52 30v60l-52-30z" />
            <path d="M152 48l-52 30v60l52-30z" />
          </g>
          <path d="M82.7 28l34.6 20-17.3 10-34.7-20z" fill="var(--mint)" stroke="var(--dim)" />
          <path d="M48 68l52 30v20l-52-30zM152 68l-52 30v20l52-30z" fill="var(--dim)" stroke="var(--dim)" />
          <g stroke="var(--dim)">
            <path d="M117.3 28l-52 30M134.7 38l-52 30M82.7 28l52 30M65.3 38l52 30" />
            <path d="M65.3 58v60M82.7 68v60M48 68l52 30M48 88l52 30" />
            <path d="M117.3 68v60M134.7 58v60M152 68l-52 30M152 88l-52 30" />
          </g>
        </>
      ) : (
        <>
          <path d="M100 20l43.3 25v50L100 120 56.7 95V45z" fill="var(--panel-2)" stroke="var(--dim)" />
          <path d="M100 32l32.9 19v38L100 108 67.1 89V51z" stroke="var(--amber)" strokeWidth="3" />
          <path d="M86 58h28l8 10-22 24-22-24z" fill="var(--amber)" />
        </>
      )}
    </svg>
  );
}
