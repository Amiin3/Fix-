<?php
use Illuminate\Support\Facades\Route;

Route::get('/cek-user-asli', function () {
    $user = auth()->user();
    return response()->json([
        'status_login' => auth()->check() ? 'LOGGED_IN' : 'NOT_LOGGED_IN',
        'data_user_db' => $user,
        'session_id' => session()->getId(),
        'all_session' => session()->all()
    ]);
})->middleware(['web', 'auth']);
