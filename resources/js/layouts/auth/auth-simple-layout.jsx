import AppLogoIcon from "@/components/app-logo-icon";
import { home } from "@/routes";
import { Link } from "@inertiajs/react";

function AuthSimpleLayout({ children, title, description }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#1d2758] p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 rounded-2xl bg-white px-8 py-10 shadow-2xl">

          {/* NUST Brand Header */}
          <div className="flex flex-col items-center gap-4">
            <Link href={home()} className="flex items-center justify-center">
              <AppLogoIcon className="h-20 w-auto" />
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
