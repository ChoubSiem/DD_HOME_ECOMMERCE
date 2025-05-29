<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use App\Http\Resources\SettingResource;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $settings = Setting::all();
        return SettingResource::collection($settings);
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        try{
            
            foreach ($request->settings as $setting_data) {
                $setting = Setting::findOrFail($setting_data['id']);
                $setting->update($setting_data);
                $updated_settings[] = $setting;
            }

            $updated_settings = [];
            return response()->json([
                'message' => 'Settings updated successfully',
                'settings' => $updated_settings
            ], 200);

        }catch(\Exception $e){
            return response()->json([
                'message' => 'Something went wrong!',
                'error' => $e->getMessage()
            ],500);
        }




    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
