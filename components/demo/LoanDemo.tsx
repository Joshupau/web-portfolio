"use client";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { schedule, type Method, type Row } from "../../lib/amortize";
import type { LoanData, LoanHandle } from "../scene/loan";

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const pesoWhole = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
/** centavos to "₱5,648.82" */
const money = (centavos: number) => peso.format(centavos / 100);

const METHODS: Array<{ id: Method; label: string }> = [
  { id: "diminishing", label: "Diminishing balance" },
  { id: "flat", label: "Flat rate" },
];

const DEFAULT_CAPTION = "Green is principal, amber is interest. Tap a bar for that month.";
const FALLBACK_CAPTION = "Green is principal, amber is interest. The full table is below.";

const CSS = `.ld{box-sizing:border-box;width:100%;min-width:0;padding:.75rem;border:1px solid var(--line);border-radius:var(--radius);background:var(--panel);color:var(--text);font:400 14px/1.45 var(--font-sans)}
.ld *{box-sizing:border-box}
.ld-controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:.25rem 1.1rem}
.ld-field{min-width:0}
.ld-head{display:flex;justify-content:space-between;align-items:baseline;gap:.5rem}
.ld-head label{color:var(--dim)}
.ld-head output{font:500 14px/1.45 var(--font-mono);font-variant-numeric:tabular-nums;white-space:nowrap}
.ld-field input{display:block;width:100%;height:44px;margin:0;padding:0;background:transparent;accent-color:var(--amber);cursor:pointer;touch-action:pan-y}
.ld-field input:focus-visible{outline:2px solid var(--ice);outline-offset:-6px;border-radius:6px}
.ld-toggle{display:flex;flex-wrap:wrap;gap:6px;margin:.3rem 0 .8rem}
.ld-toggle button{flex:1 1 132px;min-height:44px;margin:0;padding:0 12px;font:500 13px/1.2 var(--font-mono);border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--text);cursor:pointer;-webkit-tap-highlight-color:transparent}
.ld-toggle button:hover{border-color:var(--amber)}
.ld-toggle button:focus-visible{outline:2px solid var(--ice);outline-offset:2px}
.ld-toggle button[aria-pressed="true"]{border-color:var(--amber);color:var(--amber)}
.ld-figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(124px,1fr));gap:.5rem 1.1rem;margin:0 0 .8rem}
.ld-figs div{min-width:0}
.ld-figs dt{color:var(--dim);font-size:13px}
.ld-figs dd{margin:0;font:500 clamp(1.05rem,4.6vw,1.3rem)/1.3 var(--font-mono);font-variant-numeric:tabular-nums;white-space:nowrap}
.ld-chart{position:relative;width:100%;min-width:0;aspect-ratio:16/9;min-height:240px;max-height:360px;border:1px solid var(--line);border-radius:6px;background:var(--bg);overflow:hidden;touch-action:pan-y;cursor:grab}
.ld-stage{position:absolute;inset:0}
.ld-key{position:absolute;z-index:1;top:8px;left:10px;right:10px;display:flex;flex-wrap:wrap;gap:2px 12px;margin:0;padding:0;list-style:none;font:500 11px/1.5 var(--font-mono);color:var(--dim);pointer-events:none}
.ld-key li{display:flex;align-items:center;gap:5px;white-space:nowrap}
.ld-key i{display:block;width:9px;height:9px;border-radius:2px;background:var(--c)}
.ld-key i.ld-line{height:3px;width:14px;border-radius:1px}
.ld-fb{position:absolute;left:12px;right:12px;top:34px;bottom:12px;width:calc(100% - 24px);height:calc(100% - 46px)}
.ld-cap{min-height:3em;margin:.55rem 0 .3rem;font:500 12px/1.5 var(--font-mono);font-variant-numeric:tabular-nums;color:var(--dim);overflow-wrap:anywhere}
.ld-cap b{font-weight:500;color:var(--text)}
.ld-details summary{min-height:44px;padding:.7rem 0;color:var(--text);cursor:pointer;border-radius:6px}
.ld-details summary:hover{color:var(--amber)}
.ld-details summary:focus-visible{outline:2px solid var(--ice);outline-offset:-2px}
.ld-scroll{max-width:100%;max-height:22rem;overflow:auto;border:1px solid var(--line);border-radius:6px;background:var(--bg)}
.ld-scroll:focus-visible{outline:2px solid var(--ice);outline-offset:2px}
.ld-table{width:100%;min-width:430px;border-collapse:collapse;font:400 12px/1.4 var(--font-mono);font-variant-numeric:tabular-nums}
.ld-table th,.ld-table td{padding:.36rem .7rem;text-align:right;white-space:nowrap;border-bottom:1px solid var(--line)}
.ld-table thead th{font-weight:500;color:var(--dim)}
.ld-table tbody th{font-weight:400;color:var(--dim)}
.ld-table tbody tr:last-child>*{border-bottom:0}
.ld-table tr.ld-on>*{background:var(--panel-2);color:var(--text)}
.ld-note{margin:.5rem 0 0;font-size:12px;color:var(--dim)}
@media (max-width:480px){.ld-cap{min-height:4.5em}}
@media (prefers-reduced-motion:no-preference){.ld-toggle button{transition:border-color .15s,color .15s}}`;

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const prefersLessMotion = () => window.matchMedia(MOTION_QUERY).matches;
function watchMotion(onChange: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Counts toward the new value over about a quarter of a second. */
function useCountTo(target: number, reduced: boolean) {
  const [shown, setShown] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (reduced) {
      cur.current = target;
      return;
    }
    const start = cur.current;
    if (start === target) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 250);
      const value = Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3)));
      cur.current = value;
      setShown(value);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return reduced ? target : shown;
}

function Figure({ label, value, reduced }: { label: string; value: number; reduced: boolean }) {
  const shown = useCountTo(value, reduced);
  return (
    <div>
      <dt>{label}</dt>
      <dd>{money(shown)}</dd>
    </div>
  );
}

/**
 * A loan schedule calculator with a 3D chart: one bar per month, principal below and
 * interest on top, and a line for the balance still owed. The table underneath carries
 * the same numbers for anyone who cannot use the chart.
 */
export default function LoanDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<LoanHandle | null>(null);
  const dataRef = useRef<LoanData | null>(null);
  const [failed, setFailed] = useState(false);
  // null until the page is live in the browser, then follows the system setting
  const reduced = useSyncExternalStore<boolean | null>(watchMotion, prefersLessMotion, () => null);
  const [amount, setAmount] = useState(120000);
  const [rate, setRate] = useState(12);
  const [months, setMonths] = useState(24);
  const [method, setMethod] = useState<Method>("diminishing");
  const [picked, setPicked] = useState<number | null>(null);

  const { plan, data } = useMemo(() => {
    const input = { principal: amount * 100, annualRatePct: rate, months };
    const both = {
      diminishing: schedule({ ...input, method: "diminishing" }),
      flat: schedule({ ...input, method: "flat" }),
    };
    // one height scale for both methods, so switching shows which one costs more per month
    const max = Math.max(...both.diminishing.rows.map((r) => r.payment), ...both.flat.rows.map((r) => r.payment));
    const chosen = both[method];
    const chart: LoanData = {
      bars: chosen.rows.map((r) => ({ principal: r.principal, interest: r.interest, balance: r.balance })),
      max,
      loan: input.principal,
    };
    return { plan: chosen, data: chart };
  }, [amount, rate, months, method]);

  useEffect(() => {
    dataRef.current = data;
    handleRef.current?.setData(data);
  }, [data]);

  useEffect(() => {
    if (reduced === null) return;
    const host = stageRef.current;
    if (!host) return;
    let disposed = false;
    let handle: LoanHandle | null = null;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let visible = true;
    const mqs = [window.matchMedia("(prefers-color-scheme: light)")];

    const sync = () => handle?.setRunning(visible && !document.hidden);
    const onScheme = () => handle?.refreshColors();
    const onVis = () => sync();

    import("../scene/loan")
      .then(({ createLoanChart }) => {
        if (disposed) return;
        try {
          handle = createLoanChart(host, {
            reduced,
            onPick: (i) => !disposed && setPicked(i),
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
        if (dataRef.current) handle.setData(dataRef.current);
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
      setPicked(null);
    };
  }, [reduced]);

  const row: Row | null = picked !== null && picked < plan.rows.length ? plan.rows[picked] : null;
  const still = reduced === true;

  return (
    <div className="ld" role="group" aria-label="Loan schedule calculator">
      <style>{CSS}</style>

      <div className="ld-controls">
        <div className="ld-field">
          <div className="ld-head">
            <label htmlFor="ld-amount">Loan amount</label>
            <output htmlFor="ld-amount">{pesoWhole.format(amount)}</output>
          </div>
          <input
            id="ld-amount"
            type="range"
            min={10000}
            max={1000000}
            step={5000}
            value={amount}
            aria-valuetext={`${amount.toLocaleString("en-PH")} pesos`}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div className="ld-field">
          <div className="ld-head">
            <label htmlFor="ld-rate">Yearly interest</label>
            <output htmlFor="ld-rate">{rate}%</output>
          </div>
          <input
            id="ld-rate"
            type="range"
            min={0}
            max={36}
            step={0.5}
            value={rate}
            aria-valuetext={`${rate} percent a year`}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>
        <div className="ld-field">
          <div className="ld-head">
            <label htmlFor="ld-months">Months</label>
            <output htmlFor="ld-months">{months}</output>
          </div>
          <input
            id="ld-months"
            type="range"
            min={3}
            max={60}
            step={1}
            value={months}
            aria-valuetext={`${months} months`}
            onChange={(e) => setMonths(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="ld-toggle" role="group" aria-label="How interest is charged">
        {METHODS.map((m) => (
          <button key={m.id} type="button" aria-pressed={method === m.id} onClick={() => setMethod(m.id)}>
            {m.label}
          </button>
        ))}
      </div>

      <dl className="ld-figs">
        <Figure label="Monthly payment" value={plan.payment} reduced={still} />
        <Figure label="Total interest" value={plan.totalInterest} reduced={still} />
        <Figure label="Total paid" value={plan.totalPaid} reduced={still} />
      </dl>

      <div className="ld-chart">
        <div ref={stageRef} className="ld-stage">
          {failed && <FlatChart data={data} />}
        </div>
        <ul className="ld-key" aria-hidden="true">
          <li>
            <i style={{ ["--c" as string]: "var(--mint)" }} />
            principal
          </li>
          <li>
            <i style={{ ["--c" as string]: "var(--amber)" }} />
            interest
          </li>
          <li>
            <i className="ld-line" style={{ ["--c" as string]: "var(--ice)" }} />
            balance left
          </li>
        </ul>
      </div>

      <p className="ld-cap">
        {row ? (
          <>
            <b>Month {row.n}:</b> pays {money(row.payment)} ({money(row.principal)} principal, {money(row.interest)}{" "}
            interest), {money(row.balance)} left
          </>
        ) : failed ? (
          FALLBACK_CAPTION
        ) : (
          DEFAULT_CAPTION
        )}
      </p>

      <details className="ld-details">
        <summary>Show the full table</summary>
        <div className="ld-scroll" tabIndex={0} role="region" aria-label="Payment schedule table">
          <table className="ld-table">
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Payment</th>
                <th scope="col">Interest</th>
                <th scope="col">Principal</th>
                <th scope="col">Balance</th>
              </tr>
            </thead>
            <tbody>
              {plan.rows.map((r) => (
                <tr key={r.n} className={row && row.n === r.n ? "ld-on" : undefined}>
                  <th scope="row">{r.n}</th>
                  <td>{money(r.payment)}</td>
                  <td>{money(r.interest)}</td>
                  <td>{money(r.principal)}</td>
                  <td>{money(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="ld-note">Amounts are computed in whole centavos, and the last payment absorbs the rounding.</p>
    </div>
  );
}

/** No-WebGL fallback: the same stacked bars drawn flat, colors from CSS variables. */
function FlatChart({ data }: { data: LoanData }) {
  const n = data.bars.length;
  const slot = 100 / n;
  const w = slot * 0.74;
  const h = (v: number) => (v / (data.max || 1)) * 50;
  const line = [`0,${0}`]
    .concat(data.bars.map((b, i) => `${(slot * (i + 0.5)).toFixed(2)},${(50 - (b.balance / (data.loan || 1)) * 50).toFixed(2)}`))
    .join(" ");
  return (
    <svg className="ld-fb" viewBox="0 0 100 50" preserveAspectRatio="none" role="presentation">
      {data.bars.map((b, i) => {
        const x = slot * i + (slot - w) / 2;
        const p = h(b.principal);
        const t = h(b.interest);
        return (
          <g key={i}>
            <rect x={x} y={50 - p} width={w} height={p} fill="var(--mint)" />
            <rect x={x} y={50 - p - t} width={w} height={t} fill="var(--amber)" />
          </g>
        );
      })}
      <polyline points={line} fill="none" stroke="var(--ice)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
