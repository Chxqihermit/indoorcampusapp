async function diagnoseSvg(svgUrl) {
  try {
    const response = await fetch(svgUrl);
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const root = svgDoc.documentElement;
    if (root.tagName !== "svg") {
      console.error("Invalid SVG document");
      return null;
    }
    const textElements = svgDoc.querySelectorAll("text");
    const textSamples = [];
    textElements.forEach((el, i) => {
      if (i < 10) {
        textSamples.push({
          text: el.textContent?.trim().substring(0, 50) || "",
          x: el.getAttribute("x") || "none",
          y: el.getAttribute("y") || "none"
        });
      }
    });
    const tspanElements = svgDoc.querySelectorAll("tspan");
    const groups = svgDoc.querySelectorAll("g");
    const groupLabels = [];
    groups.forEach((g, i) => {
      if (i < 10) {
        const label = g.getAttribute("id") || g.getAttribute("class") || `Group ${i}`;
        const children = g.children.length;
        groupLabels.push({ label, children });
      }
    });
    const analysis = {
      fileName: svgUrl.split("/").pop() || "unknown",
      hasText: textElements.length > 0,
      textCount: textElements.length,
      hasTspan: tspanElements.length > 0,
      tspanCount: tspanElements.length,
      hasGroups: groups.length > 0,
      groupCount: groups.length,
      textSamples,
      groupLabels,
      svgDimensions: {
        width: root.getAttribute("width") || "auto",
        height: root.getAttribute("height") || "auto"
      },
      xmlns: root.getAttribute("xmlns") || "none"
    };
    return analysis;
  } catch (error) {
    console.error("Diagnostic error:", error);
    return null;
  }
}
async function diagnoseAllFloorPlans() {
  const floors = ["basement", "ground", "first", "second"];
  const results = {};
  for (const floor of floors) {
    console.log(`
\u{1F50D} Analyzing library-${floor}.svg...`);
    const analysis = await diagnoseSvg(`/floor-plans/library-${floor}.svg`);
    if (analysis) {
      results[floor] = analysis;
      console.log(`\u2705 ${floor}:`);
      console.log(`   Text elements: ${analysis.textCount}`);
      console.log(`   Tspan elements: ${analysis.tspanCount}`);
      console.log(`   Groups: ${analysis.groupCount}`);
      console.log(`   Dimensions: ${analysis.svgDimensions.width} x ${analysis.svgDimensions.height}`);
      console.log(`   Samples:`, analysis.textSamples);
    } else {
      console.warn(`\u274C Failed to analyze ${floor}`);
    }
  }
  return results;
}
export {
  diagnoseAllFloorPlans,
  diagnoseSvg
};
