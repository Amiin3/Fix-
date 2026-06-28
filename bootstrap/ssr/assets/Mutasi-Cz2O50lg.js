import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
function Mutasi({ mutasi = [], statistik = {} }) {
  const [filter, setFilter] = useState("SEMUA");
  const formatRp = (angka) => new Intl.NumberFormat("id-ID").format(angka || 0);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const filteredMutasi = mutasi.filter((item) => filter === "SEMUA" ? true : item.tipe === filter);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 font-sans pb-10", children: [
    /* @__PURE__ */ jsx(Head, { title: "Statistik Mutasi - Amifi Store" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-amber-500 to-orange-500 pt-6 px-5 pb-24 rounded-b-[40px] shadow-[0_10px_30px_rgba(245,158,11,0.2)] relative", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3 pointer-events-none" }),
      /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto flex items-center justify-between relative z-10 text-white", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "text-white opacity-80 hover:opacity-100 text-2xl no-underline transition-opacity", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left-long" }) }),
        /* @__PURE__ */ jsx("h5", { className: "m-0 font-black text-lg tracking-wide", children: "Statistik Mutasi" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto mt-6 text-center relative z-10 text-white", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase tracking-widest opacity-80 mb-1", children: "Saldo Tersedia" }),
        /* @__PURE__ */ jsxs("h2", { className: "text-4xl font-black tracking-tight mb-0", children: [
          "Rp ",
          formatRp(statistik.saldo_sekarang)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-5 -mt-16 relative z-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[24px] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-slate-100 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "text-center mb-4 pb-4 border-b border-slate-100", children: /* @__PURE__ */ jsxs("span", { className: "text-[10px] bg-slate-100 text-slate-500 font-black px-3 py-1 rounded-full uppercase tracking-widest", children: [
          "Periode: ",
          statistik.bulan
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center w-1/2 border-r border-slate-100", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-lg mx-auto mb-2", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-down" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-wide mb-0.5", children: "Uang Masuk" }),
            /* @__PURE__ */ jsxs("h4", { className: "text-sm font-black text-emerald-600", children: [
              "Rp ",
              formatRp(statistik.total_masuk)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-center w-1/2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-lg mx-auto mb-2", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-up" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-wide mb-0.5", children: "Uang Keluar" }),
            /* @__PURE__ */ jsxs("h4", { className: "text-sm font-black text-rose-600", children: [
              "Rp ",
              formatRp(statistik.total_keluar)
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex bg-slate-200/50 p-1 rounded-2xl mb-5", children: ["SEMUA", "MASUK", "KELUAR"].map((tab) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setFilter(tab),
          className: `flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${filter === tab ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
          children: tab
        },
        tab
      )) }),
      /* @__PURE__ */ jsx("h3", { className: "text-xs font-black text-slate-800 tracking-wider mb-4 ml-1 uppercase", children: "Riwayat Aktivitas" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: filteredMutasi.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-10 bg-white rounded-[24px] border border-slate-100 shadow-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "text-4xl mb-2 opacity-30", children: "📭" }),
        /* @__PURE__ */ jsx("div", { className: "font-bold text-sm text-slate-500", children: "Tidak ada mutasi ditemukan." })
      ] }) : filteredMutasi.map((item, idx) => {
        const isMasuk = item.tipe === "MASUK";
        const statusColor = item.status === "Sukses" ? "text-emerald-500" : ["Gagal", "Batal"].includes(item.status) ? "text-rose-500" : "text-amber-500";
        return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:border-amber-200 transition-colors", children: [
          /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-[16px] flex items-center justify-center text-xl shrink-0 ${isMasuk ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`, children: /* @__PURE__ */ jsx("i", { className: `fa-solid ${isMasuk ? "fa-wallet" : "fa-receipt"}` }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-grow overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-1", children: [
              /* @__PURE__ */ jsx("h6", { className: "font-black text-slate-800 text-xs truncate pr-2 m-0 leading-tight", children: item.keterangan }),
              /* @__PURE__ */ jsxs("span", { className: `font-black text-sm whitespace-nowrap ${isMasuk ? "text-emerald-500" : "text-slate-800"}`, children: [
                isMasuk ? "+" : "-",
                " Rp ",
                formatRp(item.nominal)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400", children: formatDate(item.created_at) }),
              /* @__PURE__ */ jsx("span", { className: `text-[9px] font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md ${statusColor}`, children: item.status })
            ] })
          ] })
        ] }, idx);
      }) })
    ] })
  ] });
}
export {
  Mutasi as default
};
