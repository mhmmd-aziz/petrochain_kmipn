<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\OperatorController;
use App\Http\Controllers\AuditorController;
use App\Http\Controllers\FuelStockController;
use App\Http\Controllers\UserRegistrationController;
use App\Http\Controllers\AdminRegistrationController;

// Public Landing Page
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

// Public Stock View
Route::get('/public-stock', [FuelStockController::class, 'publicIndex'])->name('public.stock');
Route::get('/stock', function () {
    return redirect()->route('public.stock');
});

Route::middleware(['auth'])->group(function () {
    // Redirect /dashboard based on role
    Route::get('/dashboard', function () {
        $role = request()->user()->role;
        if ($role === 'admin') return redirect()->route('admin.dashboard');
        if ($role === 'operator') return redirect()->route('operator.dashboard');
        if ($role === 'auditor') return redirect()->route('auditor.dashboard');
        return redirect()->route('registrations.index');
    })->name('dashboard');

    // Admin Routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminRegistrationController::class, 'dashboard'])->name('dashboard');
        Route::get('/registrations', [AdminRegistrationController::class, 'index'])->name('registrations');
        Route::post('/registrations/{id}/review', [AdminRegistrationController::class, 'review'])->name('registrations.review');
        Route::post('/registrations/{id}/rerun-ai', [AdminRegistrationController::class, 'rerunAi'])->name('registrations.rerun_ai');
        Route::get('/spbu', [\App\Http\Controllers\SpbuController::class, 'index'])->name('spbu');
        Route::post('/spbu', [\App\Http\Controllers\SpbuController::class, 'store'])->name('spbu.store');
        Route::put('/spbu/{spbu}', [\App\Http\Controllers\SpbuController::class, 'update'])->name('spbu.update');
        Route::delete('/spbu/{spbu}', [\App\Http\Controllers\SpbuController::class, 'destroy'])->name('spbu.destroy');
    });

    // Dummy resource routes for admin/operator to avoid 404
    Route::get('/vehicles', [\App\Http\Controllers\VehicleController::class, 'index'])->name('vehicles.index');
    Route::post('/vehicles', [\App\Http\Controllers\VehicleController::class, 'store'])->name('vehicles.store');
    Route::put('/vehicles/{vehicle}', [\App\Http\Controllers\VehicleController::class, 'update'])->name('vehicles.update');
    Route::delete('/vehicles/{vehicle}', [\App\Http\Controllers\VehicleController::class, 'destroy'])->name('vehicles.destroy');

    Route::get('/users', [\App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::post('/users', [\App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');

    Route::get('/blockchain', function() {
        return Inertia::render('Admin/Blockchain', [
            'transactions' => \App\Models\Transaction::with(['spbu', 'vehicle'])->orderBy('id', 'desc')->get()
        ]);
    })->name('blockchain.index');

    // Operator Routes
    Route::middleware(['role:operator'])->prefix('operator')->name('operator.')->group(function () {
        Route::get('/dashboard', [OperatorController::class, 'dashboard'])->name('dashboard');
        Route::get('/validation', [OperatorController::class, 'validation'])->name('validation');
        Route::get('/validation-motor', [OperatorController::class, 'validationMotor'])->name('validation.motor');
        Route::post('/validation/process', [OperatorController::class, 'processValidation'])->name('validation.process');
        Route::get('/stock', [FuelStockController::class, 'operatorIndex'])->name('stock');
        Route::post('/stock/update', [FuelStockController::class, 'operatorUpdate'])->name('stock.update');
        Route::post('/stock/add', [FuelStockController::class, 'operatorStore'])->name('stock.store');
        Route::delete('/stock/{id}', [FuelStockController::class, 'operatorDestroy'])->name('stock.destroy');
    });

    // Auditor Routes
    Route::middleware(['role:auditor'])->prefix('auditor')->name('auditor.')->group(function () {
        Route::get('/dashboard', [AuditorController::class, 'dashboard'])->name('dashboard');
        Route::get('/transactions', [AuditorController::class, 'transactions'])->name('transactions');
    });

    // Public User Registration Routes
    Route::get('/registrations', [UserRegistrationController::class, 'index'])->name('registrations.index');
    Route::get('/registrations/create', [UserRegistrationController::class, 'create'])->name('registrations.create');
    Route::post('/registrations', [UserRegistrationController::class, 'store'])->name('registrations.store');
    
    // Transaksi History for all authenticated users
    Route::get('/transactions/export/pdf', [TransactionController::class, 'exportPdf'])->name('transactions.export.pdf');
    Route::get('/transactions/export/csv', [TransactionController::class, 'exportCsv'])->name('transactions.export.csv');
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
});

require __DIR__.'/auth.php';
