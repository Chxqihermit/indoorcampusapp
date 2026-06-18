import AppLogoIcon from "@/components/app-logo-icon";
import { dashboard, login, register } from "@/routes";
import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useRef } from "react";

function Welcome({ canRegister = true }) {
  const { auth } = usePage().props;
  const pathRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    const pathLen = path.getTotalLength();
    path.setAttribute("stroke-dasharray", pathLen);
    path.setAttribute("stroke-dashoffset", pathLen);

    const duration = 3200;
    let start = null;
    let animId;

    function frame(ts) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      path.setAttribute("stroke-dashoffset", pathLen * (1 - eased));
      const pt = path.getPointAtLength(pathLen * eased);
      dot.setAttribute("cx", pt.x);
      dot.setAttribute("cy", pt.y);

      if (t < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        start = null;
        animId = requestAnimationFrame(frame);
      }
    }

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <>
      <Head title="Welcome" />
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#1d2758]">

        {/* Background campus node network */}
        <svg
          viewBox="0 0 320 560"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <g stroke="#2a345f" strokeWidth="1">
            <line x1="40" y1="90" x2="120" y2="60" />
            <line x1="120" y1="60" x2="210" y2="100" />
            <line x1="210" y1="100" x2="280" y2="70" />
            <line x1="40" y1="90" x2="70" y2="170" />
            <line x1="70" y1="170" x2="150" y2="150" />
            <line x1="150" y1="150" x2="210" y2="100" />
            <line x1="150" y1="150" x2="180" y2="230" />
            <line x1="180" y1="230" x2="260" y2="210" />
            <line x1="260" y1="210" x2="280" y2="70" />
            <line x1="70" y1="170" x2="50" y2="260" />
            <line x1="50" y1="260" x2="120" y2="300" />
            <line x1="120" y1="300" x2="180" y2="230" />
            <line x1="120" y1="300" x2="100" y2="390" />
            <line x1="100" y1="390" x2="190" y2="410" />
            <line x1="190" y1="410" x2="180" y2="230" />
            <line x1="190" y1="410" x2="260" y2="380" />
            <line x1="260" y1="380" x2="260" y2="210" />
            <line x1="100" y1="390" x2="80" y2="480" />
            <line x1="80" y1="480" x2="170" y2="500" />
            <line x1="170" y1="500" x2="190" y2="410" />
            <line x1="170" y1="500" x2="250" y2="470" />
            <line x1="250" y1="470" x2="260" y2="380" />
          </g>
          <g fill="#2a345f">
            <circle cx="40" cy="90" r="3" />
            <circle cx="120" cy="60" r="3" />
            <circle cx="210" cy="100" r="3" />
            <circle cx="280" cy="70" r="3" />
            <circle cx="70" cy="170" r="3" />
            <circle cx="150" cy="150" r="3" />
            <circle cx="180" cy="230" r="3" />
            <circle cx="260" cy="210" r="3" />
            <circle cx="50" cy="260" r="3" />
            <circle cx="120" cy="300" r="3" />
            <circle cx="100" cy="390" r="3" />
            <circle cx="190" cy="410" r="3" />
            <circle cx="260" cy="380" r="3" />
            <circle cx="80" cy="480" r="3" />
            <circle cx="170" cy="500" r="3" />
            <circle cx="250" cy="470" r="3" />
          </g>
        </svg>

        {/* Animated gold route */}
        <svg
          viewBox="0 0 320 560"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            ref={pathRef}
            d="M 40 90 L 70 170 L 150 150 L 180 230 L 120 300 L 100 390 L 190 410 L 170 500"
            fill="none"
            stroke="#f6b11f"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle ref={dotRef} r="6" fill="#f6b11f" cx="40" cy="90" />
          <circle cx="40" cy="90" r="5" fill="#d9272d" />
          <circle cx="170" cy="500" r="5" fill="none" stroke="#d9272d" strokeWidth="2" />
        </svg>

        {/* Nav */}
        <header className="absolute top-0 right-0 p-6">
          <nav className="flex items-center gap-3">
            {auth.user ? (
              <Link
                href={dashboard()}
                className="rounded-lg border border-[#f6b11f] px-5 py-2 text-sm font-medium text-[#f6b11f] transition hover:bg-[#f6b11f] hover:text-[#1d2758]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={login()}
                  className="rounded-lg px-5 py-2 text-sm font-medium text-white/80 transition hover:text-white"
                >
                  Log in
                </Link>
                {canRegister && (
                  <Link
                    href={register()}
                    className="rounded-lg bg-[#f6b11f] px-5 py-2 text-sm font-semibold text-[#1d2758] transition hover:bg-[#e8a41a]"
                  >
                    Register
                  </Link>
                )}
              </>
            )}
          </nav>
        </header>

        {/* Center content */}
        <main className="relative z-10 flex flex-col items-center gap-5 text-center">
          <AppLogoIcon className="h-32 w-auto drop-shadow-lg" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Campus Navigator</h1>
            <p className="mt-1 text-sm text-white/60">NUST campus, mapped and routed</p>
          </div>
          {!auth.user && (
            <Link
              href={login()}
              className="mt-2 rounded-lg bg-[#f6b11f] px-8 py-3 text-sm font-semibold text-[#1d2758] shadow-lg transition hover:bg-[#e8a41a]"
            >
              Get Started
            </Link>
          )}
        </main>
      </div>
    </>
  );
}

export { Welcome as default };
