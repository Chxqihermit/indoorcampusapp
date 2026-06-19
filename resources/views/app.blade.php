<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Background colour matches splash so there is no white flash --}}
        <style>
            html {
                background-color: #1d2758;
            }

            html.dark {
                background-color: #0d1533;
            }

            /* ── Splash screen ─────────────────────────────────────── */
            #app-splash {
                position: fixed;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0;
                z-index: 99999;
                background: radial-gradient(circle at center, #1d2758 0%, #0d1533 100%);
                transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                            transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }

            #app-splash.fade-out {
                opacity: 0;
                transform: scale(1.04);
                pointer-events: none;
            }

            @keyframes shield-pulse {
                0%, 100% {
                    transform: scale(1);
                    filter: drop-shadow(0 0 12px rgba(246, 177, 31, 0.2));
                }
                50% {
                    transform: scale(1.05);
                    filter: drop-shadow(0 0 24px rgba(246, 177, 31, 0.5));
                }
            }

            @keyframes progress-slide {
                0%   { left: -45%; width: 40%; }
                50%  { width: 55%; }
                100% { left: 100%; width: 40%; }
            }

            .splash-logo {
                animation: shield-pulse 2.4s ease-in-out infinite;
                height: 80px;
                width: auto;
                margin-bottom: 20px;
            }

            .splash-title {
                font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
                font-size: 1.375rem;
                font-weight: 600;
                color: #ffffff;
                letter-spacing: -0.02em;
                margin-bottom: 4px;
            }

            .splash-subtitle {
                font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
                font-size: 0.8125rem;
                color: rgba(255,255,255,0.5);
                margin-bottom: 28px;
            }

            .splash-track {
                width: 160px;
                height: 3px;
                background: rgba(255,255,255,0.12);
                border-radius: 9999px;
                overflow: hidden;
                position: relative;
            }

            .splash-bar {
                position: absolute;
                top: 0;
                height: 100%;
                background: linear-gradient(90deg, #f6b11f 0%, #d9272d 100%);
                border-radius: 9999px;
                animation: progress-slide 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.jsx','resources/css/app.css', "resources/js/pages/{$page['component']}.jsx"])
        @inertiaHead
        <script>
            setTimeout(function () {
                var splash = document.getElementById('app-splash');
                if (!splash || !splash.parentNode) return;
                var hint = document.createElement('p');
                hint.style.cssText = 'font-family:sans-serif;font-size:12px;color:rgba(255,255,255,0.7);margin-top:16px;max-width:280px;text-align:center;line-height:1.5';
                hint.textContent = 'Still loading? From the project root run: npm run build';
                splash.appendChild(hint);
            }, 12000);
        </script>
    </head>
    <body class="font-sans antialiased">

        {{-- Splash screen: visible before React boots, dismissed in app.jsx --}}
        <div id="app-splash" role="status" aria-label="Loading NUST Campus App">
            <img src="/images/nust-logo.png" class="splash-logo" alt="NUST Logo" />

            <p class="splash-title">Campus App</p>
            <p class="splash-subtitle">Loading campus map&hellip;</p>

            <div class="splash-track">
                <div class="splash-bar"></div>
            </div>
        </div>

        @inertia
    </body>
</html>
