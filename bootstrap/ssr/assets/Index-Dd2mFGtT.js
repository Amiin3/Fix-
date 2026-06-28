import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, Link } from "@inertiajs/react";
import "axios";
import "moment";
function Index({ auth, rekbers = [] }) {
  const [filter, setFilter] = useState("all");
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(Number(n) || 0);
  const filteredData = rekbers.filter((item) => {
    if (filter === "buying") return item.buyer_id === auth.user.id;
    if (filter === "selling") return item.seller_id === auth.user.id;
    return true;
  });
  const getStatusInfo = (status) => {
    switch (status) {
      case "secured":
        return { text: "DANA AMAN", color: "bg-indigo-100 text-indigo-600", border: "border-indigo-500" };
      case "processed":
        return { text: "DIPROSES", color: "bg-amber-100 text-amber-600", border: "border-amber-500" };
      case "success":
        return { text: "SELESAI", color: "bg-emerald-100 text-emerald-600", border: "border-emerald-500" };
      default:
        return { text: status, color: "bg-slate-100 text-slate-400", border: "border-slate-200" };
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Riwayat Rekber" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40 pt-8 px-5", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-black tracking-tighter text-slate-800 uppercase", children: [
            "Rekber ",
            /* @__PURE__ */ jsx("span", { className: "text-indigo-600", children: "Hub" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 tracking-widest uppercase", children: "Daftar Invoice Transaksi" })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: route("rekber.create"), className: "w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-plus text-xl" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100", children: ["all", "buying", "selling"].map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setFilter(t), className: `flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === t ? "bg-indigo-600 text-white shadow-md" : "text-slate-400"}`, children: t === "all" ? "Semua" : t === "buying" ? "Pembeli" : "Penjual" }, t)) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: filteredData.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-receipt text-5xl text-slate-200 mb-4 block" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Belum ada Invoice" })
      ] }) : filteredData.map((item) => {
        const isBuyer = auth.user.id === item.buyer_id;
        const status = getStatusInfo(item.status);
        return /* @__PURE__ */ jsxs(Link, { href: route("rekber.show", item.trx_id), className: `block bg-white rounded-2xl p-4 shadow-sm border-l-4 transition-all active:scale-95 ${status.border}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: `text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${isBuyer ? "bg-indigo-50 text-indigo-500" : "bg-emerald-50 text-emerald-500"}`, children: isBuyer ? "Saya Pembeli" : "Saya Penjual" }),
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-black text-slate-800 mt-1", children: item.judul_pesanan })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${status.color}`, children: status.text })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end border-t border-dashed pt-2", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-400 font-bold tracking-widest", children: item.trx_id }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5", children: "Nilai Barang" }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-black text-slate-800", children: [
                "Rp ",
                formatRp(item.nominal)
              ] })
            ] })
          ] })
        ] }, item.id);
      }) })
    ] }) })
  ] });
}
export {
  Index as default
};
