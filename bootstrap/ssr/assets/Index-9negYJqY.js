import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
function RiwayatTransaksi() {
  const [status, setStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [totalSukses, setTotalSukses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const typingTimeoutRef = useRef(null);
  const formatRp = (angka) => new Intl.NumberFormat("id-ID").format(angka);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/riwayat/data", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content },
        body: JSON.stringify({ status, q: searchQ })
      });
      const res = await response.json();
      setTransactions(res.data);
      setTotalSukses(res.data.total_sukses);
    } catch (error) {
      console.error("Gagal memuat riwayat");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      fetchHistory();
    }, 500);
  }, [status, searchQ]);
  const openSheet = (tx) => {
    setSelectedTx(tx);
    setIsSheetOpen(true);
  };
  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedTx(null), 300);
  };
  const copySN = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "SN Tersalin!", showConfirmButton: false, timer: 1500 });
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 font-sans pb-10", children: [
    /* @__PURE__ */ jsx(Head, { title: "Riwayat Transaksi - Amifi Store" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white px-5 py-4 sticky top-0 z-40 border-b border-slate-100 shadow-sm flex justify-between items-center", children: [
      /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "text-slate-800 font-bold text-xl no-underline", children: "←" }),
      /* @__PURE__ */ jsx("h6", { className: "font-black text-slate-800 m-0 tracking-wide text-[15px]", children: "RIWAYAT TRANSAKSI" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 text-emerald-600 rounded-full px-3 py-1 text-[10px] font-black tracking-widest flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-pulse" }),
        " LIVE"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-4 mt-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 mb-4 flex gap-2", children: [
        /* @__PURE__ */ jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "w-1/3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 py-3 focus:ring-0", children: [
          /* @__PURE__ */ jsx("option", { value: "all", children: "Semua" }),
          /* @__PURE__ */ jsx("option", { value: "Sukses", children: "Sukses" }),
          /* @__PURE__ */ jsx("option", { value: "Menunggu", children: "Proses" }),
          /* @__PURE__ */ jsx("option", { value: "Gagal", children: "Gagal" })
        ] }),
        /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Cari No / SN...", value: searchQ, onChange: (e) => setSearchQ(e.target.value), className: "w-2/3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 py-3 focus:ring-0 placeholder:font-medium" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-indigo-600 to-blue-500 rounded-[24px] p-5 text-white flex justify-between items-center shadow-lg shadow-indigo-200 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] font-black opacity-75 tracking-[1px] mb-1", children: "TOTAL PENGELUARAN (SUKSES)" }),
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-black", children: [
            "Rp ",
            formatRp(totalSukses)
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-4xl opacity-30", children: "📊" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" }) }) : transactions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-10 text-slate-400", children: [
        /* @__PURE__ */ jsx("div", { className: "text-5xl mb-3 opacity-30", children: "📂" }),
        /* @__PURE__ */ jsx("div", { className: "font-bold text-sm", children: "Tidak ada transaksi ditemukan." })
      ] }) : transactions.map((tx) => {
        let bgClass = tx.status === "Sukses" ? "bg-emerald-100 text-emerald-700" : ["Gagal", "Batal"].includes(tx.status) ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700 animate-pulse";
        return /* @__PURE__ */ jsxs("div", { onClick: () => openSheet(tx), className: "bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm cursor-pointer hover:border-indigo-300 transition-all active:scale-95 flex items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-2xl flex items-center justify-center text-xl mr-4 flex-shrink-0 bg-slate-50 border border-slate-100 shadow-sm", children: tx.icon }),
          /* @__PURE__ */ jsxs("div", { className: "flex-grow overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end mb-1", children: [
              /* @__PURE__ */ jsx("div", { className: "font-black text-slate-800 text-sm truncate pr-2", children: tx.kode_layanan }),
              /* @__PURE__ */ jsxs("div", { className: "font-black text-indigo-600 text-sm whitespace-nowrap", children: [
                "Rp ",
                formatRp(tx.harga)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-slate-500 truncate", children: tx.tujuan }),
              /* @__PURE__ */ jsx("div", { className: `text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${bgClass}`, children: tx.status })
            ] })
          ] })
        ] }, tx.ref_id);
      }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isSheetOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`, onClick: closeSheet }),
    /* @__PURE__ */ jsx("div", { className: `fixed bottom-0 left-0 w-full bg-white z-[60] rounded-t-[35px] transition-transform duration-400 ease-out max-h-[90vh] overflow-y-auto ${isSheetOpen ? "translate-y-0 shadow-[0_-15px_40px_rgba(0,0,0,0.15)]" : "translate-y-full"}`, children: selectedTx && /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto pb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 pt-5 pb-6 px-6 text-center border-b border-slate-100 rounded-t-[35px]", children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5" }),
        /* @__PURE__ */ jsx("div", { className: "text-5xl mb-3", children: selectedTx.status === "Sukses" ? "✅" : ["Gagal", "Batal"].includes(selectedTx.status) ? "❌" : "⏳" }),
        /* @__PURE__ */ jsx("h4", { className: "font-black text-slate-800 text-xl tracking-wide uppercase", children: selectedTx.status }),
        /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-slate-400 mt-1", children: formatDate(selectedTx.tanggal) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2.5 border-b border-slate-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-500", children: "ID Transaksi" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-slate-800", children: [
            "#",
            selectedTx.ref_id
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2.5 border-b border-slate-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-500", children: "Nomor Tujuan" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-slate-800 tracking-wider", children: selectedTx.tujuan })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2.5 border-b border-slate-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-500", children: "Layanan" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-md", children: selectedTx.kode_layanan })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between py-2.5 border-b border-slate-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-500", children: "Provider" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-widest", children: selectedTx.provider })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center pt-4 pb-2 mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-black text-slate-800", children: "Total Harga" }),
          /* @__PURE__ */ jsxs("span", { className: "text-2xl font-black text-indigo-600", children: [
            "Rp ",
            formatRp(selectedTx.harga)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center mt-2 mb-5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2", children: "SN / Keterangan Provider" }),
          selectedTx.sn_parsed.type === "PLN" ? /* @__PURE__ */ jsx("div", { className: "font-mono text-xl font-black text-indigo-600 tracking-[3px] break-words", children: selectedTx.sn_parsed.token }) : /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-slate-700 break-words leading-relaxed", children: selectedTx.sn_parsed.raw })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => copySN(selectedTx.sn_parsed.type === "PLN" ? selectedTx.sn_parsed.token : selectedTx.sn_parsed.raw), disabled: selectedTx.status === "Gagal", className: "w-full bg-slate-100 text-slate-600 font-black py-3.5 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 text-sm", children: "📋 Salin SN / Keterangan" })
      ] })
    ] }) })
  ] });
}
export {
  RiwayatTransaksi as default
};
