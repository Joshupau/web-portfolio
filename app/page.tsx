import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import Frame from "@/components/Frame";
import QuickAdd from "@/components/QuickAdd";
import SyncDemo from "@/components/SyncDemo";
import { education, experience, focus, person, projects } from "@/lib/content";

const accent: Record<string, string> = { fico: "#0a8f6a", kofi: "#6b3df0" };

export default function Home() {
  const [fico, kofi] = projects;
  return (
    <>
      <section className="x-hero wrap">
        <h1 className="x-name">
          <span>Joshua Paul</span>
          <span>De Guzman</span>
        </h1>
        <div className="x-hero__grid">
          <p className="x-tag">
            Full-stack developer. I build software with AI, and I’m getting better at building AI. Backend and fintech, from Zamboanga.
          </p>
          <QuickAdd />
        </div>
        <p className="x-demo-note">That box is live. It’s a small copy of how Fico reads an expense.</p>
      </section>

      <section id="work" className="x-work">
        <div className="wrap">
          <article className="x-proj" style={{ ["--c" as string]: accent.fico }}>
            <div className="x-proj__text">
              <p className="x-proj__year">{fico.year}</p>
              <h2>{fico.name}</h2>
              <p>{fico.lead}</p>
              <ul className="x-stack">
                {fico.stack.slice(0, 6).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <Link href={`/work/${fico.slug}`} className="x-link">
                Read how it works
              </Link>
            </div>
            <div className="x-proj__demo">
              <p className="x-demo-title">Try the offline part</p>
              <SyncDemo />
            </div>
          </article>

          <article className="x-proj x-proj--flip" style={{ ["--c" as string]: accent.kofi }}>
            <div className="x-proj__text">
              <p className="x-proj__year">{kofi.year}</p>
              <h2>Kofi</h2>
              <p>{kofi.lead}</p>
              <ul className="x-stack">
                {kofi.stack.slice(0, 6).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <Link href={`/work/${kofi.slug}`} className="x-link">
                Read the case study
              </Link>
            </div>
            <div className="x-proj__demo">
              <Frame src="/img/kofi.webp" alt="The Kofi marketplace home page" width={1600} height={979} host="kofi-nft-market.vercel.app" />
            </div>
          </article>
        </div>
      </section>

      <section id="approach" className="block">
        <div className="wrap">
          <h2 className="x-h2">How I work</h2>
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
          <h2 className="x-h2">Experience</h2>
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

      <section id="contact" className="block x-contact">
        <div className="wrap">
          <h2 className="x-h2">Let’s talk</h2>
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
