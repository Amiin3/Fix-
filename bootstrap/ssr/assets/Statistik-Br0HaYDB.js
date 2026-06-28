import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, Link } from "@inertiajs/react";
import moment from "moment";
import "axios";
function Statistik({ auth, saldo_user = 0, pemasukan = 0, pengeluaran = 0, riwayat = [] }) {
  const formatRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);
  const efisiensi = pemasukan > 0 ? Math.round((pemasukan - pengeluaran) / pemasukan * 100) : 0;
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth?.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Premium Analytics - MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#050505] text-slate-300 pb-32 font-['Plus_Jakarta_Sans']", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-b from-[#1A1A1A] to-[#050505] pt-12 pb-24 px-6 rounded-b-[60px] relative overflow-hidden shadow-2xl", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-yellow-500 opacity-5 rounded-full blur-[100px]" }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto relative z-10 text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-10", children: [
            /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chevron-left" }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500", children: "Portfolio Pro" }),
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chart-line" }) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2", children: "Total Net Worth" }),
          /* @__PURE__ */ jsx("h1", { className: "text-4xl font-black text-white tracking-tighter mb-4", children: formatRp(saldo_user) }),
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" }),
            " Performance: ",
            efisiensi,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-6 -mt-12 relative z-20", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111111] rounded-[30px] p-5 border border-white/5 shadow-xl", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-down-short-wide" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black text-slate-500 uppercase tracking-widest", children: "Inflow" }),
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-white mt-1", children: formatRp(pemasukan) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#111111] rounded-[30px] p-5 border border-white/5 shadow-xl", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-up-short-wide" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black text-slate-500 uppercase tracking-widest", children: "Outflow" }),
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-white mt-1", children: formatRp(pengeluaran) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-[#111111] rounded-[40px] p-7 border border-white/5 shadow-2xl mb-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-8", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-white font-black text-xs uppercase tracking-[0.2em]", children: "Transaction History" }),
            /* @__PURE__ */ jsx("div", { className: "h-1 w-8 bg-yellow-500 rounded-full" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-6", children: riwayat && riwayat.length > 0 ? riwayat.map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between group", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: `w-11 h-11 rounded-2xl flex items-center justify-center text-lg border transition-all ${item.type === "in" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-white/5 text-slate-500 border-white/5 group-hover:bg-yellow-500/10 group-hover:text-yellow-500 group-hover:border-yellow-500/10"}`, children: /* @__PURE__ */ jsx("i", { className: `fa-solid ${item.type === "in" ? "fa-plus" : "fa-minus"}` }) }),
              /* @__PURE__ */ jsxs("div", { className: "max-w-[130px]", children: [
                /* @__PURE__ */ jsx("h5", { className: "text-[11px] font-black text-white uppercase truncate leading-none mb-1.5", children: item.title }),
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-600", children: moment(item.created_at).format("DD MMM, HH:mm") })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxs("p", { className: `text-xs font-black ${item.type === "in" ? "text-emerald-500" : "text-slate-200"}`, children: [
                item.type === "in" ? "+" : "-",
                formatRp(item.amt)
              ] }),
              /* @__PURE__ */ jsxs("span", { className: `text-[8px] font-black uppercase tracking-widest ${["success", "sukses", "lunas"].includes(item.status?.toLowerCase()) ? "text-emerald-500" : "text-amber-500"}`, children: [
                "● ",
                item.status
              ] })
            ] })
          ] }, i)) : /* @__PURE__ */ jsx("div", { className: "text-center py-10 opacity-20 font-black text-[10px] uppercase tracking-widest", children: "Empty Data" }) })
        ] }),
        /* @__PURE__ */ jsxs(Link, { href: "/deposit", className: "group flex items-center justify-between bg-yellow-500 hover:bg-yellow-400 text-black p-6 rounded-[35px] shadow-xl relative", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-black text-sm mb-0.5", children: "Deposit Assets" }),
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold uppercase tracking-widest opacity-60", children: "Prepare for next transaction" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-black text-yellow-500 rounded-2xl flex items-center justify-center text-xl shadow-xl relative z-10", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-plus" }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  Statistik as default
};
