<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

abstract class Controller
{
    public function favicon(): Response
    {
        return response()->noContent();
    }
}
