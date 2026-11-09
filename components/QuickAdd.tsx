"use client";

import { useEffect, useRef, useState } from "react";

type Parsed = { kind: "expense" | "transfer"; amount: number; category: string; wallet: string; to?: string; label: string };

const CATEGORIES: [RegExp, string][] = [
  [/lunch|dinner|breakfast|food|coffee|snack|meal|jollibee/i, "Food"],
  [/grab|taxi|jeep|fare|bus|gas|fuel|toll/i, "Transport"],
  [/load|bill|wifi|water|electric|rent/i, "Bills"],
  [/movie|netflix|game|spotify/i, "Fun"],
];
const WALLETS = ["gcash", "maya", "bdo", "gotyme", "bpi", "cash"];

export function parse(text: string): Parsed | null {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(k)?/i);
  if (!m) return null;
  const amount = parseFloat(m[1].replace(",", ".")) * (m[2] ? 1000 : 1);
  if (!amount) return null;
  const found = WALLETS.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(text));
  const pretty = (w: string) => (w === "gcash" ? "GCash" : w === "gotyme" ? "GoTyme" : w === "bdo" || w === "bpi" ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1));
  if (/^\s*transfer|\bto\b/i.test(text) && found.length >= 2) {
    return { kind: "transfer", amount, category: "Transfer", wallet: pretty(found[0]), to: pretty(found[1]), label: "Transfer" };
  }
  const category = CATEGORIES.find(([re]) => re.test(text))?.[1] ?? "Other";
  const label = text.replace(m[0], "").replace(new RegExp(`\\b(${WALLETS.join("|")})\\b`, "gi"), "").replace(/\s+/g, " ").trim() || category;
  return { kind: "expense", amount, category, wallet: pretty(found[0] ?? "cash"), label: label[0].toUpperCase() + label.slice(1) };
}

const peso = (n: number) => "₱" + n.toLocaleString("en-PH", { maximumFractionDigits: 0 });
const BUDGET = 1500;
const SCRIPT = "80 lunch cash";

export default function QuickAdd() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<Parsed[]>([]);
  const touched = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setText(SCRIPT);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      i++;
      setText(SCRIPT.slice(0, i));
      if (i >= SCRIPT.length) window.clearInterval(id);
    }, 110);
    return () => window.clearInterval(id);
  }, []);

  const live = parse(text);
  const spent = items.filter((p) => p.kind === "expense").reduce((s, p) => s + p.amount, 0);
  const left = BUDGET - spent - (live && live.kind === "expense" ? live.amount : 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!live) return;
    setItems((a) => [live, ...a].slice(0, 4));
    setText("");
    touched.current = true;
  };

  return (
    <div className="qa" aria-label="Quick-add demo">
      <p className="qa__safe">
        <span>Safe to spend today</span>
        <strong aria-live="polite">{peso(Math.max(left, 0))}</strong>
      </p>
      <form onSubmit={submit} className="qa__form">
        <label htmlFor="qa-input" className="qa__hint">
          Type an expense like you’d text it
        </label>
        <div className="qa__row">
          <input
            id="qa-input"
            value={text}
            onChange={(e) => {
              touched.current = true;
              setText(e.target.value);
            }}
            placeholder="transfer 2k bdo to gotyme"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" disabled={!live}>
            Add
          </button>
        </div>
      </form>
      <div className="qa__parsed" aria-live="polite">
        {live ? (
          <>
            <span className="qa__amt">{peso(live.amount)}</span>
            <span>{live.kind === "transfer" ? `${live.wallet} to ${live.to}` : `${live.category}, ${live.wallet}`}</span>
          </>
        ) : (
          <span className="qa__muted">Waiting for an amount</span>
        )}
      </div>
      {items.length > 0 && (
        <ul className="qa__list">
          {items.map((p, i) => (
            <li key={i}>
              <span>{p.kind === "transfer" ? `${p.wallet} to ${p.to}` : p.label}</span>
              <span>{peso(p.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
