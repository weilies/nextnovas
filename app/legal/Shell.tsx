import Link from "next/link";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "../portfolio.css";

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

// Shared frame for the Next Novas legal pages (/privacy, /terms). Server-rendered.
export default function LegalShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
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
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title">{title}</h1>
        <div className="prose legal">{children}</div>
      </main>

      <footer className="pf-footer">
        <div className="wrap footer-inner">
          <p className="footer-tag">Next Novas — a family of small apps by Weilies Chok.</p>
          <div className="footer-links">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <a href="mailto:weilies.chok@gmail.com">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
