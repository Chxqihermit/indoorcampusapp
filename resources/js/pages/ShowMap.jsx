import MapWithAnimatedPath from "@/components/MapWithAnimatedPath";
function ShowMap() {
  return <div style={{ padding: "40px" }}>
            <h1 style={{ marginBottom: "20px", fontSize: "24px" }}>My Map Page</h1>

            {
    /* Your MapComponent will render here.
      The height/width (100% / 500px) is set inside MapComponent.tsx
    */
  }
            <MapWithAnimatedPath />
        </div>;
}
export {
  ShowMap as default
};
