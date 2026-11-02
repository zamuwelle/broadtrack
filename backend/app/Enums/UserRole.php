<?php

namespace App\Enums;

enum UserRole: string
{
	case Borrower = 'borrower';
	case Admin = 'admin';
}
