import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
function Docs() {
  return /* @__PURE__ */ jsxs("div", { className: "bg-[#0b0f1a] min-h-screen text-slate-300 font-sans antialiased", children: [
    /* @__PURE__ */ jsx(Head, { title: "MilaPay V12 - Official Developer Documentation" }),
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 bg-[#0b0f1a]/90 backdrop-blur-xl border-b border-white/5", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-yellow-400 text-black px-2 py-0.5 rounded font-black text-xs italic", children: "MILA" }),
        /* @__PURE__ */ jsxs("span", { className: "text-white font-black tracking-tighter text-xl uppercase italic", children: [
          "PAY ",
          /* @__PURE__ */ jsx("span", { className: "text-indigo-500", children: "V12" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-[10px] font-black uppercase tracking-widest", children: [
        /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Status:" }),
        /* @__PURE__ */ jsxs("span", { className: "text-emerald-400 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" }),
          "Production Ready"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-6 py-12 max-w-6xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-6xl font-black text-white mb-6 tracking-tighter leading-none", children: [
          "White-Label",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-indigo-500", children: "Core API Integration" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-6 bg-slate-800/30 rounded-3xl border border-white/5 border-l-4 border-l-yellow-400 max-w-3xl", children: /* @__PURE__ */ jsxs("p", { className: "text-sm leading-relaxed", children: [
          /* @__PURE__ */ jsx("span", { className: "text-yellow-400 font-bold uppercase tracking-tighter", children: "Integrasi Tanpa Redirect:" }),
          " MilaPay V12 memberikan keleluasaan bagi Developer untuk mengambil ",
          /* @__PURE__ */ jsx("strong", { children: "Raw Data" }),
          " pembayaran. Tampilkan QRIS atau instruksi bank di UI Anda sendiri secara profesional."
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-20", children: [
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
              /* @__PURE__ */ jsx("span", { className: "text-4xl font-black text-white/10 italic", children: "01" }),
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black text-white uppercase tracking-tight", children: "Create Transaction" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 p-4 rounded-2xl border border-white/5", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-slate-500 uppercase mb-1", children: "Header Auth" }),
                  /* @__PURE__ */ jsx("span", { className: "text-yellow-400", children: "X-MILA-KEY: YOUR_KEY" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 p-4 rounded-2xl border border-white/5", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-slate-500 uppercase mb-1", children: "Endpoint (POST)" }),
                  /* @__PURE__ */ jsx("span", { className: "text-emerald-400", children: "/api/gateway/pay" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "bg-slate-900 rounded-3xl overflow-hidden border border-white/5", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs text-left", children: [
                /* @__PURE__ */ jsx("thead", { className: "bg-white/5 text-slate-400 font-bold uppercase", children: /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("th", { className: "p-4", children: "Parameter" }),
                  /* @__PURE__ */ jsx("th", { className: "p-4", children: "Description" })
                ] }) }),
                /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-white/5", children: [
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "p-4 font-mono text-indigo-400", children: "amount" }),
                    /* @__PURE__ */ jsx("td", { className: "p-4 text-slate-400", children: "Nominal dasar (Int)" })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "p-4 font-mono text-indigo-400", children: "method" }),
                    /* @__PURE__ */ jsx("td", { className: "p-4 text-slate-400", children: "QRIS_GOPAY, QRIS_SHOPEE, JAGO, SEABANK" })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "p-4 font-mono text-indigo-400", children: "external_id" }),
                    /* @__PURE__ */ jsx("td", { className: "p-4 text-slate-400", children: "ID Transaksi sistem Anda" })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "p-4 font-mono text-indigo-400", children: "webhook_url" }),
                    /* @__PURE__ */ jsx("td", { className: "p-4 text-slate-400", children: "URL Callback spesifik (Opsional)" })
                  ] })
                ] })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
              /* @__PURE__ */ jsx("span", { className: "text-4xl font-black text-white/10 italic", children: "02" }),
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black text-white uppercase tracking-tight", children: "Webhook (Automated Report)" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 rounded-[2.5rem] p-8 border border-indigo-500/20 space-y-6", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
                "MilaPay akan mengirimkan ",
                /* @__PURE__ */ jsx("strong", { children: "Callback JSON" }),
                " secara otomatis segera setelah sistem kami mendeteksi mutasi lunas."
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-black/80 p-6 rounded-2xl border border-white/5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-500 uppercase mb-3", children: "Payload Callback (POST):" }),
                /* @__PURE__ */ jsx("pre", { className: "text-xs text-blue-400 font-mono leading-relaxed overflow-x-auto", children: `{
  "trx_id": 437,
  "external_id": "ORDER-001",
  "status": "SUKSES",
  "amount": 10000,
  "total_bayar": 10567,
  "signature": "8d7f87f7d6a9b8c7e6d5..."
}` })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/30", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-white uppercase mb-2", children: "Signature Security:" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mb-3", children: "Untuk memvalidasi bahwa data benar dari MilaStore, gunakan rumus MD5 berikut:" }),
                /* @__PURE__ */ jsx("div", { className: "bg-black/40 p-3 rounded-lg text-center font-mono text-indigo-300 text-xs", children: 'md5(trx_id + total_bayar + "MILAPAY_SECRET_V12")' })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
              /* @__PURE__ */ jsx("span", { className: "text-4xl font-black text-white/10 italic", children: "03" }),
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black text-white uppercase tracking-tight", children: "Response & Polling" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 relative", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute top-6 right-8 text-[10px] font-bold text-slate-600 font-mono uppercase", children: "JSON Output" }),
              /* @__PURE__ */ jsx("pre", { className: "text-xs md:text-sm text-green-400 overflow-x-auto leading-relaxed font-mono mt-4", children: `{
  "status": "success",
  "data": {
    "trx_id": 419,
    "total_bayar": 10882,
    "qr_image": "https://api.qrserver.com/v1/create-qr-code/...",
    "status_url": "https://milastore.web.id/api/gateway/status/419",
    "checkout_url": "https://milastore.web.id/checkout/v1/419"
  }
}` })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
              /* @__PURE__ */ jsx("span", { className: "text-4xl font-black text-white/10 italic", children: "04" }),
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black text-white uppercase tracking-tight", children: "Status & Cancellation" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 p-6 rounded-3xl border border-white/5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1", children: "Check Status (GET)" }),
                /* @__PURE__ */ jsxs("code", { className: "text-sm text-white", children: [
                  "/status/",
                  `{id}`
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 mt-2", children: "Dapatkan info detail transaksi secara realtime." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 p-6 rounded-3xl border border-white/5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1", children: "Cancel (POST)" }),
                /* @__PURE__ */ jsxs("code", { className: "text-sm text-white", children: [
                  "/cancel/",
                  `{id}`
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 mt-2", children: "Batalkan tiket pembayaran yang belum dibayar." })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 sticky top-28 border border-indigo-400/30", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-white font-black italic mb-6 text-xl flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("i", { className: "fas fa-shield-alt text-yellow-400" }),
            " SULTAN GUIDE"
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-6 text-indigo-100 text-[11px] font-bold leading-relaxed", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex gap-4 border-b border-white/10 pb-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-yellow-400 text-lg italic", children: "01" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Tampilkan ",
                /* @__PURE__ */ jsx("code", { className: "bg-black/30 px-1.5 py-0.5 rounded text-white", children: "qr_image" }),
                " langsung via ",
                /* @__PURE__ */ jsx("code", { className: "bg-black/30 px-1.5 py-0.5 rounded text-white", children: "<img>" }),
                " untuk kemudahan user."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-4 border-b border-white/10 pb-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-yellow-400 text-lg italic", children: "02" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Gunakan ",
                /* @__PURE__ */ jsx("code", { className: "bg-black/30 px-1.5 py-0.5 rounded text-white", children: "status_url" }),
                " untuk polling status otomatis di sistem Anda."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-4 border-b border-white/10 pb-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-yellow-400 text-lg italic", children: "03" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Endpoint Webhook wajib merespon ",
                /* @__PURE__ */ jsx("b", { children: "200 OK" }),
                " agar laporan tidak dikirim berulang kali."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-yellow-400 text-lg italic", children: "04" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Jangan pernah mengabaikan pengecekan ",
                /* @__PURE__ */ jsx("b", { children: "Signature" }),
                " di sisi backend Reseller!"
              ] })
            ] })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "py-20 border-t border-white/5 text-center mt-12 bg-black/40", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]", children: "MilaPay Secure Engine © 2026" }) })
  ] });
}
export {
  Docs as default
};
