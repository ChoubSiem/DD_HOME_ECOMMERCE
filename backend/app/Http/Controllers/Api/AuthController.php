<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'phone' => 'required_without:email|numeric|unique:users',
            'email' => 'required_without:phone|string|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role_id' => 'required|exists:roles,id'
        ]);
    
        $user = User::create([
            'username' => $request->username,
            'phone' => $request->phone,
            'email' => $request->email,
            'role_id' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        $token = JWTAuth::fromUser($user);
        return \response()->json([
            'message' => 'User created successfully',
            'user' => $user,
            'token' => $token ,
        ], 201);
    }

    public function login(Request $request)
    {
        
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string|min:6',
        ]);
        $credentials = $request->only('phone', 'password');
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'message' => $credentials,
            ], 401);
        }
        
        $user = Auth::user();
        $role = User::getRoleByUserId($user->id);
        $user['role'] = $role->role_name;
        $user['role_id'] = $role->role_id;
        $permissions = PermissionController::get_role_permissions($role->role_id);
        $payload = [
            'user' => $user,
            'permission' => $permissions 
        ];

        $token = JWTAuth::claims($payload)->fromUser(JWTAuth::user());
        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token, 
            'permissions' =>$permissions
        ], 200);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json([
            'message' => 'Logout successful',
        ], 200);
    }

    public function getProfile(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            return response()->json([
                'message' => 'Profile get successfully',
                'user' => $user
            ], 200);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token is invalid or expired'], 401);
        }
    }
    public function updateProfileImage(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $request->validate([
                'profile_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($user->profile) {
                $oldPath = 'profiles/' . $user->profile;
                Storage::disk('profile_images')->delete($oldPath);
            }

            $image = $request->file('profile_image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(storage_path('profiles'), $imageName);

            $user->profile = $imageName;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profile image updated successfully',
                'profile_image_path' => storage_path('profiles/' . $imageName),
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong'], 500);
        }
    }

    public function deleteProfile()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            if ($user->profile) {
                $imagePath = storage_path('profiles/' . $user->profile);
                if (file_exists($imagePath)) {
                    unlink($imagePath); 
                }
                $user->getProfile = null;
                $user->save();
            }
    
            return response()->json([
                'success' => true,
                'message' => 'Profile image deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Something went wrong'], 500);
        }
    }

    public function updateInfo(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $request->validate([
                'username' => 'string|max:255',
                'phone' => 'string|max:20',
                'recovery_number' => 'string|max:100',
                'gender' => 'string|max:10',
            ]);
    
            $user->fill($request->only(['username', 'phone', 'recovery_number','gender']))->save();
            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePassword(Request $request){

        try {

            $user = JWTAuth::accessToken()->authenticate();
            $user->fill($request->only(['password']))->save();

        }catch(\Exception $e){
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }

    }

    public function resetPassword()
    {
        try{
            

            // todo 



        }catch(\Exception $e){
            return response()->json([
                'message' =>'Something when wrong',
                'error' => $e->getMessage() ,
            ],500);
        }
    }
    
    
    
}
