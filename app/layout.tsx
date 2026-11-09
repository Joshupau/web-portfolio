import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { person } from "@/lib/content";

export const metadata: Metadata = {
  title: {
    default: `${person.name}, full-stack developer`,
    template: `%s | ${person.name}`,
  },
  description:
    "Full-stack developer in Zamboanga City. Accounting and loan systems, real-time backends, and local-first finance apps.",
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
          <div className="wrap">
            <span>
              © {new Date().getFullYear()} {person.name}
            </span>
            <span className="site-footer__links">
              <a href={person.github}>GitHub</a>
              <a href={person.linkedin}>LinkedIn</a>
            </span>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
