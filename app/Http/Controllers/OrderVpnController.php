<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\VpnProduct;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;

class OrderVpnController extends Controller
{
    public function index() {
        return Inertia::render('Order/Vpn', [
            'products' => VpnProduct::where('is_active', true)->get(),
            'userBalance' => (float) auth()->user()->saldo
        ]);
    }

    public function store(Request $request) {
        $request->validate([
            'protocol' => 'required|string',
            'duration' => 'required|integer|min:1',
            'username' => 'required|alpha_dash|max:20',
            'credential' => 'nullable|string|max:50',
            'kuota' => 'nullable|integer|min:1',
            'limit_ip' => 'required|integer|min:1|max:10' 
        ]);

        $user = auth()->user();
        $prod = VpnProduct::where('protocol', $request->protocol)->first();
        if (!$prod) return response()->json(['status' => false, 'message' => 'Layanan tidak ditemukan.']);

        $isXray = in_array($request->protocol, ['vmess', 'vless', 'trojan']);
        
        $totalPrice = ($prod->price_per_day * $request->duration) + ($prod->price_per_ip * $request->limit_ip);
        if ($isXray) $totalPrice += ($prod->price_per_gb * ($request->kuota ?? 10));

        if ($user->saldo < $totalPrice) return response()->json(['status' => false, 'message' => 'Saldo tidak cukup Kak!']);

        DB::beginTransaction();
        try {
            DB::table('users')->where('id', $user->id)->decrement('saldo', $totalPrice);
            $newBalance = $user->saldo - $totalPrice;

            $apiUrl = env('VPN_API_URL') ?: 'http://vpn.milastore.cloud/api/v12.php';
            $apiKey = env('VPN_API_KEY') ?: '79bc29a684142b7ea5fa52c539c79b95';

            $params = [
                'key' => $apiKey,
                'action' => $request->protocol,
                'user' => $request->username,
                'durasi' => $request->duration,
                'limit' => $request->limit_ip, 
            ];

            if ($isXray) $params['kuota'] = $request->kuota ?? 10;
            else $params['pass'] = $request->credential;

            $response = Http::timeout(30)->get($apiUrl, $params);
            $apiData = $response->json();

            if ($response->successful() && ($apiData['status'] ?? '') === 'success') {
                $ref_id = 'MSVPN-' . strtoupper(Str::random(6)) . '-' . time();
                
                $namaLayanan = 'VPN ' . strtoupper($request->protocol) . ' ' . $request->duration . ' Hari (' . $request->limit_ip . ' Device)';
                if($isXray) $namaLayanan = 'VPN ' . strtoupper($request->protocol) . ' ' . $request->duration . ' Hari (' . ($request->kuota ?? 10) . 'GB | ' . $request->limit_ip . ' Dev)';

                DB::table('transaksi')->insert([
                    'ref_id' => $ref_id, 'tujuan' => $request->username, 'sn' => 'VPN-' . strtoupper($request->protocol),
                    'username' => $user->email ?? $user->name, 'kode_layanan' => $namaLayanan,
                    'harga' => $totalPrice, 'status' => 'Sukses',
                    'created_at' => now(), 'updated_at' => now()
                ]);

                DB::commit();
                // 🛡️ SUNTIKAN ANTI CRASH: Kita kirimkan $request->protocol langsung ke Formatter!
                return response()->json(['status' => true, 'new_balance' => $newBalance, 'data' => $this->formatOutput($apiData, $request->protocol)]);
            } else {
                DB::rollBack();
                return response()->json(['status' => false, 'message' => 'Gagal API: ' . ($apiData['message'] ?? $response->body())]);
            }
        } catch (\Throwable $e) { 
            DB::rollBack();
            return response()->json(['status' => false, 'message' => 'CRASH PHP: ' . $e->getMessage()]);
        }
    }

    // 🎨 FORMATTER V12 TERBARU DENGAN FALLBACK PROTOCOL
    private function formatOutput($data, $reqProtocol) {
        $garis = "==============================\n";
        
        // 🛡️ BACA PROTOCOL DARI DATA JSON. KALAU KOSONG, PAKAI PROTOCOL DARI FORM PEMBELI!
        $protocol = strtolower($data['protocol'] ?? $reqProtocol);
        $protocolName = strtoupper($protocol);
        
        $template = "✨ 𝐌𝐈𝐋𝐀𝐒𝐓𝐎𝐑𝐄 $protocolName 𝐕𝟏𝟐 ✨\n$garis";
        
        $user = $data['user'] ?? '-';
        $exp = $data['exp'] ?? '-';
        $host = $data['host'] ?? 'vpn.milastore.cloud';
        $limit = $data['limit'] ?? '2';
        $bug_default = "sni.milastore.cloud"; 
        
        if (in_array($protocol, ['ssh', 'zivpn'])) {
            $pass = $data['pass'] ?? 'Lihat di Web';
            $template .= "👤 Username  : $user\n🔑 Password  : $pass\n🌐 Host/IP   : $host\n📊 Limit IP  : $limit Device\n";
            if ($protocol == 'ssh') {
                $template .= "🔰 Port SSH  : 22\n🔰 Port WS   : 80, 8080, 443\n" . (isset($data['udp_port']) ? "🔰 Port UDP  : {$data['udp_port']}\n" : "");
                $template .= "$garis\n📝 𝐏𝐚𝐲𝐥𝐨𝐚𝐝 𝐖𝐞𝐛𝐒𝐨𝐜𝐤𝐞𝐭:\nGET / HTTP/1.1[crlf]Host: $host[crlf]Upgrade: websocket[crlf]Connection: Keep-Alive[crlf]User-Agent: [ua][crlf][crlf]\n";
            } else {
                $template .= "🛡️ Auth Type : " . ($data['auth_type'] ?? 'ziVPN Custom') . "\n🎯 UDP Port  : " . ($data['udp_custom'] ?? '7100, 7200, 7300') . "\n";
                $template .= "$garis\n💡 𝐂𝐚𝐫𝐚 𝐏𝐚𝐤𝐚𝐢:\nGunakan aplikasi ziVPN, masukkan kredensial lalu pilih UDP Custom.\n";
            }
            $template .= "$garis";
        } else {
            $kuota = $data['kuota'] ?? '10';
            $template .= "👤 Username  : $user\n🌐 Domain    : $host\n🎯 SNI/Bug   : $bug_default\n📊 Limit IP  : $limit Device\n📦 Kuota     : $kuota GB\n$garis";
            
            if (isset($data['link_tls'])) {
                $link_tls = $data['link_tls'];
                $template .= "🔒 𝐅𝐨𝐫𝐦𝐚𝐭 𝐓𝐋𝐒 (443):\n{$link_tls}\n\n🔓 𝐅𝐨𝐫𝐦𝐚𝐭 𝐍𝐨𝐧-𝐓𝐋𝐒 (80):\n" . str_replace(['tls', '443'], ['none', '80'], $link_tls) . "\n\n";
                
                if ($protocol == 'vmess') {
                    $decoded = base64_decode(substr($link_tls, 8));
                    $grpc_json = str_replace(['"net":"ws"','"path":"/vmess-ws"'], ['"net":"grpc"','"path":"vmess-grpc"'], $decoded);
                    $template .= "🚀 𝐅𝐨𝐫𝐦𝐚𝐭 𝐠𝐑𝐏𝐂 (443):\nvmess://" . base64_encode($grpc_json) . "\n";
                } else {
                    $template .= "🚀 𝐅𝐨𝐫𝐦𝐚𝐭 𝐠𝐑𝐏𝐂 (443):\n" . str_replace(['type=ws', 'path=/' . $protocol . '-ws'], ['type=grpc', 'serviceName=' . $protocol . '-grpc'], $link_tls) . "\n";
                }
                $template .= "$garis";
            }
        }
        $template .= "⏳ 𝐄𝐱𝐩𝐢𝐫𝐞𝐝 𝐃𝐚𝐭𝐞 : $exp\n$garis\n✨ 𝐓𝐡𝐚𝐧𝐤𝐬 𝐟𝐨𝐫 𝐨𝐫𝐝𝐞𝐫 𝐚𝐭 𝐌𝐢𝐥𝐚 𝐒𝐭𝐨𝐫𝐞 ✨\n";
        return $template;
    }
}
