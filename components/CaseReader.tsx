"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import ArchDiagram from "@/components/ArchDiagram";
import { projects } from "@/lib/content";

export function openCase(slug: string) {
  window.dispatchEvent(new CustomEvent("case:open", { detail: slug }));
}

/** Full project write-ups, opened in place as a side sheet so the visitor never leaves the session. */
export default function CaseReader() {
  const refs = useRef<Record<string, HTMLDialogElement | null>>({});

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = refs.current[(e as CustomEvent<string>).detail];
      if (d && !d.open) {
        d.showModal();
        d.scrollTop = 0;
      }
    };
    window.addEventListener("case:open", onOpen);
    return () => window.removeEventListener("case:open", onOpen);
  }, []);

  return (
    <>
      {projects.map((p) => (
        <dialog
          key={p.slug}
          ref={(el) => {
            refs.current[p.slug] = el;
          }}
          className="reader"
          aria-labelledby={`reader-${p.slug}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) e.currentTarget.close(); // click on the backdrop
          }}
        >
          <div className="reader__sheet">
            <header className="reader__bar">
              <span className="reader__path">
                <span className="reader__tool">Read</span>(~/work/{p.slug}/README.md)
              </span>
              <form method="dialog">
                <button className="chip" aria-label="Close write-up">
                  close
                </button>
              </form>
            </header>
            <div className="reader__body">
              <h2 id={`reader-${p.slug}`}>{p.name}</h2>
              <p className="reader__lead">{p.lead}</p>
              <dl className="reader__facts">
                <div>
                  <dt>year</dt>
                  <dd>{p.year}</dd>
                </div>
                <div>
                  <dt>role</dt>
                  <dd>{p.role}</dd>
                </div>
                <div>
                  <dt>built with</dt>
                  <dd>{p.stack.join(", ")}</dd>
                </div>
              </dl>
              <div className="prose">
                {p.sections.map((s) => (
                  <section key={s.heading}>
                    <h2>{s.heading}</h2>
                    {s.body.map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                    {s.figure === "architecture" && (
                      <figure className="figure">
                        <ArchDiagram />
                      </figure>
                    )}
                    {s.figure && s.figure !== "architecture" && (
                      <figure className={s.figure.height > s.figure.width ? "figure figure--phone" : "figure"}>
                        <Image src={s.figure.src} alt={s.figure.alt} width={s.figure.width} height={s.figure.height} sizes="(max-width: 900px) 100vw, 700px" loading="lazy" />
                        <figcaption>{s.figure.caption}</figcaption>
                      </figure>
                    )}
                  </section>
                ))}
              </div>
              {p.links.length > 0 && (
                <p className="reader__links">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ))}
                </p>
              )}
            </div>
          </div>
        </dialog>
      ))}
    </>
  );
}
