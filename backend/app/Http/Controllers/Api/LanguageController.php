<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class LanguageController extends Controller
{
    public function change(Request $request)
    {
        $locale = $request->input('locale');

        if (!in_array($locale, ['en', 'kh'])) {
            return response()->json(['error' => 'Invalid locale'], 400);
        }

        App::setLocale($locale);

        return response()->json([
            'message' => 'Language changed successfully',
            'locale' => $locale,
        ]);
    }
}
