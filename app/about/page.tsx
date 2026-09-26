import Link from "next/link";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "../portfolio.css";

export const metadata = {
  title: "About — Weilies Chok",
  description: "Weekend B2C side projects, alongside a day job in integration strategy.",
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

export default function About() {
  return (
    <div className={`pf-root ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <header className="pf-nav">
        <div className="pf-nav-inner">
          <Link className="pf-logo" href="/">
            WEILIES CHOK
          </Link>
          <nav className="pf-nav-links">
            <Link className="pf-nav-resume" href="/projects">
              Projects
            </Link>
            <a className="pf-nav-resume" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              Résumé ↓
            </a>
          </nav>
        </div>
      </header>

      <main className="wrap page-main">
        <p className="eyebrow">About</p>
        <h1 className="page-title">Beyond the day job.</h1>

        <div className="prose">
          <p>
            Most weeks I&apos;m architecting integration strategy for a platform running 5,500+ clients and
            700,000+ employees at BIPO. It&apos;s deliberate, roadmapped, stakeholder-heavy work — the kind
            that ships in quarters.
          </p>
          <p>
            On weekends I like doing the opposite: small, scrappy B2C hobby projects with no roadmap and no
            stakeholders — just <em>does this actually help someone</em>.
          </p>
          <p>
            <strong>Habit Hacker</strong> is one of those — a tiny habit tracker built around BJ Fogg&apos;s
            B=MAP model, made because most habit trackers punish a missed day as harshly as never starting,
            instead of asking whether the habit was ever sized right to begin with.
          </p>
          <p>
            <strong>Tolong Alih</strong> is another — a problem very specific to Malaysia and Indonesia: the
            double-parked car blocking everyone in, and the scramble to track down a stranger to move it,
            solved without either driver ever seeing the other&apos;s phone number.
          </p>
          <p>
            If any of that&apos;s useful to you — or you just want to see what a PM builds when nobody&apos;s
            asking them to — the projects are below.
          </p>
        </div>

        <div className="cta-row">
          <Link className="btn btn-primary" href="/projects">
            See the projects
          </Link>
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
