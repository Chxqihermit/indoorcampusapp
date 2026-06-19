<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Serve Vite/build assets from the same host as the request (127.0.0.1 in browser,
        // 10.0.2.2 in Android emulator, LAN IP on physical phones).
        if (! $this->app->runningInConsole() && ! $this->app->runningUnitTests()) {
            $request = request();
            if ($request && $request->getHttpHost()) {
                URL::forceRootUrl($request->getSchemeAndHttpHost());
            }
        }
    }
}
