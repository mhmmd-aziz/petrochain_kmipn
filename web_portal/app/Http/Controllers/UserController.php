<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('operator.spbu')->get();
        // If we have an Operator model, the relation should be loaded to show assigned SPBU
        
        $spbus = DB::table('spbu')->select('id', 'name', 'code')->get();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'spbus' => $spbus
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,operator,auditor,public',
            'spbu_id' => 'required_if:role,operator'
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => 'active'
            ]);

            if ($request->role === 'operator') {
                DB::table('operators')->insert([
                    'user_id' => $user->id,
                    'spbu_id' => $request->spbu_id,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'User berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menambahkan user: ' . $e->getMessage());
        }
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,operator,auditor,public',
            'spbu_id' => 'required_if:role,operator'
        ]);

        DB::beginTransaction();
        try {
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'role' => $request->role,
            ]);

            if ($request->password) {
                $user->update(['password' => Hash::make($request->password)]);
            }

            // Handle operator logic
            if ($request->role === 'operator') {
                DB::table('operators')->updateOrInsert(
                    ['user_id' => $user->id],
                    ['spbu_id' => $request->spbu_id, 'updated_at' => now()]
                );
            } else {
                DB::table('operators')->where('user_id', $user->id)->delete();
            }

            DB::commit();
            return redirect()->back()->with('success', 'User berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal memperbarui user: ' . $e->getMessage());
        }
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();
            return redirect()->back()->with('success', 'User berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus user.');
        }
    }
}
