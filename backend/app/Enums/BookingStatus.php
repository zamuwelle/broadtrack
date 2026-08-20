<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Released = 'released';
    case Returned = 'returned';
    case Cancelled = 'cancelled';
}
