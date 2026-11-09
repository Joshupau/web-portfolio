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
                <a href={person.github}>GitHub</a>
              </li>
              <li>
                <a href={person.linkedin}>LinkedIn</a>
              </li>
              <li>
                <a href={person.resume}>Résumé (PDF)</a>
              </li>
            </ul>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
