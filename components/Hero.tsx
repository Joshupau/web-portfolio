"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LedgerScene from "@/components/scene/LedgerScene";
import type { SceneHandle, SceneStats } from "@/components/scene/engine";
import { intro, person } from "@/lib/content";

const words = intro.headline.split(" ");

export default function Hero() {
  const handle = useRef<SceneHandle | null>(null);
  const section = useRef<HTMLElement>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean; on: boolean } | null>(null);
  const [stats, setStats] = useState<SceneStats>({ offline: false, queued: 0, synced: 0 });
  const [live, setLive] = useState(false);

  const onHandle = useCallback((h: SceneHandle | null) => {
    handle.current = h;
    setLive(!!h);
  }, []);

  // the camera lifts and pulls back as the hero scrolls away
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = section.current;
        if (el) handle.current?.setScroll(window.scrollY / Math.max(1, el.offsetHeight));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // the command prompt at the bottom of the page can drive the scene too
  useEffect(() => {
    const toggle = () => handle.current?.toggleOffline();
    const spawn = () => handle.current?.spawn(3);
    window.addEventListener("scene:toggle", toggle);
    window.addEventListener("scene:spawn", spawn);
    return () => {
      window.removeEventListener("scene:toggle", toggle);
      window.removeEventListener("scene:spawn", spawn);
    };
  }, []);

  const inText = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.(".hero__text");

  return (
    <section
      ref={section}
      id="top"
      className="hero"
      aria-labelledby="hero-title"
      onPointerMove={(e) => {
        const h = handle.current;
        const el = section.current;
        if (!h || !el) return;
        const d = drag.current;
        if (d?.on) {
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4 || d.moved) {
            d.moved = true;
            h.drag(dx * 0.006);
            d.x = e.clientX;
          }
          return;
        }
        if (e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        h.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
        el.style.cursor = !inText(e.target) && h.pick(e.clientX, e.clientY) ? "pointer" : "";
      }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, moved: false, on: !inText(e.target) };
      }}
      onPointerUp={() => {
        if (drag.current) drag.current.on = false;
      }}
      onPointerLeave={() => {
        handle.current?.setPointer(0, 0);
        if (drag.current) drag.current.on = false;
      }}
      onClick={(e) => {
        const h = handle.current;
        if (!h || inText(e.target) || drag.current?.moved) return;
        const hit = h.pick(e.clientX, e.clientY);
        if (hit === "phone") h.spawn(3);
        else if (hit) h.toggleOffline();
      }}
    >
      <div className="hero__scene" aria-hidden="true">
        <LedgerScene className="hero__canvas" onHandle={onHandle} onStats={setStats} />
      </div>
      <div className="wrap hero__inner">
        <div className="hero__text">
          <p className="hero__cmd" aria-hidden="true">
            <span className="status__prompt">$</span> <span className="hero__typed">cat joshua.md</span>
            <span className="hero__cursor" />
          </p>
          <h1 id="hero-title" className="hero__title" aria-label={intro.headline}>
            {words.map((w, i) => (
              <span key={i} aria-hidden="true">
                <span className="hero__word">
                  <span style={{ animationDelay: `${0.75 + i * 0.07}s` }}>{w}</span>
                </span>{" "}
              </span>
            ))}
          </h1>
          <p className="hero__lede hero__in" style={{ animationDelay: "1.35s" }}>
            {intro.body}
          </p>

          <div className="hero__actions hero__in" style={{ animationDelay: "1.5s" }}>
            <a href="#work" className="btn btn--primary">
              View work
            </a>
            <a href={person.resume} className="btn" target="_blank" rel="noopener noreferrer">
              Résumé
            </a>
          </div>

          <div className="status hero__in" style={{ animationDelay: "1.65s" }} role="group" aria-label="Live demo of Fico's offline sync">
            <p>
              <span className="status__prompt">$</span> <span className="status__cmd">fico sync --watch</span>
            </p>
            <p className="status__out status__live" aria-live="off">
              <span className={stats.offline ? "is-bad" : "is-ok"}>
                <i className="status__led" /> {stats.offline ? "link down" : "link up"}
              </span>
              <span>
                outbox <b key={`q${stats.queued}`}>{stats.queued}</b>
              </span>
              <span>
                synced <b key={`s${stats.synced}`}>{stats.synced}</b>
              </span>
            </p>
            <div className="status__actions">
              <button type="button" className="chip" disabled={!live} onClick={() => handle.current?.spawn(3)}>
                + add 3 records
              </button>
              <button type="button" className="chip" disabled={!live} onClick={() => handle.current?.toggleOffline()}>
                {stats.offline ? "reconnect" : "cut the link"}
              </button>
            </div>
            <p className="status__hint">
              This is how Fico saves money records with no signal. Drag the scene to turn it, or tap the phone and the link.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
