<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($company_name = false): JsonResponse
    {
        try {
            $companies = Company::getCompanys($company_name);
            return response()->json([
                'success' => true,
                'message' => 'Companies get successfully!',
                'companies' => $companies
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch companies',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'location' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255|unique:companies,email',
                'ceo_id' => 'nullable|exists:users,id'
            ]);
            
            $company = Company::create([
                'name' => $validated['name'],
                'location' => $validated['location'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'ceo_id' => $validated['ceo_id'] ?? null,
            ]);
            
            return response()->json([
                'success' => true,
                'company' => $company,
                'message' => 'Company created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create company',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $company = Company::find($id);
            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'Something went wrong!',
                    'message' => 'Company not found'
                ], 404);
            }
    
            return response()->json([
                'success' => true,
                'message' => 'Company get successfully !',
                'company' => $company
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch company',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'location' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'email' => 'sometimes|email|max:255|unique:companies,email,'.$id,
            ]);
            $company = Company::findOrFail($id);
            
            if (!$company) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company not found'
                ], 404);
            }
    
            $company->update([
                'name' => $validated['name'] ?? $company->name,
                'email' => $validated['email'] ?? $company->email,
                'phone' => $validated['phone'] ?? $company->phone,
                'location' => $validated['location'] ?? $company->location
            ]);
            
            return response()->json([
                'success' => true,
                'company' => $company,
                'message' => 'Company updated successfully'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update company',
                'error' => $e->getMessage()
            ], 500);
        }
    }

public function destroy($id): JsonResponse
{
    try {
        $company = Company::find($id);
        
        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'Company not found'
            ], 404);
        }

        // Check using count() which is more reliable
        if ($company->regionals()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete company because it has associated regionals'
            ], 422);
        }

        $company->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Company deleted successfully'
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete company',
            'error' => $e->getMessage()
        ], 500);
    }
}
}