import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import "moment";
const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative bg-[#111827] rounded-lg overflow-hidden border border-gray-800 my-4 shadow-sm group", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: copyToClipboard,
        className: `absolute top-3 right-3 text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1 font-bold ${copied ? "bg-green-600 text-white" : "bg-gray-700 hover:bg-gray-600 text-gray-200 opacity-0 group-hover:opacity-100"}`,
        children: copied ? "✅ Tersalin!" : "📋 Salin Kode"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "p-4 overflow-x-auto pt-10 sm:pt-4", children: /* @__PURE__ */ jsx("pre", { className: "text-[13px] font-mono text-gray-300 leading-relaxed", children: /* @__PURE__ */ jsx("code", { children: code }) }) })
  ] });
};
const EndpointHeader = ({ method, path, title, description, badge }) => /* @__PURE__ */ jsxs("div", { className: "mb-6 border-b border-gray-100 pb-6 mt-12", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: title }),
    badge && /* @__PURE__ */ jsx("span", { className: "bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-200", children: badge })
  ] }),
  /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm mb-4 leading-relaxed", children: description }),
  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 font-mono text-sm", children: [
    /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded font-semibold border ${method === "POST" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-green-50 text-green-700 border-green-200"}`, children: method }),
    /* @__PURE__ */ jsx("span", { className: "text-gray-700 bg-gray-50 px-3 py-0.5 rounded border border-gray-200 select-all", children: path })
  ] })
] });
function ApiDocs({ auth }) {
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [customUrl, setCustomUrl] = useState("");
  const [testStatus, setTestStatus] = useState("Sukses");
  const testWebhook = async () => {
    if (!customUrl) {
      setTestResult({ success: false, message: "URL Webhook tidak boleh kosong!" });
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const response = await axios.post("/user/test-webhook", {
        custom_url: customUrl,
        status: testStatus
      });
      setTestResult(response.data);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || "Gagal terhubung ke server target. Pastikan URL Valid dan Server Hidup."
      });
    } finally {
      setTestLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "API Reference V12 - MilaStore" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50 font-sans text-gray-800", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto flex flex-col md:flex-row bg-white shadow-xl rounded-xl mt-6 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "w-full md:w-72 bg-gray-50 border-r border-gray-200 pt-8 pb-12 px-6 hidden md:block", children: /* @__PURE__ */ jsxs("div", { className: "sticky top-8", children: [
        /* @__PURE__ */ jsx(Link, { href: route("dashboard"), className: "text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-8 transition-colors font-semibold", children: "← Kembali ke Dashboard" }),
        /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-gray-400 mb-4", children: "MilaStore H2H API V12" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-4 text-sm font-medium text-gray-600", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "#auth", className: "flex items-center hover:text-blue-600 transition-colors", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-gray-300 mr-2" }),
            "Autentikasi"
          ] }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "#profile", className: "flex items-center hover:text-blue-600 transition-colors", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-gray-300 mr-2" }),
            "Cek Profil & Saldo"
          ] }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "#pricelist", className: "flex items-center hover:text-blue-600 transition-colors", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-gray-300 mr-2" }),
            "Katalog Produk"
          ] }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "#check-stock", className: "flex items-center text-red-600 hover:text-red-800 font-bold transition-colors", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-red-500 mr-2" }),
            "Stok Real-Time (VIP)"
          ] }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "#transaction", className: "flex items-center hover:text-blue-600 transition-colors", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-gray-300 mr-2" }),
            "Buat Transaksi"
          ] }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "#status", className: "flex items-center hover:text-blue-600 transition-colors", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-gray-300 mr-2" }),
            "Status Transaksi"
          ] }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: "#webhook", className: "flex items-center text-blue-600 font-bold transition-colors", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-blue-500 mr-2" }),
            "Smart Webhook"
          ] }) }),
          /* @__PURE__ */ jsx("li", { className: "pt-4 border-t border-gray-200", children: /* @__PURE__ */ jsxs("a", { href: "#errors", className: "flex items-center text-orange-600 hover:text-orange-800 font-bold transition-colors", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-orange-500 mr-2" }),
            "Kamus Error"
          ] }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 pt-10 pb-32 md:px-12 px-6 bg-white", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-14 pb-8 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-4xl font-extrabold text-gray-900 mb-4 tracking-tight", children: [
            "MilaStore ",
            /* @__PURE__ */ jsx("span", { className: "text-blue-600", children: "H2H API V12" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 leading-relaxed text-lg font-medium", children: "Official Developer Documentation" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 leading-relaxed mt-2 text-sm md:text-base", children: "Selamat datang di dokumentasi resmi MilaStore V12. Kami merancang API ini semudah dan sejelas mungkin agar Anda bisa mengintegrasikannya ke Bot WhatsApp atau Panel Anda dalam hitungan menit. Dilengkapi dengan sistem proteksi Anti-Bocor Saldo dan Smart Webhook." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col md:flex-row items-start md:items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono text-gray-700 w-fit", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500 mr-2", children: "Base URL:" }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-gray-900 select-all", children: "https://milastore.cloud/api/v1" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mt-2 italic", children: "*Catatan: Harap tidak menambahkan tanda garis miring (/) di akhir Base URL." })
        ] }),
        /* @__PURE__ */ jsxs("div", { id: "auth", className: "pt-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "🔐 Autentikasi API" }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-sm mb-4 leading-relaxed", children: [
            "Untuk menggunakan layanan API ini, Anda diwajibkan menyertakan ",
            /* @__PURE__ */ jsx("strong", { children: "API Key" }),
            " Anda di setiap permintaan (request). API Key ini bersifat rahasia, jangan dibagikan kepada siapapun."
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-r", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-800 font-medium", children: [
            /* @__PURE__ */ jsx("strong", { children: "⚠️ PENTING:" }),
            " Pastikan Alamat IP Server/Hosting Anda telah didaftarkan pada ",
            /* @__PURE__ */ jsx("strong", { children: "Whitelist" }),
            ". Hubungi Admin jika Anda mendapatkan error 403 Forbidden."
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-5", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-xs font-bold uppercase tracking-wider text-gray-500 mb-3", children: "Format Header Wajib" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-sm font-mono text-gray-800 space-y-3", children: [
              /* @__PURE__ */ jsxs("li", { className: "flex flex-col sm:flex-row sm:items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "w-32 text-gray-500 mb-1 sm:mb-0", children: "X-MILA-KEY:" }),
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded select-all border border-blue-100", children: "API_KEY_ANDA_DI_SINI" })
              ] }),
              /* @__PURE__ */ jsxs("li", { className: "flex flex-col sm:flex-row sm:items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "w-32 text-gray-500 mb-1 sm:mb-0", children: "Accept:" }),
                " ",
                /* @__PURE__ */ jsx("span", { children: "application/json" })
              ] }),
              /* @__PURE__ */ jsxs("li", { className: "flex flex-col sm:flex-row sm:items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "w-32 text-gray-500 mb-1 sm:mb-0", children: "Content-Type:" }),
                " ",
                /* @__PURE__ */ jsx("span", { children: "application/json" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { id: "profile", children: [
          /* @__PURE__ */ jsx(EndpointHeader, { title: "1. Cek Profil & Saldo", description: "Gunakan endpoint ini untuk mengecek apakah API Key Anda sudah terhubung dengan benar sekaligus melihat sisa saldo terkini.", method: "POST", path: "/profile" }),
          /* @__PURE__ */ jsx(CodeBlock, { code: `// Payload (Body) cukup dikosongkan:
{}` }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 font-bold mb-2 mt-4", children: "Contoh Balasan (Sukses):" }),
          /* @__PURE__ */ jsx(CodeBlock, { code: `{
  "status": true,
  "message": "Koneksi Berhasil",
  "data": {
    "username": "NamaMitraAnda",
    "level": "reseller",
    "saldo": 150000
  }
}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { id: "pricelist", children: [
          /* @__PURE__ */ jsx(EndpointHeader, { title: "2. Katalog Produk", description: "Menarik daftar layanan dan harga. Jika akun Anda berada di level Reseller, harga yang tampil sudah otomatis terpotong Harga Diskon.", method: "POST", path: "/pricelist" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mb-2 leading-relaxed", children: [
            "Anda bisa menarik seluruh daftar produk sekaligus, atau menggunakan filter ",
            /* @__PURE__ */ jsx("strong", { children: "kategori" }),
            " jika hanya ingin menampilkan kelompok produk tertentu saja."
          ] }),
          /* @__PURE__ */ jsx(CodeBlock, { code: `// OPSI 1: Tarik SEMUA Layanan (Kirim body kosong)
{}

// OPSI 2: Tarik Kategori Spesifik (Gunakan salah satu pilihan di bawah):
{
  // "kategori": "PRODUK XLA"      // Menampilkan semua layanan Paket XLA
  // "kategori": "AKRAB XDA"    // Menampilkan semua layanan Paket Akrab XDA
  // "kategori": "XDA_V2"       // Menampilkan semua layanan Paket XDA V2
  // "kategori": "PPOB REGULER" // Menampilkan layanan Reguler (Pulsa, Token, dll)

  "kategori": "PRODUK XLA" // Contoh Penggunaan
}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { id: "check-stock", children: [
          /* @__PURE__ */ jsx(EndpointHeader, { title: "3. Stok Real-Time", description: "Menarik data ketersediaan stok fisik secara langsung dari server pusat dengan akurasi 100%. Sangat berguna bagi Anda yang ingin memastikan stok ada sebelum menembak transaksi.", method: "POST", path: "/check-stock", badge: "FITUR VIP 🔥" }),
          /* @__PURE__ */ jsx("div", { className: "bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-r", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-800 font-medium", children: [
            /* @__PURE__ */ jsx("strong", { children: "⚠️ Batasan Kecepatan (Rate Limit):" }),
            " Maksimal 4 permintaan per detik. Jangan melakukan ",
            /* @__PURE__ */ jsx("i", { children: "looping/spam" }),
            " tanpa jeda agar IP Anda tidak diblokir otomatis oleh sistem keamanan kami."
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-200 p-4 rounded-lg mb-5", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-bold text-blue-900 mb-2", children: "Panduan Pengisian Kategori Stok:" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-800 mb-2", children: [
              "Tidak semua layanan memiliki stok fisik (misalnya Pulsa Reguler tidak ada batas stok fisik). Fitur Cek Stok ini ",
              /* @__PURE__ */ jsx("strong", { children: "HANYA" }),
              " berlaku untuk kategori produk injeksi kuota di bawah ini. Anda wajib mengirimkan parameter ",
              /* @__PURE__ */ jsx("code", { className: "bg-white px-1 text-blue-700 rounded font-mono", children: "kategori" }),
              ":"
            ] }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc ml-5 text-sm text-blue-800 space-y-1 font-mono mt-3", children: [
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("code", { className: "font-bold", children: "PRODUK XLA" }),
                " : Untuk mengecek sisa stok layanan Paket XLA"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("code", { className: "font-bold", children: "AKRAB XDA" }),
                " : Untuk mengecek sisa stok layanan Paket Akrab XDA"
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("code", { className: "font-bold", children: "XDA_V2" }),
                " : Untuk mengecek sisa stok layanan Paket XDA V2"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Contoh Penggunaan Step-by-Step:" }),
          /* @__PURE__ */ jsx(CodeBlock, { code: `// LANGKAH 1: Jika ingin mengecek Stok XLA
{
  "kategori": "PRODUK XLA"
}

// LANGKAH 1 (Alternatif): Jika ingin mengecek Stok XDA
{
  "kategori": "AKRAB XDA"
}

// LANGKAH 2: Server akan merespon dengan data ketersediaan stok.
// Contoh Balasan (Sukses):
{
  "status": true,
  "message": "Berhasil mengambil stok murni",
  "kategori": "AKRAB XDA",
  "data": [
    { "kode": "XDA13", "stok": 25 },
    { "kode": "XDA25", "stok": 0 }
  ]
}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { id: "transaction", children: [
          /* @__PURE__ */ jsx(EndpointHeader, { title: "4. Buat Transaksi", description: "Endpoint utama untuk mengeksekusi pesanan. Pastikan saldo Anda mencukupi sebelum melakukan pemesanan.", method: "POST", path: "/transaction" }),
          /* @__PURE__ */ jsx(CodeBlock, { code: `// Format Body yang Wajib Dikirim:
{
  "kode_produk": "XDA55",
  "tujuan": "081234567890",
  "ref_id": "ORDER-001" // ID Unik/Order ID dari sistem Anda (Maksimal 50 Karakter)
}` }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 font-bold mb-2 mt-4", children: "Contoh Balasan Transaksi Diterima:" }),
          /* @__PURE__ */ jsx(CodeBlock, { code: `{
  "status": true,
  "message": "Transaksi Diterima",
  "data": {
    "ref_id": "ORDER-001",
  "status": "Pending",
    "sn": "Diproses"
  }
}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { id: "status", children: [
          /* @__PURE__ */ jsx(EndpointHeader, { title: "5. Cek Status Manual", description: "Mengecek status transaksi terakhir berdasarkan ref_id yang pernah Anda pesan sebelumnya.", method: "POST", path: "/transaction/status" }),
          /* @__PURE__ */ jsx(CodeBlock, { code: `{
  "ref_id": "ORDER-001"
}

// Contoh Balasan:
{
  "status": true,
  "data": {
    "status": "Sukses",
    "sn": "1234567890123456"
  }
}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { id: "webhook", children: [
          /* @__PURE__ */ jsx(EndpointHeader, { title: "6. Smart Webhook (Callback Otomatis)", description: "Lebih efisien! Anda tidak perlu mengecek status secara manual terus-menerus. Cukup isi URL Webhook di menu Profil, dan server kami akan memberi tahu server Anda jika pesanan telah Sukses/Gagal.", method: "POST", path: "[URL_WEBHOOK_ANDA]", badge: "REKOMENDASI" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 mb-3", children: "📦 Data Payload yang akan kami kirim ke server Anda:" }),
          /* @__PURE__ */ jsx(CodeBlock, { code: `// Data ini dikirim otomatis dalam format RAW JSON ke URL Webhook Anda
{
  "ref_id": "ORDER-001",
  "status": "Sukses",
  "sn": "0987654321",
  "harga": 25000,
  "tujuan": "081234567890"
}` }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-blue-500 rounded-xl overflow-hidden mt-8 shadow-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-blue-600 px-5 py-3 flex items-center gap-2", children: /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg", children: "🛡️ Sistem Validasi Keamanan Webhook" }) }),
            /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-700 mb-4 leading-relaxed", children: [
                'Untuk mencegah tindak penipuan (injeksi saldo palsu), kami membekali setiap notifikasi dengan "Kunci Rahasia" di bagian HTTP Header. ',
                /* @__PURE__ */ jsx("strong", { children: "Silakan pilih salah satu dari dua metode validasi di bawah ini yang paling cocok dengan kemampuan Anda:" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 p-4 rounded-lg mb-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "bg-green-600 text-white text-xs font-bold px-2 py-1 rounded", children: "METODE 1" }),
                  /* @__PURE__ */ jsx("h4", { className: "font-bold text-green-900", children: "Jalur Pemula (Paling Disarankan & Termudah)" })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-green-800 mb-2 leading-relaxed", children: [
                  "Anda tidak perlu repot meracik kode MD5. Cukup tangkap Header ",
                  /* @__PURE__ */ jsx("code", { className: "bg-green-100 px-1", children: "Authorization" }),
                  " yang masuk, dan pastikan isinya sama persis dengan API Key milik Anda."
                ] }),
                /* @__PURE__ */ jsx("code", { className: "text-xs bg-white px-3 py-2 rounded border border-green-300 block font-mono", children: "Authorization: Bearer API_KEY_ANDA_DI_SINI" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 border border-gray-200 p-4 rounded-lg", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded", children: "METODE 2" }),
                  /* @__PURE__ */ jsx("h4", { className: "font-bold text-gray-900", children: "Jalur MD5 (Untuk Panel / Bot Profesional)" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-3 leading-relaxed", children: "Jika skrip Anda (misalnya Bot Baileys) mewajibkan validasi MD5 Signature, kami menyediakan 4 jenis format *Header* sekaligus agar sesuai dengan standar kodingan Anda:" }),
                /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm font-mono text-gray-800 bg-white p-3 border border-gray-200 rounded", children: [
                  /* @__PURE__ */ jsxs("li", { children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-600 w-28 inline-block", children: "signature" }),
                    " : md5( API_KEY + REF_ID )"
                  ] }),
                  /* @__PURE__ */ jsxs("li", { children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-600 w-28 inline-block", children: "x-signature" }),
                    " : md5( REF_ID + API_KEY )"
                  ] }),
                  /* @__PURE__ */ jsxs("li", { children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-600 w-28 inline-block", children: "x-upper-sign" }),
                    " : MD5( REF_ID + API_KEY ) huruf besar"
                  ] }),
                  /* @__PURE__ */ jsxs("li", { children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-600 w-28 inline-block", children: "x-mila-sign" }),
                    " : md5( API_KEY + REF_ID + STATUS )"
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { id: "errors", className: "mt-16 pt-10 border-t-2 border-dashed border-gray-200", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "🚨 Kamus Error" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-6 leading-relaxed", children: "Apabila permintaan (request) Anda gagal diproses, perhatikan pesan error berikut untuk menemukan solusinya:" }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-white border-l-4 border-red-500 shadow-sm p-4 rounded-r-lg border border-y-gray-100 border-r-gray-100", children: [
              /* @__PURE__ */ jsx("h5", { className: "font-bold text-gray-900 text-sm mb-1", children: "HTTP 403 Forbidden" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "API Key salah atau IP Server Anda belum didaftarkan (Whitelist) oleh Admin." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white border-l-4 border-purple-500 shadow-sm p-4 rounded-r-lg border border-y-gray-100 border-r-gray-100", children: [
              /* @__PURE__ */ jsx("h5", { className: "font-bold text-gray-900 text-sm mb-1", children: "HTTP 429 Too Many Requests" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Terlalu banyak permintaan dalam 1 detik. Harap beri jeda pada skrip Anda." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white border-l-4 border-yellow-500 shadow-sm p-4 rounded-r-lg border border-y-gray-100 border-r-gray-100", children: [
              /* @__PURE__ */ jsx("h5", { className: "font-bold text-gray-900 text-sm mb-1", children: "Saldo tidak cukup" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600", children: "Sistem otomatis menolak transaksi karena sisa saldo Anda tidak mencukupi untuk pesanan tersebut." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-white border-l-4 border-orange-500 shadow-sm p-4 rounded-r-lg border border-y-gray-100 border-r-gray-100", children: [
              /* @__PURE__ */ jsx("h5", { className: "font-bold text-gray-900 text-sm mb-1", children: "Produk tidak ditemukan" }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-600", children: [
                "Pastikan ",
                /* @__PURE__ */ jsx("code", { className: "bg-gray-100 px-1", children: "kode_produk" }),
                " yang dikirim sama persis dengan yang ada di Katalog (Pricelist)."
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-16 p-6 bg-white shadow-md border border-gray-200 rounded-xl border-l-4 border-l-blue-600", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
            "                                ",
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-gray-900", children: "🛠️ Alat Uji Coba Webhook" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-sm mb-6", children: "Gunakan fitur ini untuk melakukan simulasi pengiriman notifikasi ke server Anda sebelum mulai beroperasi secara nyata." }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-5 mb-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: "URL Target Uji Coba" }),
              /* @__PURE__ */ jsx("input", { type: "url", placeholder: "https://domain-anda.com/callback", className: "w-full border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-4 py-2", value: customUrl, onChange: (e) => setCustomUrl(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-bold text-gray-700 mb-2", children: "Simulasi Status" }),
              /* @__PURE__ */ jsxs("select", { className: "w-full border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-4 py-2 font-medium", value: testStatus, onChange: (e) => setTestStatus(e.target.value), children: [
                /* @__PURE__ */ jsx("option", { value: "Sukses", className: "text-green-600", children: "✅ Sukses" }),
                /* @__PURE__ */ jsx("option", { value: "Pending", className: "text-yellow-600", children: "⏳ Pending" }),
                /* @__PURE__ */ jsx("option", { value: "Gagal", className: "text-red-600", children: "❌ Gagal" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: testWebhook, disabled: testLoading, className: `px-6 py-2.5 font-bold text-white text-sm rounded-lg shadow transition-all ${testLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`, children: testLoading ? "Memproses Pengujian..." : "Kirim Uji Coba Webhook" }),
          testResult && /* @__PURE__ */ jsx("div", { className: `mt-5 p-4 rounded-lg text-sm border ${testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`, children: testResult.success ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "font-bold text-green-700 mb-1", children: "✅ Berhasil Terkirim ke Server Anda!" }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-700 text-xs mt-2 bg-white p-2 rounded border border-green-100", children: testResult.response_body || "Tidak ada response body (balasan teks) dari server Anda" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "font-bold text-red-700", children: [
            "❌ Gagal Terkirim: ",
            testResult.message
          ] }) })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ApiDocs as default
};
