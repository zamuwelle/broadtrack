<?php

use Illuminate\Support\Facades\Route;

Route::get('test', fn() => 'wassup');
Route::get('favicon.icon', fn() => response()->noContent());
