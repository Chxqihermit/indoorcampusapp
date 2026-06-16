import { useState, useEffect, useCallback, useRef } from "react";
function useWifiPositioning({
  accessPoints,
  enabled,
  scanIntervalMs = 3e3,
  onPositionUpdate,
  onError
}) {
  const [userPosition, setUserPosition] = useState(null);
  const [wifiSignals, setWifiSignals] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const rssiToDistance = useCallback((rssi, txPower) => {
    const pathLossExponent = 3;
    const distance = Math.pow(10, (txPower - rssi) / (10 * pathLossExponent));
    return Math.max(0.5, Math.min(distance, 50));
  }, []);
  const calculatePosition = useCallback((signals) => {
    const measurements = signals.map((signal) => {
      const ap = accessPoints.find(
        (a) => a.bssid.toLowerCase() === signal.bssid.toLowerCase()
      );
      if (!ap) return null;
      const distance = rssiToDistance(signal.rssi, ap.tx_power);
      const weight = Math.pow(1 / Math.max(distance, 0.1), 2);
      return { x: ap.x_coordinate, y: ap.y_coordinate, distance, weight };
    }).filter((m) => m !== null);
    if (measurements.length < 3) return null;
    const totalWeight = measurements.reduce((sum, m) => sum + m.weight, 0);
    const x = measurements.reduce((sum, m) => sum + m.x * m.weight, 0) / totalWeight;
    const y = measurements.reduce((sum, m) => sum + m.y * m.weight, 0) / totalWeight;
    const avgDist = measurements.reduce((sum, m) => sum + m.distance, 0) / measurements.length;
    const accuracy = avgDist / Math.sqrt(measurements.length) * (1 + 1 / measurements.length);
    return {
      x,
      y,
      accuracy: Math.max(accuracy, 1),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }, [accessPoints, rssiToDistance]);
  const performScan = useCallback(async () => {
    try {
      let networks = [];
      try {
        const WifiScannerModule = await import("./WifiScanner");
        const result = await WifiScannerModule.default.startScan();
        networks = result.networks || [];
      } catch (pluginError) {
        if (process.env.NODE_ENV === "development" && accessPoints.length > 0) {
          networks = accessPoints.map((ap, i) => ({
            bssid: ap.bssid,
            ssid: ap.ssid,
            rssi: -45 - i * 8 + Math.random() * 6,
            frequency: 2412
          }));
        } else {
          throw pluginError;
        }
      }
      setWifiSignals(networks);
      if (accessPoints.length > 0) {
        const position = calculatePosition(networks);
        if (position) {
          setUserPosition(position);
          setError(null);
          onPositionUpdate?.(position);
        } else {
          const msg = `Need 3+ matching APs (found ${networks.length} networks)`;
          setError(msg);
          onError?.(msg);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Scan failed";
      setError(msg);
      onError?.(msg);
      setUserPosition(null);
      onPositionUpdate?.(null);
    }
  }, [accessPoints, calculatePosition, onPositionUpdate, onError]);
  const startScanning = useCallback(() => {
    if (intervalRef.current || accessPoints.length < 3) {
      if (accessPoints.length < 3) {
        const msg = `Need at least 3 APs configured, have ${accessPoints.length}`;
        setError(msg);
        onError?.(msg);
      }
      return;
    }
    setIsScanning(true);
    setError(null);
    performScan();
    intervalRef.current = setInterval(performScan, scanIntervalMs);
  }, [accessPoints.length, performScan, scanIntervalMs, onError]);
  const stopScanning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScanning(false);
    setUserPosition(null);
    setWifiSignals([]);
    setError(null);
    onPositionUpdate?.(null);
  }, [onPositionUpdate]);
  useEffect(() => {
    if (enabled) {
      startScanning();
    } else {
      stopScanning();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, startScanning, stopScanning]);
  return {
    userPosition,
    wifiSignals,
    isScanning,
    error,
    detectedCount: wifiSignals.length,
    startScanning,
    stopScanning
  };
}
export {
  useWifiPositioning
};
