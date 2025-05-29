<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;
use Illuminate\Support\Facades\Validator;

class PromotionController extends Controller
{
    /**
     * Display a listing of active promotions
     */
    public function index()
    {
        $promotions = Promotion::where('end_date', '>=', now())
            ->select('id', 'person_discount', 'money_discount', 'start_date', 'end_date')
            ->get();
            
        return response()->json($promotions);
    }

    /**
     * Store a newly created promotion
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'person_discount' => 'nullable|numeric|between:0,100',
            'money_discount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date'
        ]);
    
        if (empty($validated['person_discount']) && empty($validated['money_discount'])) {
            return response()->json([
                'message' => 'At least one discount type (percentage or fixed amount) must be provided'
            ], 422);
        }
    
        $promotion = Promotion::create($validated);
    
        return response()->json([
            'message' => 'Promotion created successfully',
            'promotion' => $promotion
        ], 201);
    }

    /**
     * Display the specified promotion
     */
    public function show($id)
    {
        $promotion = Promotion::findOrFail($id);
        return response()->json([
            'id' => $promotion->id,
            'person_discount' => $promotion->person_discount,
            'money_discount' => $promotion->money_discount,
            'start_date' => $promotion->start_date,
            'end_date' => $promotion->end_date,
            'status' => $promotion->end_date >= now() ? 'Active' : 'Expired'
        ]);
    }

    /**
     * Update the specified promotion
     */
    public function update(Request $request, $id)
    {
        $promotion = Promotion::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'person_discount' => 'nullable|numeric|between:0,100',
            'money_discount' => 'nullable|numeric|min:0',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $promotion->update($request->all());

        return response()->json([
            'message' => 'Promotion updated successfully',
            'promotion' => $promotion
        ]);
    }

    /**
     * Remove the specified promotion
     */
    public function destroy($id)
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->delete();

        return response()->json([
            'message' => 'Promotion deleted successfully'
        ]);
    }

    /**
     * Get current active promotions
     */
    public function active()
    {
        $activePromotions = Promotion::where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->get();

        return response()->json($activePromotions);
    }
}