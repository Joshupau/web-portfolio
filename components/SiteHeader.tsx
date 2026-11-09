import Link from "next/link";
import { person } from "@/lib/content";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap site-header__row">
        <Link href="/" className="site-header__name">
          <span aria-hidden="true">~/</span>
          {person.name}
        </Link>
        <nav aria-label="Main" className="site-header__nav">
          <Link href="/#work">work</Link>
          <Link href="/#experience">experience</Link>
          <Link href="/#contact">contact</Link>
          <a href={person.resume}>resume</a>
        </nav>
      </div>
    </header>
  );
}
