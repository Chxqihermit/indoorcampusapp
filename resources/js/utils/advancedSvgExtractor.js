async function extractLocationsFromSvgText(svgUrl) {
  try {
    const response = await fetch(svgUrl);
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    if (svgDoc.documentElement.tagName !== "svg") {
      throw new Error("Invalid SVG document");
    }
    const locations = [];
    const processedLabels = /* @__PURE__ */ new Set();
    const textElements = svgDoc.querySelectorAll("text");
    const textMap = /* @__PURE__ */ new Map();
    console.log(`Found ${textElements.length} text elements in SVG`);
    textElements.forEach((textEl) => {
      const x = parseFloat(textEl.getAttribute("x") || "0");
      const y = parseFloat(textEl.getAttribute("y") || "0");
      const content = textEl.textContent?.trim() || "";
      const fill = textEl.getAttribute("fill") || textEl.style.fill || "#000000";
      const fontSize = textEl.getAttribute("font-size") || "12";
      if (content.length === 0 || content.length > 100) return;
      const key = `${Math.round(x)}-${Math.round(y)}-${content.substring(0, 20)}`;
      if (!textMap.has(key)) {
        textMap.set(key, {
          text: content,
          x,
          y,
          fill,
          fontSize
        });
      }
    });
    console.log(`Extracted ${textMap.size} unique text labels`);
    textMap.forEach((textEl) => {
      const roomInfo = parseRoomLabel(textEl.text);
      if (roomInfo && !processedLabels.has(roomInfo.name)) {
        locations.push({
          name: roomInfo.name,
          x_coordinate: Math.round(textEl.x),
          y_coordinate: Math.round(textEl.y),
          type: roomInfo.type,
          confidence: roomInfo.confidence
        });
        processedLabels.add(roomInfo.name);
      }
    });
    const tspanElements = svgDoc.querySelectorAll("tspan");
    tspanElements.forEach((tspanEl) => {
      const parentText = tspanEl.parentElement?.getAttribute("x");
      const parentY = tspanEl.parentElement?.getAttribute("y");
      if (!parentText || !parentY) return;
      const x = parseFloat(parentText);
      const y = parseFloat(parentY);
      const content = tspanEl.textContent?.trim() || "";
      if (content.length === 0 || content.length > 100) return;
      const roomInfo = parseRoomLabel(content);
      const key = `${roomInfo?.name}-tspan`;
      if (roomInfo && !processedLabels.has(key)) {
        locations.push({
          name: roomInfo.name,
          x_coordinate: Math.round(x),
          y_coordinate: Math.round(y),
          type: roomInfo.type,
          confidence: roomInfo.confidence
        });
        processedLabels.add(key);
      }
    });
    console.log(`\u2705 Extracted ${locations.length} total locations from SVG text labels`);
    return locations;
  } catch (error) {
    console.error("\u274C SVG Text Extraction Error:", error);
    return [];
  }
}
function parseRoomLabel(text) {
  const cleanText = text.trim();
  if (cleanText.length === 0) {
    return null;
  }
  const typePatterns = [
    { pattern: /stair/i, type: "stair" },
    { pattern: /stairs/i, type: "stair" },
    { pattern: /elevator/i, type: "elevator" },
    { pattern: /lift/i, type: "elevator" },
    { pattern: /hallway/i, type: "hallway" },
    { pattern: /corridor/i, type: "hallway" },
    { pattern: /passage/i, type: "hallway" },
    { pattern: /hall\s/i, type: "hallway" },
    { pattern: /conf room/i, type: "room" },
    { pattern: /conference/i, type: "room" },
    { pattern: /meeting/i, type: "room" },
    { pattern: /office/i, type: "room" },
    { pattern: /room/i, type: "room" },
    { pattern: /lab/i, type: "room" },
    { pattern: /library/i, type: "room" },
    { pattern: /lounge/i, type: "room" },
    { pattern: /cafeteria/i, type: "room" },
    { pattern: /restroom/i, type: "room" },
    { pattern: /toilet/i, type: "room" },
    { pattern: /entrance/i, type: "entrance" },
    { pattern: /entry/i, type: "entrance" },
    { pattern: /exit/i, type: "entrance" }
  ];
  let type = "room";
  let confidence = 0.5;
  for (const { pattern, type: detectedType } of typePatterns) {
    if (pattern.test(cleanText)) {
      type = detectedType;
      confidence = 0.9;
      break;
    }
  }
  if (/^[A-Z]?\d{2,4}(:\d)?$/.test(cleanText)) {
    return {
      name: cleanText,
      type: "room",
      confidence: 0.7
    };
  }
  const skipPatterns = [/^[xy]$/i, /^pt\d+$/i, /^,$/];
  if (skipPatterns.some((p) => p.test(cleanText))) {
    return null;
  }
  if (cleanText.length < 2 || cleanText.length > 80) {
    return null;
  }
  if (/^\d+\.?\d*\s*,\s*\d+\.?\d*$/.test(cleanText)) {
    return null;
  }
  return {
    name: cleanText,
    type,
    confidence
  };
}
function locationsToGeoJSON(locations, floorName) {
  return {
    type: "FeatureCollection",
    features: locations.map((location, index) => ({
      type: "Feature",
      properties: {
        id: index + 1,
        name: location.name,
        type: location.type,
        floor: floorName,
        confidence: location.confidence
      },
      geometry: {
        type: "Point",
        coordinates: [location.x_coordinate, location.y_coordinate]
      }
    }))
  };
}
async function extractAllFloorPlansFromText() {
  const floorConfigs = [
    { file: "library-basement", name: "Basement", level: -1 },
    { file: "library-ground", name: "Ground", level: 0 },
    { file: "library-first", name: "First", level: 1 },
    { file: "library-second", name: "Second", level: 2 }
  ];
  const results = [];
  for (const floor of floorConfigs) {
    console.log(`
\u{1F4C4} Extracting ${floor.name}...`);
    try {
      const locations = await extractLocationsFromSvgText(`/floor-plans/${floor.file}.svg`);
      if (locations.length === 0) {
        console.warn(`\u26A0\uFE0F No locations found in ${floor.name}`);
        continue;
      }
      const geojson = locationsToGeoJSON(locations, floor.name);
      results.push({
        floor: floor.file,
        level: floor.level,
        locations,
        geojson,
        count: locations.length
      });
      console.log(`\u2705 ${floor.name}: Extracted ${locations.length} locations`);
      console.log("Sample locations:", locations.slice(0, 3).map((l) => `${l.name} (${l.type}) @ ${l.x_coordinate},${l.y_coordinate}`));
    } catch (error) {
      console.error(`\u274C Error extracting ${floor.name}:`, error);
    }
  }
  return results;
}
export {
  extractAllFloorPlansFromText,
  extractLocationsFromSvgText,
  locationsToGeoJSON
};
