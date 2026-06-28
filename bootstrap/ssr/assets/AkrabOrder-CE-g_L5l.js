import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import Swal from "sweetalert2";
import "moment";
function AkrabOrder({ auth, products }) {
  const [targetMsisdn, setTargetMsisdn] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [queues, setQueues] = useState([]);
  const fetchQueues = async () => {
    try {
      const res = await axios.get("/admin/akrab/order/queues");
      if (res.data.status) setQueues(res.data.data);
    } catch (e) {
    }
  };
  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 5e3);
    return () => clearInterval(interval);
  }, []);
  const handleOrder = async (e) => {
    e.preventDefault();
    if (!targetMsisdn || !selectedProduct) return Swal.fire("Error", "Nomor Target dan Produk wajib diisi!", "warning");
    Swal.fire({ title: "Memproses Order...", html: "Mencari slot kosong & mengeksekusi Invite...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await axios.post("/admin/akrab/order/submit", { target_msisdn: targetMsisdn, product_id: selectedProduct });
      if (res.data.status) {
        Swal.fire("Order Diterima!", res.data.message, "success");
        setTargetMsisdn("");
        setSelectedProduct("");
        fetchQueues();
      } else {
        Swal.fire("Gagal", res.data.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Koneksi ke server gagal.", "error");
    }
  };
  const triggerCron = async () => {
    Swal.fire({ title: "Menjalankan Worker...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const res = await axios.get("/cron/akrab/process-kuber");
    Swal.fire("Worker Selesai", res.data.message, "info");
    fetchQueues();
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Menu Order MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 text-slate-800 pb-12 font-sans", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-white px-6 py-5 shadow-sm border-b border-slate-200 flex items-center justify-between mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx(Link, { href: "/admin/akrab", className: "mr-4 text-2xl text-slate-400 hover:text-indigo-600 transition-colors", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-left" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h6", { className: "mb-0 font-black text-xl text-slate-800 tracking-tight", children: "MENU ORDER OTOMATIS" }),
          /* @__PURE__ */ jsx("small", { className: "text-emerald-500 font-bold tracking-widest text-[10px] uppercase", children: "MilaStore War Engine" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8", children: [
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-5", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl p-6 shadow-sm border border-slate-200", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-indigo-50 text-indigo-700 p-4 rounded-2xl mb-6 border border-indigo-100 flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bolt-lightning text-3xl" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-black text-sm uppercase tracking-wide", children: "Sistem Auto-Kuber" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium opacity-80 leading-snug", children: "Order akan memotong stok secara otomatis. Jeda eksekusi Kuber adalah 2 menit pasca invite berhasil." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleOrder, children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs font-black text-slate-500 uppercase mb-2", children: "Nomor Pembeli (Target)" }),
              /* @__PURE__ */ jsx("input", { type: "number", value: targetMsisdn, onChange: (e) => setTargetMsisdn(e.target.value), placeholder: "0819xxxx", className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all", required: true })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs font-black text-slate-500 uppercase mb-2", children: "Pilih Varian Produk" }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: products.map((p) => /* @__PURE__ */ jsxs("div", { onClick: () => p.stok_tersedia > 0 && setSelectedProduct(p.id), className: `border-2 rounded-xl p-4 cursor-pointer transition-all flex justify-between items-center ${selectedProduct === p.id ? "border-indigo-500 bg-indigo-50/50" : p.stok_tersedia > 0 ? "border-slate-100 hover:border-indigo-300" : "border-slate-100 opacity-50 cursor-not-allowed bg-slate-50"}`, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("h4", { className: "font-bold text-slate-800 text-sm", children: [
                    p.nama_produk,
                    " (",
                    p.kuber_gb,
                    "GB)"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-black px-2 py-0.5 rounded mt-1 inline-block ${p.stok_tersedia > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`, children: [
                    "STOK: ",
                    p.stok_tersedia,
                    " SLOT"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxs("span", { className: "block text-emerald-600 font-black text-sm", children: [
                  "Rp ",
                  p.harga_jual.toLocaleString("id-ID")
                ] }) })
              ] }, p.id)) })
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "submit", disabled: !targetMsisdn || !selectedProduct, className: "w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-rocket" }),
              " EKSEKUSI ORDER SEKARANG"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-7", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6 border-b border-slate-100 pb-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h6", { className: "font-bold text-lg text-slate-800", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-satellite-dish text-indigo-500 mr-2" }),
                " Live Monitor Kuber"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider", children: "Otomatis Eksekusi setelah 2 menit" })
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: triggerCron, className: "bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold py-2 px-4 rounded-xl text-[10px] transition-all", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-stopwatch mr-1" }),
              " TEST TRIGGER CRON"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-[500px] overflow-y-auto pr-2", children: queues.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-10 text-slate-400 font-bold text-sm", children: "Belum ada antrean order." }) : queues.map((q, i) => /* @__PURE__ */ jsxs("div", { className: "border border-slate-100 rounded-2xl p-4 bg-slate-50 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center text-white shadow-inner ${q.status_queue === "success" ? "bg-emerald-500" : q.status_queue === "failed" ? "bg-rose-500" : "bg-amber-500"}`, children: /* @__PURE__ */ jsx("i", { className: `fa-solid ${q.status_queue === "success" ? "fa-check" : q.status_queue === "failed" ? "fa-xmark" : "fa-hourglass-half fa-spin"}` }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h5", { className: "font-black text-slate-800 font-mono text-sm tracking-tight", children: q.member_msisdn }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center mt-1", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] bg-white border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded", children: [
                    "Tembak: ",
                    q.kuber_gb,
                    " GB"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-slate-400 font-medium", children: [
                    "Slot Induk: ",
                    q.parent_msisdn
                  ] })
                ] }),
                q.log && /* @__PURE__ */ jsx("p", { className: "text-[10px] text-rose-500 mt-1 italic", children: q.log })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("span", { className: `inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${q.status_queue === "success" ? "bg-emerald-100 text-emerald-700" : q.status_queue === "failed" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`, children: q.status_queue }),
              /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-slate-400 font-bold mt-1.5", children: [
                "Jadwal: ",
                new Date(q.process_at).toLocaleTimeString("id-ID")
              ] })
            ] })
          ] }, i)) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  AkrabOrder as default
};
