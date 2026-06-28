<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    // Hanya kolom ini yang boleh diisi lewat Request/Input
    protected $fillable = [
        'api_key', 'ip_whitelist',
        'name', 'email', 'password', 'whatsapp', 'phone', 'username', 'api_key', 'ip_whitelist', 'webhook_url'
    ];

    // Kolom ini HARAM diisi lewat input (Harus manual lewat Admin/Database)
    protected $guarded = [
        'id', 'saldo', 'role', 'level'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];
}
