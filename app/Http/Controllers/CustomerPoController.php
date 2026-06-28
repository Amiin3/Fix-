<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerPoController extends Controller
{
    private function getPrioritas($kode) {
        $prioMap = ['CFMX'=>0, 'XLA89'=>1, 'XLA14'=>2, 'XLA32'=>3, 'XLA39'=>4, 'XLA51'=>5, 'XLA65'=>6];
        return $prioMap[strtoupper($kode)] ?? 99;
    }

    public function index() {
        $user = auth()->user();
        $isAdmin = $user && ($user->id === 1 || (isset($user->level) && $user->level === 'admin') || (isset($user->role) && $user->role === 'admin'));
        
        $products = DB::table('layanan_khfy')->get()
            ->filter(function($i) use ($isAdmin) {
                $kode = strtoupper($i->kode_layanan);
                $isXla = str_starts_with($kode, 'XLA');
                $isCfmx = $kode === 'CFMX';
                if ($isCfmx && !$isAdmin) return false;
                return $isXla || $isCfmx;
            })
            ->map(fn($i) => [
                'kode_layanan' => $i->kode_layanan,
                'nama_layanan' => $i->nama_layanan,
                'harga_jual' => (float)$i->harga_jual,
                'status' => $i->status,
                'deskripsi' => $i->deskripsi ?? '',
                'prioritas' => $this->getPrioritas($i->kode_layanan)
            ])->sortBy('prioritas')->values();
            
        return Inertia::render('Order/PreOrderXla', [
            'products' => $products,
            'total_antri' => DB::table('antrian_po')->whereIn('status', ['Menunggu', 'Proses_API'])->count()
        ]);
    }

    public function store(Request $request) {
        $request->validate(['no_hp' => 'required|string', 'kode_produk' => 'required|string']);
        $user = auth()->user();
        
        if (strtoupper($request->kode_produk) === 'CFMX') {
            $isAdmin = ($user->id === 1 || (isset($user->level) && $user->level === 'admin') || (isset($user->role) && $user->role === 'admin'));
            if (!$isAdmin) {
                return $request->wantsJson() 
                    ? response()->json(['success' => false, 'message' => "Akses Ditolak!"]) 
                    : back()->withErrors(['error' => "Akses Ditolak!"]);
            }
        }
        
        $produk = DB::table('layanan_khfy')->where('kode_layanan', $request->kode_produk)->first();
        if (!$produk) {
            return $request->wantsJson() 
                ? response()->json(['success' => false, 'message' => "Produk tidak ditemukan."]) 
                : back()->withErrors(['error' => "Produk tidak ditemukan."]);
        }
        
        // 🧠 OTAK SMART MULTI TRANSAKSI
        $raw_numbers = preg_split('/[\r\n,]+/', $request->no_hp);
        $tujuan_list = [];
        foreach($raw_numbers as $n) {
            $clean = preg_replace('/[^0-9]/', '', $n);
            if(strlen($clean) >= 10) $tujuan_list[] = $clean;
        }
        
        // Anti-Bocor: Hapus nomor duplikat yang diinput user
        $tujuan_list = array_values(array_unique($tujuan_list));
        $qty = count($tujuan_list);
        
        $msgKosong = "Tidak ada nomor valid.";
        $msgLimit = "Maksimal 20 nomor sekaligus!";
        
        if ($qty == 0) return $request->wantsJson() ? response()->json(['success' => false, 'message' => $msgKosong]) : back()->withErrors(['error' => $msgKosong]);
        if ($qty > 20) return $request->wantsJson() ? response()->json(['success' => false, 'message' => $msgLimit]) : back()->withErrors(['error' => $msgLimit]);
        
        $harga_satuan = (float)$produk->harga_jual;
        $total_harga = $harga_satuan * $qty;
        
        DB::beginTransaction();
        try {
            // 🚀 BENTENG SULTAN: PESSIMISTIC LOCKING
            $lockedUser = \App\Models\User::where('id', $user->id)->lockForUpdate()->first();
            
            if ($lockedUser->saldo < $total_harga) {
                DB::rollBack();
                $msgSaldo = "Saldo kurang! Butuh Rp " . number_format($total_harga, 0, ',', '.');
                return $request->wantsJson() ? response()->json(['success' => false, 'message' => $msgSaldo]) : back()->withErrors(['error' => $msgSaldo]);
            }
            
            // 💰 POTONG SALDO AMAN
            DB::table('users')->where('id', $lockedUser->id)->decrement('saldo', $total_harga);
            
            $antrian_data = [];
            $transaksi_data = [];
            $waktu = now();
            $base_ref = 'POX-' . time();
            
            // 🚀 RAKIT PELURU SHOTGUN
            foreach($tujuan_list as $index => $tujuan) {
                $ref = $base_ref . '-' . $index;
                $antrian_data[] = [
                    'ref_id' => $ref,
                    'username' => $lockedUser->username ?? $lockedUser->name,
                    'kode_produk' => $request->kode_produk,
                    'tujuan' => $tujuan,
                    'harga' => $harga_satuan,
                    'status' => 'Menunggu',
                    'prioritas' => $this->getPrioritas($request->kode_produk),
                    'tanggal' => $waktu,
                    'created_at' => $waktu,
                    'updated_at' => $waktu
                ];
                $transaksi_data[] = [
                    'username' => $lockedUser->username ?? $lockedUser->name,
                    'ref_id' => $ref,
                    'kode_layanan' => $request->kode_produk,
                    'tujuan' => $tujuan,
                    'harga' => $harga_satuan,
                    'status' => 'Pending',
                    'sn' => 'Antrean WAR',
                    'tanggal' => $waktu,
                    'created_at' => $waktu,
                    'updated_at' => $waktu
                ];
            }
            
            // 🔥 TEMBAKKAN SEKALIGUS (BULK INSERT)
            DB::table('antrian_po')->insert($antrian_data);
            DB::table('transaksi')->insert($transaksi_data);
            
            DB::commit();
            
            $msgSukses = "$qty Pesanan berhasil masuk Radar!";
            
            // 💡 SMART RESPONSE (Bisa buat Inertia, bisa buat Axios)
            if ($request->wantsJson()) {
                return response()->json(['success' => true, 'message' => $msgSukses]);
            }
            return back()->with('success', $msgSukses);
            
        } catch (\Exception $e) {
            DB::rollBack();
            $msgGagal = "Sistem sibuk, coba lagi.";
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $msgGagal]);
            }
            return back()->withErrors(['error' => $msgGagal]);
        }
    }
}
