<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    protected $fillable = [
        'key',
        'first_name',
        'last_name',
        'email',
        'company',
        'reason',
        'is_active',
    ];
}
