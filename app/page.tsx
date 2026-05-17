export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="grid-bg absolute inset-0 pointer-events-none" aria-hidden />

      <div className="relative max-w-2xl mx-auto px-6 py-16 sm:py-24 flex flex-col gap-12">
        <header className="flex items-center gap-3 text-xs tracking-[0.3em] text-cyan-neon/80">
          <span className="h-2 w-2 rounded-full bg-cyan-neon shadow-[0_0_12px_#00e5ff]" />
          NEXTNOVAS / WEILIES.CHOK
        </header>

        <section className="flex flex-col gap-6">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Weilies Chok.
            <br />
            <span className="text-cyan-neon">Product Manager</span> by day.
            <br />
            <span className="text-purple-neon">Indie game builder</span> by night.
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            Two worlds, one obsession — making things <span className="text-gray-100">simpler</span> for
            the people who use them. By day, that means cutting friction inside the enterprise.
            By night, it means cutting friction between a player and pure fun.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 gap-4 text-sm">
          <a
            href="https://www.linkedin.com/in/weilies-chok/"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-md border border-gray-800 hover:border-cyan-neon/60 bg-black/40 p-5 flex flex-col gap-3 transition hover:shadow-[0_0_24px_rgba(0,229,255,0.15)]"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-neon shadow-[0_0_8px_#00e5ff]" />
              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-neon/80">
                Day — 09:00
              </div>
            </div>
            <div className="text-gray-100 font-semibold">Product Manager</div>
            <p className="text-gray-400 leading-relaxed">
              Leading teams to reduce enterprise friction. Designing and integrating
              workflows across <span className="text-gray-200">SAP SuccessFactors</span>,
              {" "}<span className="text-gray-200">Workday</span>, and{" "}
              <span className="text-gray-200">Oracle</span> — so HR, payroll, and
              ops stop fighting their own tools.
            </p>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 group-hover:text-cyan-neon transition">
              View on LinkedIn →
            </div>
          </a>

          <div className="rounded-md border border-gray-800 bg-black/40 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-neon shadow-[0_0_8px_#b366ff]" />
              <div className="text-[10px] uppercase tracking-[0.25em] text-purple-neon/80">
                Night — 21:00
              </div>
            </div>
            <div className="text-gray-100 font-semibold">Nexus Arcade</div>
            <p className="text-gray-400 leading-relaxed">
              Chasing a kid&apos;s dream — build something{" "}
              <span className="text-gray-200">simple</span> and{" "}
              <span className="text-gray-200">fun</span>. Retro-neon browser
              games. No downloads. No accounts to try. Open. Play. Smile.
            </p>
            <a
              href="https://arcade.nextnovas.com"
              className="group/cta mt-1 inline-flex items-center justify-center gap-3 rounded-md border border-cyan-neon/60 bg-cyan-neon/5 px-5 py-3 text-cyan-neon transition hover:bg-cyan-neon/10 hover:border-cyan-neon hover:shadow-[0_0_24px_rgba(0,229,255,0.35)]"
            >
              <span className="font-bold tracking-widest text-sm">INSERT COIN →</span>
              <span className="text-[10px] opacity-70 group-hover/cta:opacity-100">
                arcade.nextnovas.com
              </span>
            </a>
          </div>
        </section>

        <footer className="mt-auto pt-12 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between text-xs text-gray-500">
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/weilies"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-neon transition inline-flex items-center gap-2"
              aria-label="GitHub"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/weilies-chok/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-neon transition inline-flex items-center gap-2"
              aria-label="LinkedIn"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M13.63 13.63h-2.37V9.92c0-.89-.02-2.03-1.23-2.03-1.24 0-1.43.97-1.43 1.97v3.77H6.23V6h2.28v1.04h.03c.32-.6 1.09-1.23 2.25-1.23 2.41 0 2.85 1.58 2.85 3.65v4.17ZM3.56 4.96a1.37 1.37 0 1 1 0-2.75 1.37 1.37 0 0 1 0 2.75Zm1.18 8.67H2.37V6h2.37v7.63ZM14.82 0H1.18C.53 0 0 .52 0 1.16v13.68C0 15.48.53 16 1.18 16h13.64c.65 0 1.18-.52 1.18-1.16V1.16C16 .52 15.47 0 14.82 0Z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href="mailto:weilies.chok@gmail.com"
              className="hover:text-cyan-neon transition"
            >
              Email
            </a>
          </div>
          <div className="tracking-widest">© {new Date().getFullYear()} NEXTNOVAS</div>
        </footer>
      </div>
    </main>
  );
}
