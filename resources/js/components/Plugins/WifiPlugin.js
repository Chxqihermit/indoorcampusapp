import { registerPlugin } from "@capacitor/core";
const WifiPlugin = registerPlugin("WifiPlugin", {
  // Web fallback for browser testing
  web: () => ({
    startScan: async () => ({
      networks: [
        { ssid: "TestNetwork", bssid: "00:11:22:33:44:55", rssi: -65, frequency: 2437 }
      ]
    })
  })
});
var stdin_default = WifiPlugin;
export {
  stdin_default as default
};
