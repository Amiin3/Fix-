import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
function PaymentDocs() {
  return /* @__PURE__ */ jsxs("div", { className: "bg-[#0b0f1a] min-h-screen text-slate-300 font-sans antialiased pb-20", children: [
    /* @__PURE__ */ jsx(Head, { title: "MilaPay V12 - Official Technical Documentation" }),
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 bg-[#0b0f1a]/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/50", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1 rounded font-black text-xs italic shadow-[0_0_15px_rgba(250,204,21,0.4)]", children: "MILA" }),
        /* @__PURE__ */ jsxs("span", { className: "text-white font-black tracking-tighter text-2xl uppercase italic drop-shadow-md", children: [
          "PAY ",
          /* @__PURE__ */ jsx("span", { className: "text-indigo-500", children: "V12" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-black uppercase text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-500 animate-pulse" }),
        "Live Production API"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-6 py-12 max-w-5xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter italic drop-shadow-xl", children: [
          "API GATEWAY ",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-600", children: "INTEGRATION DOCS" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-6 md:p-8 bg-slate-800/40 rounded-[2rem] border border-white/5 border-l-4 border-l-yellow-400 shadow-xl shadow-black/40", children: /* @__PURE__ */ jsxs("p", { className: "text-sm md:text-base leading-relaxed text-slate-300", children: [
          /* @__PURE__ */ jsx("span", { className: "text-yellow-400 font-black uppercase italic mr-2", children: "Enterprise Edition:" }),
          "Ini adalah dokumentasi resmi untuk mengintegrasikan MilaPay V12 ke dalam sistem/website Anda. Pastikan Anda menggunakan ",
          /* @__PURE__ */ jsx("b", { children: "API KEY" }),
          " untuk Request, dan ",
          /* @__PURE__ */ jsx("b", { children: "SECRET KEY" }),
          " untuk memvalidasi Webhook (Callback)."
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-16 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-white font-black text-2xl mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm italic", children: "01" }),
          " Endpoint & Otentikasi"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] p-6 rounded-[1.5rem] border border-slate-700/50 shadow-inner", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-link mr-1" }),
              " Production URL (POST)"
            ] }),
            /* @__PURE__ */ jsx("code", { className: "text-emerald-400 text-sm font-mono select-all bg-emerald-400/10 px-3 py-2 rounded-lg block border border-emerald-500/20", children: "https://milastore.cloud/api/gateway/pay" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] p-6 rounded-[1.5rem] border border-slate-700/50 shadow-inner", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-key mr-1" }),
              " Header Authentication"
            ] }),
            /* @__PURE__ */ jsx("code", { className: "text-yellow-400 text-sm font-mono select-all bg-yellow-400/10 px-3 py-2 rounded-lg block border border-yellow-500/20", children: "X-MILA-KEY: [API_KEY_ANDA]" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-16 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-white font-black text-2xl mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm italic", children: "02" }),
          " Parameter Request (Body)"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-[#111827] rounded-[1.5rem] border border-slate-700/50 overflow-hidden mb-6", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-800/50 text-[10px] uppercase tracking-widest text-slate-400", children: [
            /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-700/50", children: "Parameter" }),
            /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-700/50", children: "Tipe" }),
            /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-700/50", children: "Wajib" }),
            /* @__PURE__ */ jsx("th", { className: "p-4 border-b border-slate-700/50", children: "Deskripsi" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { className: "text-sm text-slate-300", children: [
            /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-800", children: [
              /* @__PURE__ */ jsx("td", { className: "p-4 font-mono text-blue-400", children: "amount" }),
              /* @__PURE__ */ jsx("td", { className: "p-4", children: "Integer" }),
              /* @__PURE__ */ jsx("td", { className: "p-4 text-emerald-400 font-bold", children: "Ya" }),
              /* @__PURE__ */ jsx("td", { className: "p-4", children: "Nominal deposit/pembayaran (contoh: 100000)." })
            ] }),
            /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-800", children: [
              /* @__PURE__ */ jsx("td", { className: "p-4 font-mono text-blue-400", children: "method" }),
              /* @__PURE__ */ jsx("td", { className: "p-4", children: "String" }),
              /* @__PURE__ */ jsx("td", { className: "p-4 text-emerald-400 font-bold", children: "Ya" }),
              /* @__PURE__ */ jsxs("td", { className: "p-4", children: [
                "Kode metode pembayaran (contoh: ",
                /* @__PURE__ */ jsx("code", { className: "text-xs bg-slate-800 px-1 rounded", children: "QRIS_GOPAY" }),
                ", ",
                /* @__PURE__ */ jsx("code", { className: "text-xs bg-slate-800 px-1 rounded", children: "SEABANK" }),
                ")."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-800", children: [
              /* @__PURE__ */ jsx("td", { className: "p-4 font-mono text-blue-400", children: "external_id" }),
              /* @__PURE__ */ jsx("td", { className: "p-4", children: "String" }),
              /* @__PURE__ */ jsx("td", { className: "p-4 text-slate-500", children: "Opsional" }),
              /* @__PURE__ */ jsx("td", { className: "p-4", children: "ID Transaksi dari sistem Anda sendiri untuk mempermudah pelacakan." })
            ] }),
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "p-4 font-mono text-blue-400", children: "webhook_url" }),
              /* @__PURE__ */ jsx("td", { className: "p-4", children: "String" }),
              /* @__PURE__ */ jsx("td", { className: "p-4 text-slate-500", children: "Opsional" }),
              /* @__PURE__ */ jsx("td", { className: "p-4", children: "URL Callback khusus untuk transaksi ini. Jika kosong, sistem menggunakan URL Webhook di Profil Anda." })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-16 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-white font-black text-2xl mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm italic", children: "03" }),
          " Contoh Response API"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-[#011627] p-6 rounded-[1.5rem] border border-emerald-500/30 relative shadow-[0_0_20px_rgba(16,185,129,0.05)]", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase", children: "200 OK (SUCCESS)" }),
            /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4", children: "Berhasil Membuat Tagihan" }),
            /* @__PURE__ */ jsx("pre", { className: "text-xs text-emerald-300 font-mono overflow-x-auto", children: `{
  "status": "success",
  "data": {
    "trx_id": 1450,
    "total_bayar": 100451,
    "method": "QRIS_GOPAY",
    "qr_image": "https://api.qrserver.com/...",
    "checkout_url": "https://milastore.cloud/checkout/v1/1450"
  }
}` })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#1a0f14] p-6 rounded-[1.5rem] border border-rose-500/30 relative shadow-[0_0_20px_rgba(244,63,94,0.05)]", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 bg-rose-500/20 text-rose-400 text-[10px] font-black px-3 py-1 rounded-full uppercase", children: "400 / 401 (FAILED)" }),
            /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4", children: "Contoh Response Gagal" }),
            /* @__PURE__ */ jsx("pre", { className: "text-xs text-rose-300 font-mono overflow-x-auto", children: `// Jika API Key Salah / Kosong
{
  "status": false,
  "msg": "Key Invalid"
}

// Jika Metode Pembayaran Salah
{
  "status": false,
  "msg": "Metode Tidak Terdaftar"
}` })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-16 scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-white font-black text-2xl mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm italic", children: "04" }),
          " Webhook Callback & Keamanan (HMAC)"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-500/10 p-6 rounded-2xl border border-blue-500/30 mb-8", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-200 leading-relaxed mb-4", children: [
            "Saat pelanggan membayar sejumlah ",
            /* @__PURE__ */ jsx("b", { children: "total_bayar" }),
            ", server MilaStore akan mengirim data POST (JSON) ke URL Webhook Anda. Untuk memastikan data ini asli dari kami, lakukan validasi ",
            /* @__PURE__ */ jsx("b", { children: "Signature" }),
            " menggunakan algoritma ",
            /* @__PURE__ */ jsx("b", { children: "HMAC-SHA256" }),
            "."
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-black/50 p-4 rounded-xl font-mono text-xs text-blue-300 border border-black inline-block", children: "hash_hmac('sha256', trx_id + amount + total_bayar, SECRET_KEY)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-[#111827] p-8 rounded-[2rem] border border-slate-700/50", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4", children: "Payload Webhook yang dikirim MilaStore:" }),
          /* @__PURE__ */ jsx("pre", { className: "bg-black/40 p-6 rounded-xl text-xs text-orange-300 font-mono overflow-x-auto", children: `{
  "status": "success",
  "trx_id": "1450",
  "amount": 100000,
  "total_bayar": 100451,
  "service": "QRIS_GOPAY",
  "external_id": "ORDER-9999",
  "signature": "a8f5f167f44f4964e6c998dee827110c"
}` })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "scroll-mt-24", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-white font-black text-2xl mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-sm italic", children: "05" }),
          " Script Penerima (Copy & Paste)"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-slate-400 mb-6 text-sm", children: [
          "Buat file PHP (contoh: ",
          /* @__PURE__ */ jsx("code", { className: "bg-slate-800 px-2 py-0.5 rounded text-white", children: "callback.php" }),
          ") di hosting Anda. Script ini otomatis memvalidasi HMAC-SHA256 dan memproses saldo."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-[#011627] rounded-[2rem] border border-emerald-500/30 overflow-hidden relative shadow-[0_15px_30px_rgba(16,185,129,0.1)]", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-[#0a2540] px-6 py-3 border-b border-emerald-500/20 flex justify-between items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-emerald-400/70", children: "callback.php" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-rose-500" }),
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }),
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-emerald-500" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-6 overflow-x-auto", children: /* @__PURE__ */ jsx("pre", { className: "text-xs font-mono leading-relaxed text-emerald-300", children: `<?php
// 1. Tangkap Payload JSON dari MilaStore
$payload = file_get_contents('php://input');
$data = json_decode($payload, true);

if ($data) {
    // ⚠️ MASUKKAN SECRET KEY ANDA (Bukan API KEY)
    // Awalan Secret Key wajib "SK-"
    $secret = "SK-MASUKKAN_SECRET_KEY_ANDA_DISINI";

    // 2. Format Data untuk Signature
    // Format: trx_id + amount + total_bayar
    $data_to_sign = $data['trx_id'] . $data['amount'] . $data['total_bayar'];

    // 3. Hitung Signature Lokal dengan HMAC-SHA256
    $signature_lokal = hash_hmac('sha256', $data_to_sign, $secret);

    // 4. Validasi Keamanan
    if ($data['signature'] === $signature_lokal && $data['status'] === 'success') {
        
        $trx_id      = $data['trx_id'];
        $external_id = $data['external_id'];
        $total_bayar = $data['total_bayar']; // Duit yang benar-benar masuk
        $amount      = $data['amount'];      // Duit bersih

        // 🚀 PROSES PENAMBAHAN SALDO ATAU UPDATE ORDER DI SINI
        // Contoh Eksekusi Database Anda:
        // $db->query("UPDATE users SET balance = balance + $amount WHERE ...");
        // $db->query("UPDATE orders SET status = 'PAID' WHERE ref = '$external_id'");

        // WAJIB KEMBALIKAN HTTP 200 OK AGAR SISTEM MILASTORE TAHU SUKSES
        http_response_code(200);
        echo json_encode(["status" => true, "message" => "Callback Diterima & Saldo Ditambahkan"]);
        exit;
    }
}

// Respon Jika Ditolak (Hacker / Salah Kunci)
http_response_code(403);
echo json_encode(["status" => false, "message" => "Akses Ditolak! Signature Tidak Valid."]);
?>` }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  PaymentDocs as default
};
