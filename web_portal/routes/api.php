<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\SpbuController;

// Public Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Public endpoints
Route::get('/public/spbus', [SpbuController::class, 'publicList']);
Route::get('/iot/latest-transaction', [App\Http\Controllers\Api\IotController::class, 'getLatestTransaction']);

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
    Route::post('/spbu/validate-motor', [SpbuController::class, 'validateMotor']);
    Route::post('/spbu/submit-transaction', [SpbuController::class, 'submitTransaction']);
    Route::get('/spbu/check-quota', [SpbuController::class, 'checkQuota']);
    
});

