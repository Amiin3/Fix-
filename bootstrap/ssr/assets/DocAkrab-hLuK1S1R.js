import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head } from "@inertiajs/react";
import "axios";
import "moment";
function DocAkrab({ auth }) {
  const scrollTo = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth?.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "MILASTORE H2H API - Dokumentasi" }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 lg:p-8 bg-[#f8fafc] min-h-screen text-slate-800 pb-32", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8 border-b border-slate-200 pb-5 text-center md:text-left", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500 mb-1", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-book-open mr-2 text-blue-600" }),
          " MILASTORE H2H API V12"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-xs font-bold tracking-widest uppercase", children: "Official Developer & Integration Guide" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-4 gap-8", children: [
        /* @__PURE__ */ jsx("div", { className: "xl:col-span-1 hidden xl:block", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-8", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-xs font-black text-slate-400 uppercase tracking-widest mb-4", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bars-staggered mr-2" }),
            " Daftar Isi"
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3 text-sm font-bold text-slate-600", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => scrollTo("auth"), className: "hover:text-blue-600 transition-colors text-left", children: "1. Otentikasi & Header" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => scrollTo("baca-json"), className: "hover:text-blue-600 transition-colors text-left", children: "2. Cara Membaca JSON XL" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => scrollTo("endpoints"), className: "hover:text-blue-600 transition-colors text-left", children: "3. Daftar API & Payload" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => scrollTo("contoh-backend"), className: "hover:text-blue-600 transition-colors text-left", children: "4. Contoh Code Backend (PHP)" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => scrollTo("contoh-frontend"), className: "hover:text-blue-600 transition-colors text-left", children: "5. Contoh Code Frontend (JS)" }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "xl:col-span-3 space-y-8", children: [
          /* @__PURE__ */ jsxs("section", { id: "auth", className: "bg-white rounded-3xl border border-slate-200 p-8 shadow-sm", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xl font-black text-slate-800 mb-4 border-b border-slate-100 pb-3", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-shield-halved text-emerald-500 mr-2" }),
              " 1. Otentikasi & Base URL"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600 mb-4", children: "Semua request harus mengarah ke Base URL dan wajib menyertakan API Key di dalam Header request Anda." }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1", children: "Base URL:" }),
              /* @__PURE__ */ jsx("div", { className: "bg-slate-50 p-3 rounded-lg font-mono text-sm font-bold text-blue-600 border border-slate-200 select-all", children: "https://milastore.cloud/api/h2h/v12/" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1", children: "Headers Wajib:" }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 text-blue-200 p-5 rounded-2xl font-mono text-sm overflow-x-auto shadow-inner", children: [
              "Accept: application/json",
              /* @__PURE__ */ jsx("br", {}),
              "Content-Type: application/json",
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "text-yellow-400", children: "X-AKRAB-KEY: MILA-AKRAB-XXXXXXXX" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { id: "baca-json", className: "bg-white rounded-3xl border border-slate-200 p-8 shadow-sm", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xl font-black text-slate-800 mb-4 border-b border-slate-100 pb-3", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass-chart text-purple-500 mr-2" }),
              " 2. Cara Membaca JSON XL (Penting!)"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-600 mb-4", children: [
              "Data dari server XL mentah menggunakan satuan ",
              /* @__PURE__ */ jsx("b", { children: "Bytes" }),
              " dan waktu format ",
              /* @__PURE__ */ jsx("b", { children: "UNIX Timestamp" }),
              ". Berikut rumus konversinya:"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-100 p-4 rounded-xl", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-black text-blue-800 text-sm mb-2", children: "A. Konversi Kuota (Bytes ke GB)" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-600 font-mono mb-2", children: "Rumus: Bytes / (1024 * 1024 * 1024)" }),
                /* @__PURE__ */ jsxs("div", { className: "bg-white p-2 rounded text-xs font-mono border text-slate-700", children: [
                  "Data Asli: 80530636800",
                  /* @__PURE__ */ jsx("br", {}),
                  "Hasil: 75.00 GB"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-orange-50 border border-orange-100 p-4 rounded-xl", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-black text-orange-800 text-sm mb-2", children: "B. Konversi Waktu (Timestamp)" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-orange-600 font-mono mb-2", children: "Rumus: Timestamp * 1000" }),
                /* @__PURE__ */ jsxs("div", { className: "bg-white p-2 rounded text-xs font-mono border text-slate-700", children: [
                  "Data Asli: 1783011600",
                  /* @__PURE__ */ jsx("br", {}),
                  "Hasil: 01 Jul 2026, 12:00"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { id: "endpoints", className: "bg-white rounded-3xl border border-slate-200 p-8 shadow-sm", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-3", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-server text-orange-500 mr-2" }),
              " 3. Daftar API & Payload"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "border border-slate-200 rounded-2xl overflow-hidden", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 px-5 py-3 border-b flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded text-[10px]", children: "POST" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-bold text-slate-700", children: "/akrab/info" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-600 mb-2", children: [
                    /* @__PURE__ */ jsx("b", { children: "Fungsi:" }),
                    " Cek sisa kuota pengelola dan daftar member di dalam paket."
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "bg-slate-800 p-3 rounded-lg text-xs font-mono text-green-400", children: `{ "msisdn": "62819xxx" }` })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border border-slate-200 rounded-2xl overflow-hidden", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 px-5 py-3 border-b flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded text-[10px]", children: "POST" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-bold text-slate-700", children: "/akrab/invite" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-600 mb-2", children: [
                    /* @__PURE__ */ jsx("b", { children: "Fungsi:" }),
                    " Memasukkan nomor pelanggan ke dalam paket Akrab."
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "bg-slate-800 p-3 rounded-lg text-xs font-mono text-green-400", children: `{ "msisdn": "62819xxx_PENGELOLA", "target_msisdn": "628xxx_PELANGGAN", "slot_id": 1 }` })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border border-slate-200 rounded-2xl overflow-hidden", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 px-5 py-3 border-b flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "bg-red-100 text-red-700 font-black px-2 py-1 rounded text-[10px]", children: "POST" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-bold text-slate-700", children: "/akrab/kick" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-600 mb-2", children: [
                    /* @__PURE__ */ jsx("b", { children: "Fungsi:" }),
                    " Menendang (menghapus) nomor pelanggan dari paket Akrab."
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "bg-slate-800 p-3 rounded-lg text-xs font-mono text-green-400", children: `{ "msisdn": "62819xxx_PENGELOLA", "target_msisdn": "628xxx_PELANGGAN" }` })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border border-slate-200 rounded-2xl overflow-hidden", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 px-5 py-3 border-b flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded text-[10px]", children: "POST" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono text-sm font-bold text-slate-700", children: "/akrab/set-quota" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-600 mb-2", children: [
                    /* @__PURE__ */ jsx("b", { children: "Fungsi:" }),
                    " Set Limit Kuber (Kuota Bersama). Isi 0 untuk Unlimited."
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "bg-slate-800 p-3 rounded-lg text-xs font-mono text-green-400", children: `{ "msisdn": "62819xxx_PENGELOLA", "target_msisdn": "628xxx_PELANGGAN", "limit_gb": 5.5 }` })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { id: "contoh-backend", className: "bg-slate-900 rounded-3xl border border-slate-700 p-8 shadow-sm", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xl font-black text-white mb-4 border-b border-slate-700 pb-3", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-brands fa-php text-indigo-400 mr-2" }),
              " 4. Contoh Integrasi Backend (PHP / Laravel)"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mb-4", children: "Gunakan script ini di controller web Anda untuk menembak API MILASTORE secara aman (tanpa mengekspos API Key ke user)." }),
            /* @__PURE__ */ jsx("div", { className: "bg-black p-5 rounded-xl font-mono text-xs overflow-x-auto text-slate-300", children: /* @__PURE__ */ jsx("pre", { children: `// Contoh Fungsi Ambil Info Akrab menggunakan Laravel Http Client
use Illuminate\\Support\\Facades\\Http;

public function getInfoAkrab($msisdn_pengelola) {
    $response = Http::withHeaders([
        'X-AKRAB-KEY'  => 'MILA-AKRAB-XXXXXXXX',
        'Content-Type' => 'application/json'
    ])->post('https://milastore.cloud/api/h2h/v12/info', [
        'msisdn' => $msisdn_pengelola
    ]);

    if ($response->successful()) {
        $data = $response->json();
        return response()->json($data);
    }

    return response()->json(['success' => false, 'error' => 'Gagal konek API MILASTORE']);
}` }) })
          ] }),
          /* @__PURE__ */ jsxs("section", { id: "contoh-frontend", className: "bg-slate-900 rounded-3xl border border-slate-700 p-8 shadow-sm", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xl font-black text-white mb-4 border-b border-slate-700 pb-3", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-brands fa-react text-cyan-400 mr-2" }),
              " 5. Contoh Render Frontend (Menampilkan Kuota)"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mb-4", children: "Setelah mendapat response JSON di frontend Anda, gunakan kode ini agar Kuota Bytes berubah menjadi tampilan GB yang rapi." }),
            /* @__PURE__ */ jsx("div", { className: "bg-black p-5 rounded-xl font-mono text-xs overflow-x-auto text-slate-300", children: /* @__PURE__ */ jsx("pre", { children: `import React, { useState, useEffect } from 'react';

export default function AkrabDashboard() {
    const [dataAkrab, setDataAkrab] = useState(null);

    // Rumus Wajib MILASTORE: Ubah Bytes jadi GB
    const formatGB = (bytes) => {
        if (!bytes || bytes <= 0) return "0 GB";
        return (bytes / (1024 ** 3)).toFixed(2) + ' GB';
    };

    // Fungsi Fetch ke Backend Anda sendiri
    const fetchData = async () => {
        const res = await fetch('/api/backend-anda/info-akrab');
        const json = await res.json();
        if (json.success) setDataAkrab(json.data);
    };

    useEffect(() => { fetchData(); }, []);

    if (!dataAkrab) return <div>Loading...</div>;

    return (
        <div className="card">
            <h3>Sisa Kuota Utama: {formatGB(dataAkrab.remaining_quota)}</h3>
            
            <h4>Daftar Member:</h4>
            <ul>
                {dataAkrab.members.map((member, i) => (
                    <li key={i}>
                        Nomor: {member.msisdn} | Limit: {formatGB(member.usage?.quota_allocated)}
                    </li>
                ))}
            </ul>
        </div>
    );
}` }) })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  DocAkrab as default
};
