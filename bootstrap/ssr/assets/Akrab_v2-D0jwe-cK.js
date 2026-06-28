import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
import axios from "axios";
function Akrab_v2({ groupedProducts = {}, userBalance = 0 }) {
  const categories = Object.keys(groupedProducts);
  const [phone, setPhone] = useState(localStorage.getItem("last_hp_akrab_xda") || "");
  const [activeCat, setActiveCat] = useState(categories.length > 0 ? categories[0] : "");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [localBalance, setLocalBalance] = useState(userBalance);
  const [liveStock, setLiveStock] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formatRp = (angka) => new Intl.NumberFormat("id-ID").format(angka);
  useEffect(() => {
    let isMounted = true;
    const fetchLiveStock = async () => {
      const catLower = activeCat.toLowerCase();
      const needsPolling = catLower.includes("akrab") || catLower.includes("circle");
      if (!needsPolling) return;
      try {
        const res = await axios.post("/order/akrab_v2/poll");
        if (isMounted && res.data.status === "success") {
          setLiveStock(res.data.data);
        }
      } catch (e) {
        console.log("Polling tertunda");
      }
    };
    fetchLiveStock();
    const intervalId = setInterval(fetchLiveStock, 8e3);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [activeCat]);
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    setPhone(val);
    localStorage.setItem("last_hp_akrab_xda", val);
  };
  const formatDisplayPhone = (str) => {
    let matches = str.match(/.{1,4}/g);
    return matches ? matches.join(" ") : str;
  };
  const openBottomSheet = (prod) => {
    setSelectedProduct(prod);
    setIsSheetOpen(true);
  };
  const closeBottomSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };
  const handlePay = async () => {
    if (!selectedProduct) return;
    if (phone.length < 10) return Swal.fire("Oops", "Nomor HP minimal 10 digit.", "warning");
    if (localBalance < selectedProduct.harga_jual) {
      closeBottomSheet();
      Swal.fire({ icon: "error", title: "Saldo Kurang", text: "Silakan isi saldo Anda." }).then((r) => {
        if (r.isConfirmed) window.location.href = "/deposit";
      });
      return;
    }
    const catLower = activeCat.toLowerCase();
    if (catLower.includes("akrab") || catLower.includes("circle")) {
      const stockData = liveStock.find((item) => item.kode_layanan === selectedProduct.kode_layanan);
      if (stockData && (stockData.status !== "active" || parseInt(stockData.stok) <= 0)) {
        return Swal.fire("Habis", "Stok paket ini sedang kosong dari pusat", "error");
      }
    }
    closeBottomSheet();
    setIsLoading(true);
    try {
      const res = await axios.post("/order/akrab_v2/store", {
        kode_produk: selectedProduct.kode_layanan,
        target: phone
      });
      setIsLoading(false);
      if (res.data.status === "success") {
        setLocalBalance((prev) => prev - selectedProduct.harga_jual);
        Swal.fire({ title: "Berhasil!", text: res.data.message, icon: "success" }).then(() => {
          window.location.href = "/dashboard";
        });
      } else {
        Swal.fire({ title: "Gagal", text: res.data.message, icon: "error" });
      }
    } catch (error) {
      setIsLoading(false);
      Swal.fire("Error", "Terjadi kesalahan jaringan.", "error");
    }
  };
  const currentProducts = groupedProducts[activeCat] || [];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 font-sans pb-10", children: [
    /* @__PURE__ */ jsx(Head, { title: "Akrab XDA - Amifi Store" }),
    isLoading && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 bg-white/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" }),
      /* @__PURE__ */ jsx("div", { className: "text-sm font-black text-slate-600 uppercase tracking-widest animate-pulse", children: "Memproses Transaksi..." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-b-[40px] px-6 pt-8 pb-24 shadow-lg relative", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto flex justify-between items-center text-white", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "text-white opacity-90 hover:opacity-100 font-bold text-2xl", children: "←" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h5", { className: "m-0 font-black text-lg leading-tight", children: "Akrab XDA" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center mt-1", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399] mr-2" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold opacity-90", children: "Live Kaje Server" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-black/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-amber-400", children: "💰" }),
        " Rp ",
        formatRp(localBalance)
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-4 -mt-12 relative z-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[24px] p-5 shadow-lg border border-violet-100 mb-5 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all", children: [
        /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-violet-500 uppercase tracking-[2px] block mb-2", children: "Nomor Tujuan" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center border-b-2 border-slate-100 pb-2", children: [
          /* @__PURE__ */ jsx("input", { type: "tel", placeholder: "08xxxxxxxx", maxLength: "16", value: formatDisplayPhone(phone), onChange: handlePhoneChange, className: "w-full border-none bg-transparent text-2xl font-black text-slate-800 outline-none p-0 focus:ring-0 placeholder-slate-300 font-mono tracking-wider" }),
          /* @__PURE__ */ jsx("span", { className: "text-2xl text-slate-300 ml-2", children: "📱" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex overflow-x-auto whitespace-nowrap pb-4 mb-2 -mx-4 px-4 scrollbar-hide space-x-3", children: categories.map((cat) => /* @__PURE__ */ jsxs("button", { onClick: () => setActiveCat(cat), className: `inline-flex items-center px-6 py-3 rounded-full font-black text-xs transition-all border-2 ${activeCat === cat ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200 transform -translate-y-1" : "bg-white text-slate-500 border-violet-100 hover:border-violet-300"}`, children: [
        /* @__PURE__ */ jsx("span", { className: "mr-2", children: cat.toLowerCase().includes("akrab") || cat.toLowerCase().includes("circle") ? "👥" : "⚡" }),
        " ",
        cat
      ] }, cat)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto px-4", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3", children: currentProducts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-10 text-slate-400 font-bold text-sm", children: "Produk tidak tersedia / Belum Sync." }) : currentProducts.map((p) => {
      const catLower = activeCat.toLowerCase();
      const isRealTimeTab = catLower.includes("akrab") || catLower.includes("circle");
      let isAvail = true;
      let badgeHtml = /* @__PURE__ */ jsxs("div", { className: "absolute top-4 right-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black tracking-widest", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bolt mr-1" }),
        " AUTO"
      ] });
      if (isRealTimeTab) {
        const stockData = liveStock.find((item) => item.kode_layanan === p.kode_layanan);
        isAvail = false;
        badgeHtml = /* @__PURE__ */ jsxs("div", { className: "absolute top-4 right-4 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black tracking-widest flex items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2 h-2 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin mr-1" }),
          " WAIT"
        ] });
        if (stockData) {
          isAvail = stockData.status === "active" && parseInt(stockData.stok) > 0;
          if (isAvail) {
            badgeHtml = /* @__PURE__ */ jsxs("div", { className: "absolute top-4 right-4 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black tracking-widest", children: [
              "✅ ",
              stockData.stok,
              " STOK"
            ] });
          } else {
            badgeHtml = /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[9px] font-black tracking-widest", children: "❌ HABIS" });
          }
        }
      }
      return /* @__PURE__ */ jsxs("div", { onClick: () => isAvail && openBottomSheet(p), className: `bg-white rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between shadow-sm ${isAvail ? "cursor-pointer hover:-translate-y-1 hover:shadow-md border-transparent hover:border-violet-100" : "opacity-60 grayscale border-dashed border-slate-200 cursor-not-allowed"}`, children: [
        badgeHtml,
        /* @__PURE__ */ jsx("div", { className: "text-sm font-black text-slate-800 leading-snug w-3/4 mb-3", children: p.nama_layanan }),
        /* @__PURE__ */ jsxs("div", { className: "text-lg font-black text-violet-600", children: [
          "Rp ",
          formatRp(p.harga_jual)
        ] })
      ] }, p.kode_layanan);
    }) }) }),
    /* @__PURE__ */ jsx("div", { className: `fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSheetOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`, onClick: closeBottomSheet }),
    /* @__PURE__ */ jsx("div", { className: `fixed bottom-0 left-0 w-full bg-white z-50 rounded-t-[30px] p-6 sm:p-8 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-[85vh] overflow-y-auto ${isSheetOpen ? "translate-y-0 shadow-[0_-15px_40px_rgba(0,0,0,0.1)]" : "translate-y-full"}`, children: selectedProduct && /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" }),
      /* @__PURE__ */ jsx("h5", { className: "font-black text-xl text-slate-800 mb-2 leading-tight", children: selectedProduct.nama_layanan }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center bg-violet-50 border border-violet-100 p-4 rounded-2xl mb-5", children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono font-black text-violet-500 text-xs tracking-widest", children: selectedProduct.kode_layanan }),
        /* @__PURE__ */ jsxs("span", { className: "text-2xl font-black text-violet-700", children: [
          "Rp ",
          formatRp(selectedProduct.harga_jual)
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx("small", { className: "font-black text-slate-400 uppercase tracking-widest text-[10px]", children: "Info & Detail Paket" }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6", children: /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: selectedProduct.deskripsi ? selectedProduct.deskripsi.split(/\r?\n/).map((line, idx) => {
        let cleanLine = line.replace(/^[-•]\s*/, "").trim();
        if (cleanLine.length < 2) return null;
        return /* @__PURE__ */ jsxs("li", { className: "flex items-start text-xs font-bold text-slate-600 leading-relaxed", children: [
          /* @__PURE__ */ jsx("span", { className: "text-violet-500 mr-2 mt-0.5", children: "✓" }),
          /* @__PURE__ */ jsx("span", { children: cleanLine })
        ] }, idx);
      }) : /* @__PURE__ */ jsx("li", { className: "text-xs font-bold text-slate-400", children: "Deskripsi tidak tersedia." }) }) }),
      /* @__PURE__ */ jsx("button", { onClick: handlePay, disabled: phone.length < 10 || localBalance < selectedProduct.harga_jual, className: "w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-violet-500/30 transition-all active:scale-95 disabled:grayscale disabled:cursor-not-allowed", children: phone.length < 10 ? "MASUKKAN NOMOR HP" : localBalance < selectedProduct.harga_jual ? "SALDO TIDAK CUKUP" : "BELI SEKARANG" })
    ] }) })
  ] });
}
export {
  Akrab_v2 as default
};
