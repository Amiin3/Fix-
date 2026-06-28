<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PpobProduct extends Model {
    protected $table = 'ppob_products';
    protected $fillable = ['provider_name', 'category', 'product_name', 'description', 'product_code', 'price_cost', 'price_sell', 'stock_count', 'is_active'];
}
