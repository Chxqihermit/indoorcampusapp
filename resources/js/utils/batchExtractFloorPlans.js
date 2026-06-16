import { extractOfficesFromSVG, generateGeoJSON } from "./svgExtractor";
const FLOOR_CONFIGS = [
  { fileName: "library-basement", floorName: "Basement", floorLevel: -1 },
  { fileName: "library-ground", floorName: "Ground", floorLevel: 0 },
  { fileName: "library-first", floorName: "First", floorLevel: 1 },
  { fileName: "library-second", floorName: "Second", floorLevel: 2 }
];
async function extractAllFloorPlans() {
  console.log("\u{1F3D7}\uFE0F  Starting bulk SVG-to-GeoJSON extraction...\n");
  const results = [];
  const svgMappings = [
    { fileName: "library-basement", floorName: "Basement", floorLevel: -1, svgFile: "Basement 1.5.svg" },
    { fileName: "library-ground", floorName: "Ground", floorLevel: 0, svgFile: "Ground 1.5.svg" },
    { fileName: "library-first", floorName: "First", floorLevel: 1, svgFile: "First 1.5.svg" },
    { fileName: "library-second", floorName: "Second", floorLevel: 2, svgFile: "Second 1.5.svg" }
  ];
  for (const floor of svgMappings) {
    try {
      console.log(`\u{1F4C4} Processing: ${floor.svgFile}...`);
      const svgUrl = `/Floor Plans/${floor.svgFile}`;
      const offices = await extractOfficesFromSVG(svgUrl);
      if (offices.length === 0) {
        console.warn(`\u26A0\uFE0F  No offices extracted from ${floor.svgFile}`);
        results.push({
          floor: floor.floorName,
          fileName: floor.fileName,
          count: 0,
          offices: [],
          geojson: { type: "FeatureCollection", features: [] },
          status: "failed",
          error: "No offices found in SVG"
        });
        continue;
      }
      const geojson = generateGeoJSON(offices, floor.floorName);
      console.log(
        `\u2705 ${floor.floorName}: ${offices.length} locations extracted`
      );
      console.log(
        `   Samples: ${offices.slice(0, 3).map((o) => `${o.name} (${o.type})`).join(", ")}`
      );
      results.push({
        floor: floor.floorName,
        fileName: floor.fileName,
        count: offices.length,
        offices,
        geojson,
        status: "success"
      });
      localStorage.setItem(
        `geojson-${floor.fileName}`,
        JSON.stringify(geojson)
      );
    } catch (error) {
      console.error(`\u274C Error processing ${floor.svgFile}:`, error);
      results.push({
        floor: floor.floorName,
        fileName: floor.fileName,
        count: 0,
        offices: [],
        geojson: { type: "FeatureCollection", features: [] },
        status: "failed",
        error: String(error)
      });
    }
  }
  console.log("\n\u2728 Extraction complete!");
  return results;
}
async function saveAllGeoJSONToServer(results) {
  console.log("\n\u{1F4BE} Saving GeoJSON files to server...\n");
  for (const result of results) {
    if (result.status === "failed") {
      console.warn(`\u23ED\uFE0F  Skipping ${result.floor} (extraction failed)`);
      continue;
    }
    try {
      const response = await fetch("/api/save-geojson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: result.fileName,
          floorName: result.floor,
          geojson: result.geojson
        })
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      console.log(`\u2705 Saved ${result.floor}: ${result.fileName}.geojson`);
    } catch (error) {
      console.error(`\u274C Failed to save ${result.floor}:`, error);
    }
  }
  console.log("\n\u2728 Save complete!");
}
async function seedAllFloorPlansToDatabase(results) {
  console.log("\n\u{1F5C4}\uFE0F  Seeding floor plan data to database...\n");
  for (const result of results) {
    if (result.status === "failed") {
      console.warn(`\u23ED\uFE0F  Skipping ${result.floor} (extraction failed)`);
      continue;
    }
    try {
      const response = await fetch("/api/seed-floor-locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          floor: result.floor,
          fileName: result.fileName,
          geojson: result.geojson
        })
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      console.log(`\u2705 Seeded ${result.floor}: ${data.count} locations`);
    } catch (error) {
      console.error(`\u274C Failed to seed ${result.floor}:`, error);
    }
  }
  console.log("\n\u2728 Seeding complete!");
}
async function processAllFloorPlans() {
  const results = await extractAllFloorPlans();
  await saveAllGeoJSONToServer(results);
  await seedAllFloorPlansToDatabase(results);
}
export {
  extractAllFloorPlans,
  processAllFloorPlans,
  saveAllGeoJSONToServer,
  seedAllFloorPlansToDatabase
};
