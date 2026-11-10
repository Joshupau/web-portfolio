import { person } from "@/lib/content";

// Plain anchors on purpose: they work as same-page jumps on the home page and as normal links elsewhere.
export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap site-header__row">
        <a href="/" className="site-header__name">
          <span aria-hidden="true">~/</span>
          {person.name}
        </a>
        <nav aria-label="Main" className="site-header__nav">
          <a href="/#work">work</a>
          <a href="/#experience">experience</a>
          <a href="/#contact">contact</a>
          <a href={person.resume} target="_blank" rel="noopener noreferrer">
            resume
          </a>
        </nav>
      </div>
    </header>
  );
}
