import { useState, useRef } from "react";
import MapHeader from "@/components/MapHeader";
import MapComponent from "@/components/MapComponent";
import CampusSearch from "@/components/CampusSearch";
import { AppSidebar } from "@/components/app-sidebar";
import { AppShell } from "@/components/app-shell";
import { Head } from "@inertiajs/react";

function CampusMapLayout({ showSidebar = true, title = "CampusNav", hideHeader }) {
  const mapRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routeState, setRouteState] = useState({ start: "", end: "" });
  const [staffCardUi, setStaffCardUi] = useState({ visible: false, collapsed: false });
  const compactTop = hideHeader ?? !showSidebar;

  const handleGpsClick = () => {
    document.querySelector("[data-gps-btn]")?.click();
  };

  return (
    <AppShell variant="sidebar">
      <div className="flex h-screen w-screen bg-gray-50 dark:bg-slate-950">
        <Head title={title} />

        {showSidebar && (
          <div
            className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-transform duration-300 z-40 pt-16 w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <AppSidebar />
          </div>
        )}

        <div className="flex-1 flex flex-col w-full">
          {!compactTop && (
            <MapHeader
              onMenuToggle={showSidebar ? () => setSidebarOpen(!sidebarOpen) : undefined}
              onGpsClick={handleGpsClick}
            />
          )}

          <div className={`flex-1 relative overflow-hidden bg-gray-200 dark:bg-slate-800 ${compactTop ? "" : "mt-16"}`}>
            <MapComponent
              ref={mapRef}
              onRouteStateChange={setRouteState}
              onStaffCardChange={setStaffCardUi}
            />

            <CampusSearch
              mapRef={mapRef}
              startLabel={routeState.start}
              endLabel={routeState.end}
              sidebarOpen={sidebarOpen}
              compactTop={compactTop}
              hideQuickCategories={staffCardUi.visible && !staffCardUi.collapsed}
            />

            {showSidebar && sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/20 z-30 pt-16"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export { CampusMapLayout as default };
