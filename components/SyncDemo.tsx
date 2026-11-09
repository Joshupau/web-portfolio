"use client";

import { useEffect, useRef, useState } from "react";

type Row = { id: number; label: string; synced: boolean };
const SAMPLES = ["Jeep fare", "Coffee", "Load", "Lunch", "Groceries", "Grab"];

export default function SyncDemo() {
  const [online, setOnline] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const next = useRef(1);
  const timers = useRef<number[]>([]);

  const flush = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setRows((cur) => {
      cur
        .filter((r) => !r.synced)
        .forEach((r, i) => {
          timers.current.push(
            window.setTimeout(() => setRows((c) => c.map((x) => (x.id === r.id ? { ...x, synced: true } : x))), 450 * (i + 1)),
          );
        });
      return cur;
    });
  };

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const add = () => {
    const id = next.current++;
    const label = SAMPLES[id % SAMPLES.length];
    setRows((c) => [{ id, label, synced: false }, ...c].slice(0, 6));
    if (online) {
      timers.current.push(window.setTimeout(() => setRows((c) => c.map((x) => (x.id === id ? { ...x, synced: true } : x))), 600));
    }
  };

  const toggle = () => {
    const nowOnline = !online;
    setOnline(nowOnline);
    if (nowOnline) window.setTimeout(flush, 0);
  };

  const pending = rows.filter((r) => !r.synced).length;
  const onServer = rows.filter((r) => r.synced);

  return (
    <div className="sd">
      <div className="sd__bar">
        <button type="button" onClick={add}>
          Add expense
        </button>
        <button type="button" onClick={toggle} aria-pressed={!online} className={online ? "" : "is-off"}>
          {online ? "Go offline" : "Back online"}
        </button>
        <span className="sd__status">{online ? "Connected" : "No connection"}</span>
      </div>
      <div className="sd__cols">
        <section aria-label="On the phone">
          <h4>On the phone</h4>
          <ul>
            {rows.map((r) => (
              <li key={r.id}>{r.label}</li>
            ))}
            {rows.length === 0 && <li className="sd__empty">Press Add expense</li>}
          </ul>
          <p className="sd__note">Saved instantly, online or not</p>
        </section>
        <section aria-label="Outbox">
          <h4>Outbox</h4>
          <p className="sd__count" aria-live="polite">
            {pending}
          </p>
          <p className="sd__note">{pending ? "waiting to sync" : "all sent"}</p>
        </section>
        <section aria-label="Server">
          <h4>Supabase</h4>
          <ul>
            {onServer.map((r) => (
              <li key={r.id}>{r.label}</li>
            ))}
            {onServer.length === 0 && <li className="sd__empty">Nothing yet</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
