import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArchDiagram from "@/components/ArchDiagram";
import { projects } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return project ? { title: project.name, description: project.lead } : {};
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      <div className="case__head wrap">
        <Link href="/#work" className="case__back">
          <span aria-hidden="true">&lt;- </span>back to work
        </Link>
        <p className="case__path" aria-hidden="true">
          ~/work/{project.slug}/README.md
        </p>
        <h1>{project.name}</h1>
        <p>{project.lead}</p>
      </div>

      <div className="wrap">
        <div className="case__body">
          <dl className="facts">
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Built with</dt>
              <dd>
                <ul>
                  {project.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>Links</dt>
              <dd>
                <ul>
                  {project.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <div className="prose">
            {project.sections.map((s) => (
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
                    <Image src={s.figure.src} alt={s.figure.alt} width={s.figure.width} height={s.figure.height} sizes="(max-width: 900px) 100vw, 800px" />
                    <figcaption>{s.figure.caption}</figcaption>
                  </figure>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
