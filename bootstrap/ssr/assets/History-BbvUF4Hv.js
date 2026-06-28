import { jsxs, jsx } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { router, Head, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import "axios";
import "moment";
const ultimateStyles = `
    .cyber-bg {
        background-color: #f8fafc;
        background-image: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05), transparent 50%);
        min-height: 100vh;
    }
    .history-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .history-card:hover {
        border-color: #c7d2fe;
        transform: translateY(-3px);
        box-shadow: 0 12px 25px -5px rgba(99, 102, 241, 0.15);
    }
    .status-badge {
        padding: 4px 12px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .status-sukses { background: #ecfdf5; color: #10b981; border: 1px solid #a7f3d0; }
    .status-pending { background: #fffbeb; color: #f59e0b; border: 1px solid #fde68a; }
    .status-gagal { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;
function History({ auth, transactions, filters }) {
  useEffect(() => {
    const hasPending = transactions?.data?.some((t) => ["Proses", "Wait", "Pending", "Proses_API"].includes(t.status));
    if (hasPending) {
      const interval = setInterval(() => {
        router.reload({ only: ["transactions"], preserveScroll: true });
      }, 5e3);
      return () => clearInterval(interval);
    }
  }, [transactions]);
  const [search, setSearch] = useState(filters.search || "");
  const [filterStatus, setFilterStatus] = useState(filters.status || "Semua");
  const [showModal, setShowModal] = useState(false);
  const [activeTrx, setActiveTrx] = useState(null);
  const [tokoName, setTokoName] = useState(auth.user.username || auth.user.name || "Konter Saya");
  const [hargaJual, setHargaJual] = useState(0);
  const receiptRef = useRef(null);
  const applyFilters = (newSearch, newStatus) => {
    router.get("/riwayat", { search: newSearch, status: newStatus }, { preserveState: true, preserveScroll: true });
  };
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters(search, filterStatus);
  };
  const handleFilterChange = (statusName) => {
    setFilterStatus(statusName);
    applyFilters(search, statusName);
  };
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);
  const maskSN = (sn) => {
    if (!sn) return "-";
    return sn.replace(/kaje|kj|khfy/gi, "MS");
  };
  const copyToClipboard = (text) => {
    if (!text || text === "-") return Swal.fire({ icon: "error", title: "Kosong", text: "Tidak ada SN yang bisa disalin.", customClass: { popup: "rounded-[24px]" } });
    navigator.clipboard.writeText(text);
    Swal.fire({ title: "Tersalin! 📋", text: "SN / Token berhasil disalin ke clipboard.", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-[24px]" } });
  };
  const openPrintModal = (trx) => {
    setActiveTrx(trx);
    setHargaJual(Number(trx.harga) + 2e3);
    setShowModal(true);
  };
  const handlePrint = () => window.print();
  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    Swal.fire({
      title: "Memproses Gambar...",
      text: "Mencetak struk digital kualitas tinggi",
      allowOutsideClick: false,
      customClass: { popup: "rounded-[24px]" },
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      const fileName = `STRUK_${tokoName.replace(/\s+/g, "_")}_${activeTrx.tujuan}.png`;
      const base64Image = canvas.toDataURL("image/png");
      if (window.AndroidBridge) {
        window.AndroidBridge.downloadBase64Image(base64Image, fileName);
        Swal.fire({ title: "Berhasil! 🎉", text: "Struk dikirim ke Galeri HP Anda!", icon: "success", timer: 2e3, showConfirmButton: false, customClass: { popup: "rounded-[24px]" } });
      } else {
        const link = document.createElement("a");
        link.download = fileName;
        link.href = base64Image;
        link.click();
        Swal.fire({ title: "Berhasil! 🎉", text: "Struk berhasil didownload!", icon: "success", timer: 2e3, showConfirmButton: false, customClass: { popup: "rounded-[24px]" } });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Terjadi kesalahan saat membuat gambar struk.", customClass: { popup: "rounded-[24px]" } });
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Riwayat Transaksi - MilaStore" }),
    /* @__PURE__ */ jsx("style", { children: ultimateStyles }),
    /* @__PURE__ */ jsxs("div", { className: "cyber-bg font-['Outfit'] print:hidden pb-[140px] md:pb-32", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 pt-12 pb-24 px-5 rounded-b-[45px] shadow-xl relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center md:text-left", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 drop-shadow-sm", children: "RIWAYAT TRANSAKSI" }),
            /* @__PURE__ */ jsx("p", { className: "text-indigo-200/80 mt-1 text-xs md:text-sm font-bold tracking-widest uppercase", children: "Arsip Keuangan & Cetak Struk" })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "w-full md:w-auto flex-1 max-w-md relative", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Cari Nomor / Ref ID...",
                value: search,
                onChange: (e) => setSearch(e.target.value),
                className: "w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-indigo-300/70 rounded-[20px] py-4 pl-12 pr-24 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-inner font-bold text-sm"
              }
            ),
            /* @__PURE__ */ jsx("button", { type: "submit", className: "absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-black uppercase px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95", children: "CARI" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-5 -mt-16 relative z-20", children: [
        /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 justify-start md:justify-center", children: ["Semua", "Berhasil", "Pending", "Gagal"].map((status) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handleFilterChange(status),
            className: `px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border shadow-sm active:scale-95 ${filterStatus === status ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_5px_15px_rgba(79,70,229,0.3)]" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"}`,
            children: [
              status === "Berhasil" && /* @__PURE__ */ jsx("i", { className: "fa-solid fa-check-circle mr-1.5" }),
              status === "Pending" && /* @__PURE__ */ jsx("i", { className: "fa-solid fa-clock mr-1.5" }),
              status === "Gagal" && /* @__PURE__ */ jsx("i", { className: "fa-solid fa-times-circle mr-1.5" }),
              status === "Semua" && /* @__PURE__ */ jsx("i", { className: "fa-solid fa-list mr-1.5" }),
              status
            ]
          },
          status
        )) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 mb-8", children: transactions.data.length > 0 ? transactions.data.map((trx) => {
          const statusLower = String(trx.status).toLowerCase();
          const isSukses = statusLower.includes("sukses") || statusLower.includes("success") || statusLower.includes("berhasil");
          const isGagal = statusLower.includes("gagal") || statusLower.includes("batal") || statusLower.includes("error");
          const maskedSN = maskSN(trx.sn);
          return /* @__PURE__ */ jsxs("div", { className: "history-card rounded-[28px] p-5 lg:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row justify-between gap-5 lg:items-center relative overflow-hidden group", children: [
            /* @__PURE__ */ jsx("div", { className: `absolute left-0 top-0 bottom-0 w-1.5 ${isSukses ? "bg-emerald-500" : isGagal ? "bg-rose-500" : "bg-amber-500"}` }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 w-full lg:w-4/12", children: [
              /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${isSukses ? "bg-emerald-50 text-emerald-500 border-emerald-100" : isGagal ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-amber-50 text-amber-500 border-amber-100"}`, children: /* @__PURE__ */ jsx("i", { className: `fa-solid text-xl ${isSukses ? "fa-check" : isGagal ? "fa-xmark" : "fa-hourglass-half animate-spin-slow"}` }) }),
              /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
                /* @__PURE__ */ jsxs("p", { className: "text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1", children: [
                  trx.ref_id,
                  " • ",
                  new Date(trx.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "font-black text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors tracking-tight", children: trx.tujuan }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-500 mb-2 mt-0.5", children: trx.kode_layanan }),
                isSukses && /* @__PURE__ */ jsxs("button", { onClick: () => openPrintModal(trx), className: "text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all border border-indigo-200 inline-flex items-center gap-1.5 shadow-sm active:scale-95", children: [
                  /* @__PURE__ */ jsx("i", { className: "fa-solid fa-receipt" }),
                  " Buat Struk"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-full lg:w-5/12 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black uppercase text-slate-400 tracking-widest", children: "Pesan Server / SN / Token" }),
                /* @__PURE__ */ jsxs("button", { onClick: () => copyToClipboard(maskedSN), className: "text-[9px] font-black px-2.5 py-1 rounded-md bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm active:scale-95 flex items-center gap-1 uppercase tracking-widest", children: [
                  /* @__PURE__ */ jsx("i", { className: "fa-regular fa-copy" }),
                  " Salin"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-xs font-mono font-bold text-slate-700 break-all leading-relaxed max-h-[60px] overflow-y-auto custom-scrollbar pr-1", children: maskedSN || trx.keterangan || "Menunggu respon..." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-full lg:w-3/12 flex flex-row lg:flex-col justify-between items-center lg:items-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-left lg:text-right", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5", children: "Harga Asli" }),
                /* @__PURE__ */ jsxs("p", { className: "font-black text-slate-800 text-lg tracking-tight", children: [
                  "Rp ",
                  formatRp(trx.harga)
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: `status-badge ${isSukses ? "status-sukses" : isGagal ? "status-gagal" : "status-pending"}`, children: trx.status })
            ] })
          ] }, trx.id);
        }) : /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[32px] p-12 text-center border border-slate-200 shadow-sm", children: [
          /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-box-open text-3xl text-slate-300" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-black text-slate-700 mb-1 uppercase tracking-widest", children: "Riwayat Kosong" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-xs font-bold", children: "Tidak ada transaksi untuk filter ini." })
        ] }) }),
        transactions.links && transactions.data.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-2 mt-8", children: transactions.links.map((link, index) => {
          if (!link.url && !link.active) return null;
          return /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url || "#",
              preserveScroll: true,
              dangerouslySetInnerHTML: { __html: link.label.replace("Previous", '<i class="fa-solid fa-chevron-left"></i>').replace("Next", '<i class="fa-solid fa-chevron-right"></i>') },
              className: `px-4 py-2 rounded-xl text-xs font-black transition-all border ${link.active ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105" : !link.url ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"}`
            },
            index
          );
        }) })
      ] })
    ] }),
    showModal && activeTrx && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-full" }),
        /* @__PURE__ */ jsxs("h2", { className: "font-black text-lg uppercase tracking-widest relative z-10", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-receipt mr-2" }),
          " Pengaturan Struk"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setShowModal(false), className: "bg-white/20 hover:bg-white/40 w-8 h-8 rounded-full flex items-center justify-center transition-colors relative z-10", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-xmark" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-5 bg-slate-50", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2", children: "Nama Konter / Toko Anda" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: tokoName, onChange: (e) => setTokoName(e.target.value), className: "w-full border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:border-indigo-500 focus:ring-0 transition-all outline-none", placeholder: "Masukkan nama toko..." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2", children: "Harga Jual ke Pelanggan (Rp)" }),
          /* @__PURE__ */ jsx("input", { type: "number", value: hargaJual, onChange: (e) => setHargaJual(e.target.value), className: "w-full border-2 border-slate-200 rounded-xl p-3 font-black text-indigo-600 text-lg focus:border-indigo-500 focus:ring-0 transition-all outline-none", placeholder: "Contoh: 22000" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 mt-1.5 font-bold", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-info mr-1" }),
            " Harga modal: Rp ",
            formatRp(activeTrx.harga)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 bg-white border-t border-slate-100 flex gap-3", children: [
        /* @__PURE__ */ jsxs("button", { onClick: handlePrint, className: "w-1/2 bg-slate-100 text-slate-700 hover:text-white border border-slate-200 font-black py-4 rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[9px] flex flex-col justify-center items-center gap-1.5 shadow-sm", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-print text-xl" }),
          " Printer Thermal"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: handleDownloadImage, className: "w-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 rounded-2xl shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all uppercase tracking-widest text-[9px] flex flex-col justify-center items-center gap-1.5 border border-white/20", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-download text-xl" }),
          " Unduh Gambar"
        ] })
      ] })
    ] }) }),
    showModal && activeTrx && /* @__PURE__ */ jsxs("div", { className: "hidden print:block font-mono text-black bg-white w-[80mm] mx-auto text-sm p-4 leading-relaxed border-none", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-4", children: [
        /* @__PURE__ */ jsx("h1", { className: "font-bold text-xl uppercase tracking-widest m-0 p-0 border-b-2 border-dashed border-black pb-2 mb-2", children: tokoName }),
        /* @__PURE__ */ jsx("p", { className: "text-xs m-0", children: "Struk Pembelian PPOB / Elektrik" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "w-20", children: "Tanggal" }),
          /* @__PURE__ */ jsxs("span", { children: [
            ": ",
            new Date(activeTrx.created_at).toLocaleString("id-ID")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "w-20", children: "No. Ref" }),
          /* @__PURE__ */ jsxs("span", { children: [
            ": ",
            activeTrx.ref_id
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "w-20", children: "Status" }),
          /* @__PURE__ */ jsx("span", { children: ": SUKSES" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-b border-dashed border-black py-2 mb-4 text-xs", children: [
        /* @__PURE__ */ jsx("div", { className: "font-bold mb-1", children: activeTrx.kode_layanan }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between mb-2", children: [
          /* @__PURE__ */ jsx("span", { children: "Tujuan:" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: activeTrx.tujuan })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsx("span", { className: "block mb-1", children: "SN / Token / Pesan:" }),
          /* @__PURE__ */ jsx("span", { className: "block font-bold break-all bg-gray-100 p-1", children: maskSN(activeTrx.sn) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-base font-bold mb-6", children: [
        /* @__PURE__ */ jsx("span", { children: "TOTAL BAYAR" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "Rp ",
          formatRp(hargaJual)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center text-xs border-t-2 border-dashed border-black pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "m-0", children: "Terima Kasih" }),
        /* @__PURE__ */ jsx("p", { className: "m-0", children: "Simpan struk ini sebagai bukti pembayaran yang sah." }),
        /* @__PURE__ */ jsxs("p", { className: "mt-4 text-[10px]", children: [
          "Powered by ",
          tokoName
        ] })
      ] })
    ] }),
    showModal && activeTrx && /* @__PURE__ */ jsx("div", { className: "fixed top-[-9999px] left-[-9999px] z-[-50] print:hidden", children: /* @__PURE__ */ jsxs("div", { ref: receiptRef, className: "w-[450px] bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden font-sans border-4 border-indigo-500/30", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-40" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-48 h-48 bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-30" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center border-b border-white/20 pb-5 mb-6 relative z-10", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300 uppercase drop-shadow-lg", children: tokoName }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-indigo-200 font-black uppercase tracking-[0.3em] mt-2 bg-white/10 inline-block px-4 py-1.5 rounded-md border border-white/10 shadow-sm", children: "Bukti Pembayaran Digital" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 relative z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b border-white/10 pb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-indigo-200 text-xs font-bold uppercase tracking-widest", children: "Waktu" }),
          /* @__PURE__ */ jsx("span", { className: "font-black text-sm text-right", children: new Date(activeTrx.created_at).toLocaleString("id-ID") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b border-white/10 pb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-indigo-200 text-xs font-bold uppercase tracking-widest", children: "No. Ref" }),
          /* @__PURE__ */ jsx("span", { className: "font-black text-sm text-right font-mono bg-white/10 px-2 py-0.5 rounded", children: activeTrx.ref_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b border-white/10 pb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-indigo-200 text-xs font-bold uppercase tracking-widest", children: "Status" }),
          /* @__PURE__ */ jsxs("span", { className: "font-black text-emerald-400 text-xs uppercase tracking-widest bg-emerald-500/20 px-2.5 py-1 rounded border border-emerald-500/30", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-check mr-1" }),
            " SUKSES"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b border-white/10 pb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-indigo-200 text-xs font-bold uppercase tracking-widest", children: "Produk" }),
          /* @__PURE__ */ jsx("span", { className: "font-black text-sm text-right max-w-[200px]", children: activeTrx.kode_layanan })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b border-white/10 pb-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-indigo-200 text-xs font-bold uppercase tracking-widest", children: "Tujuan" }),
          /* @__PURE__ */ jsx("span", { className: "font-black text-xl text-right tracking-widest text-white", children: activeTrx.tujuan })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 relative z-10 shadow-inner", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-indigo-300 uppercase tracking-widest font-black mb-2 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-key" }),
          " SN / Token / Pesan"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "font-mono text-base font-bold text-white break-all leading-relaxed", children: maskSN(activeTrx.sn) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-6 border-t-2 border-dashed border-white/20 text-center relative z-10", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-indigo-200 uppercase tracking-widest font-black mb-1", children: "TOTAL PEMBAYARAN" }),
        /* @__PURE__ */ jsxs("h2", { className: "text-[40px] font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]", children: [
          "Rp ",
          formatRp(hargaJual)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 text-center relative z-10 bg-black/20 rounded-2xl p-4 border border-white/5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-indigo-200 font-bold uppercase tracking-widest", children: "Terima kasih telah bertransaksi." }),
        /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-white/40 mt-1 font-mono", children: [
          "Generated securely by ",
          tokoName,
          " System"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  History as default
};
