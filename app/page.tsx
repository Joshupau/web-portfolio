import CaseReader from "@/components/CaseReader";
import Composer from "@/components/Composer";
import ContactForm from "@/components/ContactForm";
import Hero from "@/components/Hero";
import Session from "@/components/session/Session";
import { person } from "@/lib/content";

export default function Home() {
  return (
    <>
      <Hero />

      <div id="work" className="anchor">
        <Session />
      </div>

      <section id="contact" className="section" aria-labelledby="contact-title">
        <div className="wrap">
          <h2 id="contact-title" className="section__title">
            <span aria-hidden="true">$ </span>mail --to joshua
          </h2>
          <div className="contact">
            <ul className="contact__aside">
              <li>{person.location}</li>
              <li>
                <a href={person.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              </li>
              <li>
                <a href={person.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </li>
              <li>
                <a href={person.resume} target="_blank" rel="noopener noreferrer">Résumé (PDF)</a>
              </li>
            </ul>
            <ContactForm />
          </div>
        </div>
      </section>

      <CaseReader />
      <Composer />
    </>
  );
}
