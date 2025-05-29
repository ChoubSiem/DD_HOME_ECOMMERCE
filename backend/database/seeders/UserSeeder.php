<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\UserRole;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'username' => 'Super Admin',
            'phone' => '068402014',
            'password' => Hash::make('password'),
            'user_group_id' => null,
        ]);

        User::create([
            'username' => 'Seller',
            'phone' => '068402015',
            'password' => Hash::make('password'),
            'user_group_id' => null,
        ]);
        Role::create(['id' => 1, 'name' => 'super_admin']);
        Role::create(['id' => 2, 'name' => 'seller']);

        UserRole::create([
            'user_id' => 1,
            'role_id' => 1,
        ]);


        UserRole::create([
            'user_id' => 2,
            'role_id' => 2,
        ]);
    }
}
