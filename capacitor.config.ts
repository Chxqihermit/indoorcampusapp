import type { CapacitorConfig } from '@capacitor/cli';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function envValue(name: string): string | undefined {
    if (process.env[name]) {
        return process.env[name]!.trim();
    }

    const envPath = resolve(__dirname, '.env');
    if (!existsSync(envPath)) {
        return undefined;
    }

    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        const eq = trimmed.indexOf('=');
        if (eq === -1) {
            continue;
        }

        const key = trimmed.slice(0, eq).trim();
        if (key !== name) {
            continue;
        }

        let value = trimmed.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"'))
            || (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        return value;
    }

    return undefined;
}

const serverUrl = envValue('CAPACITOR_SERVER_URL');

const config: CapacitorConfig = {
    appId: 'com.example.indoornav',
    appName: 'CampusNav',
    webDir: 'public',
    android: {
        allowMixedContent: true,
    },
    ...(serverUrl
        ? {
              server: {
                  url: serverUrl,
                  cleartext: serverUrl.startsWith('http://'),
              },
          }
        : {}),
};

export default config;
