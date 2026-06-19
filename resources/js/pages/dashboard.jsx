import CampusMapLayout from "@/components/CampusMapLayout";

function Dashboard() {
  const mapRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [routeState, setRouteState] = useState({ start: "", end: "" });
  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const handleGpsClick = () => {
    const gpsBtn = document.querySelector("[data-gps-btn]");
    if (gpsBtn) {
      gpsBtn.click();
    }
  };
  return <AppShell variant="sidebar">
            <div className="flex h-screen w-screen bg-gray-50 dark:bg-slate-950">
                <Head title="Dashboard" />

                {
    /* Sidebar - Collapsible */
  }
                <div
    className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-transform duration-300 z-40 pt-16 w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
  >
                    <AppSidebar />
                </div>

                {
    /* Main Content */
  }
                <div className="flex-1 flex flex-col w-full">
                    {
    /* Header */
  }
                    <MapHeader
    onMenuToggle={handleMenuToggle}
    onGpsClick={handleGpsClick}
  />

                    {
    /* Map Container */
  }
                    <div className="flex-1 mt-16 relative overflow-hidden bg-gray-200 dark:bg-slate-800">
                        <MapComponent ref={mapRef} onRouteStateChange={setRouteState} />

                        <CampusSearch
    mapRef={mapRef}
    startLabel={routeState.start}
    endLabel={routeState.end}
    sidebarOpen={sidebarOpen}
  />

                        {
    /* Overlay to close sidebar when clicking on map */
  }
                        {sidebarOpen && <div
    className="fixed inset-0 bg-black/20 z-30 pt-16"
    onClick={() => setSidebarOpen(false)}
  />}
                    </div>
                </div>
            </div>
        </AppShell>;
}
export {
  Dashboard as default
};
