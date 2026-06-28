import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { router, Head } from "@inertiajs/react";
import Swal from "sweetalert2";
import axios from "axios";
import "moment";
function Riwayat({ auth, transaksi }) {
  const [syncingId, setSyncingId] = useState(null);
  useEffect(() => {
    const pendingIds = transaksi.data.filter((t) => t.status === "Pending").map((t) => t.id);
    if (pendingIds.length === 0) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.post(route("riwayat.check-status"), { ids: pendingIds });
        const statusBerubah = res.data.some((update) => {
          const dataLama = transaksi.data.find((t) => t.id === update.id);
          return dataLama && dataLama.status !== update.status;
        });
        if (statusBerubah) {
          router.reload({ preserveScroll: true });
        }
      } catch (e) {
      }
    }, 6e3);
    return () => clearInterval(interval);
  }, [transaksi.data]);
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Swal.fire({ title: "Tersalin!", text, icon: "success", timer: 1500, showConfirmButton: false });
  };
  const handleSync = (ref_id) => {
    setSyncingId(ref_id);
    router.post(route("riwayat.sync"), { ref_id }, {
      preserveScroll: true,
      onSuccess: (page) => {
        setSyncingId(null);
        const flash = page.props.flash;
        if (flash?.success) Swal.fire("Update!", flash.success, "success");
        else if (flash?.info) Swal.fire("Info", flash.info, "info");
        else if (flash?.error) Swal.fire("Oops", flash.error, "error");
      },
      onError: () => {
        setSyncingId(null);
        Swal.fire("Error", "Gagal menghubungi server.", "error");
      }
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Riwayat Transaksi - MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#f1f5f9] font-['Outfit'] pb-24", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-slate-900 pt-10 pb-20 px-6 rounded-b-[40px] shadow-xl relative", children: /* @__PURE__ */ jsxs("div", { className: "max-w-xl mx-auto", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-white tracking-tight", children: "Riwayat Transaksi" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1", children: "Sistem Auto Sync 3 Provider" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "max-w-xl mx-auto px-4 -mt-12 relative z-10 space-y-4", children: transaksi.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-white p-10 rounded-[24px] text-center shadow-sm", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-receipt text-4xl text-slate-200 mb-3" }),
        /* @__PURE__ */ jsx("h4", { className: "font-black text-slate-400", children: "Belum ada transaksi." })
      ] }) : transaksi.data.map((trx) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[24px] p-5 shadow-lg shadow-slate-200/50 border border-slate-50 transition-all hover:scale-[1.01]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4 border-b border-dashed border-slate-200 pb-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-[9px] font-black text-slate-400 bg-slate-100 inline-block px-2 py-1 rounded mb-1", children: trx.ref_id }),
            /* @__PURE__ */ jsx("h3", { className: "font-black text-slate-800 leading-tight", children: trx.kode_layanan }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-slate-400 mt-1", children: new Date(trx.tanggal).toLocaleString("id-ID") })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxs("h4", { className: "font-black text-indigo-600", children: [
              "Rp ",
              formatRp(trx.harga)
            ] }),
            /* @__PURE__ */ jsx("span", { className: `inline-block mt-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${trx.status === "Sukses" ? "bg-emerald-100 text-emerald-700" : trx.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`, children: trx.status })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase", children: "Tujuan / Nomor HP" }),
          /* @__PURE__ */ jsx("div", { className: "font-mono text-lg font-black text-slate-800 tracking-widest", children: trx.tujuan })
        ] }),
        trx.sn && trx.status === "Sukses" && /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "overflow-hidden", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black text-emerald-600 uppercase block mb-0.5", children: "SN / Token / Ref:" }),
            /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-black text-emerald-800 truncate block", children: trx.sn })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => copyToClipboard(trx.sn), className: "bg-white p-2 rounded-lg text-emerald-600 shadow-sm active:scale-95", children: /* @__PURE__ */ jsx("i", { className: "fa-regular fa-copy" }) })
        ] }),
        (trx.keterangan || trx.status === "Pending") && /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-3 rounded-xl text-[10px] font-bold text-slate-500 mb-4 leading-relaxed whitespace-pre-line border border-slate-100", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-info mr-1 text-indigo-400" }),
          " ",
          trx.keterangan || "Menunggu respon dari server pusat..."
        ] }),
        trx.status === "Pending" && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleSync(trx.ref_id),
            disabled: syncingId === trx.ref_id,
            className: "w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center gap-2",
            children: syncingId === trx.ref_id ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-spinner fa-spin" }),
              " Mengecek Server..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-rotate-right" }),
              " Tarik Status Provider"
            ] })
          }
        )
      ] }, trx.id)) })
    ] })
  ] });
}
export {
  Riwayat as default
};
