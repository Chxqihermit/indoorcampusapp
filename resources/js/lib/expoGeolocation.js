const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

function isExpoWebView() {
    return (
        document.documentElement.classList.contains('expo-webview')
        || window.__CAMPUS_NATIVE_GEO === true
        || typeof window.ReactNativeWebView?.postMessage === 'function'
    );
}

function postNative(message) {
    window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}

function coordsToPosition(coords) {
    return {
        coords: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy ?? 0,
            altitude: coords.altitude ?? null,
            altitudeAccuracy: coords.altitudeAccuracy ?? null,
            heading: coords.heading ?? null,
            speed: coords.speed ?? null,
        },
        timestamp: Date.now(),
    };
}

function applyExpoGeolocationPatch() {
    if (window.__expoGeoPatched) {
        return true;
    }
    if (!isExpoWebView()) {
        return false;
    }

    window.__expoGeoPatched = true;

    const pendingGets = new Map();
    const watchCallbacks = new Map();
    let watchActive = false;

    window.__expoGeoDeliver = (id, coords, errorCode, errorMessage) => {
        const pending = pendingGets.get(id);
        if (!pending) return;
        pendingGets.delete(id);

        if (errorCode) {
            pending.error({
                code: errorCode,
                message: errorMessage || 'Location error',
                PERMISSION_DENIED,
                POSITION_UNAVAILABLE,
                TIMEOUT,
            });
            return;
        }

        pending.success(coordsToPosition(coords));
    };

    window.__expoGeoWatchUpdate = (coords) => {
        const position = coordsToPosition(coords);
        watchCallbacks.forEach((callback) => {
            try {
                callback(position);
            } catch {
                // ignore listener errors
            }
        });
    };

    const ensureWatch = () => {
        if (watchActive || watchCallbacks.size === 0) return;
        watchActive = true;
        postNative({ type: 'geo-watch-start' });
    };

    const maybeStopWatch = () => {
        if (watchCallbacks.size > 0) return;
        watchActive = false;
        postNative({ type: 'geo-watch-stop' });
    };

    navigator.geolocation.getCurrentPosition = (success, error, options) => {
        const id = `g${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        pendingGets.set(id, { success, error: error ?? (() => undefined) });

        postNative({
            type: 'geo-get',
            id,
            options: {
                enableHighAccuracy: options?.enableHighAccuracy ?? true,
                timeout: options?.timeout ?? 30000,
                maximumAge: options?.maximumAge ?? 0,
            },
        });

        if (options?.timeout && options.timeout > 0) {
            setTimeout(() => {
                const pending = pendingGets.get(id);
                if (!pending) return;
                pendingGets.delete(id);
                pending.error({
                    code: TIMEOUT,
                    message: 'Location request timed out.',
                    PERMISSION_DENIED,
                    POSITION_UNAVAILABLE,
                    TIMEOUT,
                });
            }, options.timeout);
        }
    };

    navigator.geolocation.watchPosition = (success, error, options) => {
        const watchId = Date.now() + Math.floor(Math.random() * 1000);
        watchCallbacks.set(watchId, success);
        ensureWatch();

        navigator.geolocation.getCurrentPosition(
            success,
            error ?? (() => undefined),
            options
        );

        return watchId;
    };

    navigator.geolocation.clearWatch = (watchId) => {
        watchCallbacks.delete(watchId);
        maybeStopWatch();
    };

    return true;
}

export function initializeExpoWebViewGeolocation() {
    if (applyExpoGeolocationPatch()) {
        return;
    }

    let tries = 0;
    const retry = setInterval(() => {
        if (applyExpoGeolocationPatch() || ++tries >= 50) {
            clearInterval(retry);
        }
    }, 100);

    document.addEventListener('DOMContentLoaded', () => applyExpoGeolocationPatch(), { once: true });
    window.addEventListener('load', () => applyExpoGeolocationPatch(), { once: true });
}

export { applyExpoGeolocationPatch, isExpoWebView };
