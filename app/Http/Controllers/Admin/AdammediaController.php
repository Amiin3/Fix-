<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Services\AdammediaService;

use App\Models\PpobProduct;

use Illuminate\Http\Request;

use Inertia\Inertia;



class AdammediaController extends Controller {

    public function index(AdammediaService $srv) {

        return Inertia::render('Admin/Adammedia', [

            'info'     => $srv->getInfoAdmin(),

            'products' => PpobProduct::where('provider_name', 'ADAMMEDIA')->orderBy('category')->get()

        ]);

    }



    public function ticket(Request $request, AdammediaService $srv) {

        $res = $srv->requestTicket($request->amount);

        return response()->json(['message' => $res]);

    }



    public function sync(AdammediaService $srv) {

        $live = collect($srv->getLiveStockAdmin('regulers'))->concat($srv->getLiveStockAdmin('circles'));

        if($live->isEmpty()) return back()->with('error', 'Gagal ambil data stok!');

        foreach ($live as $p) {

            $safeName = $p['name'] ?? $p['config'] ?? 'PRODUK';

            PpobProduct::updateOrCreate(

                ['product_code' => $p['config'], 'provider_name' => 'ADAMMEDIA'],

                [

                    'product_name' => $safeName,

                    'category'     => str_contains(strtolower($safeName), 'circle') ? 'CIRCLE' : 'REGULER',

                    'price_cost'   => $p['price'] ?? 0,

                    'is_active'    => ($p['status'] ?? '') === 'pagi' ? 1 : 0,

                ]

            );

        }

        return back()->with('success', 'Sinkronisasi Berhasil!');

    }



    public function update(Request $request, $id) {

        $product = PpobProduct::findOrFail($id);

        

        // Cek input, jika parameter tidak dikirim maka pakai nilai lama dari database (Sistem Pengaman Saklar)

        $product->update([

            'price_sell'  => $request->has('price_sell') ? $request->price_sell : $product->price_sell,

            'is_active'   => $request->has('is_active') ? $request->is_active : $product->is_active,

            'description' => $request->has('description') ? $request->description : $product->description

        ]);

        

        return back();

    }

}

