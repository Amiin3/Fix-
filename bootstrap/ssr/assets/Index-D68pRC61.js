import { jsxs, jsx } from "react/jsx-runtime";
import { useEffect } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { usePage, Head, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import "axios";
import "moment";
function Index({ auth, rekbers }) {
  const { flash } = usePage().props;
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(Number(n) || 0);
  useEffect(() => {
    if (flash?.error) Swal.fire("Gagal!", flash.error, "error");
    if (flash?.success) Swal.fire("Sah!", flash.success, "success");
  }, [flash]);
  const handleAction = (trx_id, actionType) => {
    const isRefund = actionType === "refund";
    Swal.fire({
      title: isRefund ? "Refund ke Pembeli?" : "Paksa Cair ke Penjual?",
      text: isRefund ? "Saldo Pembeli akan dikembalikan utuh. Gunakan jika penjual menipu." : "Saldo akan langsung dikirim ke Penjual. Gunakan jika pembeli kabur.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isRefund ? "#e11d48" : "#10b981",
      confirmButtonText: "Ya, Ketuk Palu!"
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route("admin.rekber.action", trx_id), { action: actionType }, { preserveScroll: true });
      }
    });
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "secured":
        return /* @__PURE__ */ jsx("span", { className: "bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase", children: "DANA DIAMANKAN" });
      case "processed":
        return /* @__PURE__ */ jsx("span", { className: "bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase", children: "DIPROSES PENJUAL" });
      case "success":
        return /* @__PURE__ */ jsx("span", { className: "bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase", children: "SELESAI" });
      case "refunded":
        return /* @__PURE__ */ jsx("span", { className: "bg-rose-100 text-rose-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase", children: "DIKEMBALIKAN" });
      default:
        return /* @__PURE__ */ jsx("span", { className: "bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase", children: status });
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Admin Rekber - MilaStore" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40 p-5 md:p-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-[32px] p-8 shadow-2xl mb-8 flex justify-between items-center text-white relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-[-50px] right-[-50px] w-48 h-48 bg-rose-500 opacity-20 rounded-full blur-3xl" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-black uppercase tracking-tighter mb-1", children: [
            "Panel Hakim ",
            /* @__PURE__ */ jsx("span", { className: "text-rose-500", children: "Rekber" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Kendali Penuh Transaksi Member" })
        ] }),
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-scale-balanced text-5xl text-rose-500/50" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest", children: [
          /* @__PURE__ */ jsx("th", { className: "p-5 border-b border-slate-100", children: "ID / Pesanan" }),
          /* @__PURE__ */ jsx("th", { className: "p-5 border-b border-slate-100", children: "Pembeli" }),
          /* @__PURE__ */ jsx("th", { className: "p-5 border-b border-slate-100", children: "Penjual" }),
          /* @__PURE__ */ jsx("th", { className: "p-5 border-b border-slate-100", children: "Nilai Barang" }),
          /* @__PURE__ */ jsx("th", { className: "p-5 border-b border-slate-100", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "p-5 border-b border-slate-100 text-right", children: "Tombol Dewa" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: rekbers.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "6", className: "text-center p-10 font-bold text-slate-400", children: "Belum ada transaksi Rekber." }) }) : rekbers.map((r) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0", children: [
          /* @__PURE__ */ jsxs("td", { className: "p-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400", children: r.trx_id }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-black text-slate-800", children: r.judul_pesanan })
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "p-5 text-xs font-bold text-indigo-600", children: [
            "ID: ",
            r.buyer_id
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "p-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-black text-slate-800", children: r.seller_name }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400", children: r.seller_whatsapp })
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "p-5 text-sm font-black text-emerald-600", children: [
            "Rp ",
            formatRp(r.nominal)
          ] }),
          /* @__PURE__ */ jsx("td", { className: "p-5", children: getStatusBadge(r.status) }),
          /* @__PURE__ */ jsx("td", { className: "p-5 text-right", children: ["secured", "processed"].includes(r.status) ? /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-end", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => handleAction(r.trx_id, "refund"), className: "bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all", title: "Refund ke Pembeli", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-rotate-left" }),
              " REFUND"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => handleAction(r.trx_id, "forward"), className: "bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all", title: "Paksa Cair ke Penjual", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-check-double" }),
              " CAIRKAN"
            ] })
          ] }) : /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-slate-300", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-lock" }),
            " TERKUNCI"
          ] }) })
        ] }, r.id)) })
      ] }) }) })
    ] }) })
  ] });
}
export {
  Index as default
};
