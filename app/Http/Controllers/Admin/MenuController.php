<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    private function getInitialMenus() {
        return [
            'admin' => [
                ['name' => 'VPN Manager', 'icon' => 'fa-server', 'route' => 'admin.vpn.index'],
                ['name' => 'Transaksi', 'icon' => 'fa-receipt', 'route' => 'admin.transaksi.index'],
                ['name' => 'Deposit', 'icon' => 'fa-wallet', 'route' => 'admin.deposit.index'],
                ['name' => 'Digiflazz', 'icon' => 'fa-bolt', 'route' => 'admin.digiflazz.index'],
                ['name' => 'Keuangan', 'icon' => 'fa-money-bill-trend-up', 'route' => 'admin.keuangan'],
                ['name' => 'Sistem XDA', 'icon' => 'fa-microchip', 'route' => 'admin.kaje.index'],
                ['name' => 'War XDA', 'icon' => 'fa-rocket', 'route' => 'admin.kaje.war.index'],
                ['name' => 'Command PO', 'icon' => 'fa-robot', 'route' => 'admin.po_v8'],
                ['name' => 'Promo', 'icon' => 'fa-bullhorn', 'route' => 'admin.promo.index'],
                ['name' => 'Sistem XLA', 'icon' => 'fa-users', 'route' => 'admin.khfy.index'],
                ['name' => 'War XLA', 'icon' => 'fa-jet-fighter', 'route' => 'admin.khfy.war.po'],
                ['name' => 'Adammedia', 'icon' => 'fa-satellite-dish', 'url' => '/admin/adammedia'],
                ['name' => 'Member', 'icon' => 'fa-users-gear', 'route' => 'admin.users'],
                ['name' => 'Audit', 'icon' => 'fa-user-secret', 'url' => '/admin/audit', 'isBlade' => 1],
                ['name' => 'Broadcast', 'icon' => 'fa-tower-broadcast', 'route' => 'admin.broadcast'],
                ['name' => 'Setting', 'icon' => 'fa-sliders', 'route' => 'profile.edit'],
                ['name' => 'Diskon', 'icon' => 'fa-tags', 'url' => '/admin/reseller-discounts'],
                ['name' => 'Payment', 'icon' => 'fa-money-check-dollar', 'url' => '/admin/payment-settings'],
                ['name' => 'Kelola Menu', 'icon' => 'fa-layer-group', 'url' => '/admin/menus']
            ],
            'app' => [
                ['name' => 'VPN V12', 'icon' => 'fa-shield-halved', 'bg' => 'bg-gradient-to-br from-blue-700 to-indigo-900 shadow-md border border-indigo-400/30', 'route' => 'order.vpn'],
                ['name' => 'Cek Kuota', 'icon' => 'fa-magnifying-glass-chart', 'bg' => 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md border border-emerald-400/30', 'url' => 'https://milastore.cloud/order/cek-kuota'],
                ['name' => 'Pulsa', 'icon' => 'fa-mobile-retro', 'bg' => 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md', 'route' => 'order.pulsa'],
                ['name' => 'Data', 'icon' => 'fa-wifi', 'bg' => 'bg-gradient-to-br from-indigo-400 to-purple-600 shadow-md', 'route' => 'order.data'],
                ['name' => 'E-Wallet', 'icon' => 'fa-wallet', 'bg' => 'bg-gradient-to-br from-sky-300 to-cyan-500 shadow-md', 'route' => 'order.ewallet'],
                ['name' => 'PLN', 'icon' => 'fa-bolt', 'bg' => 'bg-gradient-to-br from-yellow-300 to-amber-500 shadow-md', 'route' => 'order.pln'],
                ['name' => 'Pascabayar', 'icon' => 'fa-file-invoice-dollar', 'bg' => 'bg-gradient-to-br from-teal-400 to-emerald-600 shadow-md', 'route' => 'order.pascabayar'],
                ['name' => 'Games', 'icon' => 'fa-gamepad', 'bg' => 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-md', 'route' => 'order.games'],
                ['name' => 'Voucher', 'icon' => 'fa-ticket', 'bg' => 'bg-gradient-to-br from-rose-400 to-red-600 shadow-md', 'route' => 'order.voucher'],
                ['name' => 'Masa Aktif', 'icon' => 'fa-calendar-check', 'bg' => 'bg-gradient-to-br from-orange-400 to-rose-500 shadow-md', 'route' => 'order.masa-aktif'],
                ['name' => 'Akrab XLA', 'icon' => 'fa-users', 'bg' => 'bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-md', 'route' => 'order.akrab'],
                ['name' => 'Akrab V8', 'icon' => 'fa-share-nodes', 'bg' => 'bg-gradient-to-br from-pink-400 to-rose-600 shadow-md border border-pink-300/50', 'url' => '/order/akrabv8', 'isBlade' => 1],
                ['name' => 'PO XLA', 'icon' => 'fa-fire', 'bg' => 'bg-gradient-to-br from-red-500 to-orange-600 shadow-md', 'route' => 'war.xla.index'],
                ['name' => 'Akrab XDA', 'icon' => 'fa-microchip', 'bg' => 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-md', 'route' => 'order.xda'],
                ['name' => 'PO XDA', 'icon' => 'fa-rocket', 'bg' => 'bg-gradient-to-br from-indigo-500 to-blue-700 shadow-md', 'route' => 'order.po-xda.view'],
                ['name' => 'Tool XL', 'icon' => 'fa-wrench', 'bg' => 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md', 'route' => 'tools.xl'],
                ['name' => 'API Docs', 'icon' => 'fa-laptop-code', 'bg' => 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-md border border-slate-500/50', 'url' => '/developer/payment-gateway-docs']
            ]
        ];
    }

    private function autoSyncIfEmpty() {
        $count = DB::table('app_menus')->count();
        if ($count === 0) {
            $defaults = $this->getInitialMenus();
            $now = now();
            $order = 1;
            foreach ($defaults['admin'] as $m) {
                DB::table('app_menus')->insert([
                    'type' => 'admin', 'name' => $m['name'], 'icon' => $m['icon'],
                    'route' => $m['route'] ?? null, 'url' => $m['url'] ?? null,
                    'bg' => null, 'isBlade' => $m['isBlade'] ?? 0, 'order_num' => $order++, 'created_at' => $now, 'updated_at' => $now
                ]);
            }
            $order = 1;
            foreach ($defaults['app'] as $m) {
                DB::table('app_menus')->insert([
                    'type' => 'app', 'name' => $m['name'], 'icon' => $m['icon'],
                    'route' => $m['route'] ?? null, 'url' => $m['url'] ?? null,
                    'bg' => $m['bg'] ?? null, 'isBlade' => $m['isBlade'] ?? 0, 'order_num' => $order++, 'created_at' => $now, 'updated_at' => $now
                ]);
            }
        }
    }

    public function index() {
        $this->autoSyncIfEmpty();
        $adminMenus = DB::table('app_menus')->where('type', 'admin')->orderBy('order_num', 'asc')->get();
        $appMenus = DB::table('app_menus')->where('type', 'app')->orderBy('order_num', 'asc')->get();
        $settings = DB::table('settings')->whereIn('key', ['web_name', 'web_logo'])->pluck('value', 'key')->toArray();

        return Inertia::render('Admin/MenuManager', [
            'adminMenus' => $adminMenus,
            'appMenus' => $appMenus,
            'webSettings' => [
                'name' => $settings['web_name'] ?? 'MilaStore',
                'logo' => $settings['web_logo'] ?? ''
            ]
        ]);
    }

    public function apiList() {
        $this->autoSyncIfEmpty();
        $admin = DB::table('app_menus')->where('type', 'admin')->orderBy('order_num', 'asc')->get();
        $app = DB::table('app_menus')->where('type', 'app')->orderBy('order_num', 'asc')->get();
        return response()->json(['status' => 'custom', 'data' => [ 'admin' => $admin, 'app' => $app ]]);
    }

    public function store(Request $request) {
        $request->validate(['name' => 'required', 'type' => 'required']);
        
        $icon = $request->icon;

        // SEED UTAMA: LOGIKA MENERIMA UPLOAD FILE DARI GALERI HP
        if ($request->hasFile('icon_file')) {
            $file = $request->file('icon_file');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            // Pindahkan file secara aman ke folder public storage
            $file->move(public_path('storage/menus'), $filename);
            $icon = '/storage/menus/' . $filename;
        }

        $data = [
            'type' => $request->type,
            'name' => $request->name,
            'icon' => $icon,
            'url' => $request->url,
            'route' => $request->route_name,
            'bg' => $request->bg,
            'color' => $request->color ?? 'text-white',
            'isBlade' => $request->is_blade ? 1 : 0,
            'order_num' => $request->order_num ?? 0,
            'updated_at' => now()
        ];

        if ($request->id) {
            DB::table('app_menus')->where('id', $request->id)->update($data);
            return response()->json(['status' => true, 'message' => 'Menu berhasil diupdate!']);
        } else {
            if(!$request->order_num || $request->order_num == 0) {
                $data['order_num'] = DB::table('app_menus')->where('type', $request->type)->max('order_num') + 1;
            }
            $data['created_at'] = now();
            DB::table('app_menus')->insert($data);
            return response()->json(['status' => true, 'message' => 'Menu baru ditambahkan!']);
        }
    }

    public function updateOrder(Request $request) {
        foreach ($request->orders as $item) {
            DB::table('app_menus')->where('id', $item['id'])->update(['order_num' => $item['order_num']]);
        }
        return response()->json(['status' => true]);
    }

    public function destroy(Request $request) {
        DB::table('app_menus')->where('id', $request->id)->delete();
        return response()->json(['status' => true]);
    }

    public function saveWebSettings(Request $request) {
        DB::table('settings')->updateOrInsert(['key' => 'web_name'], ['value' => $request->web_name]);
        if ($request->hasFile('web_logo')) {
            $file = $request->file('web_logo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('storage/logo'), $filename);
            DB::table('settings')->updateOrInsert(['key' => 'web_logo'], ['value' => '/storage/logo/' . $filename]);
        }
        return redirect()->back()->with('success', 'Pengaturan Web Berhasil Disimpan!');
    }
}
