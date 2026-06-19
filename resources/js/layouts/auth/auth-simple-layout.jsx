import AnimatedCampusBg from "@/components/animated-campus-bg";
import AppLogoIcon from "@/components/app-logo-icon";
import { home } from "@/routes";
import { Link } from "@inertiajs/react";

function AuthSimpleLayout({ children, title, description }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#1d2758] p-6">

      <AnimatedCampusBg />

      {/* Form card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col gap-6 rounded-2xl bg-white px-8 py-10 shadow-2xl text-gray-900 [--primary:#1d2758] [--primary-foreground:#ffffff] [--foreground:#1a1a1a]">

          {/* NUST Brand Header */}
          <div className="flex flex-col items-center gap-4">
            <Link href={home()} className="flex items-center justify-center">
              <div className="flex items-center justify-center rounded-xl bg-[#1d2758] px-4 py-3">
                <AppLogoIcon className="h-16 w-auto" />
              </div>
            </Link>
            <div className="h-0.5 w-full rounded-full bg-[#f6b11f]" />
          </div>

          {/* Page title and description */}
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-semibold text-[#1d2758]">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export { AuthSimpleLayout as default };
