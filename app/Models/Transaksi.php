<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model {
    protected $table = 'transaksi'; // 🚀 FIX: Pakai nama tunggal sesuai database Lu
    protected $guarded = []; 
    public $timestamps = true; // Karena Lu punya created_at & updated_at
}
