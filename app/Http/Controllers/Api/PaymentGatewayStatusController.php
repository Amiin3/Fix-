<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PaymentGatewayStatusController extends Controller {
    public function check($id) {
        $trx = DB::table('deposits')->where('id', $id)->select('status', 'total_bayar')->first();
        if (!$trx) return response()->json(['status' => 'not_found'], 404);
        
        $status = strtoupper($trx->status);
        return response()->json([
            'trx_id' => $id,
            'status' => $status,
            'is_paid' => in_array($status, ['SUKSES', 'BERHASIL', 'LUNAS'])
        ]);
    }
}
