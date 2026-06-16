async function extractOfficesFromSVG(svgUrl) {
  try {
    const response = await fetch(svgUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.statusText}`);
    }
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    if (svgDoc.documentElement.tagName !== "svg") {
      throw new Error("Invalid SVG document");
    }
    const offices = [];
    const processedLabels = /* @__PURE__ */ new Set();
    const textElements = svgDoc.querySelectorAll("text");
    const textMap = /* @__PURE__ */ new Map();
    textElements.forEach((text) => {
      const x = parseFloat(text.getAttribute("x") || "0");
      const y = parseFloat(text.getAttribute("y") || "0");
      const content = text.textContent?.trim() || "";
      const fill = text.getAttribute("fill") || text.style.fill || "#000000";
      if (content.length === 0 || content === " ") return;
      const key = `${Math.round(x)}-${Math.round(y)}`;
      if (!textMap.has(key)) {
        textMap.set(key, {
          id: content,
          name: content,
          type: classifyOfficeType(content),
          x,
          y
        });
      }
    });
    const groupedOffices = groupRelatedLabels(Array.from(textMap.values()));
    groupedOffices.forEach((office) => {
      if (!processedLabels.has(office.id)) {
        offices.push(office);
        processedLabels.add(office.id);
      }
    });
    const rects = svgDoc.querySelectorAll("rect");
    rects.forEach((rect) => {
      const x = parseFloat(rect.getAttribute("x") || "0");
      const y = parseFloat(rect.getAttribute("y") || "0");
      const width = parseFloat(rect.getAttribute("width") || "0");
      const height = parseFloat(rect.getAttribute("height") || "0");
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const nearbyLabels = Array.from(textMap.values()).filter(
        (office) => Math.abs(office.x - centerX) < 50 && Math.abs(office.y - centerY) < 50
      );
      if (nearbyLabels.length > 0 && !processedLabels.has(nearbyLabels[0].id)) {
        const office = {
          ...nearbyLabels[0],
          x: centerX,
          y: centerY
        };
        offices.push(office);
        processedLabels.add(office.id);
      }
    });
    const circles = svgDoc.querySelectorAll("circle");
    circles.forEach((circle) => {
      const cx = parseFloat(circle.getAttribute("cx") || "0");
      const cy = parseFloat(circle.getAttribute("cy") || "0");
      const nearbyText = Array.from(textMap.values()).find(
        (office) => Math.abs(office.x - cx) < 30 && Math.abs(office.y - cy) < 30
      );
      if (nearbyText && !processedLabels.has(nearbyText.id)) {
        offices.push({
          ...nearbyText,
          x: cx,
          y: cy
        });
        processedLabels.add(nearbyText.id);
      }
    });
    console.log(`\u2705 Extracted ${offices.length} offices from SVG`);
    return offices;
  } catch (error) {
    console.error("\u274C SVG Extraction Error:", error);
    return [];
  }
}
async function extractPathsFromSVG(svgUrl) {
  try {
    const response = await fetch(svgUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG: ${response.statusText}`);
    }
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const paths = [];
    svgDoc.querySelectorAll("line[data-from][data-to]").forEach((line) => {
      const from = line.getAttribute("data-from");
      const to = line.getAttribute("data-to");
      if (from && to) {
        paths.push({ from, to });
      }
    });
    return paths;
  } catch (error) {
    console.error("\u274C Path Extraction Error:", error);
    return [];
  }
}
function groupRelatedLabels(textOffices) {
  const grouped = /* @__PURE__ */ new Map();
  textOffices.forEach((office) => {
    const roomIdMatch = office.name.match(/^([A-Z0-9:]+)/);
    const roomId = roomIdMatch ? roomIdMatch[1].trim() : office.name;
    const areaMatch = office.name.match(/(\d+\.?\d*)\s*m²/);
    const area = areaMatch ? parseFloat(areaMatch[1]) : void 0;
    const roomName = office.name.includes("\n") ? office.name.split("\n")[0].trim() : office.name;
    if (!grouped.has(roomId)) {
      grouped.set(roomId, {
        id: roomId,
        name: roomName,
        type: office.type,
        x: office.x,
        y: office.y,
        area
      });
    } else {
      const existing = grouped.get(roomId);
      if (office.name.length > existing.name.length) {
        existing.name = roomName;
      }
      if (area) {
        existing.area = area;
      }
    }
  });
  return Array.from(grouped.values());
}
function classifyOfficeType(label) {
  const lower = label.toLowerCase();
  if (lower.includes("stair") || lower.includes("stairs")) return "stair";
  if (lower.includes("elevator") || lower.includes("lift")) return "elevator";
  if (lower.includes("hall") || lower.includes("corridor") || lower.includes("passage"))
    return "hallway";
  if (lower.includes("entrance") || lower.includes("entry") || lower.includes("main"))
    return "entrance";
  if (lower.includes("department") || lower.includes("office") || lower.includes("reception"))
    return "department";
  return "room";
}
function generateGeoJSON(offices, floorName) {
  return {
    type: "FeatureCollection",
    features: offices.map((office, index) => ({
      type: "Feature",
      properties: {
        id: index + 1,
        name: office.name,
        room_id: office.id,
        type: office.type,
        floor: floorName,
        area_sqm: office.area
      },
      geometry: {
        type: "Point",
        coordinates: [Math.round(office.x), Math.round(office.y)]
      }
    }))
  };
}
export {
  extractOfficesFromSVG,
  extractPathsFromSVG,
  generateGeoJSON
};
