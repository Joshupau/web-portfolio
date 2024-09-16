import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react"
import Header from "@/components/header";
import Navbar from "@/components/navbar";
import ActiveSectionContextProvider from "@/context/active-section-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Joshua De Guzman - Portfolio",
  description: "Joshua De Guzman is a fresh graduate web developer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark !scroll-smooth">
      <body className={inter.className}>
        <main className="relative overflow-hidden bg-slate-950">
          <Analytics/>
          <ActiveSectionContextProvider>
          <Navbar/>
          <Header/>
          {children}
          </ActiveSectionContextProvider>
        </main>
        </body>
    </html>
  );
}
