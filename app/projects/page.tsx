import Link from "next/link";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "../portfolio.css";

export const metadata = {
  title: "Projects — Weilies Chok",
  description: "Weekend B2C hobby projects: Habit Hacker and Tolong Alih.",
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--pf-font-display",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--pf-font-body",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--pf-font-mono",
});

export default function Projects() {
  return (
    <div className={`pf-root ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <header className="pf-nav">
        <div className="pf-nav-inner">
          <Link className="pf-logo" href="/">
            WEILIES CHOK
          </Link>
          <nav className="pf-nav-links">
            <Link className="pf-nav-resume" href="/about">
              About
            </Link>
            <a className="pf-nav-resume" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              Résumé ↓
            </a>
          </nav>
        </div>
      </header>

      <main className="wrap page-main">
        <p className="eyebrow">Projects</p>
        <h1 className="page-title">Weekend builds.</h1>
        <p className="prose">
          Small B2C tools built on weekends, for whoever finds them useful — no roadmap, no stakeholders.
        </p>

        <div className="systems-grid">
          <a
            className="system-card"
            href="https://habit-hacker-ivory.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="system-top">
              <span className="system-name">Habit Hacker</span>
              <span className="badge live">LIVE</span>
            </div>
            <p className="system-desc">
              A tiny habit tracker built on BJ Fogg&apos;s B=MAP model — shrink the behavior until it
              survives a bad day, instead of punishing the day it doesn&apos;t.
            </p>
          </a>

          <a className="system-card" href="https://alih.nextnovas.com" target="_blank" rel="noopener noreferrer">
            <div className="system-top">
              <span className="system-name">Tolong Alih</span>
              <span className="badge live">LIVE</span>
            </div>
            <p className="system-desc">
              Double parking, sorted — the blocker declares the block, the blocked driver gets notified or
              traces it by plate. Neither side ever sees the other&apos;s phone number.
            </p>
          </a>
        </div>
      </main>

      <footer className="pf-footer">
        <div className="wrap footer-inner">
          <p className="footer-tag">Every integration ships with a rollback plan.</p>
          <div className="footer-links">
            <a href="mailto:weilies.chok@gmail.com">Email</a>
            <a href="https://www.linkedin.com/in/weilies-chok/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              Résumé
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
