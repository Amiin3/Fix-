<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AkrabAccount extends Model
{
    protected $table = 'akrab_accounts';
    protected $fillable = ['msisdn', 'data_member', 'last_sync'];
    protected $casts = [
        'data_member' => 'array',
        'last_sync' => 'datetime',
    ];
}
