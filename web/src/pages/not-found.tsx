export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden font-sans selection:bg-white/20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl w-full px-6 flex flex-col items-center text-center">
        <div className="w-full max-w-md bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl mb-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex items-center px-4 py-2 border-b border-white/5 bg-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
            </div>
            <div className="ml-4 text-[10px] font-mono text-neutral-500 flex items-center gap-2">
              <Icon name="file-code" className="w-3 h-3 text-blue-400" />
              <span>src/pages/404.tsx</span>
            </div>
          </div>

          <div className="p-5 text-left font-mono text-xs sm:text-sm leading-relaxed text-neutral-400">
            <p>
              <span className="text-purple-400">const</span>{" "}
              <span className="text-blue-400">page</span> ={" "}
              <span className="text-purple-400">await</span> findRoute(
              <span className="text-green-400">currentUrl</span>);
            </p>
            <p className="mt-2">
              <span className="text-purple-400">if</span> (!
              <span className="text-blue-400">page</span>) {"{"}
            </p>
            <p className="pl-4 text-neutral-500">
              <span className="text-red-400/80">
                // Error: The requested component was not found.
              </span>
            </p>
            <p className="pl-4">
              <span className="text-yellow-400">throw</span>{" "}
              <span className="text-purple-400">new</span>{" "}
              <span className="text-yellow-100">Error</span>(
              <span className="text-green-400">"404_NOT_FOUND"</span>);
            </p>
            <p className="pl-4 mt-1 bg-white/5 inline-block rounded px-1 animate-pulse">
              <span className="text-neutral-500">_</span>
            </p>
            <p>{"}"}</p>
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/10 mb-4">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-medium text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-neutral-400 max-w-md mx-auto mb-10 leading-relaxed">
          It seems that this page doesn’t exist yet. It might be a broken link
          or a feature that hasn’t been developed yet.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <a
            href="/"
            className="group flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all w-full sm:w-auto"
          >
            <Icon name="home" className="w-4 h-4" />
            <span>Back Home</span>
          </a>

          <a
            href="https://github.com/jiramo/www"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-medium text-sm transition-all w-full sm:w-auto"
          >
            <Icon
              name="github"
              className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors"
            />
            <span>Contribute on GitHub</span>
            <Icon
              name="arrow-right"
              className="w-3 h-3 text-neutral-500 group-hover:translate-x-0.5 transition-transform"
            />
          </a>
        </div>

        <div className="mt-12 text-[11px] text-neutral-600 font-mono uppercase tracking-widest">
          System Error: Route_Missing_Exception
        </div>
      </div>
    </div>
  );
}

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "github":
      return (
        <svg {...props}>
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );
    case "home":
      return (
        <svg {...props}>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...props}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      );
    case "file-code":
      return (
        <svg {...props}>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m10 13-2 2 2 2" />
          <path d="m14 17 2-2-2-2" />
        </svg>
      );
    default:
      return null;
  }
};
