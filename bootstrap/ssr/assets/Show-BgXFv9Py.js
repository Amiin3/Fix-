import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { useForm, Head, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
import "axios";
import "moment";
function Show({ auth, rekber }) {
  const { post, processing } = useForm();
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(Number(n) || 0);
  const isBuyer = Number(auth.user.id) === Number(rekber.buyer_id);
  const isSeller = Number(auth.user.id) === Number(rekber.seller_id);
  const actionRequest = (routeUrl, title, text, confirmText, color) => {
    Swal.fire({ title, text, icon: "warning", showCancelButton: true, confirmButtonColor: color, confirmButtonText: confirmText }).then((result) => {
      if (result.isConfirmed) post(route(routeUrl, rekber.trx_id), { preserveScroll: true });
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: `Invoice ${rekber.trx_id}` }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40 pt-8 px-5", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
        /* @__PURE__ */ jsx(Link, { href: "/rekber", className: "w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 hover:text-indigo-600", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-slate-400", children: "Detail Transaksi" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `rounded-[32px] p-6 mb-6 text-center text-white shadow-xl ${rekber.status === "secured" ? "bg-indigo-600" : rekber.status === "processed" ? "bg-amber-500" : "bg-emerald-500"}`, children: [
        /* @__PURE__ */ jsx("i", { className: `text-4xl mb-3 fa-solid ${rekber.status === "secured" ? "fa-shield-halved" : rekber.status === "processed" ? "fa-truck-fast" : "fa-check-double"}` }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-black uppercase tracking-tighter", children: rekber.status === "secured" ? "Menunggu ACC Penjual" : rekber.status === "processed" ? "Pesanan Diproses Penjual" : "Transaksi Selesai" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-bold opacity-80 mt-1", children: rekber.trx_id })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[32px] p-6 shadow-sm mb-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-bold", children: "Pesanan" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-slate-800", children: rekber.judul_pesanan })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-bold", children: "Nilai Barang" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-slate-800", children: [
            "Rp ",
            formatRp(rekber.nominal)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-bold", children: "Penjual" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-slate-800", children: isSeller ? "Anda" : rekber.seller_name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 font-bold", children: "Pembeli" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-slate-800", children: isBuyer ? "Anda" : "Member MilaStore" })
        ] }),
        isBuyer && /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t-2 border-dashed flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-rose-500", children: "Biaya Admin (Dibayar Anda)" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-rose-500", children: [
            "Rp ",
            formatRp(rekber.fee)
          ] })
        ] }),
        isSeller && /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t-2 border-dashed flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-emerald-500", children: "Uang Diterima Nanti" }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm font-black text-emerald-600", children: [
            "Rp ",
            formatRp(rekber.nominal)
          ] })
        ] })
      ] }),
      isSeller && rekber.status === "secured" && /* @__PURE__ */ jsxs("div", { className: "animate-in slide-in-from-bottom-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 text-center mb-2 uppercase tracking-widest", children: "Aksi Penjual" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => actionRequest("rekber.acc", "ACC Rekber Ini?", "Dana Pembeli sudah diamankan sistem. Silakan ACC dan kirim barangnya!", "Ya, ACC & Proses!", "#f59e0b"), disabled: processing, className: "w-full bg-amber-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-amber-500/30 active:scale-95 transition-all", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-check-double mr-2" }),
          " ACC PERMINTAAN REKBER"
        ] })
      ] }),
      isBuyer && rekber.status === "processed" && /* @__PURE__ */ jsxs("div", { className: "animate-in slide-in-from-bottom-5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 text-center mb-2 uppercase tracking-widest", children: "Aksi Pembeli" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => actionRequest("rekber.release", "Barang Sudah Aman?", "Saldo akan langsung dicairkan ke rekening Penjual.", "Ya, Cairkan Saldo!", "#10b981"), disabled: processing, className: "w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/30 active:scale-95 transition-all", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-hand-holding-dollar mr-2" }),
          " BARANG DITERIMA (CAIRKAN SALDO)"
        ] })
      ] }),
      rekber.status === "success" && /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 border border-emerald-200 text-emerald-600 text-center py-3 rounded-xl text-xs font-black uppercase tracking-widest", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-lock text-emerald-500 mr-1" }),
        " TRANSAKSI SELESAI"
      ] })
    ] }) })
  ] });
}
export {
  Show as default
};
