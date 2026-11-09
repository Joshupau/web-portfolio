import LedgerScene from "@/components/scene/LedgerScene";
import { intro, person } from "@/lib/content";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__scene" aria-hidden="true">
        <LedgerScene className="hero__canvas" />
      </div>
      <div className="wrap hero__inner">
        <div className="hero__text">
          <h1 id="hero-title" className="hero__title">
            {intro.headline}
          </h1>
          <p className="hero__lede">{intro.body}</p>

          <div className="hero__actions">
            <a href="#work" className="btn btn--primary">
              View work
            </a>
            <a href={person.resume} className="btn">
              Résumé
            </a>
          </div>

          <div className="status" role="group" aria-label="Quick facts">
            <p>
              <span className="status__prompt">$</span> <span className="status__cmd">whoami</span>
            </p>
            <p className="status__out">{person.name}</p>
            <p>
              <span className="status__prompt">$</span> <span className="status__cmd">pwd</span>
            </p>
            <p className="status__out">{person.location}</p>
            <p>
              <span className="status__prompt">$</span> <span className="status__cmd">now</span>
            </p>
            <p className="status__out">
              Software Developer, Dee Global Software Corporation <span className="status__ok">(since Jun 2026)</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
