<?php

namespace App\Http\Controllers;

abstract class Controller
{
    public function favicon()
    {
        return response()->noContent();
    }
}
