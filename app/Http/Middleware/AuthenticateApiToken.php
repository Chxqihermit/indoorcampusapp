<?php

namespace App\Http\Middleware;

use App\Models\PersonalAccessToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $bearer = $request->bearerToken();
        if (! $bearer || ! str_contains($bearer, '|')) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        [$id, $plainText] = explode('|', $bearer, 2);

        $accessToken = PersonalAccessToken::query()->find($id);
        if (! $accessToken || ! hash_equals($accessToken->token, hash('sha256', $plainText))) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($accessToken->expires_at && $accessToken->expires_at->isPast()) {
            return response()->json(['message' => 'Token expired.'], 401);
        }

        $user = $accessToken->tokenable;
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $accessToken->forceFill(['last_used_at' => now()])->save();
        $request->setUserResolver(fn () => $user);
        $request->attributes->set('currentAccessToken', $accessToken);

        return $next($request);
    }
}
