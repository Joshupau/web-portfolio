import Link from "next/link";
import { person } from "@/lib/content";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-header__name">
        {person.name}
      </Link>
      <nav aria-label="Main" className="site-header__nav">
        <Link href="/#work">Work</Link>
        <Link href="/#approach">How I work</Link>
        <Link href="/#experience">Experience</Link>
        <Link href="/#contact">Contact</Link>
        <a href={person.resume}>Résumé</a>
      </nav>
    </header>
  );
}
