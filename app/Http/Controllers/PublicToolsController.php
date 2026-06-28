<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class PublicToolsController extends Controller
{
    public function index()
    {
        return Inertia::render('Public/MilaTools');
    }

    public function getAreaAll()
    {
        $db = [
            "Area 1" => "kulon progo, yogyakarta, sleman, bantul, gunungkidul, bandung, kuningan, purwakarta, jembrana, buleleng, maluku tenggara barat, kepulauan aru, tual, seram bagian barat, maluku tengah, seram bagian timur, ambon, maluku tenggara, maluku barat daya, buru selatan, buru, halmahera barat, halmahera utara, kepulauan sula, halmahera timur, pulau taliabu, halmahera selatan, tidore kepulauan, ternate, halmahera tengah, pulau morotai, asmat, jayapura, mimika, keerom, biak numfor, kepulauan yapen, boven digoel, merauke, deiyai, dogiyai, intan jaya, jayawijaya, lanny jaya, mamberamo raya, mamberamo tengah, mappi, nabire, nduga, paniai, pegunungan bintang, puncak, puncak jaya, sarmi, supiori, tolikara, waropen, yahukimo, yalimo",
            "Area 2" => "tangerang selatan, tangerang, pandeglang, lebak, serang, cilegon, jakarta pusat, jakarta selatan, jakarta barat, jakarta timur, jakarta utara, bandung barat, cimahi, cirebon, indramayu, subang, tegal, surakarta, brebes, kebumen, pemalang, semarang, probolinggo, bangkalan, sidoarjo, banyuwangi, surabaya, sampang, pamekasan, sumenep, pacitan, bangka selatan, pangkal pinang, belitung, belitung timur, batam, aceh barat daya, aceh besar, sabang, gayo lues, pekanbaru, kepulauan mentawai, karo, medan, dairi, hulu sungai tengah, tapin, hulu sungai utara, tabalong, banjarmasin, banjar, tanah bumbu, banjarbaru, hulu sungai selatan, mamuju tengah, barru, pare pare, pinrang, konawe kepulauan, konawe utara, buton utara, wakatobi, badung, karangasem, tabanan, bangli, gianyar, klungkung, denpasar, lombok barat, lombok timur, mataram, lombok tengah, lombok utara, sumbawa barat, sumbawa, bima, dompu",
            "Area 3" => "kepulauan seribu, bogor, depok, bekasi, banjar, ciamis, tasikmalaya, majalengka, sumedang, garut, boyolali, salatiga, cilacap, grobogan, kendal, rembang, lumajang, probolinggo, seluma, batanghari, jambi, tanjung jabung barat, muaro jambi, sarolangun, bangka, bangka tengah, bangka barat, karimun, bintan, tanjung pinang, lampung tengah, pringsewu, metro, pesawaran, lampung selatan, bandar lampung, aceh jaya, aceh selatan, aceh tenggara, nagan raya, banda aceh, kuantan singingi, pelalawan, kampar, siak, dumai, rokan hilir, indragiri hulu, kepulauan meranti, bengkalis, payakumbuh, padang panjang, sijunjung, padang pariaman, padang, solok selatan, ogan komering ilir, penukal abab lematang ilir, banyuasin, palembang, ogan ilir, binjai, tebing tinggi, serdang bedagai, langkat, deli serdang, batu bara, tanjung balai, asahan, gunungsitoli, nias barat, nias selatan, nias utara, balangan, barito kuala, tanah laut, kotabaru, kapuas, pulang pisau, palangkaraya, majene, polewali mandar, mamuju utara, sinjai, enrekang, sidenreng rappang, luwu timur, soppeng, tana toraja, banggai kepulauan, banggai laut, palu, toli toli, tojo una una, morowali, morowali utara, bau bau, muna, buton selatan, buton tengah, muna barat",
            "Area 4" => "cianjur, pangandaran, karawang, sukabumi, pekalongan, batang, purbalingga, kudus, sukoharjo, klaten, magelang, banyumas, temanggung, sragen, banjarnegara, karanganyar, wonosobo, jepara, demak, purworejo, blora, wonogiri, pati, jombang, blitar, kediri, lamongan, ngawi, mojokerto, magetan, gresik, tulungagung, nganjuk, pasuruan, bojonegoro, madiun, bondowoso, tuban, situbondo, jember, malang, ponorogo, batu, trenggalek, bengkulu selatan, kaur, lebong, rejang lebong, bengkulu tengah, bengkulu utara, kepahiang, muko muko, tanjung jabung timur, kerinci, bungo, tebo, merangin, sungai penuh, lingga, kepulauan anambas, natuna, lampung barat, lampung timur, tulang bawang barat, way kanan, tulang bawang, tanggamus, pesisir barat, lampung utara, mesuji, aceh barat, aceh singkil, aceh tamiang, aceh tengah, subulussalam, bener meriah, aceh utara, lhokseumawe, pidie, aceh timur, simeulue, langsa, bireuen, pidie jaya, rokan hulu, indragiri hilir, pasaman barat, pasaman, lima puluh kota, tanah datar, dharmasraya, solok, bukittinggi, pariaman, sawahlunto, pesisir selatan, ogan komering ulu timur, ogan komering ulu selatan, ogan komering ulu, musi rawas, musi rawas utara, empat lawang, pagar alam, lubuk linggau, musi banyuasin, muara enim, lahat, prabumulih, pakpak bharat, mandailing natal, padang lawas, labuhanbatu utara, padangsidimpuan, tapanuli selatan, labuhanbatu selatan, labuhanbatu, tapanuli utara, padang lawas utara, humbang hasundutan, simalungun, toba samosir, pematangsiantar, tapanuli tengah, samosir, sibolga, nias, sekadau, kapuas hulu, sintang, bengkayang, melawi, sambas, sanggau, kubu raya, pontianak, kayong utara, landak, mempawah, singkawang, ketapang, seruyan, kotawaringin barat, katingan, kotawaringin timur, sukamara, lamandau, murung raya, barito timur, barito utara, barito selatan, gunung mas, penajam paser utara, balikpapan, paser, kutai kartanegara, samarinda, bontang, berau, kutai timur, kutai barat, mahakam ulu, tana tidung, malinau, bulungan, tarakan, nunukan, pahuwato, boalemo, gorontalo, gorontalo utara, bone bolango, mamuju, mamasa, kepulauan selayar, takalar, jeneponto, bulukumba, pangkajene kepulauan, makassar, gowa, maros, bone, wajo, luwu, luwu utara, palopo, toraja utara, banggai, parigi moutong, donggala, sigi, poso, buol, kolaka, kolaka utara, konawe, konawe selatan, kendari, kolaka timur, buton, bombana, bolaang mongondow, bolaang mongondow selatan, kotamobagu, minahasa selatan, bolaang mongondow timur, minahasa tenggara, bolaang mongondow utara, tomohon, minahasa, manado, minahasa utara, bitung, kepulauan sangihe, kepulauan talaud, siau tagulandang biaro, bima, alor, kupang, malaka, manggarai barat, timor tengah selatan, belu, sikka, timor tengah utara, lembata, manggarai timur, ende, sumba barat daya, rote ndao, nagekeo, flores timur, ngada, sumba tengah, manggarai, sumba barat, sumba timur, sabu raijua, teluk bintuni, sorong selatan, sorong, teluk wondama, manokwari, fak fak, kaimana, manokwari selatan, maybrat, pegunungan arfak, raja ampat, tambrauw"
        ];

        $formatted = [];
        foreach ($db as $area => $list) {
            $cities = explode(', ', $list);
            sort($cities);
            $formatted[] = [
                'area' => $area,
                'cities' => array_map('ucwords', $cities)
            ];
        }

        return response()->json(['status' => 'success', 'data' => $formatted]);
    }

    public function cekStokFilter()
    {
        // 🔥 VAKSIN ANTI-DDOS AKTIF: CACHE 5 DETIK 🔥
        return Cache::remember('milastore_live_stok', 5, function () {
            $hasil_stok = [];

            // 1. Tarik Data KHFY
            try {
                $khfy_url = rtrim(env("KHFY_URL", "https://panel.khfy-store.com/api_v2"), '/');
                $khfy_req = Http::withoutVerifying()
                    ->withUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0')
                    ->connectTimeout(5)->timeout(10)
                    ->get("{$khfy_url}/list_product", ['api_key' => env("KHFY_API_KEY")]);
                    
                if ($khfy_req->successful()) {
                    $resData = $khfy_req->json();
                    $list = $resData['data'] ?? []; 
                    if(is_array($list)){
                        foreach ($list as $p) {
                            if(!is_array($p)) continue;
                            $kode = strtoupper($p['kode_produk'] ?? '');
                            if (str_contains($kode, 'XLA') || str_contains($kode, 'XDA')) {
                                $kategori = str_contains($kode, 'XLA') ? 'XLA' : 'KDA_PDAP'; 
                                $isKosong = (isset($p['kosong']) && $p['kosong'] == 1);
                                $isGangguan = (isset($p['gangguan']) && $p['gangguan'] == 1);
                                $status = 'Tersedia'; $stokAngka = 'Ready';
                                if ($isKosong) { $status = 'Kosong'; $stokAngka = 'Habis'; } 
                                elseif ($isGangguan) { $status = 'Gangguan'; $stokAngka = '-'; }
                                
                                $hasil_stok[] = [
                                    'kategori' => $kategori,
                                    'kode' => $kode,
                                    'nama' => $p['nama_produk'] ?? 'Produk XL',
                                    'status' => $status,
                                    'stok_angka' => $stokAngka
                                ];
                            }
                        }
                    }
                }
            } catch (\Exception $e) {}

            // 2. Tarik Data KAJE
            try {
                $kaje_req = Http::withoutVerifying()
                    ->withHeaders([
                        'x-api-key' => env("KAJE_API_KEY", ""), 
                        'accept' => 'application/json',
                        'Cache-Control' => 'no-cache'
                    ])
                    ->connectTimeout(5)->timeout(10)
                    ->post("https://end.kaje-store.com/api/service/stock-product", []);

                if ($kaje_req->successful()) {
                    $dataKaje = $kaje_req->json();
                    if (isset($dataKaje['success']) && $dataKaje['success'] === true && isset($dataKaje['data'])) {
                        foreach ($dataKaje['data'] as $p) {
                            $kode = strtoupper($p['code'] ?? '');
                            if (str_contains($kode, 'KDA') || str_contains($kode, 'PDAP') || str_contains($kode, 'PDA') || str_contains($kode, 'PCRL') || str_contains($kode, 'PDFM')) {
                                $stok = (int)($p['stock'] ?? 0);
                                $isKosong = (isset($p['status']) && strtolower($p['status']) == 'kosong') || $stok <= 0;
                                
                                $hasil_stok[] = [
                                    'kategori' => 'KDA_PDAP',
                                    'kode' => $kode,
                                    'nama' => $p['name'] ?? 'Promo Data',
                                    'status' => $isKosong ? 'Kosong' : 'Tersedia',
                                    'stok_angka' => $isKosong ? 'Habis' : $stok
                                ];
                            }
                        }
                    }
                }
            } catch (\Exception $e) {}

            usort($hasil_stok, function($a, $b) { return strcmp($a['kode'], $b['kode']); });
            return response()->json(['status' => 'success', 'data' => $hasil_stok]);
        });
    }
}
