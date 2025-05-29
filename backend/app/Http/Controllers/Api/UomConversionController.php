<?php 

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UomConversion;
use Illuminate\Http\Request;

class UomConversionController extends Controller
{
    public function index()
    {
        $conversions = UomConversion::with(['fromUnit', 'toUnit'])->get();
        $simplified = $conversions->map(function ($item) {
            return [
                'id' => $item->id,
                'from_unit' => $item->fromUnit ?? null,
                'to_unit' => $item->toUnit ?? null,
                'conversion_rate' => $item->conversion_rate, 
                'description' => $item->description, 
            ];
        });
    
        return response()->json([
            'message' => "UomConversion get successfully!",
            "uoms" => $simplified
        ]);
    }
    

    public function store(Request $request)
    {
        $request->validate([
            'from_unit' => 'required|exists:units,id',
            'to_unit' => 'required|exists:units,id',
            'conversion_rate' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $conversion = UomConversion::create($request->all());

        return response()->json(['message' => 'UOM Conversion created', 'data' => $conversion], 201);
    }

    public function show($id)
    {
        $conversion = UomConversion::with(['fromUnit', 'toUnit'])->findOrFail($id);
        return response()->json($conversion);
    }

    public function update(Request $request, $id)
    {
        $conversion = UomConversion::findOrFail($id);
        $request->validate([
            'from_unit' => 'required|exists:units,id',
            'to_unit' => 'required|exists:units,id',
            'conversion_rate' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $conversion->update($request->all());
        return response()->json(['message' => 'UOM Conversion updated', 'data' => $conversion]);
    }

    public function destroy($id)
    {
        $conversion = UomConversion::findOrFail($id);
        $conversion->delete();

        return response()->json(['message' => 'UOM Conversion deleted']);
    }
}
