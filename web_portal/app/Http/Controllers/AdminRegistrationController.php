<?php

namespace App\Http\Controllers;

use App\Models\RegistrationApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AdminRegistrationController extends Controller
{
    public function index()
    {
        $applications = RegistrationApplication::with(['vehicle', 'user', 'ocrResults'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Registrations', [
            'applications' => $applications,
        ]);
    }

    public function review(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,needs_reupload',
            'admin_notes' => 'nullable|string',
        ]);

        $application = RegistrationApplication::with('vehicle')->findOrFail($id);
        
        $application->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'reviewed_at' => now(),
            'reviewer_id' => $request->user()->id,
        ]);

        $vehicle = $application->vehicle;

        if ($request->status === 'approved') {
            // Generate QR Code token logic
            $token = Str::random(32);
            $vehicle->update([
                'registration_status' => 'approved',
                'qr_code_token' => $token,
                'qr_generated_at' => now(),
            ]);
            // Here, you would typically also generate an actual QR code image and store its path in 'qr_code_path'
        } else if ($request->status === 'rejected') {
            $vehicle->update(['registration_status' => 'rejected']);
        }

        return back()->with('success', 'Aplikasi berhasil direview.');
    }
}
