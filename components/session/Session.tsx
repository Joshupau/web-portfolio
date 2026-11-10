"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import MiniScene from "@/components/scene/MiniScene";
import OutboxDemo from "./OutboxDemo";
import { education, person } from "@/lib/content";
import { fico_, jobs, kofi_, kkyubbi_, nowNext, prompt, statusMark, tasks, type TaskStatus } from "@/lib/session";
import s from "./session.module.css";

type Phase = "static" | "wait" | "run" | "done";

/** A tool call that "runs" the first time it scrolls into view: the dot spins, then the output streams in. */
function Tool({ name, args, open = true, children }: { name: string; args: ReactNode; open?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const [phase, setPhase] = useState<Phase>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || !open || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return; // already on screen: leave as is
    setPhase("wait");
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setPhase("run");
        timer = window.setTimeout(() => setPhase("done"), 520);
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [open]);

  return (
    <details ref={ref} className={`${s.tool} ${s[phase]}`} open={open}>
      <summary>
        <span className={s.dot} aria-hidden="true" />
        <span className={s.name}>{name}</span>
        <span className={s.args}>({args})</span>
        <span className={s.running} aria-hidden="true">running</span>
      </summary>
      <div className={s.result}>{children}</div>
    </details>
  );
}

function Path({ children }: { children: ReactNode }) {
  return <span className={s.path}>{children}</span>;
}

function Say({ children }: { children: ReactNode }) {
  return <p className={s.say}>{children}</p>;
}

function TaskList({ active }: { active: string }) {
  return (
    <ol className={s.tasks}>
      {tasks.map((t) => (
        <li key={t.id}>
          <a href={`#${t.id}`} aria-current={active === t.id ? "location" : undefined}>
            <span className={`${s.mark} ${s[t.status]}`} aria-hidden="true">
              {statusMark[t.status].mark}
            </span>
            <span className={s.tlabel}>
              {t.label}
              <span className={s.tmeta}>
                {t.meta}
                <span className={s.sr}>, {statusMark[t.status].word}</span>
              </span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

function Badge({ status }: { status: TaskStatus }) {
  return <span className={`${s.badge} ${s[status]}`}>{statusMark[status].mark} {statusMark[status].word}</span>;
}

export default function Session() {
  const [active, setActive] = useState(tasks[0].id);

  useEffect(() => {
    const els = tasks.map((t) => document.getElementById(t.id)).filter((e): e is HTMLElement => !!e);
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const done = tasks.filter((t) => t.status === "done").length;

  // rail progress line follows the scroll position through the transcript
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / Math.max(1, r.height)));
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={s.session} ref={root}>
      <details
        className={s.bar}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) e.currentTarget.open = false;
        }}
      >
        <summary>
          <span className={s.name}>Tasks</span> <span className={s.dim}>{done} of {tasks.length} done</span>
        </summary>
        <TaskList active={active} />
      </details>

      <aside className={s.rail} aria-label="Task list">
        <p className={s.railHead}>Tasks <span className={s.dim}>{done}/{tasks.length} done</span></p>
        <TaskList active={active} />
      </aside>

      <div className={s.transcript}>
        <section className={s.turn} aria-labelledby="s-user">
          <h2 id="s-user" className={s.sr}>The request</h2>
          <p className={s.user}><span className={s.caret} aria-hidden="true">&gt;</span> {prompt.user}<span className={s.cursor} aria-hidden="true" /></p>
          <Say>{prompt.agent}</Say>
        </section>

        <section id="fico" className={s.turn} aria-labelledby="h-fico">
          <h2 id="h-fico" className={s.title}>Fico <Badge status="done" /></h2>
          <Say>{fico_.sentence}</Say>

          <Tool name="Bash" args={fico_.tests.command}>
            <p className={s.note}>{fico_.tests.sentence}</p>
            <ul className={s.lines}>
              {fico_.tests.areas.map((a) => (
                <li key={a}><span className={s.ok}>covers</span> {a}</li>
              ))}
            </ul>
          </Tool>

          <Tool name="Bash" args={<>quick-add <span className={s.str}>&quot;{fico_.quickAdd.examples[0].input}&quot;</span></>}>
            <p className={s.note}>{fico_.quickAdd.sentence}</p>
            {fico_.quickAdd.examples.map((ex) => (
              <pre key={ex.input} className={s.pre}>
                <span className={s.dim}>$ </span>
                <span className={s.str}>&quot;{ex.input}&quot;</span>
                {"\n"}
                {ex.out.join("\n")}
              </pre>
            ))}
          </Tool>

          <Tool name="Edit" args={<Path>{fico_.sync.path}</Path>}>
            <p className={s.note}>{fico_.sync.sentence}</p>
            <pre className={s.diff} aria-label="Code change sketch">
              {fico_.sync.diff.map((l, i) => (
                <span key={i} className={s[l.k]}>
                  {l.k === "add" ? "+ " : l.k === "del" ? "- " : "  "}
                  {l.t}
                  {"\n"}
                </span>
              ))}
            </pre>
            <p className={s.dim}>{fico_.sync.note}</p>
          </Tool>

          <Tool name="Run" args="outbox demo">
            <p className={s.note}>Try it: add records, go offline, then back online and watch the queue flush.</p>
            <OutboxDemo />
          </Tool>

          <Tool name="Read" args={<Path>screenshots/</Path>}>
            <p className={s.note}>Three screens of the Android app: dashboard, activity, insights.</p>
            <ul className={s.phones}>
              {fico_.shots.map((p) => (
                <li key={p.src}>
                  <figure className={s.phone}>
                    <Image src={p.src} alt={p.alt} width={376} height={831} sizes="(max-width: 700px) 60vw, 200px" />
                  </figure>
                  <span className={s.cap}>{p.cap}</span>
                </li>
              ))}
            </ul>
          </Tool>

          <Tool name="Read" args={<Path>stack, links</Path>}>
            <ul className={s.lines}>
              {fico_.also.map((a) => <li key={a}>{a}</li>)}
              <li><span className={s.dim}>stack </span>{fico_.stack.join(", ")}</li>
              {fico_.links.map((l) => (
                <li key={l.href}><span className={s.dim}>{l.label.toLowerCase()} </span><a href={l.href}>{l.href.replace("https://", "")}</a></li>
              ))}
            </ul>
          </Tool>
        </section>

        <section id="kkyubbi" className={s.turn} aria-labelledby="h-kky">
          <h2 id="h-kky" className={s.title}>Kkyubbi <Badge status="active" /></h2>
          <Say>{kkyubbi_.sentence}</Say>

          <Tool name="Run" args="module demo">
            <p className={s.note}>{kkyubbi_.demo}</p>
            <MiniScene kind="cube" />
          </Tool>

          <Tool name="Read" args={<Path>architecture</Path>}>
            <ul className={s.lines}>
              {kkyubbi_.points.map((p) => <li key={p}>{p}</li>)}
              <li><span className={s.dim}>stack </span>{kkyubbi_.stack.join(", ")}</li>
              <li><span className={s.dim}>status </span>{kkyubbi_.status}</li>
            </ul>
          </Tool>
        </section>

        <section id="kofi" className={s.turn} aria-labelledby="h-kofi">
          <h2 id="h-kofi" className={s.title}>Kofi NFT Marketplace <Badge status="done" /></h2>
          <Say>{kofi_.sentence}</Say>
          <Tool name="Run" args="mint demo">
            <p className={s.note}>A toy version of the flow: mint a token, list it, buy it.</p>
            <MiniScene kind="token" />
          </Tool>
          <Tool name="Read" args={<Path>{kofi_.host}</Path>}>
            <figure className={s.browser}>
              <div className={s.browserBar} aria-hidden="true"><i /><i /><i /><span>{kofi_.host}</span></div>
              <Image src={kofi_.img.src} alt={kofi_.img.alt} width={kofi_.img.width} height={kofi_.img.height} sizes="(max-width: 900px) 100vw, 640px" />
            </figure>
            <ul className={s.lines}>
              <li>{kofi_.how}</li>
              <li><span className={s.dim}>stack </span>{kofi_.stack.join(", ")}</li>
              {kofi_.links.map((l) => (
                <li key={l.href}><span className={s.dim}>{l.label.toLowerCase()} </span><a href={l.href}>{l.href.replace("https://", "")}</a></li>
              ))}
            </ul>
          </Tool>
        </section>

        <section id="experience" className={s.turn} aria-labelledby="h-exp">
          <h2 id="h-exp" className={s.title}>Experience</h2>
          <Say>Three jobs, each closed out as a task. The current one is still open.</Say>
          {jobs.map(({ id, status, sentence, job }) => (
            <div key={id} id={id} className={s.job}>
              <h3 className={s.jobHead}>
                {job.role}, {job.org} <Badge status={status} />
              </h3>
              <p className={s.note}>{sentence} <span className={s.dim}>{job.period}.</span></p>
              <Tool name="Read" args={<Path>{job.org.toLowerCase().replace(/[^a-z]+/g, "-")}</Path>} open={status === "active"}>
                <ul className={s.lines}>
                  {job.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </Tool>
            </div>
          ))}
          <Tool name="Read" args={<Path>education</Path>} open={false}>
            <ul className={s.lines}>
              <li>{education.degree}, {education.school}, {education.period}.</li>
              <li>{education.note}.</li>
            </ul>
          </Tool>
        </section>

        <section id="now-next" className={s.turn} aria-labelledby="h-now">
          <h2 id="h-now" className={s.title}>Now and next <Badge status="active" /></h2>
          <Say>{nowNext.sentence}</Say>
          <Tool name="Plan" args="now">
            <ul className={s.lines}>
              {nowNext.now.map((p) => <li key={p}><span className={s.ok}>[x]</span> {p}</li>)}
            </ul>
          </Tool>
          <Tool name="Plan" args="next">
            <ul className={s.lines}>
              {nowNext.next.map((p) => <li key={p}><span className={s.dim}>[ ]</span> {p}</li>)}
            </ul>
          </Tool>
          <Say>{nowNext.open}</Say>
          <p className={s.links}>
            <a href={person.github}>GitHub</a>
            <a href={person.linkedin}>LinkedIn</a>
            <a href={person.resume}>Resume (PDF)</a>
          </p>
        </section>
      </div>
    </div>
  );
}
