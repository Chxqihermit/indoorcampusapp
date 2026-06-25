import { useState } from "react";
import MapHeader from "@/components/MapHeader";
import { AppSidebar } from "@/components/app-sidebar";
import { AppShell } from "@/components/app-shell";
import { Head } from "@inertiajs/react";

function CampusPageLayout({ children, title = "CampusNav" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppShell variant="sidebar">
      <div className="flex flex-col min-h-screen w-full bg-gray-50 dark:bg-slate-950">
        <Head title={title} />

        <div
          className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-transform duration-300 z-40 pt-16 w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <AppSidebar />
        </div>

        <MapHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 pt-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="mt-16 flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </AppShell>
  );
}

export { CampusPageLayout as default };
