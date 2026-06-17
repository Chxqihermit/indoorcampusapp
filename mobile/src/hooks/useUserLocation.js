import { useEffect, useState } from "react";
import * as Location from "expo-location";

function useUserLocation() {
  const [coords, setCoords] = useState(null);
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    let subscription = null;
    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status);
      if (status !== "granted") return;

      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setCoords(current.coords);
      } catch {
        // watch may still succeed after permission is granted
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 3,
          timeInterval: 2e3
        },
        (pos) => setCoords(pos.coords)
      );
    };
    start();
    return () => {
      subscription?.remove();
    };
  }, []);

  return { coords, permission };
}

export { useUserLocation };
