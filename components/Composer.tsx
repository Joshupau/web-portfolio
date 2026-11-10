"use client";

import { useEffect, useRef, useState } from "react";
import { openCase } from "@/components/CaseReader";
import { person, projects } from "@/lib/content";

type Reply = { text: string; ok: boolean };

const go = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return false;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  return true;
};
const scene = (name: "toggle" | "spawn") => window.dispatchEvent(new CustomEvent(`scene:${name}`));
const tab = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

const SUGGEST = ["fico", "kkyubbi", "kofi", "read fico", "loan demo", "experience", "go offline", "resume", "contact", "help"];

/** Runs one typed command and says what happened. No AI here: a small, honest command list. */
function run(raw: string): Reply {
  const q = raw.trim().toLowerCase().replace(/^[/>$]\s*/, "");
  if (!q) return { text: "Type a command, or pick one above.", ok: false };
  const has = (...w: string[]) => w.some((x) => q.includes(x));
  const project = projects.find((p) => q.includes(p.slug) || q.includes(p.name.toLowerCase().split(" ")[0]));

  if (has("help", "commands", "what can")) return { text: `Try: ${SUGGEST.filter((s) => s !== "help").join(", ")}.`, ok: true };
  if (project && has("read", "case", "open", "more", "detail", "write")) {
    openCase(project.slug);
    return { text: `Opened the ${project.name} write-up.`, ok: true };
  }
  if (project) {
    go(project.slug);
    return { text: `Here is ${project.name}. Type "read ${project.slug}" for the full write-up.`, ok: true };
  }
  if (has("loan", "amort", "schedule", "interest")) return go("loan-demo") ? { text: "Here is the loan schedule demo. Move the sliders.", ok: true } : { text: "The loan demo is not on this page.", ok: false };
  if (has("offline", "cut", "online", "reconnect", "sync")) {
    go("top");
    scene("toggle");
    return { text: "Toggled the link in the 3D scene at the top.", ok: true };
  }
  if (has("add", "record", "expense")) {
    go("top");
    scene("spawn");
    return { text: "Added three records to the phone.", ok: true };
  }
  if (has("resume", "résumé", "cv")) {
    tab(person.resume);
    return { text: "Opened the résumé in a new tab.", ok: true };
  }
  if (has("github", "code", "source")) {
    tab(person.github);
    return { text: "Opened GitHub in a new tab.", ok: true };
  }
  if (has("linkedin")) {
    tab(person.linkedin);
    return { text: "Opened LinkedIn in a new tab.", ok: true };
  }
  if (has("contact", "hire", "email", "mail", "message", "talk")) {
    go("contact");
    return { text: "The contact form is here. Messages go to Joshua's email.", ok: true };
  }
  if (has("experience", "job", "work history", "career")) {
    go("experience");
    return { text: "Three jobs, newest first.", ok: true };
  }
  if (has("work", "project")) {
    go("work");
    return { text: "Three projects: Fico, Kkyubbi and Kofi.", ok: true };
  }
  if (has("now", "next", "learning", "ai")) {
    go("now-next");
    return { text: "What he is doing now and learning next.", ok: true };
  }
  if (has("whoami", "who", "about", "joshua")) return { text: `${person.name}, software developer in ${person.location}. He builds fintech software with AI in the loop.`, ok: true };
  if (has("top", "home", "start")) {
    go("top");
    return { text: "Back at the top.", ok: true };
  }
  if (has("hello", "hi", "hey")) return { text: 'Hello. Type "help" to see what this prompt can do.', ok: true };
  return { text: `No command matches "${raw.trim()}". Type "help" for the list.`, ok: false };
}

export default function Composer() {
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [focus, setFocus] = useState(false);
  const [reply, setReply] = useState<Reply | null>(null);
  const timer = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer.current);
    };
  }, []);

  const submit = (text: string) => {
    const r = run(text);
    setReply(r);
    setValue("");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setReply(null), 6000);
    if (r.ok) input.current?.blur();
  };

  return (
    <div className={`composer${focus ? " is-open" : ""}`}>
      <div className="composer__inner">
        {reply && (
          <p className={`composer__reply${reply.ok ? "" : " is-bad"}`} role="status">
            <span aria-hidden="true">{reply.ok ? "●" : "×"}</span> {reply.text}
          </p>
        )}
        {focus && (
          <ul className="composer__chips" aria-label="Suggested commands">
            {SUGGEST.map((s) => (
              <li key={s}>
                {/* pointerdown so the tap lands before the input loses focus */}
                <button type="button" className="chip" onPointerDown={(e) => e.preventDefault()} onClick={() => submit(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
        <form
          className="composer__form"
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
        >
          <label htmlFor="composer" className="composer__caret">
            <span aria-hidden="true">&gt;</span>
            <span className="composer__sr">Type a command</span>
          </label>
          <input
            id="composer"
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
            placeholder='Type a command, like "fico" or "help"'
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="go"
          />
          <kbd className="composer__key" aria-hidden="true">/</kbd>
          <button type="submit" className="composer__send" aria-label="Run command">
            run
          </button>
        </form>
      </div>
    </div>
  );
}
