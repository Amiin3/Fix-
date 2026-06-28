import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head, Link } from "@inertiajs/react";
function History({ orders = { data: [] } }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 font-sans pb-20 text-slate-800", children: [
    /* @__PURE__ */ jsx(Head, { title: "Riwayat Transaksi" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-indigo-900 p-8 pt-12 text-white rounded-b-[40px] shadow-xl relative", children: [
      /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "absolute top-8 left-6 text-white/70 text-sm font-black no-underline", children: "❮ KEMBALI" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-center mt-6 uppercase tracking-widest", children: "Riwayat" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto px-6 mt-6", children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: orders.data && orders.data.length > 0 ? orders.data.map((o, i) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-5 rounded-[25px] shadow-sm border border-slate-100 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black opacity-50 uppercase tracking-widest mb-1", children: o.created_at || "Hari Ini" }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-black m-0 uppercase", children: o.nama_layanan || "Transaksi" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-black text-indigo-600 m-0", children: [
          "Rp ",
          new Intl.NumberFormat("id-ID").format(o.harga_jual || 0)
        ] }),
        /* @__PURE__ */ jsx("span", { className: `text-[8px] font-black uppercase px-2 py-1 rounded-md ${o.status === "Sukses" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`, children: o.status || "Pending" })
      ] })
    ] }, i)) : /* @__PURE__ */ jsxs("div", { className: "text-center p-10 bg-white rounded-[30px] shadow-sm", children: [
      /* @__PURE__ */ jsx("p", { className: "text-4xl mb-2", children: "🧾" }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase text-slate-400", children: "Belum ada transaksi" })
    ] }) }) })
  ] });
}
export {
  History as default
};
