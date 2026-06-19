import "../css/app.css";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initializeCapacitor } from "./lib/capacitor";
import { initializeExpoWebViewGeolocation } from "./lib/expoGeolocation";
import { initializeTheme } from "./hooks/use-appearance";
import "maplibre-gl/dist/maplibre-gl.css";

initializeCapacitor();
initializeExpoWebViewGeolocation();
const appName = import.meta.env.VITE_APP_NAME || "Laravel";
createInertiaApp({
  title: (title) => title ? `${title} - ${appName}` : appName,
  resolve: (name) => {
    const pages = {
      ...import.meta.glob('./pages/**/*.jsx'),
      ...import.meta.glob('./pages/**/*.tsx'),
    };
    return resolvePageComponent(`./pages/${name}.tsx`, pages)
      .catch(() => resolvePageComponent(`./pages/${name}.jsx`, pages));
  },
    setup({ el, App, props }) {
    const splash = document.getElementById('app-splash');
    if (splash) {
      const removeSplash = () => { if (splash.parentNode) splash.remove(); };
      splash.addEventListener('transitionend', removeSplash, { once: true });
      splash.classList.add('fade-out');
      setTimeout(removeSplash, 700);
    }
    if (window.ReactNativeWebView?.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "campus-ready" }));
    }
    const root = createRoot(el);
    root.render(
      <StrictMode>
                <App {...props} />
            </StrictMode>
    );
  },
  progress: {
    color: "#4B5563"
  }
});
initializeTheme();
