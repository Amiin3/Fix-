<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\KajeService;
use Inertia\Inertia;

class XlToolController extends Controller
{
    protected $kaje;

    public function __construct(KajeService $kaje) {
        $this->kaje = $kaje;
    }

    public function index() {
        return Inertia::render('Tools/XlSakti');
    }

    public function process(Request $request) {
        $action = $request->action;
        $number = $request->number;
        $otp = $request->otp;

        if (empty($number) || strlen($number) < 10) {
            return response()->json(['success' => false, 'message' => 'Nomor XL tidak valid']);
        }

        switch ($action) {
            case 'get_otp':
                return response()->json($this->kaje->xlGetOtp($number));
            case 'login_otp':
                return response()->json($this->kaje->xlLoginOtp($number, $otp));
            case 'cek_kuota':
                return response()->json($this->kaje->xlCheckQuota($number));
            case 'cek_pulsa':
                return response()->json($this->kaje->xlCheckBalance($number));
            case 'kunci_pulsa':
                return response()->json($this->kaje->xlLockBalance($number, true));
            case 'buka_pulsa':
                return response()->json($this->kaje->xlLockBalance($number, false));
            default:
                return response()->json(['success' => false, 'message' => 'Aksi tidak dikenal']);
        }
    }
}
