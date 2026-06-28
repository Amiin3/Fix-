import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { useForm, Head } from "@inertiajs/react";
/* empty css                      */
import "axios";
import "moment";
function Voucher({ auth, groupedProducts, userBalance }) {
  const [phone, setPhone] = useState("");
  const [activeProvider, setActiveProvider] = useState(null);
  const [selected, setSelected] = useState(null);
  const { transform, post, processing } = useForm({
    tujuan: "",
    kode_layanan: ""
  });
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);
  const providers = Object.keys(groupedProducts || {});
  const activeProducts = activeProvider ? groupedProducts[activeProvider] || [] : [];
  const handleOrder = () => {
    if (!selected || phone.length < 10) return;
    transform((data) => ({
      ...data,
      tujuan: phone,
      kode_layanan: selected.kode_layanan
    }));
    post(route("order.voucher.store"), {
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Beli Voucher - MilaStore" }),
    processing && /* @__PURE__ */ jsx("div", { className: "mila-loader-overlay", children: /* @__PURE__ */ jsxs("div", { className: "loading-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "spinner-wrapper", children: [
        /* @__PURE__ */ jsx("div", { className: "ms-ring-bg" }),
        /* @__PURE__ */ jsx("div", { className: "ms-ring", style: { borderTopColor: "#e11d48", borderLeftColor: "#be123c" } }),
        /* @__PURE__ */ jsx("div", { className: "ms-logo", style: { background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", WebkitBackgroundClip: "text" }, children: "MS" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-rose-600 font-bold tracking-widest mt-4", children: "MEMPROSES VOUCHER..." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#f8fafc] font-['Outfit'] pb-40", children: [
      /* @__PURE__ */ jsx("div", { className: "app-header-pln", style: { background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)" }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("h5", { className: "font-black text-xl m-0 text-white", children: "Beli Voucher" }),
        /* @__PURE__ */ jsxs("div", { className: "bg-black/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs font-bold text-white", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-wallet mr-2" }),
          " Rp ",
          formatRp(userBalance)
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-4 -mt-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl p-6 shadow-xl shadow-rose-500/10 mb-6", children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2", children: "Nomor HP Pembeli" }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center border-b-2 border-slate-100 focus-within:border-rose-500 transition-all pb-2", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "tel",
              className: "w-full border-none focus:ring-0 font-mono text-2xl font-black text-slate-800 p-0",
              placeholder: "0812 3456 7890",
              value: phone,
              onChange: (e) => setPhone(e.target.value.replace(/\D/g, "")),
              maxLength: "13"
            }
          ) }),
          /* @__PURE__ */ jsx("p", { className: "text-[9px] font-bold text-slate-400 mt-2", children: "*Kode voucher akan dikirim via SN transaksi" })
        ] }),
        !activeProvider ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("h6", { className: "font-black text-slate-700 mb-3 ml-1", children: "Pilih Jenis Voucher" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: providers.length === 0 ? /* @__PURE__ */ jsx("div", { className: "col-span-2 text-center py-10 text-slate-400 font-bold", children: "Voucher Kosong" }) : providers.map((prov) => /* @__PURE__ */ jsxs("div", { onClick: () => setActiveProvider(prov), className: "bg-white p-4 rounded-2xl border-2 border-transparent shadow-sm hover:border-rose-300 cursor-pointer flex items-center justify-between transition-all hover:-translate-y-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-800", children: prov }),
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chevron-right text-slate-300 text-xs" })
          ] }, prov)) })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3 ml-1", children: [
            /* @__PURE__ */ jsxs("h6", { className: "font-black text-slate-700", children: [
              "Voucher ",
              activeProvider
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => {
              setActiveProvider(null);
              setSelected(null);
            }, className: "text-xs font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left mr-1" }),
              " Ganti"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: activeProducts.map((p) => /* @__PURE__ */ jsxs("div", { onClick: () => setSelected(p), className: `p-4 rounded-2xl transition-all border-2 cursor-pointer ${selected?.kode_layanan === p.kode_layanan ? "bg-rose-50 border-rose-500 shadow-md scale-[1.02]" : "bg-white border-transparent shadow-sm hover:border-rose-200"}`, children: [
            /* @__PURE__ */ jsx("div", { className: "text-[9px] font-black text-slate-400 uppercase mb-1", children: "KODE VOUCHER" }),
            /* @__PURE__ */ jsx("div", { className: "font-bold text-slate-800 mb-2 leading-snug", children: p.nama_layanan }),
            /* @__PURE__ */ jsxs("div", { className: "text-rose-600 font-black text-sm", children: [
              "Rp ",
              formatRp(p.harga_jual)
            ] })
          ] }, p.kode_layanan)) })
        ] })
      ] }),
      selected && activeProvider && /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-slate-100 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 animate-bounce-in", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto flex justify-between items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase", children: "Total Bayar" }),
          /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-black text-slate-800", children: [
            "Rp ",
            formatRp(selected.harga_jual)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: handleOrder, disabled: processing, className: "bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 rounded-full font-black shadow-lg shadow-rose-500/30 active:scale-95 transition-all disabled:opacity-50", children: [
          processing ? "MEMPROSES..." : "BELI",
          " ",
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chevron-right ml-2" })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  Voucher as default
};
