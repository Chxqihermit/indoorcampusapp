<?php

namespace App\Models\Concerns;

use App\Models\PersonalAccessToken;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

trait CreatesApiTokens
{
    public function tokens(): MorphMany
    {
        return $this->morphMany(PersonalAccessToken::class, 'tokenable');
    }

    public function createApiToken(string $name = 'mobile'): string
    {
        $plainText = Str::random(40);

        $accessToken = $this->tokens()->create([
            'name' => $name,
            'token' => hash('sha256', $plainText),
            'abilities' => ['*'],
        ]);

        return $accessToken->id.'|'.$plainText;
    }

    public function deleteApiToken(PersonalAccessToken $token): void
    {
        if ($token->tokenable_id === $this->getKey() && $token->tokenable_type === $this->getMorphClass()) {
            $token->delete();
        }
    }
}
