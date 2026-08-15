<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\SpbuController;

// Public Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes (Requires Sanctum Token)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth User
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Public / Society Endpoints
    Route::get('/my-vehicles', [RegistrationController::class, 'myVehicles']);
    Route::post('/register-vehicle', [RegistrationController::class, 'registerVehicle']);

    // SPBU Operator Endpoints
    Route::post('/spbu/validate-qr', [SpbuController::class, 'validateQr']);
    Route::post('/spbu/validate-vehicle', [SpbuController::class, 'validateVehicle']);
    
});

