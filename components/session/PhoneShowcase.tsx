"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import s from "./showcase.module.css";

export type Shot = {
  src: string;
  alt: string;
  cap: string;
  /** numbered callouts; x and y are percentages of the screenshot */
  notes: { x: number; y: number; title: string; text: string }[];
};

const EDGE = [1, 2, 3, 4, 5, 6]; // stacked plates that give the phone a real edge when it turns

/** Three app screens as real 3D phones: the front one follows the pointer, callouts explain what is on screen. */
export default function PhoneShowcase({ shots }: { shots: Shot[] }) {
  const [active, setActive] = useState(0);
  const [note, setNote] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const pick = (i: number) => {
    setActive((i + shots.length) % shots.length);
    setNote(0);
  };

  // tilt the stage toward the pointer (mouse only), eased in one rAF loop that sleeps when settled
  useEffect(() => {
    const el = stage.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.setProperty("--rx", `${(-cy * 7).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(cx * 14).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${(50 + cx * 40).toFixed(1)}%`);
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      kick();
    };
    const leave = () => {
      tx = ty = 0;
      kick();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const shot = shots[active];

  return (
    <div className={s.show}>
      <div className={s.tabs} role="group" aria-label="App screen">
        {shots.map((p, i) => (
          <button key={p.src} type="button" aria-pressed={i === active} onClick={() => pick(i)}>
            {p.cap}
          </button>
        ))}
      </div>

      <div className={s.body}>
        <div
          ref={stage}
          className={s.stage}
          onPointerDown={(e) => {
            swipe.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const d = swipe.current;
            swipe.current = null;
            if (!d) return;
            const dx = e.clientX - d.x;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - d.y) * 1.5) pick(active + (dx < 0 ? 1 : -1));
          }}
          onPointerCancel={() => {
            swipe.current = null;
          }}
        >
          <div className={s.floor} aria-hidden="true" />
          {shots.map((p, i) => {
            const rel = ((i - active + shots.length + 1) % shots.length) - 1; // -1 left, 0 front, 1 right
            const front = rel === 0;
            return (
              <div key={p.src} className={`${s.slot} ${front ? s.front : rel < 0 ? s.left : s.right}`}>
                <div className={s.phone}>
                  {EDGE.map((n) => (
                    <i key={n} className={s.plate} style={{ transform: `translateZ(${-n * 2.4}px)` }} aria-hidden="true" />
                  ))}
                  <div className={s.face}>
                    <Image src={p.src} alt={front ? p.alt : ""} width={376} height={831} sizes="(max-width: 700px) 60vw, 260px" draggable={false} />
                    <span className={s.glare} aria-hidden="true" />
                  </div>
                  {front && (
                    <div className={s.pins}>
                      {p.notes.map((n, k) => (
                        <button
                          key={n.title}
                          type="button"
                          className={`${s.pin} ${k === note ? s.on : ""}`}
                          style={{ left: `${n.x}%`, top: `${n.y}%` }}
                          aria-label={`${k + 1}: ${n.title}`}
                          onClick={() => setNote(k)}
                        >
                          {k + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  {!front && (
                    <button type="button" className={s.cover} onClick={() => pick(i)} aria-label={`Show ${p.cap}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <ol className={s.notes} aria-label={`What is on the ${shot.cap} screen`}>
          {shot.notes.map((n, k) => (
            <li key={`${active}-${n.title}`} style={{ animationDelay: `${k * 70}ms` }}>
              <button type="button" className={k === note ? s.on : ""} aria-pressed={k === note} onClick={() => setNote(k)}>
                <span className={s.num} aria-hidden="true">{k + 1}</span>
                <span>
                  <b>{n.title}</b>
                  <span className={s.text}>{n.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className={s.hint}>Swipe or tap a phone to change screens. Tap a number to see what it points at.</p>
    </div>
  );
}
