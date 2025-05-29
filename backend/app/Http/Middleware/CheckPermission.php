<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next , string $permission): Response
    {


        $permissions = auth('api')->payload()->get('permissions');

        $hasPermission = collect($permissions)->contains('name' , $permission);

        if (!$hasPermission) {
            return response()->json([
                'error' =>'Unauthorized'
            ],403);
        };
        return $next($request);
    }
}
