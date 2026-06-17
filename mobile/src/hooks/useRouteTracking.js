import { useEffect, useRef, useState } from "react";
import { routeDistanceMeters } from "@/lib/outdoorRouting";

function haversineMeters(a, b) {
  const R = 6371e3;
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function projectOnSegment(px, py, ax, ay, bx, by) {
  const mPerDegLat = 111320;
  const mPerDegLng = Math.cos(py * Math.PI / 180) * 111320;
  const P = { x: px * mPerDegLng, y: py * mPerDegLat };
  const A = { x: ax * mPerDegLng, y: ay * mPerDegLat };
  const B = { x: bx * mPerDegLng, y: by * mPerDegLat };
  const ABx = B.x - A.x;
  const ABy = B.y - A.y;
  const APx = P.x - A.x;
  const APy = P.y - A.y;
  const ab2 = ABx * ABx + ABy * ABy;
  if (!ab2) {
    const dx2 = P.x - A.x;
    const dy2 = P.y - A.y;
    return { t: 0, distM: Math.sqrt(dx2 * dx2 + dy2 * dy2) };
  }
  let t = (APx * ABx + APy * ABy) / ab2;
  t = Math.max(0, Math.min(1, t));
  const Qx = A.x + t * ABx;
  const Qy = A.y + t * ABy;
  const dx = P.x - Qx;
  const dy = P.y - Qy;
  return { t, distM: Math.sqrt(dx * dx + dy * dy) };
}

function useRouteTracking(fullRoute, userCoords) {
  const [displayRoute, setDisplayRoute] = useState(fullRoute);
  const [remainingMeters, setRemainingMeters] = useState(null);
  const [arrived, setArrived] = useState(false);
  const progressIndexRef = useRef(0);
  const lastTrimRef = useRef(null);
  const fullRouteRef = useRef(fullRoute);
  const routeActiveRef = useRef(false);

  useEffect(() => {
    fullRouteRef.current = fullRoute;
    progressIndexRef.current = 0;
    lastTrimRef.current = null;
    setArrived(false);
    setDisplayRoute(fullRoute);
    setRemainingMeters(fullRoute ? routeDistanceMeters(fullRoute) : null);
    routeActiveRef.current = Boolean(fullRoute?.length && fullRoute.length > 1);
  }, [fullRoute]);

  useEffect(() => {
    const route = fullRouteRef.current;
    if (!routeActiveRef.current || !route || route.length < 2 || !userCoords) {
      return;
    }

    const user = {
      latitude: userCoords.latitude,
      longitude: userCoords.longitude
    };

    if (lastTrimRef.current && haversineMeters(user, lastTrimRef.current) < 3) {
      return;
    }

    const dest = route[route.length - 1];
    if (haversineMeters(user, dest) < 15) {
      setArrived(true);
      setDisplayRoute([dest]);
      setRemainingMeters(0);
      routeActiveRef.current = false;
      lastTrimRef.current = user;
      return;
    }

    const snapThreshold = Math.max(30, (userCoords.accuracy || 25) * 1.5);
    let bestSeg = -1;
    let bestDist = Infinity;
    let bestT = 0;
    for (let i = Math.max(0, progressIndexRef.current); i < route.length - 1; i++) {
      const a = route[i];
      const b = route[i + 1];
      const proj = projectOnSegment(
        user.longitude,
        user.latitude,
        a.longitude,
        a.latitude,
        b.longitude,
        b.latitude
      );
      if (proj.distM < bestDist) {
        bestDist = proj.distM;
        bestSeg = i;
        bestT = proj.t;
      }
    }
    if (bestSeg < 0 || bestDist > snapThreshold) return;

    const passedVertex = bestT >= 0.5 ? bestSeg + 1 : bestSeg;
    if (passedVertex > progressIndexRef.current) {
      progressIndexRef.current = passedVertex;
    }

    const remaining = [user];
    for (let j = progressIndexRef.current + 1; j < route.length; j++) {
      remaining.push(route[j]);
    }

    if (remaining.length < 2) {
      setArrived(true);
      setDisplayRoute([dest]);
      setRemainingMeters(0);
      routeActiveRef.current = false;
    } else {
      setDisplayRoute(remaining);
      setRemainingMeters(routeDistanceMeters(remaining));
    }
    lastTrimRef.current = user;
  }, [fullRoute, userCoords]);

  return { displayRoute, remainingMeters, arrived };
}

export { useRouteTracking };
