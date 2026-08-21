<?php

use Illuminate\Support\Facades\Route;

Route::get('test', fn() => 'wassup');
Route::get('favicon.icon', fn() => response()->noContent());

Route::get('user', function ($request) {
	Route::get('me', fn() => $request->user());
})->middleware('auth:sanctum');
