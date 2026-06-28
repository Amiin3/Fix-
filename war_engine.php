<?php
/**
 * WAR ENGINE KHFYPAY - ULTIMATE TRABAS (LIMIT 2 TRX MAX)
 * Anti-Banned, Anti-Cloudflare, Dynamic Limiter.
 * Status: SIAP RILIS (PRODUCTION READY)
 */

require_once 'config/database.php'; 
$khfy_config = require 'config/khfy_config.php';
$api_key = $khfy_config['api_key']; 
$base_url = rtrim($khfy_config['base_url'] ?? 'https://panel.khfy-store.com/api_v2', '/');

header('Content-Type: application/json');
error_reporting(0); 

$action = $_POST['action'] ?? '';

// --- 🛡️ SENSOR KEAMANAN PASS/PIN ---
function safeLog($msg) {
    if (!$msg) return '';
    $msg = preg_replace('/password=[^&|\s]+/', 'password=***', $msg);
    $msg = preg_replace('/pin=[^&|\s]+/', 'pin=***', $msg);
    $msg = preg_replace('/kodereseller=[^&|\s]+/', 'reseller=***', $msg);
    return $msg;
}

// ==========================================
// FITUR UI: GET LIST, CANCEL, CANCEL ALL, SKIP, RESTORE
// ==========================================
if ($action === 'get_list') {
    $stmt = $pdo->query("SELECT * FROM antrian_po ORDER BY id DESC LIMIT 250");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $html = "";
    foreach ($data as $row) {
        $badge = 'bg-secondary';
        $btn_cancel = ""; 
        
        if ($row['status'] == 'Menunggu') {
            $badge = 'bg-warning text-dark';
            $btn_cancel = "<button class='btn btn-sm btn-outline-danger py-0 px-2' onclick='cancelByRef(\"{$row['ref_id']}\")' title='Batalkan & Refund'><i class='fa-solid fa-xmark'></i></button>";
        } elseif ($row['status'] == 'Proses_API') {
            $badge = 'bg-info text-dark';
        } elseif ($row['status'] == 'Sukses') {
            $badge = 'bg-success';
        } elseif (in_array($row['status'], ['Gagal', 'Dibatalkan', 'Skipped'])) {
            $badge = 'bg-danger';
            $btn_cancel = "<button class='btn btn-sm btn-outline-success py-0 px-2' onclick='restoreByRef(\"{$row['ref_id']}\")' title='Ulangi / Restore Orderan'><i class='fa-solid fa-rotate-right'></i></button>";
        }
        
        $waktu = date('H:i:s', strtotime($row['tanggal']));
        $html .= "<tr>
            <td class='text-muted small'>{$waktu}</td>
            <td class='fw-bold text-info'>{$row['ref_id']}</td>
            <td>{$row['username']}</td>
            <td class='fw-bold'>{$row['kode_produk']} <sup class='text-muted'>P{$row['prioritas']}</sup></td>
            <td class='font-monospace'>{$row['tujuan']}</td>
            <td>Rp " . number_format($row['harga'],0,',','.') . "</td>
            <td><span class='badge {$badge}'>{$row['status']}</span></td>
            <td>{$btn_cancel}</td>
        </tr>";
    }
    if(empty($html)) $html = "<tr><td colspan='8' class='text-center text-muted py-3'>Belum ada data Pre-Order.</td></tr>";
    echo json_encode(['html' => $html]); exit;
}

if ($action === 'restore_ref') {
    $ref_id = trim($_POST['ref_id']);
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("SELECT * FROM antrian_po WHERE ref_id = ? AND status IN ('Dibatalkan', 'Gagal', 'Skipped') FOR UPDATE");
        $stmt->execute([$ref_id]);
        $trx = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($trx) {
            $stmtUser = $pdo->prepare("SELECT saldo FROM users WHERE username = ? FOR UPDATE");
            $stmtUser->execute([$trx['username']]);
            $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

            if ($user['saldo'] >= $trx['harga']) {
                $new_ref = "PO" . time() . rand(10,99);
                $pdo->prepare("UPDATE antrian_po SET status = 'Menunggu', ref_id = ? WHERE id = ?")->execute([$new_ref, $trx['id']]);
                $pdo->prepare("UPDATE users SET saldo = saldo - ? WHERE username = ?")->execute([$trx['harga'], $trx['username']]);
                $pdo->commit();
                echo json_encode(['status' => 'success', 'log' => "RESTORE: {$ref_id} diulang! Masuk antrean."]);
            } else {
                $pdo->rollBack();
                echo json_encode(['status' => 'idle', 'log' => "GAGAL RESTORE: Saldo {$trx['username']} tidak cukup."]);
            }
        } else { 
            $pdo->rollBack();
            echo json_encode(['status' => 'idle', 'log' => "GAGAL: Transaksi belum dibatalkan."]); 
        }
    } catch (Exception $e) {
        if($pdo->inTransaction()) $pdo->rollBack();
        echo json_encode(['status' => 'idle', 'log' => "ERROR DB: Gagal memulihkan."]);
    }
    exit;
}

if ($action === 'cancel_ref') {
    $ref_id = trim($_POST['ref_id']);
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("SELECT id, username, harga FROM antrian_po WHERE ref_id = ? AND status = 'Menunggu' FOR UPDATE");
        $stmt->execute([$ref_id]);
        $trx = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($trx) {
            $pdo->prepare("UPDATE antrian_po SET status = 'Dibatalkan' WHERE id = ?")->execute([$trx['id']]);
            $pdo->prepare("UPDATE users SET saldo = saldo + ? WHERE username = ?")->execute([$trx['harga'], $trx['username']]);
            $pdo->commit();
            echo json_encode(['status' => 'warning', 'log' => "CANCEL: TRX {$ref_id} dibatalkan & direfund."]);
        } else { 
            $pdo->rollBack();
            echo json_encode(['status' => 'idle', 'log' => "GAGAL: Ref ID sedang diproses / selesai."]); 
        }
    } catch (Exception $e) {
        if($pdo->inTransaction()) $pdo->rollBack();
        echo json_encode(['status' => 'idle', 'log' => "ERROR DB: Gagal membatalkan."]);
    }
    exit;
}

if ($action === 'cancel_all') {
    try {
        $pdo->beginTransaction();
        $stmtRefund = $pdo->query("SELECT id, username, harga FROM antrian_po WHERE status = 'Menunggu' FOR UPDATE");
        $count = 0;
        while ($row = $stmtRefund->fetch(PDO::FETCH_ASSOC)) {
            $pdo->prepare("UPDATE antrian_po SET status = 'Dibatalkan' WHERE id = ?")->execute([$row['id']]);
            $pdo->prepare("UPDATE users SET saldo = saldo + ? WHERE username = ?")->execute([$row['harga'], $row['username']]);
            $count++;
        }
        $pdo->commit();
        echo json_encode(['status' => 'warning', 'log' => "MASS CANCEL: $count antrian dibatalkan!"]); 
    } catch (Exception $e) {
        if($pdo->inTransaction()) $pdo->rollBack();
        echo json_encode(['status' => 'idle', 'log' => "ERROR DB: Gagal eksekusi Mass Cancel."]);
    }
    exit;
}

if ($action === 'skip') {
    $kode_skip = $_POST['kode_produk'];
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("SELECT id, username, harga FROM antrian_po WHERE kode_produk = ? AND status IN ('Menunggu', 'Proses_API') FOR UPDATE");
        $stmt->execute([$kode_skip]);
        $antrian_skip = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($antrian_skip) > 0) {
            $count = 0;
            foreach ($antrian_skip as $trx) {
                $pdo->prepare("UPDATE users SET saldo = saldo + ? WHERE username = ?")->execute([$trx['harga'], $trx['username']]);
                $pdo->prepare("UPDATE antrian_po SET status = 'Skipped' WHERE id = ?")->execute([$trx['id']]);
                $count++;
            }
            $pdo->commit();
            echo json_encode(['status' => 'info', 'log' => "SKIPPED: $count Antrian $kode_skip disapu bersih!"]); 
        } else {
            $pdo->rollBack();
            echo json_encode(['status' => 'idle', 'log' => "TIDAK ADA ANTRIAN: $kode_skip sudah bersih."]);
        }
    } catch (Exception $e) {
        if($pdo->inTransaction()) $pdo->rollBack();
        echo json_encode(['status' => 'idle', 'log' => "ERROR DB: Gagal melakukan Skip."]);
    }
    exit;
}

// ==========================================
// ENGINE 1: SHOOTER (MAX LIMIT 2 TRX)
// ==========================================
if ($action === 'shoot') {
    
    // 🚦 1. LOGIKA REM CAKRAM (LIMIT PENDING KHFY = 2) 🚦
    $stmtCekPending = $pdo->query("SELECT COUNT(id) as jml_pending FROM antrian_po WHERE status = 'Proses_API'");
    $pending_jalan = (int) $stmtCekPending->fetch()['jml_pending'];

    if ($pending_jalan >= 2) {
        sleep(2); // MESIN DITAHAN 2 DETIK BIAR PROVIDER BISA NAPAS
        echo json_encode(['status' => 'idle', 'log' => "🛑 NGEREM: Limit Khfy Penuh ($pending_jalan Pending). Tahan 2 Detik..."]);
        exit;
    }

    // Hitung berapa slot yang tersedia buat ditembak secepat cahaya (Max 2)
    $slot_tersedia = 2 - $pending_jalan;

    // ⚡ 2. TARIK AMUNISI SESUAI SLOT TERSEDIA ⚡
    $stmtCekPrio = $pdo->query("SELECT MIN(prioritas) as target_prio FROM antrian_po WHERE status = 'Menunggu'");
    $target_prio = $stmtCekPrio->fetch()['target_prio'];

    if (!$target_prio) {
        echo json_encode(['status' => 'idle', 'log' => "IDLE: Menunggu amunisi PO baru..."]); exit;
    }

    try {
        $pdo->beginTransaction();
        $sql = "SELECT * FROM antrian_po WHERE status = 'Menunggu' AND prioritas = ? ORDER BY id ASC LIMIT ? FOR UPDATE";
        $stmtAntrian = $pdo->prepare($sql);
        $stmtAntrian->bindValue(1, $target_prio, PDO::PARAM_INT);
        $stmtAntrian->bindValue(2, $slot_tersedia, PDO::PARAM_INT);
        $stmtAntrian->execute();
        $antrean_baru = $stmtAntrian->fetchAll(PDO::FETCH_ASSOC);

        if (count($antrean_baru) == 0) {
            $pdo->commit();
            echo json_encode(['status' => 'idle', 'log' => "IDLE: Antrean prioritas kosong."]); exit;
        }

        foreach ($antrean_baru as $trx) {
            $pdo->prepare("UPDATE antrian_po SET status = 'Proses_API' WHERE id = ?")->execute([$trx['id']]);
        }
        $pdo->commit();
    } catch (Exception $e) {
        if($pdo->inTransaction()) $pdo->rollBack();
        echo json_encode(['status' => 'error', 'log' => "SHOOTER DB ERROR."]); exit;
    }

    $mh = curl_multi_init();
    $curl_handles = [];
    $log_messages = [];

    foreach ($antrean_baru as $trx) {
        $url_trx = "{$base_url}/trx?produk={$trx['kode_produk']}&tujuan={$trx['tujuan']}&reff_id={$trx['ref_id']}&api_key={$api_key}";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url_trx);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 4); // Aman dari RTO
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        // 🛡️ ANTI-FIREWALL: Pura-pura jadi browser Chrome
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        curl_multi_add_handle($mh, $ch);
        $curl_handles[] = ['ch' => $ch, 'trx' => $trx];
    }

    $active = null;
    do { $mrc = curl_multi_exec($mh, $active); } while ($mrc == CURLM_CALL_MULTI_PERFORM);
    while ($active && $mrc == CURLM_OK) {
        if (curl_multi_select($mh) != -1) {
            do { $mrc = curl_multi_exec($mh, $active); } while ($mrc == CURLM_CALL_MULTI_PERFORM);
        }
    }

    foreach ($curl_handles as $item) {
        $response = curl_multi_getcontent($item['ch']);
        $trx = $item['trx'];
        curl_multi_remove_handle($mh, $item['ch']);

        $res_json = json_decode($response, true);
        $respon_lower = strtolower($response);

        // --- 🧠 OTAK DEWA: BACA JAWABAN KHFY ---
        $is_success = false;
        if ((isset($res_json['ok']) && $res_json['ok'] == true) || (isset($res_json['status']) && $res_json['status'] == true) || isset($res_json['trxid'])) {
            $is_success = true;
        } elseif (strpos($respon_lower, 'trxid=') !== false && strpos($respon_lower, '#gagal') === false) {
            $is_success = true;
        }

        if (preg_match('/(akrab|produk salah|tidak valid|salah format|tidak ditemukan|dimatikan)/i', $respon_lower)) {
            $pdo->prepare("UPDATE antrian_po SET status = 'Gagal' WHERE id = ?")->execute([$trx['id']]);
            $pdo->prepare("UPDATE users SET saldo = saldo + ? WHERE username = ?")->execute([$trx['harga'], $trx['username']]);
            $log_messages[] = "KILL: {$trx['tujuan']} (Fatal Error) -> Refund";
        } 
        elseif ($is_success) {
            $log_messages[] = "⚡ DOR: P{$trx['prioritas']} {$trx['kode_produk']} -> Diterima!";
        } 
        else {
            $new_ref = "PO" . date('His') . rand(10,99);
            $pdo->prepare("UPDATE antrian_po SET status = 'Menunggu', ref_id = ? WHERE id = ?")->execute([$new_ref, $trx['id']]);
            
            $alasan = "Limit/RTO";
            if (preg_match('/#Gagal\.\s*(.*?)(?=\s*@|$)/i', $response, $matches)) {
                $alasan = trim($matches[1]);
            }
            $log_messages[] = "SPAM: {$trx['kode_produk']} ($alasan) -> Rotasi!";
        }
    }
    curl_multi_close($mh);
    echo json_encode(['status' => 'shoot', 'log' => safeLog(implode(" | ", $log_messages))]); exit;
}

// ==========================================
// ENGINE 2: SCANNER (PENGAWAS HISTORY)
// ==========================================
if ($action === 'scan') {
    $stmtPending = $pdo->query("SELECT * FROM antrian_po WHERE status = 'Proses_API' ORDER BY id ASC LIMIT 5");
    $dataPending = $stmtPending->fetchAll(PDO::FETCH_ASSOC);

    if (count($dataPending) == 0) {
        echo json_encode(['status' => 'idle', 'log' => ""]); exit; 
    }

    $mhCek = curl_multi_init();
    $curlCekArray = [];
    $log_messages = [];

    foreach ($dataPending as $pending) {
        $url_cek = "{$base_url}/history?api_key={$api_key}&refid={$pending['ref_id']}";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url_cek);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 4); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        curl_multi_add_handle($mhCek, $ch);
        $curlCekArray[] = ['ch' => $ch, 'data' => $pending];
    }

    $active = null;
    do { $mrc = curl_multi_exec($mhCek, $active); } while ($mrc == CURLM_CALL_MULTI_PERFORM);
    while ($active && $mrc == CURLM_OK) {
        if (curl_multi_select($mhCek) != -1) {
            do { $mrc = curl_multi_exec($mhCek, $active); } while ($mrc == CURLM_CALL_MULTI_PERFORM);
        }
    }

    foreach ($curlCekArray as $item) {
        $resCek = curl_multi_getcontent($item['ch']);
        $pending = $item['data'];
        curl_multi_remove_handle($mhCek, $item['ch']);

        $resCekLower = strtolower($resCek);
        $is_rto = empty($resCek) || strpos($resCekLower, 'timeout') !== false || strpos($resCekLower, 'gateway') !== false;

        // --- 🧠 OTAK DEWA DI SCANNER ---
        if (preg_match('/(akrab|produk salah|tidak valid|salah format|tidak ditemukan|dimatikan)/i', $resCekLower)) {
            $pdo->prepare("UPDATE antrian_po SET status = 'Gagal' WHERE id = ?")->execute([$pending['id']]);
            $pdo->prepare("UPDATE users SET saldo = saldo + ? WHERE username = ?")->execute([$pending['harga'], $pending['username']]);
            $log_messages[] = "[SCAN] {$pending['ref_id']} FATAL -> Refund.";
        }
        elseif (strpos($resCekLower, 'sukses') !== false || strpos($resCekLower, 'success') !== false || strpos($resCekLower, '#sukses') !== false) {
            $pdo->prepare("UPDATE antrian_po SET status = 'Sukses' WHERE id = ?")->execute([$pending['id']]);
            $log_messages[] = "[SCAN] ✅ {$pending['ref_id']} CAIR!";
        }
        elseif ($is_rto || strpos($resCekLower, 'pending') !== false || strpos($resCekLower, 'proses') !== false) {
            // Diem aja, kasih napas
        }
        else {
            $new_ref = "PO" . time() . rand(10,99);
            $pdo->prepare("UPDATE antrian_po SET status = 'Menunggu', ref_id = ? WHERE id = ?")->execute([$new_ref, $pending['id']]);
            $log_messages[] = "[SCAN] 🔄 {$pending['ref_id']} (Batal Pusat) -> Hajar Ulang!";
        }
    }
    curl_multi_close($mhCek);

    $final_log = empty($log_messages) ? "" : safeLog(implode(" | ", $log_messages));
    echo json_encode(['status' => 'scan', 'log' => $final_log]); exit;
}
?>
