import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head } from "@inertiajs/react";
import axios from "axios";
import Swal from "sweetalert2";
import "moment";
function AkrabNew({ auth, products, userSaldo }) {
  const [targetMsisdn, setTargetMsisdn] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSaldo, setCurrentSaldo] = useState(userSaldo);
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!targetMsisdn) return Swal.fire("Peringatan", "Nomor HP pembeli wajib diisi!", "warning");
    if (!selectedProduct) return Swal.fire("Peringatan", "Silakan pilih varian paket terlebih dahulu!", "warning");
    const prodDetail = products.find((p) => p.id === parseInt(selectedProduct));
    if (prodDetail && currentSaldo < prodDetail.harga_jual) {
      return Swal.fire("Saldo Kurang", "Sisa saldo Anda tidak cukup untuk membeli paket ini.", "error");
    }
    const confirm = await Swal.fire({
      title: "Konfirmasi Pembelian",
      html: `Apakah Anda yakin ingin memproses paket <b>${prodDetail?.nama_produk}</b> ke nomor <b>${targetMsisdn}</b>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      confirmButtonText: "Ya, Beli Sekarang!"
    });
    if (!confirm.isConfirmed) return;
    setLoading(true);
    Swal.fire({
      title: "Menghubungi Server XL...",
      html: "Sedang menunggu respons real-time dari operator pusat XL Axiata. Mohon jangan di-refresh.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    try {
      const res = await axios.post("/order/akrabnew/submit", {
        target_msisdn: targetMsisdn,
        product_id: selectedProduct
      });
      if (res.data.status) {
        Swal.fire({ title: "TRANSAKSI BERHASIL!", text: res.data.message, icon: "success", confirmButtonColor: "#10b981" });
        if (prodDetail) setCurrentSaldo((prev) => prev - prodDetail.harga_jual);
        setTargetMsisdn("");
        setSelectedProduct("");
      } else {
        Swal.fire({ title: "TRANSAKSI GAGAL!", text: res.data.message, icon: "error", confirmButtonColor: "#ef4444" });
      }
    } catch (err) {
      Swal.fire("Error Sistem", "Terjadi gangguan jaringan internet/timeout server.", "error");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Order Paket Akrab - MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-100 text-slate-800 pb-12 font-sans", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white px-6 py-4 shadow-sm border-b border-slate-200 flex justify-between items-center mb-8 sticky top-0 z-40", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 text-white p-2 rounded-xl text-xl shadow-md", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-cart-shopping" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-black text-xl text-slate-900 tracking-tight", children: "MilaStore Order V2" }),
            /* @__PURE__ */ jsx("small", { className: "text-gray-400 font-bold uppercase text-[9px] tracking-widest", children: "Operator Portal Jaringan" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 rounded-2xl text-white shadow-md flex items-center gap-3 border border-indigo-500", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-wallet text-xl opacity-80" }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("span", { className: "block text-[10px] font-bold text-indigo-100 uppercase tracking-wide", children: "Sisa Saldo Anda" }),
            /* @__PURE__ */ jsxs("strong", { className: "text-lg font-black tracking-wide", children: [
              "Rp ",
              currentSaldo.toLocaleString("id-ID")
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto px-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "border-b border-slate-100 pb-4 mb-6", children: [
          /* @__PURE__ */ jsxs("h5", { className: "font-black text-lg text-slate-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-wifi text-indigo-600" }),
            " XL DATA AKRAB ENTERPRISE"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-medium mt-0.5", children: "Suntik paket akrab instan langsung ke nomor hp pelanggan Anda murni via API operator." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleOrderSubmit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-xs font-black text-slate-500 uppercase tracking-wider mb-2", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-phone mr-1" }),
              " Nomor Handphone Tujuan"
            ] }),
            /* @__PURE__ */ jsx("input", { type: "number", value: targetMsisdn, onChange: (e) => setTargetMsisdn(e.target.value), placeholder: "Contoh: 081916526445", className: "w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 font-mono text-xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300", disabled: loading, required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-xs font-black text-slate-500 uppercase tracking-wider mb-2", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-layer-group mr-1" }),
              " Varian Paket Kuota"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: products.map((p) => {
              const isAvailable = p.stok_tersedia > 0;
              return /* @__PURE__ */ jsxs("div", { onClick: () => !loading && isAvailable && setSelectedProduct(p.id.toString()), className: `border-2 rounded-2xl p-4 flex justify-between items-center transition-all ${selectedProduct === p.id.toString() ? "border-indigo-600 bg-indigo-50/40 shadow-sm" : isAvailable ? "border-slate-200 hover:border-indigo-300 cursor-pointer" : "border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed"}`, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx("div", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedProduct === p.id.toString() ? "border-indigo-600 bg-indigo-600" : "border-slate-300 bg-white"}`, children: selectedProduct === p.id.toString() && /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-white rounded-full" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("h4", { className: "font-black text-slate-800 text-sm", children: [
                      p.nama_produk,
                      " (",
                      p.kuber_gb,
                      " GB)"
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: `text-[10px] font-black px-2 py-0.5 rounded mt-1 inline-block border ${isAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`, children: isAvailable ? `READY: ${p.stok_tersedia} SLOT` : "STOK HABIS" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxs("span", { className: "block text-indigo-600 font-black text-base", children: [
                    "Rp ",
                    p.harga_jual?.toLocaleString("id-ID")
                  ] }),
                  p.deskripsi && /* @__PURE__ */ jsx("small", { className: "text-[10px] text-slate-400 font-medium", children: p.deskripsi })
                ] })
              ] }, p.id);
            }) })
          ] }),
          /* @__PURE__ */ jsxs("button", { type: "submit", disabled: loading || !targetMsisdn || !selectedProduct, className: "w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-40 disabled:cursor-not-allowed", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-check" }),
            " PROSES PEMBELIAN INSTAN"
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AkrabNew as default
};
