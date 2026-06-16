import { useRef, useEffect } from "react";
function WifiPositioning({
  userPosition,
  accessPoints,
  wifiSignals,
  floorWidth,
  floorHeight,
  calibrationMode = false,
  onMapClick,
  calibrationLocation
}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = floorWidth;
    canvas.height = floorHeight;
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    drawCoverageRanges(ctx, accessPoints);
    drawAccessPoints(ctx, accessPoints, wifiSignals);
    if (wifiSignals.length > 0) {
      drawSignalStrength(ctx, wifiSignals, accessPoints);
    }
    if (userPosition) {
      drawUserPosition(ctx, userPosition);
    }
    if (calibrationMode && calibrationLocation) {
      drawCalibrationPoint(ctx, calibrationLocation);
    }
  }, [userPosition, accessPoints, wifiSignals, floorWidth, floorHeight, calibrationMode, calibrationLocation]);
  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    const spacing = 50;
    const labelSpacing = 100;
    for (let x = 0; x < width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.fillStyle = "#999999";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let x = labelSpacing; x < width; x += labelSpacing) {
      ctx.fillText(x.toString(), x, 2);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let y = labelSpacing; y < height; y += labelSpacing) {
      ctx.fillText(y.toString(), 2, y);
    }
  };
  const drawCoverageRanges = (ctx, aps) => {
    const estimatedRange = 100;
    for (const ap of aps) {
      ctx.fillStyle = "rgba(100, 150, 255, 0.05)";
      ctx.beginPath();
      ctx.arc(ap.x_coordinate, ap.y_coordinate, estimatedRange, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(100, 150, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };
  const drawAccessPoints = (ctx, aps, signals) => {
    for (const ap of aps) {
      const isDetected = signals.some((s) => s.bssid === ap.bssid);
      ctx.fillStyle = isDetected ? "#00aa00" : "#0066cc";
      ctx.beginPath();
      ctx.arc(ap.x_coordinate, ap.y_coordinate, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("\u{1F4E1}", ap.x_coordinate, ap.y_coordinate);
      ctx.fillStyle = "#333333";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(ap.ssid, ap.x_coordinate, ap.y_coordinate + 20);
    }
  };
  const drawSignalStrength = (ctx, signals, aps) => {
    for (const signal of signals) {
      const ap = aps.find((a) => a.bssid === signal.bssid);
      if (!ap) continue;
      const signalStrength = Math.max(0, Math.min(1, (signal.rssi + 100) / 70));
      const ringRadius = 20 + signalStrength * 40;
      ctx.strokeStyle = `rgba(0, 200, 0, ${0.3 * signalStrength})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ap.x_coordinate, ap.y_coordinate, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#00aa00";
      ctx.font = "9px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${signal.rssi}dBm`, ap.x_coordinate, ap.y_coordinate - 30);
    }
  };
  const drawUserPosition = (ctx, position) => {
    ctx.fillStyle = "rgba(255, 100, 100, 0.15)";
    ctx.beginPath();
    ctx.arc(position.x, position.y, position.accuracy, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 100, 100, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ff3333";
    ctx.beginPath();
    ctx.arc(position.x, position.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(position.x, position.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff3333";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.fillText("\u{1F4CD}", position.x, position.y - 15);
    ctx.font = "9px Arial";
    ctx.fillText(`\xB1${position.accuracy.toFixed(1)}m`, position.x, position.y + 15);
  };
  const drawCalibrationPoint = (ctx, point) => {
    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 2;
    const size = 15;
    ctx.beginPath();
    ctx.moveTo(point.x - size, point.y);
    ctx.lineTo(point.x + size, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y - size);
    ctx.lineTo(point.x, point.y + size);
    ctx.stroke();
    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 20, 0, Math.PI * 2);
    ctx.stroke();
  };
  return <div className="w-full h-full flex flex-col bg-white rounded-lg border border-gray-300">
            {
    /* LEGEND - This is what you're seeing at the top */
  }
            <div className="bg-gray-50 border-b border-gray-300 p-4">
                <div className="flex flex-wrap gap-6 items-center justify-start">
                    {
    /* Legend Item 1 */
  }
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-xs font-medium text-gray-700">Access Point (inactive)</span>
                    </div>

                    {
    /* Legend Item 2 */
  }
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-xs font-medium text-gray-700">Access Point (detected)</span>
                    </div>

                    {
    /* Legend Item 3 */
  }
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-xs font-medium text-gray-700">Your Position</span>
                    </div>

                    {
    /* Legend Item 4 */
  }
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-orange-400 bg-transparent" />
                        <span className="text-xs font-medium text-gray-700">Accuracy Radius</span>
                    </div>
                </div>
            </div>

            {
    /* CANVAS - Where the map is drawn */
  }
            <div className="flex-1 relative overflow-hidden bg-gray-50">
                <canvas
    ref={canvasRef}
    onClick={calibrationMode && onMapClick ? (e) => onMapClick?.(e) : void 0}
    className={calibrationMode ? "cursor-crosshair" : "cursor-default"}
    style={{
      display: "block",
      width: "100%",
      height: "100%",
      backgroundColor: "#fafafa"
    }}
  />
            </div>

            {
    /* STATS PANEL - Shows signal information */
  }
            {wifiSignals.length > 0 && <div className="border-t border-gray-300 bg-gray-50 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {
    /* Signal stats here */
  }
                    </div>
                </div>}
        </div>;
}
export {
  WifiPositioning as default
};
