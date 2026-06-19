import CampusSearch from "@/components/CampusSearch";
import MapComponent from "@/components/MapComponent";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { useRef, useState } from "react";

const breadcrumbs = [{ title: "Dashboard", href: "/dashboard" }];

function Dashboard() {
  const mapRef = useRef(null);
  const [routeState, setRouteState] = useState({ start: "", end: "" });

  const handleGpsClick = () => {
    const gpsBtn = document.querySelector("[data-gps-btn]");
    if (gpsBtn) gpsBtn.click();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="relative flex-1 overflow-hidden">
        <MapComponent ref={mapRef} onRouteStateChange={setRouteState} />
        <CampusSearch
          mapRef={mapRef}
          startLabel={routeState.start}
          endLabel={routeState.end}
        />
        <button
          onClick={handleGpsClick}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition shadow-md dark:bg-blue-900/30 dark:text-blue-400"
          title="Use current GPS location"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11 10.07 7.5 12 7.5s3.5 1.57 3.5 3.5z" />
          </svg>
        </button>
      </div>
    </AppLayout>
  );
}

export { Dashboard as default };
