import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { education, experience, focus, intro, person, projects } from "@/lib/content";

export default function Home() {
  return (
    <>
      <section className="hero wrap">
        <h1>{intro.headline}</h1>
        <p>{intro.body}</p>
      </section>

      <section id="work" className="block">
        <div className="wrap">
          <h2>Work</h2>
          <div className="statement">
            {projects.map((p, i) => (
              <Link key={p.slug} href={`/work/${p.slug}`} className="entry" style={{ ["--i" as string]: i }}>
                <span className="entry__title">
                  {p.name}
                  <span className="entry__leader" aria-hidden="true" />
                  <span className="entry__year">{p.year}</span>
                </span>
                <span className="entry__summary">{p.summary}</span>
                <span className="entry__stack">{p.stack.slice(0, 4).join(", ")}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="approach" className="block">
        <div className="wrap">
          <h2>How I work</h2>
          <div className="history">
            {focus.map((f) => (
              <div className="job" key={f.label}>
                <p className="job__when">{f.label}</p>
                <div>
                  <h3>{f.title}</h3>
                  <ul>
                    {f.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="block">
        <div className="wrap">
          <h2>Experience</h2>
          <div className="history">
            {experience.map((job) => (
              <div className="job" key={job.org}>
                <p className="job__when">{job.period}</p>
                <div>
                  <h3>
                    {job.role}, {job.org}
                  </h3>
                  <ul>
                    {job.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            <div className="job">
              <p className="job__when">{education.period}</p>
              <div>
                <h3>
                  {education.degree}, {education.school}
                </h3>
                <ul>
                  <li>{education.note}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="block">
        <div className="wrap">
          <h2>Contact</h2>
          <div className="contact">
            <div className="contact__aside">
              <span>{person.location}</span>
              <a href={person.github}>GitHub</a>
              <a href={person.linkedin}>LinkedIn</a>
              <a href={person.resume}>Résumé (PDF)</a>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
