import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource-variable/archivo/wdth.css";
import "./theme.css";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { person } from "@/lib/content";

export const metadata: Metadata = {
  title: {
    default: `${person.name}, fintech developer`,
    template: `%s | ${person.name}`,
  },
  description:
    "Full-stack developer in Zamboanga City building fintech software with AI in the loop: accounting and loan systems, real-time backends, and an offline-first finance app.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="wrap site-footer__row">
            <span>
              © {new Date().getFullYear()} {person.name}
            </span>
            <nav aria-label="Elsewhere" className="site-footer__links">
              <a href={person.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={person.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href={person.resume} target="_blank" rel="noopener noreferrer">Résumé</a>
            </nav>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
