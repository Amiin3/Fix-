import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { useForm, Head, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
import axios from "axios";
/* empty css                      */
import "moment";
const ProviderLogo = ({ provName }) => {
  const [hasError, setHasError] = useState(false);
  const name = provName.toLowerCase();
  let logoUrl = null;
  let iconClass = null;
  let colorClass = "text-emerald-500";
  if (name.includes("indosat") || name.includes("im3")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Indosat_Ooredoo_Hutchison_logo_%282022%29.svg/512px-Indosat_Ooredoo_Hutchison_logo_%282022%29.svg.png";
  else if (name.includes("telkomsel") || name.includes("omni")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Telkomsel_2021_icon.svg/512px-Telkomsel_2021_icon.svg.png";
  else if (name.includes("pln") || name.includes("listrik")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Logo_PLN.svg/512px-Logo_PLN.svg.png";
  else if (name.includes("bpjs")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/BPJS_Kesehatan_logo.svg/512px-BPJS_Kesehatan_logo.svg.png";
  else if (name.includes("indihome") || name.includes("telkom")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/IndiHome_logo.svg/512px-IndiHome_logo.svg.png";
  else if (name.includes("pdam") || name.includes("air")) {
    iconClass = "fa-faucet-drip";
    colorClass = "text-sky-500";
  } else if (name.includes("pgn") || name.includes("gas")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/PGN_logo.svg/512px-PGN_logo.svg.png";
  else if (name.includes("finance") || name.includes("angsuran") || name.includes("kredit") || name.includes("fif") || name.includes("adira")) {
    iconClass = "fa-file-invoice-dollar";
    colorClass = "text-amber-500";
  } else if (name.includes("xl") || name.includes("axis")) logoUrl = "https://upload.wikimedia.org/wikipedia/en/thumb/5/55/XL_Axiata_logo_2016.svg/512px-XL_Axiata_logo_2016.svg.png";
  else if (name.includes("tri") || name.includes("three")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Three_logo.svg/512px-Three_logo.svg.png";
  else if (name.includes("smartfren")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Smartfren_Logo_%282019%29.svg/512px-Smartfren_Logo_%282019%29.svg.png";
  if (logoUrl && !hasError) {
    return /* @__PURE__ */ jsx("img", { src: logoUrl, alt: provName, onError: () => setHasError(true), referrerPolicy: "no-referrer", className: "h-8 w-auto max-w-[60px] object-contain drop-shadow-sm transition-all group-hover:scale-110" });
  }
  if (iconClass) {
    return /* @__PURE__ */ jsx("i", { className: `fa-solid ${iconClass} text-3xl ${colorClass} transition-all group-hover:scale-110 drop-shadow-sm` });
  }
  return /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-file-invoice text-slate-400 group-hover:text-emerald-500 text-lg" }) });
};
function Pascabayar({ auth, products = [], userBalance }) {
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoadingInq, setIsLoadingInq] = useState(false);
  const [billData, setBillData] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const { post, processing } = useForm({});
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(Number(n) || 0);
  const filteredProducts = products.filter(
    (p) => p.nama_layanan.toLowerCase().includes(search.toLowerCase()) || p.kode_layanan.toLowerCase().includes(search.toLowerCase())
  );
  const handleCekTagihan = async () => {
    if (!selected || phone.length < 5) return;
    setIsLoadingInq(true);
    try {
      const res = await axios.post(route("order.pascabayar.inquiry"), {
        tujuan: phone,
        kode_layanan: selected.kode_layanan
      });
      if (res.data.success) {
        setBillData({
          ...res.data.data,
          ref_id: res.data.ref_id
        });
        setSelectedPromo(null);
      } else {
        Swal.fire({ icon: "info", title: "Informasi", text: res.data.message, confirmButtonColor: "#10b981" });
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan koneksi", "error");
    } finally {
      setIsLoadingInq(false);
    }
  };
  const handleBayar = () => {
    if (!billData) return;
    const isOmni = Array.isArray(billData.desc?.detail);
    if (isOmni && !selectedPromo) {
      return Swal.fire("Perhatian", "Silakan pilih salah satu promo terlebih dahulu!", "warning");
    }
    const finalPrice = isOmni ? selectedPromo.harga : billData.selling_price;
    if (userBalance < finalPrice) {
      return Swal.fire("Oops", "Saldo Anda tidak mencukupi.", "error");
    }
    post(route("order.pascabayar.pay", {
      tujuan: billData.customer_no,
      kode_layanan: billData.buyer_sku_code,
      ref_id: billData.ref_id,
      harga: finalPrice,
      kodebayar_code: isOmni ? selectedPromo.kode_promo : null
    }), { preserveScroll: true, onSuccess: () => setBillData(null) });
  };
  const isOmniResponse = billData && Array.isArray(billData.desc?.detail);
  const getInputLabel = () => {
    if (!selected) return "Nomor HP / ID Pelanggan";
    const name = selected.nama_layanan.toLowerCase();
    if (name.includes("indosat") || name.includes("telkomsel") || name.includes("xl") || name.includes("tri") || name.includes("smartfren")) return "Masukkan Nomor HP";
    if (name.includes("pln")) return "No. Meter / ID Pelanggan PLN";
    if (name.includes("bpjs")) return "Nomor VA BPJS";
    if (name.includes("pdam")) return "ID Pelanggan PDAM";
    return "Nomor Tujuan / ID Pelanggan";
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Pascabayar & Tagihan - MilaStore" }),
    /* @__PURE__ */ jsx("style", { children: `.app-header-green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px 20px 90px 20px; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; color: white; } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }` }),
    (processing || isLoadingInq) && /* @__PURE__ */ jsx("div", { className: "mila-loader-overlay z-[9999] bg-white/90 backdrop-blur-md", children: /* @__PURE__ */ jsxs("div", { className: "loading-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "spinner-wrapper", children: [
        /* @__PURE__ */ jsx("div", { className: "ms-ring-bg" }),
        /* @__PURE__ */ jsx("div", { className: "ms-ring", style: { borderTopColor: "#10b981", borderLeftColor: "#059669" } }),
        /* @__PURE__ */ jsx("div", { className: "ms-logo", style: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", WebkitBackgroundClip: "text" }, children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-file-invoice-dollar" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-emerald-600 font-black tracking-widest mt-4 animate-pulse uppercase text-xs", children: isLoadingInq ? "Mengecek Server..." : "Memproses Pembayaran..." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-40", children: [
      /* @__PURE__ */ jsxs("div", { className: "app-header-green shadow-xl shadow-emerald-200/50 relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-[-50px] right-[-50px] w-48 h-48 bg-white opacity-10 rounded-full blur-2xl" }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto flex justify-between items-center relative z-10", children: [
          /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "text-white hover:-translate-x-1 transition-transform", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left-long text-xl" }) }),
          /* @__PURE__ */ jsx("h5", { className: "font-black text-xl tracking-tight m-0 text-center", children: "Pascabayar & Tagihan" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 font-black text-xs shadow-inner", children: [
            "Rp ",
            formatRp(userBalance)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-5 -mt-16 relative z-20", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-[32px] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-slate-50 mb-6", children: !selected ? /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in", children: [
          /* @__PURE__ */ jsxs("h6", { className: "font-black text-slate-700 mb-4 tracking-tight flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex justify-center items-center", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-file-invoice" }) }),
            "Pilih Layanan Tagihan"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative mb-4", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Cari PLN, PDAM, Indosat...",
                className: "w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pl-12 font-bold text-sm text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all",
                value: search,
                onChange: (e) => setSearch(e.target.value)
              }
            ),
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-search absolute left-4 top-3.5 text-slate-400" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1", children: filteredProducts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "col-span-2 text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs", children: "Produk tidak ditemukan." }) : filteredProducts.map((p) => /* @__PURE__ */ jsxs("div", { onClick: () => setSelected(p), className: "bg-white p-4 rounded-[20px] border-2 border-slate-100 shadow-sm hover:border-emerald-400 hover:shadow-emerald-100/50 cursor-pointer flex flex-col items-center text-center transition-all hover:-translate-y-1 group relative", children: [
            /* @__PURE__ */ jsx("div", { className: "h-[50px] flex items-center justify-center w-full mb-3", children: /* @__PURE__ */ jsx(ProviderLogo, { provName: p.nama_layanan }) }),
            /* @__PURE__ */ jsx("div", { className: "font-black text-xs text-slate-800 leading-snug line-clamp-2 w-full", children: p.nama_layanan }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-check text-emerald-500" }) })
          ] }, p.kode_layanan)) })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "animate-in slide-in-from-right-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5 pb-4 border-b border-slate-100", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => {
                setSelected(null);
                setPhone("");
              }, className: "w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left text-xs" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 max-w-[200px]", children: [
                /* @__PURE__ */ jsx(ProviderLogo, { provName: selected.nama_layanan }),
                /* @__PURE__ */ jsx("h6", { className: "font-black text-slate-800 m-0 uppercase tracking-tight text-xs leading-tight line-clamp-2", children: selected.nama_layanan })
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-100 shrink-0", children: "Inquiry" })
          ] }),
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block", children: getInputLabel() }),
          /* @__PURE__ */ jsxs("div", { className: "border-2 border-slate-100 rounded-2xl p-2 pl-4 flex items-center bg-slate-50 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50 mb-2 transition-all", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                className: "w-full border-none bg-transparent focus:ring-0 font-mono text-2xl font-black text-slate-800 p-0 tracking-wider placeholder-slate-300",
                placeholder: "08xxx / 1234xxx",
                value: phone,
                onChange: (e) => setPhone(e.target.value.replace(/\D/g, ""))
              }
            ),
            /* @__PURE__ */ jsx("button", { onClick: () => setPhone(""), className: `w-8 h-8 text-slate-300 hover:text-rose-500 transition-colors ${phone.length > 0 ? "opacity-100" : "opacity-0"}`, children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-xmark" }) })
          ] })
        ] }) }),
        selected && phone.length >= 5 && !billData && /* @__PURE__ */ jsxs("button", { onClick: handleCekTagihan, className: "w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-[24px] font-black text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all uppercase tracking-widest flex justify-center items-center gap-2 animate-in slide-in-from-bottom-5", children: [
          "Cek Tagihan / Promo ",
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass" })
        ] })
      ] }),
      billData && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-0 sm:p-5 animate-in fade-in", children: /* @__PURE__ */ jsxs("div", { className: "bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom pb-8 max-h-[85vh] flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-5 border-b border-dashed border-slate-200 pb-4 shrink-0", children: [
          /* @__PURE__ */ jsxs("h4", { className: "font-black text-slate-800 text-lg m-0 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-file-invoice text-emerald-500" }),
            " ",
            isOmniResponse ? "Pilih Paket Spesial" : "Rincian Tagihan"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setBillData(null), className: "w-8 h-8 bg-slate-100 rounded-full text-slate-500 hover:bg-rose-500 hover:text-white transition-colors", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-xmark" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 mb-6 bg-slate-50 p-5 rounded-2xl overflow-y-auto custom-scrollbar pr-2 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Tujuan / Nama" }),
            /* @__PURE__ */ jsx("span", { className: "text-base font-black text-slate-800 leading-tight", children: billData.customer_name && billData.customer_name !== "-" ? billData.customer_name : billData.customer_no })
          ] }),
          isOmniResponse ? /* @__PURE__ */ jsx("div", { className: "mt-4 border-t border-slate-200 pt-4", children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: billData.desc.detail.map((promo, idx) => {
            const isSelectedPromo = selectedPromo?.kode_promo === promo.kode_promo;
            return /* @__PURE__ */ jsx("label", { className: `flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelectedPromo ? "border-emerald-500 bg-white shadow-lg shadow-emerald-500/10 scale-[1.02] ring-4 ring-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: `mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelectedPromo ? "border-emerald-500" : "border-slate-300"}`, children: isSelectedPromo && /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 bg-emerald-500 rounded-full" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("span", { className: `text-sm font-black leading-snug block mb-1.5 ${isSelectedPromo ? "text-emerald-700" : "text-slate-700"}`, children: promo.nama_promo }),
                /* @__PURE__ */ jsxs("span", { className: `text-xs font-black inline-block px-2.5 py-1 rounded-lg ${isSelectedPromo ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-slate-500 bg-slate-100"}`, children: [
                  "Rp ",
                  formatRp(promo.harga)
                ] })
              ] })
            ] }) }, idx);
          }) }) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 border-t border-slate-200 pt-4 mt-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Keterangan Tagihan" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold text-slate-700 whitespace-pre-wrap leading-relaxed", children: billData.desc?.detail || billData.desc || "Tidak ada rincian tambahan." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "shrink-0 border-t border-slate-100 pt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center bg-emerald-50 p-4 rounded-2xl mb-4 border border-emerald-100", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-emerald-600 uppercase tracking-widest", children: "Total Pembayaran" }),
            /* @__PURE__ */ jsxs("span", { className: "text-2xl font-black text-emerald-600 tracking-tighter drop-shadow-sm", children: [
              "Rp ",
              formatRp(isOmniResponse ? selectedPromo?.harga || 0 : billData.selling_price)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: handleBayar, disabled: isOmniResponse && !selectedPromo, className: "w-full bg-slate-900 text-white py-4 rounded-[24px] font-black text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2", children: [
            "Bayar Tagihan ",
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-check-circle" })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  Pascabayar as default
};
