import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { WebView } from "react-native-webview";
import { CAMPUS_WEB_URL } from "@/constants/config";
import { BRAND_BLUE } from "@/constants/colors";
import { createGeoBridge } from "@/webview/geoBridge";

const WEBVIEW_BOOTSTRAP = `
  document.documentElement.classList.add('expo-webview');
  true;
`;

const WEBVIEW_READY_POLL = `
  (function pollReady(attempts) {
    var splash = document.getElementById('app-splash');
    var app = document.getElementById('app');
    if (!splash || !splash.parentNode || (app && app.children.length > 0)) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'campus-ready' }));
      }
      return;
    }
    if (attempts > 60) return;
    setTimeout(function() { pollReady(attempts + 1); }, 500);
  })(0);
  true;
`;

function WebAppScreen() {
  const webRef = useRef(null);
  const geoBridgeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const readyRef = useRef(false);

  useEffect(() => {
    geoBridgeRef.current = createGeoBridge(webRef);
    geoBridgeRef.current.primePermissions();

    return () => {
      geoBridgeRef.current?.dispose();
      geoBridgeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!readyRef.current) {
        setLoading(false);
        setError(
          "The campus map did not finish loading. Run npm run build in the project root, keep php artisan serve running, then tap Retry."
        );
      }
    }, 25000);
    return () => clearTimeout(timer);
  }, []);

  const markReady = useCallback(() => {
    readyRef.current = true;
    setLoading(false);
    setError(null);
  }, []);

  const reload = useCallback(() => {
    readyRef.current = false;
    setError(null);
    setLoading(true);
    webRef.current?.reload();
  }, []);

  const onWebMessage = useCallback(async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data?.type === "campus-ready") {
        markReady();
        return;
      }

      await geoBridgeRef.current?.handleMessage(data);
    } catch {
      if (event.nativeEvent.data === "campus-ready") {
        markReady();
      }
    }
  }, [markReady]);

  const onGeolocationPermissionsShowPrompt = useCallback(async (event) => {
    const granted = await geoBridgeRef.current?.primePermissions?.();
    if (!granted) {
      event.nativeEvent.request.deny();
      return;
    }
    event.nativeEvent.request.grant(event.nativeEvent.origin);
  }, []);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={BRAND_BLUE} />
          <Text style={styles.loadingText}>Loading campus map…</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Could not load the web app</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>URL: {CAMPUS_WEB_URL}</Text>
          <Pressable style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          ref={webRef}
          source={{ uri: CAMPUS_WEB_URL }}
          style={styles.webview}
          injectedJavaScriptBeforeContentLoaded={WEBVIEW_BOOTSTRAP}
          geolocationEnabled
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          allowsInlineMediaPlayback
          originWhitelist={["*"]}
          setSupportMultipleWindows={false}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => {
            webRef.current?.injectJavaScript(WEBVIEW_READY_POLL);
          }}
          onMessage={onWebMessage}
          onGeolocationPermissionsShowPrompt={onGeolocationPermissionsShowPrompt}
          onError={(e) => {
            setLoading(false);
            setError(e.nativeEvent.description || "Network error");
          }}
          onHttpError={(e) => {
            if (e.nativeEvent.statusCode >= 400) {
              setLoading(false);
              setError(`HTTP ${e.nativeEvent.statusCode}`);
            }
          }}
          {...Platform.select({
            android: { mixedContentMode: "always" }
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    zIndex: 2
  },
  loadingText: { marginTop: 12, color: "#4b5563", fontSize: 14 },
  errorBox: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  errorText: { fontSize: 14, color: "#dc2626", textAlign: "center" },
  errorHint: { marginTop: 12, fontSize: 12, color: "#6b7280", textAlign: "center" },
  retryBtn: {
    marginTop: 16,
    backgroundColor: BRAND_BLUE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10
  },
  retryText: { color: "#fff", fontWeight: "700" }
});

export { WebAppScreen };
