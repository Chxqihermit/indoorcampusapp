import * as Location from "expo-location";

function coordsPayload(coords) {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? 0,
    altitude: coords.altitude ?? null,
    altitudeAccuracy: coords.altitudeAccuracy ?? null,
    heading: coords.heading ?? null,
    speed: coords.speed ?? null
  };
}

function injectScript(webRef, script) {
  webRef.current?.injectJavaScript(`${script}\ntrue;`);
}

function deliverError(webRef, id, code, message) {
  injectScript(
    webRef,
    `window.__expoGeoDeliver && window.__expoGeoDeliver(${JSON.stringify(id)}, null, ${code}, ${JSON.stringify(message)});`
  );
}

function deliverCoords(webRef, id, coords) {
  injectScript(
    webRef,
    `window.__expoGeoDeliver && window.__expoGeoDeliver(${JSON.stringify(id)}, ${JSON.stringify(coordsPayload(coords))});`
  );
}

function pushWatchUpdate(webRef, coords) {
  injectScript(
    webRef,
    `window.__expoGeoWatchUpdate && window.__expoGeoWatchUpdate(${JSON.stringify(coordsPayload(coords))});`
  );
}

async function ensurePermission() {
  let { status } = await Location.getForegroundPermissionsAsync();
  if (status !== "granted") {
    ({ status } = await Location.requestForegroundPermissionsAsync());
  }
  return status === "granted";
}

async function readPosition(options = {}) {
  const accuracy = options.enableHighAccuracy
    ? Location.Accuracy.High
    : Location.Accuracy.Balanced;

  return Location.getCurrentPositionAsync({
    accuracy,
    mayShowUserSettingsDialog: true
  });
}

function createGeoBridge(webRef) {
  let watchSubscription = null;
  let permissionGranted = false;
  let pendingWatchStart = false;

  const stopWatch = () => {
    watchSubscription?.remove();
    watchSubscription = null;
  };

  const pushInitialPosition = async () => {
    try {
      const pos = await readPosition({ enableHighAccuracy: true });
      pushWatchUpdate(webRef, pos.coords);
    } catch {
      // watch may still deliver later
    }
  };

  const startWatch = async () => {
    if (watchSubscription) {
      await pushInitialPosition();
      return;
    }

    if (!permissionGranted) {
      permissionGranted = await ensurePermission();
    }
    if (!permissionGranted) {
      pendingWatchStart = true;
      return;
    }

    pendingWatchStart = false;
    await pushInitialPosition();

    watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 2,
        timeInterval: 2000
      },
      (pos) => pushWatchUpdate(webRef, pos.coords)
    );
  };

  const handleGeoGet = async (id, options) => {
    try {
      if (!permissionGranted) {
        permissionGranted = await ensurePermission();
      }
      if (!permissionGranted) {
        deliverError(
          webRef,
          id,
          1,
          "Permission denied. Allow location for Expo Go (or CampusNav) in device Settings → Apps → Permissions → Location."
        );
        return;
      }

      const pos = await readPosition(options);
      deliverCoords(webRef, id, pos.coords);
    } catch (error) {
      deliverError(
        webRef,
        id,
        2,
        error?.message || "Location unavailable. On the emulator, set a mock location in Extended controls → Location."
      );
    }
  };

  const handleMessage = async (data) => {
    if (data?.type === "geo-get") {
      await handleGeoGet(data.id, data.options ?? {});
      return;
    }

    if (data?.type === "geo-watch-start") {
      await startWatch();
      return;
    }

    if (data?.type === "geo-watch-stop") {
      stopWatch();
    }
  };

  const primePermissions = async () => {
    permissionGranted = await ensurePermission();
    if (permissionGranted && pendingWatchStart) {
      await startWatch();
    }
    return permissionGranted;
  };

  const dispose = () => {
    stopWatch();
  };

  return { handleMessage, primePermissions, dispose };
}

export { createGeoBridge, ensurePermission };
