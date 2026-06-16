function rssiToDistance(rssi, txPower, freqGhz = 2.4) {
  const pathLoss = txPower - rssi;
  const distance = Math.pow(10, (pathLoss - 20 * Math.log10(freqGhz) - 32.45) / 20);
  return Math.max(distance, 0.5);
}
function trilaterate(points) {
  if (points.length < 3) {
    console.warn("\u26A0\uFE0F Trilateration requires at least 3 points");
    return null;
  }
  let sumWeightedX = 0;
  let sumWeightedY = 0;
  let sumWeights = 0;
  for (const point of points) {
    const weight = 1 / (point.distance || 1);
    sumWeightedX += point.x * weight;
    sumWeightedY += point.y * weight;
    sumWeights += weight;
  }
  const estimatedX = sumWeightedX / sumWeights;
  const estimatedY = sumWeightedY / sumWeights;
  let totalError = 0;
  for (const point of points) {
    const dx = estimatedX - point.x;
    const dy = estimatedY - point.y;
    const calculatedDistance = Math.sqrt(dx * dx + dy * dy);
    totalError += Math.abs(calculatedDistance - point.distance);
  }
  const accuracy = totalError / points.length;
  return {
    x: estimatedX,
    y: estimatedY,
    accuracy
  };
}
function calculatePosition(signals, accessPoints) {
  if (signals.length === 0 || accessPoints.length === 0) {
    return null;
  }
  const matchedSignals = [];
  for (const signal of signals) {
    const ap = accessPoints.find((a) => a.bssid === signal.bssid);
    if (!ap) continue;
    const distance = rssiToDistance(signal.rssi, ap.tx_power);
    matchedSignals.push({
      x: ap.x_coordinate,
      y: ap.y_coordinate,
      distance
    });
  }
  if (matchedSignals.length < 3) {
    console.warn(`\u26A0\uFE0F Only ${matchedSignals.length} matching access points found (need 3+)`);
    return null;
  }
  const trilateratedPosition = trilaterate(matchedSignals);
  if (!trilateratedPosition) {
    return null;
  }
  return {
    x: trilateratedPosition.x,
    y: trilateratedPosition.y,
    accuracy: trilateratedPosition.accuracy,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function applyKalmanFilter(previousPosition, newPosition, processNoise = 0.5, measurementNoise = 2) {
  if (!previousPosition) {
    return newPosition;
  }
  const kalmanAxis = (prev, curr, prevAccuracy) => {
    const predictedAccuracy = prevAccuracy + processNoise;
    const kalmanGain = predictedAccuracy / (predictedAccuracy + measurementNoise);
    return prev + kalmanGain * (curr - prev);
  };
  return {
    x: kalmanAxis(previousPosition.x, newPosition.x, previousPosition.accuracy),
    y: kalmanAxis(previousPosition.y, newPosition.y, previousPosition.accuracy),
    // New accuracy is geometric mean of old and new
    accuracy: Math.sqrt(previousPosition.accuracy * newPosition.accuracy),
    timestamp: newPosition.timestamp
  };
}
export {
  applyKalmanFilter,
  calculatePosition,
  rssiToDistance,
  trilaterate
};
