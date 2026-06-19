import AnimatedCampusBg from "@/components/animated-campus-bg";
import AppLogoIcon from "@/components/app-logo-icon";
import { dashboard, login, register } from "@/routes";
import { Head, Link, usePage } from "@inertiajs/react";

function Welcome({ canRegister = true }) {
  const { auth } = usePage().props;

  return (
    <>
      <Head title="Welcome" />
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#1d2758]">

        <AnimatedCampusBg />

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
            <h1 className="text-2xl font-bold tracking-tight text-white">Campus App</h1>
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
