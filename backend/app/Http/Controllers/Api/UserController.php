<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

use App\Http\Resources\CustomerResource;
use App\Models\CustomerGroup;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($type = 'employee')
    {
        try{
            $users = User::getUsers($type);
            return response()->json([
                'message' => "Employee get successfully",
                'users' => $users,
            ],200);
        }catch (Exception $e){
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ],500);
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
                'username' => 'required|string|max:255',
                'phone' => 'required|string|max:255',
            ]);
    
            $customer_code = Str::random(8);
            while (User::where('customer_code', $customer_code)->exists()) {
                $customer_code = Str::random(8);
            }
    
            $customer = User::create([
                'username' => $request->username,
                'phone' => $request->phone,
                'role_id' =>$request->role_id,
                'customer_code' => $customer_code
            ]);
    
            return response()->json([
                'message' => 'Customer created successfully!',
                'customer' => $customer 
            ],200);
        }catch(Exception $e){
            return response()->json([
                'message' => 'Something went wrong!',
                'error' => $e->getMessage()
            ],500);
        }
    }
    public function addEmployee(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|exists:roles,id',
            'warehouse_id' => 'nullable',
            'profileImage' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->warehouse_id == 'company') {
            $validated['warehouse_id'] = null;
        }
    
        try {
            $employee = User::create([
                'username' => $validated['username'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'pass' => $validated['password'],
                'warehouse_id' => $validated['warehouse_id'],
            ]);
    
            UserRole::create([
                'user_id' => $employee->id,
                'role_id' => $validated['role'],
            ]);
    
            if ($request->hasFile('profileImage')) {
                $filename = time().'_'.uniqid().'.'.$request->file('profileImage')->getClientOriginalExtension();
                $path = $request->file('profileImage')->storeAs('employee_images', $filename, 'public');
                
                $employee->update([
                    'profile' => $filename
                ]);
            }
    
            return response()->json([
                'message' => 'Employee created successfully',
                'employee' => $employee
            ], 201);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Employee creation failed',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $employee = User::with('customerGroup')->find($id);

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        return response()->json([
            'customer' => $employee,
            'message' => 'Customer get successfully!'
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try{
            $customer = User::findOrfail($id);
            $role = UserRole::getRoleByUserId($id);
            $customer['role'] = $role;
            return response()->json([
                'message' => 'Customer get successfully',
                'customer' => $customer
            ],200);
        }catch(Exception $e){
            return response()->json([
                'message' => 'Someting went wrong!',
                'error' => $e->getMessage()
            ],500);
        }

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            // Manual validator
            $validator = Validator::make($request->all(), [
                'username' => 'sometimes|required|string|max:255',
                'phone' => 'sometimes|required|string|max:20',
                'covery_number' => 'nullable|string|max:255',
                'password' => 'nullable|string|min:8',
                'role_id' => 'sometimes|required|exists:roles,id',
                'warehouse_id' => 'nullable',
                'profileImage' => 'nullable|image|max:2048',
                'parents' => 'nullable|array',
                'parents.*' => 'exists:users,id',
                'children' => 'nullable|array',
                'children.*' => 'exists:users,id'
            ]);

            // if ($validator->warehouse_id == 'company') {
            //     $validator['warehouse_id'] = null;
            // }
    
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
    
            $validated = $validator->validated();
    
            $employee = User::findOrFail($id);
    
            // Update basic info
            $employee->update([
                'username' => $validated['username'],
                'phone' => $validated['phone'],
                'covery_number' => $validated['covery_number'] ?? null,
                'password' => Hash::make($validated['password']),
                'pass' => $validated['password'],
                // 'role_id' => $validated['role_id'],
                'warehouse_id' => $validated['warehouse_id'] == 'company'??null,
            ]);

            $userRole = UserRole::where('user_id', $employee['id'])->first();

                if ($userRole) {
                    $userRole->update([
                        'role_id' => $validated['role_id'],
                    ]);
            }

            
    
            // Update password if provided
            // if (!empty($validated['password'])) {
            //     $employee->password = Hash::make($validated['password']);
            //     $employee->save();
            // }
    
            // Handle profile image upload
            if ($request->hasFile('profileImage')) {
                // Delete old image if exists
                if ($employee->profile) {
                    Storage::delete('employee_images/'.$employee->profile);
                }
    
                $imagePath = $request->file('profileImage')->store('employee_images');
                $employee->profile = basename($imagePath);
                $employee->save();
            }
    
            // Sync relationships
            if (array_key_exists('parents', $validated)) {
                $employee->parents()->sync($validated['parents']);
            }
    
            if (array_key_exists('children', $validated)) {
                $employee->children()->sync($validated['children']);
            }
    
            return response()->json([
                'success' => true,
                'message' => 'Employee updated successfully',
                'employee' => $employee
            ]);
    
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $customer = User::findOrFail($id);
            $customer->delete();
    
            return response()->json([
                'message' => 'Customer deleted successfully',
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addSupplier(Request $request){
        $supplier = [
            'username' =>  $request->username,
            'phone' =>$request->phone,
            'company' =>$request->company,
            'address' =>$request->address,
            'type' => 'supplier'

        ];
        $user = User::create($supplier);
        if ($user) {
            $roleId = Role::getRoleIdByName('supplier');
            if (!$roleId) {
                return response()->json(['message' => "Create Role supplier First"],400);
            }
            UserRole::create([
                'user_id' => $user->id,
                'role_id' => $roleId
            ]);
        }
        $supplier['id'] = $user['id'];

        return response()->json([
            'message' => 'Supplier added successfully',
            'supplier' => $supplier,
        ], 200);
    }

    public function updateSupplier(Request $request, $id)
        {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'Supplier not found'], 404);
            }

            $user->username = $request->username;
            $user->phone = $request->phone;
            $user->company = $request->company;
            $user->address = $request->address;
            $user->type = 'supplier';
            $user->save();

            $roleId = Role::getRoleIdByName('supplier');
            if (!$roleId) {
                return response()->json(['message' => "Create Role supplier first"], 400);
            }

            UserRole::updateOrCreate(
                ['user_id' => $user->id],
                ['role_id' => $roleId]
            );

            return response()->json([
                'message' => 'Supplier updated successfully',
                'supplier' => $user,
            ], 200);
        }
  public function deleteSupplier($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }
        UserRole::where('user_id', $user->id)->delete();
        $user->delete();

        return response()->json([
            'message' => 'Supplier deleted successfully',
        ], 200);
    }
    
    
    public function getCustomerList()
    {
        $users = User::where('users.type', 'customer')
            ->leftJoin('customer_groups', 'users.customer_group_id', '=', 'customer_groups.id')
            ->select('users.*', 'customer_groups.name as group_name')
            ->get();

        return response()->json(['customers' => $users], 200);
    }

    
    public function deleteCustomer($id)
      {
          $user = User::find($id);
    
          if (!$user) {
              return response()->json(['message' => 'Customer not found'], 404);
          }
          UserRole::where('user_id', $user->id)->delete();
          $user->delete();
    
          return response()->json([
              'message' => 'Customer deleted successfully',
          ], 200);
      }

    public function quickAddCustomer(Request $request){
        $newCustomer = [
            'username' =>  $request->username,
            'phone' =>$request->phone,
            'type' => 'customer'

        ];
        $user = User::create($newCustomer);
        if ($user) {
            $roleId = Role::getRoleIdByName('customer');
            if (!$roleId) {
                return response()->json(['message' => "Create Role Customer First"],400);
            }
            UserRole::create([
                'user_id' => $user->id,
                'role_id' => $roleId
            ]);
        }
        $newCustomer['id'] = $user['id'];

        return response()->json([
            'message' => 'Customer added successfully',
            'customer' => $newCustomer,
        ], 200);
    }
    public function addCustomer(Request $request){
        $newCustomer = [
            'username' => $request->username,
            'phone' =>$request->phone,
            'address' =>$request->address,
            'customer_group_id' =>$request->customer_group_id,
            'type' => 'customer'

        ];
        $user = User::create($newCustomer);
        if ($user) {
            $roleId = Role::getRoleIdByName('customer');
            if (!$roleId) {
                return response()->json(['message' => "Create Role Customer First"],400);
            }
            UserRole::create([
                'user_id' => $user->id,
                'role_id' => $roleId
            ]);
        }
        $newCustomer['id'] = $user['id'];

        return response()->json([
            'message' => 'Customer added successfully',
            'customer' => $newCustomer,
        ], 200);
    }
    public function updateCustomer(Request $request , $id)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string|max:255',
            'customer_group_id' => 'nullable|exists:customer_groups,id',
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->username = $request->username;
        $user->phone = $request->phone;
        $user->address = $request->address ?? $user->address;
        $user->customer_group_id = $request->customer_group_id ?? $user->customer_group_id;
        $user->save();

        return response()->json([
            'message' => 'Customer updated successfully',
            'customer' => $user,
        ], 200);
    }


    public function importCustomer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customers.*.name' => 'required|max:255',
            'customers.*.contact_name' => 'nullable|max:255',
            'customers.*.phone' => 'nullable|max:255',
            'customers.*.code' => 'nullable|max:255',
            'customers.*.address' => 'nullable|max:500',
            'customers.*.group' => 'nullable|max:500',
        ]);



        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        foreach ($validated['customers'] as $customer) {
            $group = CustomerGroup::where('code', $customer['group'])->first();

            if (!$group) {
                return response()->json([
                    'success' => false,
                    'message' => "Customer group with code '{$customer['code']}' not found."
                ], 422);
            }
            User::create([
                'username' => $customer['name'],
                'contact_name' => $customer['contact_name']??null,
                'customer_code' => $customer['code']??null,
                'phone' => $customer['phone']??null,
                'address' => $customer['address']??null,
                'customer_group_id' => $group->id,
                'type' => 'customer',
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Customers imported successfully']);
    }


    





    
    
    
}
