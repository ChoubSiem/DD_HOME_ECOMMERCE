<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\App;

class SetLocale
{
    public function handle($request, Closure $next)
    {
        // Get the locale from the `Accept-Language` header or query parameter
        $locale = $request->header('Accept-Language') ?? $request->query('locale');

        if ($locale && in_array($locale, ['en', 'kh'])) { // Validate supported locales
            App::setLocale($locale);
        }

        return $next($request);
    }
}
