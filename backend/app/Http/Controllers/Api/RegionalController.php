<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use App\Http\Resources\RegionalResource;
use App\Models\Regional;
use Illuminate\Http\Request;

class RegionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $regionals = Regional::with(['company:id,name', 'regionalManager:id,username'])
                                 ->orderBy('name')
                                 ->get();
    
            return response()->json([
                'success' => true,
                'message' => 'Regional Get Successfully!',
                'regionals' => $regionals
            ], 201);
    
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch regionals',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try{

            $request->validate([
                'name'=>'required|max:255',
                'company_id' => 'required|exists:companies,id'
            ]);
            $regional = Regional::create([
                'name' => $request->name,
                'company_id' => $request->company_id,
                'description' => $request->description,
                'regional_manager_id' => $request->ceo_id,
                'phone' => $request->phone,
            ]);
    
            return response()->json([
                'message'=> 'Regional created successfully',
                'regional' => $regional,
            ],200);
        }catch(\Exception $e){
            return response()->json([
                'message' => 'Something went wrong!',
                'error' => $e->getMessage()
            ],500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $regional = Regional::findOrFail($id);
    
            return response()->json([
                'message' => 'Regional retrieved successfully',
                'regional' => $regional
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }        
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $regional = Regional::findOrFail($id);
    
            return response()->json([
                'message' => 'Regional retrieved successfully',
                'regional' => $regional
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'company_id' => 'required|exists:companies,id',
            ]);
    
            $regional = Regional::findOrFail($id);
            $regional->update([
                'name' => $request->name,
                'regional_manager_id' => $request->ceo_id,
                'phone' => $request->phone,
                'company_id' => $request->company_id,
                'description' => $request->description,
            ]);
    
            return response()->json([
                'message' => 'Regional updated successfully',
                'regional' => $regional
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $regional = Regional::withCount('warehouses')->findOrFail($id);

            if ($regional->warehouses_count > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete regional because it has associated warehouses',
                    'count' => $regional->warehouses_count
                ], 200);

            }

            $regional->delete();

            return response()->json([
                'success' => true,
                'message' => 'Regional deleted successfully',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete regional',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
