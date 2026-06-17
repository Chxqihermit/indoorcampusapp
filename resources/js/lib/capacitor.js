import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export function isNativeApp() {
    return Capacitor.isNativePlatform();
}

export function geolocationAllowed() {
    if (Capacitor.isNativePlatform()) {
        return true;
    }

    const { protocol, hostname } = window.location;

    return (
        protocol === 'https:'
        || hostname === 'localhost'
        || hostname === '127.0.0.1'
        || hostname === '10.0.2.2'
        || hostname.endsWith('.test')
        || hostname.endsWith('.local')
    );
}

export function initializeCapacitor() {
    if (!Capacitor.isNativePlatform()) {
        return;
    }

    document.documentElement.classList.add(
        'capacitor-native',
        `capacitor-${Capacitor.getPlatform()}`,
    );

    Geolocation.requestPermissions().catch(() => undefined);
}
