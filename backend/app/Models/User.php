<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password'])]
class User extends Authenticatable
{
	use HasFactory;

	protected function casts()
	{
		return [
			'password' => 'hashed'
		];
	}
}
