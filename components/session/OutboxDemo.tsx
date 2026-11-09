"use client";

import { useEffect, useRef, useState } from "react";
import s from "./session.module.css";

type Row = { id: number; label: string; synced: boolean };
const SAMPLES = ["jeep fare 13", "coffee 120", "load 50", "lunch 80", "groceries 640"];

// A small terminal-style version of Fico's offline queue: add records, go offline, watch them wait, reconnect, watch them replay.
export default function OutboxDemo() {
  const [online, setOnline] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const next = useRef(1);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const mark = (id: number) => setRows((c) => c.map((r) => (r.id === id ? { ...r, synced: true } : r)));

  const add = () => {
    const id = next.current++;
    setRows((c) => [{ id, label: SAMPLES[id % SAMPLES.length], synced: false }, ...c].slice(0, 6));
    if (online) timers.current.push(window.setTimeout(() => mark(id), 600));
  };

  const toggle = () => {
    const goingOnline = !online;
    setOnline(goingOnline);
    if (goingOnline) {
      rows
        .filter((r) => !r.synced)
        .reverse()
        .forEach((r, i) => timers.current.push(window.setTimeout(() => mark(r.id), 450 * (i + 1))));
    }
  };

  const queued = rows.filter((r) => !r.synced).length;
  return (
    <div className={s.demo}>
      <div className={s.demoBar}>
        <button type="button" onClick={add}>
          add record
        </button>
        <button type="button" onClick={toggle} aria-pressed={!online}>
          {online ? "go offline" : "go online"}
        </button>
        <span className={online ? s.ok : s.bad} role="status">
          {online ? "online" : `offline, ${queued} waiting`}
        </span>
      </div>
      <ul className={s.demoList} aria-label="Records on the phone">
        {rows.length === 0 && <li className={s.dim}>no records yet, press add record</li>}
        {rows.map((r) => (
          <li key={r.id}>
            <span className={r.synced ? s.ok : s.bad}>{r.synced ? "synced " : "queued "}</span>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
