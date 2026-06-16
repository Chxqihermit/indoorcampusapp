import { registerPlugin } from "@capacitor/core";
const WifiScanner = registerPlugin("WifiPlugin", {
  web: async () => {
    return {
      startScan: async () => ({
        networks: [
          {
            ssid: "Mock Wi-Fi Network",
            bssid: "00:11:22:33:44:55",
            rssi: -50,
            frequency: 2437
          }
        ]
      }),
      checkPermissions: async () => ({ location: "granted" }),
      requestPermissions: async () => ({ location: "granted" })
    };
  }
});
var stdin_default = WifiScanner;
export {
  stdin_default as default
};
