"use client";

import { useEffect, useRef } from "react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./portfolio.css";

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

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reveals = root.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((el) => io.observe(el));

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const traces = root.querySelectorAll<SVGPathElement>(".trace");
    traces.forEach((path, i) => {
      const len = path.getTotalLength();
      if (reduceMotion) {
        path.style.strokeDasharray = "none";
        return;
      }
      if (!path.classList.contains("building")) {
        path.style.strokeDasharray = String(len);
        path.style.strokeDashoffset = String(len);
        path.style.transition = `stroke-dashoffset 1.1s ease ${0.15 + i * 0.12}s`;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            path.style.strokeDashoffset = "0";
          })
        );
      }
    });

    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`pf-root ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <header className="pf-nav">
        <div className="pf-nav-inner">
          <span className="pf-logo">WEILIES CHOK</span>
          <a className="pf-nav-resume" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
            Résumé ↓
          </a>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">Product · Integration · Platform Strategy</p>
            <h1>Weilies Chok</h1>
            <p className="role">Senior Product Manager, BIPO — Singapore</p>
            <p className="lede">
              I lead integration strategy for BIPO&apos;s global HRMS, EOR, and GPO platform — architecting
              how systems like Workday, Larksuite, and DocuSign connect into the core, for 5,500+ clients
              and 700,000+ employees across 170+ countries.
            </p>
            <div className="cta-row">
              <a
                className="btn btn-primary"
                href="https://www.linkedin.com/in/weilies-chok/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect on LinkedIn
              </a>
              <a className="btn btn-ghost" href="mailto:weilies.chok@gmail.com">
                Email me
              </a>
            </div>
          </div>

          <div className="hero-diagram">
            <svg
              viewBox="0 0 520 380"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Diagram of systems integrated into the BIPO platform"
            >
              <path className="trace live" d="M75,90 C130,150 180,220 226,296" />
              <path className="trace live" d="M175,42 C205,120 232,200 250,304" />
              <path className="trace live" d="M355,42 C320,120 292,200 274,304" />
              <path className="trace live" d="M455,90 C395,150 342,220 296,296" />
              <path className="trace building" d="M260,118 L260,282" />

              <circle className="node-dot" cx="75" cy="90" r="5" />
              <text className="node-label" x="75" y="72" textAnchor="middle">LARKSUITE / FEISHU</text>

              <circle className="node-dot" cx="175" cy="42" r="5" />
              <text className="node-label" x="175" y="26" textAnchor="middle">WORKDAY</text>

              <circle className="node-dot" cx="355" cy="42" r="5" />
              <text className="node-label" x="355" y="26" textAnchor="middle">DOCUSIGN</text>

              <circle className="node-dot" cx="455" cy="90" r="5" />
              <text className="node-label" x="455" y="72" textAnchor="middle">MOKA</text>

              <circle className="node-dot building" cx="260" cy="112" r="5" />
              <text className="node-label" x="260" y="96" textAnchor="middle">WECOM / DINGTALK</text>

              <circle className="hub-circle" cx="260" cy="320" r="38" />
              <text className="hub-label" x="260" y="316" textAnchor="middle">BIPO</text>
              <text
                className="hub-label"
                x="260"
                y="330"
                textAnchor="middle"
                style={{ fontSize: "8px", fill: "var(--pf-text-dim)", fontWeight: 400 }}
              >
                PLATFORM
              </text>
            </svg>
          </div>
        </section>

        <section className="stats reveal">
          <div className="stat">
            <span className="stat-num">5,500+</span>
            <span className="stat-label">Clients supported</span>
          </div>
          <div className="stat">
            <span className="stat-num">700,000+</span>
            <span className="stat-label">Employees on platform</span>
          </div>
          <div className="stat">
            <span className="stat-num">170+</span>
            <span className="stat-label">Countries covered</span>
          </div>
          <div className="stat">
            <span className="stat-num">200–300</span>
            <span className="stat-label">Integrations shipped / yr</span>
          </div>
        </section>

        <section className="block reveal">
          <p className="eyebrow">Strengths</p>
          <h2>What I bring beyond the integration itself.</h2>
          <div className="systems-grid">
            <div className="system-card">
              <div className="system-top">
                <span className="system-name">Middleware fluency</span>
              </div>
              <p className="system-desc">
                Hands-on across n8n and Workato — the automation layer that sits between BIPO and every
                client system.
              </p>
            </div>

            <div className="system-card">
              <div className="system-top">
                <span className="system-name">Office automation</span>
              </div>
              <p className="system-desc">
                Deep working knowledge of enterprise OA platforms, from admin console down to API — not
                just the integrations built on top.
              </p>
            </div>

            <div className="system-card">
              <div className="system-top">
                <span className="system-name">Cross-functional leadership</span>
              </div>
              <p className="system-desc">
                Led engineering, sales, and project management teams of 40+ across regions to ship
                integration programs on schedule.
              </p>
            </div>

            <div className="system-card">
              <div className="system-top">
                <span className="system-name">Escalation point</span>
              </div>
              <p className="system-desc">
                The person pulled in when a complex integration stalls — diagnosing root cause and getting
                delivery back on track.
              </p>
            </div>
          </div>
        </section>

        <section className="block reveal">
          <p className="eyebrow">What I Connect</p>
          <h2>Six systems, one platform, no drama.</h2>
          <div className="systems-grid">
            <div className="system-card">
              <div className="system-top">
                <span className="system-name">Larksuite / Feishu</span>
                <span className="badge live">LIVE</span>
              </div>
              <p className="system-desc">OA integration with one of the top three OA platforms in China.</p>
            </div>

            <div className="system-card">
              <div className="system-top">
                <span className="system-name">Workday</span>
                <span className="badge live">LIVE</span>
              </div>
              <p className="system-desc">Auth and the Global Payroll Connector (GPC).</p>
            </div>

            <div className="system-card">
              <div className="system-top">
                <span className="system-name">DocuSign / eSignature</span>
                <span className="badge live">LIVE</span>
              </div>
              <p className="system-desc">
                Extended for statutory ID verification and compliance as BIPO expanded into Western
                markets.
              </p>
            </div>

            <div className="system-card">
              <div className="system-top">
                <span className="system-name">Moka</span>
                <span className="badge live">LIVE</span>
              </div>
              <p className="system-desc">Talent platform integration into the core HRMS.</p>
            </div>

            <div className="system-card">
              <div className="system-top">
                <span className="system-name">WeCom / DingTalk</span>
                <span className="badge building">BUILDING</span>
              </div>
              <p className="system-desc">Rounding out full coverage of APAC&apos;s top three OA platforms.</p>
            </div>

            <div className="system-card">
              <div className="system-top">
                <span className="system-name">Oracle NetSuite</span>
                <span className="badge building">BUILDING</span>
              </div>
              <p className="system-desc">Autonomous agent for integration and upgrade testing.</p>
            </div>
          </div>
        </section>

        <section className="block reveal">
          <p className="eyebrow">Experience</p>
          <h2>Where this got built.</h2>
          <ol className="timeline">
            <li className="tl-item">
              <span className="tl-date">Aug 2025 — Present</span>
              <div>
                <p className="tl-role">Senior Product Manager</p>
                <p className="tl-org">BIPO, Singapore</p>
                <p className="tl-desc">
                  Own integration strategy across BIPO&apos;s global HRMS, EOR, and GPO platform. Act as
                  internal consultant across regions, guiding Forward Deployment Engineers and deciding
                  what becomes a platform standard versus a chargeable customization.
                </p>
              </div>
            </li>
            <li className="tl-item">
              <span className="tl-date">Apr 2022 — Aug 2025</span>
              <div>
                <p className="tl-role">Regional Product Manager</p>
                <p className="tl-org">BIPO, Singapore</p>
              </div>
            </li>
            <li className="tl-item">
              <span className="tl-date">Jul 2021 — Apr 2022</span>
              <div>
                <p className="tl-role">Regional Product Assistant Manager</p>
                <p className="tl-org">BIPO, Singapore</p>
                <p className="tl-desc">
                  Designed workforce solutions for 800+ MNCs and led solutioning on ERP integrations.
                </p>
              </div>
            </li>
            <li className="tl-item">
              <span className="tl-date">Dec 2012 — Jul 2021</span>
              <div>
                <p className="tl-role">Senior Analyst</p>
                <p className="tl-org">Hyflux Ltd, Singapore</p>
                <p className="tl-desc">
                  End-to-end app solutioning across HR/Payroll, asset management, and ITSM systems — from
                  spec to deployment.
                </p>
              </div>
            </li>
            <li className="tl-item">
              <span className="tl-date">May 2008 — Dec 2012</span>
              <div>
                <p className="tl-role">Human Resources Consultant</p>
                <p className="tl-org">HRMS Consulting, Singapore</p>
                <p className="tl-desc">
                  Led Oracle PeopleSoft implementations and upgrades; trained client teams on advanced
                  toolkits.
                </p>
              </div>
            </li>
          </ol>
          <p className="earlier-note">
            Earlier: software engineering roles in web platforms and ad-tech, Kuala Lumpur (2005–2008).
          </p>
        </section>

        <section className="block reveal">
          <p className="eyebrow">Capabilities</p>
          <div className="tag-row">
            <span className="tag">Negotiation</span>
            <span className="tag">Agentic AI Development</span>
            <span className="tag">Agentic Automation</span>
            <span className="tag">Integration Architecture</span>
            <span className="tag">Cross-region Delivery</span>
            <span className="tag">Middleware (Workato, n8n)</span>
          </div>
          <div className="cert-row">
            <span>GDPR Advanced</span>
            <span>Privacy by Design</span>
            <span>GDPR for Senior Staff Members</span>
            <span>G Suite Administrator Fundamentals</span>
            <span>SharePoint Online for Administrator</span>
          </div>
        </section>

        <section className="block reveal">
          <p className="eyebrow">Education</p>
          <div className="edu-card">
            <div>
              <p className="edu-school">Tunku Abdul Rahman University College</p>
              <p className="edu-degree">Bachelor&apos;s Degree, Computer Science</p>
            </div>
            <span className="edu-date">2001 — 2005</span>
          </div>
        </section>
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
