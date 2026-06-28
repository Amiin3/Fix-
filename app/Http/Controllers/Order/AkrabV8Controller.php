<?php

namespace App\Http\Controllers\Order;



use App\Http\Controllers\Controller;

use App\Models\PpobProduct;

use App\Services\AdammediaService;

use Illuminate\Http\Request;

use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\DB;



class AkrabV8Controller extends Controller {

    // Fungsi pembantu agar kodingan rapi (Anti-Duplikasi)

    private function getMappedProducts(AdammediaService $srv) {

        $liveData = collect($srv->getLiveStock());

        

        // 🚀 AMBIL LEVEL USER BYPASS SESSION

        $userLevel = 'member';

        if (Auth::check()) {

            $userLevel = DB::table('users')->where('id', Auth::id())->value('level') ?? 'member';

        }



        $mapStock = function($items) use ($liveData, $userLevel) {

            return $items->map(function($p) use ($liveData, $userLevel) {

                // 🔥 TRIK SULTAN MILASTORE: KLONING STOK XDA KE XAP

                $lookupCode = strtoupper($p->product_code);

                if (str_starts_with($lookupCode, 'XAP')) {

                    // Paksa radar pusat membaca XAP sebagai XDA untuk mencuri jumlah stoknya

                    $lookupCode = str_replace('XAP', 'XDA', $lookupCode);

                }



                // Cari kecocokan kode di data live (Case Insensitive)

                $match = $liveData->first(function($val) use ($lookupCode) {

                    return strtoupper($val['kode']) === $lookupCode;

                });

                

                // Masukkan hasil stok ke objek produk

                $p->live_stock = $match['stok'] ?? 0;

                

                // 🚀 SUNTIKAN DISKON SULTAN PADA TAMPILAN & POLLING

                $p->price_sell = $this->hitungHargaReseller($p->price_sell, $p->price_buy ?? 0, 'adam', $userLevel);

                return $p;

            });

        };



        return [

            'reguler' => $mapStock(PpobProduct::where('provider_name', 'ADAMMEDIA')->where('category', 'REGULER')->get()),

            'circle'  => $mapStock(PpobProduct::where('provider_name', 'ADAMMEDIA')->where('category', 'CIRCLE')->get()),

            'promo'   => $mapStock(PpobProduct::where('provider_name', 'ADAMMEDIA')->where('category', 'PROMO')->get()), 

        ];

    }



    public function index(AdammediaService $srv) {

        $data = $this->getMappedProducts($srv);

        return Inertia::render('Order/AkrabV8', $data);

    }



    // 🚀 ENDPOINT KHUSUS POLLING 4 DETIK (JSON ONLY)

    public function liveStock(AdammediaService $srv) {

        return response()->json($this->getMappedProducts($srv));

    }

}

