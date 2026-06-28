import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import Swal from "sweetalert2";
import "moment";
function AkrabManager({ auth, localManagers, masterProducts }) {
  const [activeTab, setActiveTab] = useState("pengelola");
  const [currentView, setCurrentView] = useState("list");
  const [selectedMsisdn, setSelectedMsisdn] = useState(null);
  const [slotsData, setSlotsData] = useState([]);
  const [parentData, setParentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMassSyncing, setIsMassSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const managersArray = Object.values(localManagers || {});
  const productsArray = Object.values(masterProducts || {});
  const filteredManagers = managersArray.filter((m) => m.msisdn.includes(searchQuery));
  const filteredSlots = slotsData?.filter(
    (s) => (s.member_msisdn || "").includes(searchQuery) || (s.member_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const runMassSync = async () => {
    if (managersArray.length === 0) return;
    const confirm = await Swal.fire({ title: "Mulai Mass Sync?", text: `Sinkronisasi ${managersArray.length} pengelola ke server XL pusat.`, icon: "question", showCancelButton: true, confirmButtonColor: "#10b981" });
    if (!confirm.isConfirmed) return;
    setIsMassSyncing(true);
    setSyncProgress(0);
    for (let i = 0; i < managersArray.length; i++) {
      try {
        await axios.post("/admin/akrab/ajax-sync-slot", { msisdn: managersArray[i].msisdn });
      } catch (err) {
      }
      setSyncProgress(Math.round((i + 1) / managersArray.length * 100));
    }
    setTimeout(() => {
      setIsMassSyncing(false);
      Swal.fire("Sukses", "Seluruh pengelola berhasil diperbarui.", "success");
      router.reload();
    }, 1e3);
  };
  const loadSlotsFromDB = async (msisdn) => {
    setLoading(true);
    setSelectedMsisdn(msisdn);
    setCurrentView("slots");
    setSearchQuery("");
    try {
      const res = await axios.get(`/admin/akrab/member-info?active_msisdn=${msisdn}`);
      setSlotsData(res.data?.members || []);
      setParentData(res.data?.parent || null);
    } catch (e) {
      Swal.fire("Error", "Gagal memuat data dari DB lokal.", "error");
    }
    setLoading(false);
  };
  const syncIndividualSlot = async (msisdn) => {
    Swal.fire({ title: "Menarik Data Server XL...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await axios.post("/admin/akrab/ajax-sync-slot", { msisdn });
      if (res.data.status || res.data.success) {
        Swal.fire("Sukses", "Data ditarik!", "success");
        loadSlotsFromDB(msisdn);
      } else {
        Swal.fire("Gagal", res.data.message || "Gagal sinkronisasi.", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Koneksi ke API XL terputus.", "error");
    }
  };
  const actionHit = async (action, payload) => {
    Swal.fire({ title: "Memproses ke XL...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await axios.post("/admin/akrab/action", { action, active_msisdn: selectedMsisdn, ...payload });
      if (res.data.status || res.data.success) {
        Swal.fire("Berhasil", "Sukses dieksekusi!", "success");
        syncIndividualSlot(selectedMsisdn);
      } else {
        Swal.fire("Gagal", res.data.message || "Ditolak oleh Server XL.", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Sistem Backend bermasalah.", "error");
    }
  };
  const confirmKick = async (slotId, fid, memberName, memberHp) => {
    const confirm = await Swal.fire({
      title: "⚠️ KICK ANGGOTA!",
      html: `Yakin ingin menendang <b>${memberName || "Anggota"}</b> (${memberHp || "-"})?<br><br><span class="text-rose-500 font-bold">Peringatan: XL hanya memberikan 1x kesempatan invite ulang pada slot ini!</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "YA, KICK SEKARANG"
    });
    if (confirm.isConfirmed) {
      actionHit("kick", { family_member_id: fid, slot_id: slotId });
    }
  };
  const handleForceKuber = async (fid) => {
    const { value: gb } = await Swal.fire({ title: "Tembak Kuota (GB)", input: "number", showCancelButton: true, confirmButtonColor: "#0ea5e9" });
    if (gb) actionHit("force_kuber", { family_member_id: fid, gb });
  };
  const handleMapSlot = async (slotId, prodId) => {
    try {
      await axios.post("/admin/akrab/slots/map", { slot_id: slotId, mapped_product_id: prodId });
      loadSlotsFromDB(selectedMsisdn);
    } catch (e) {
    }
  };
  const handleProductForm = async (prod = null) => {
    const { value: formValues } = await Swal.fire({
      title: prod ? "🔧 Edit Varian Produk" : "📦 Tambah Varian Produk",
      html: `
                <input id="swal_p_nama" class="swal2-input" placeholder="Nama Varian (Ex: Akrab 10GB)" value="${prod ? prod.nama_produk : ""}">
                <input id="swal_p_harga" type="number" class="swal2-input" placeholder="Harga Jual (Rp)" value="${prod ? prod.harga_jual : ""}">
                <input id="swal_p_kuber" type="number" class="swal2-input" placeholder="Jatah Kuber (GB)" value="${prod ? prod.kuber_gb : ""}">
                <input id="swal_p_desc" class="swal2-input" placeholder="Deskripsi Singkat" value="${prod?.deskripsi || ""}">
            `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      preConfirm: () => ({
        id: prod?.id || null,
        nama_produk: document.getElementById("swal_p_nama").value,
        harga_jual: document.getElementById("swal_p_harga").value,
        kuber_gb: document.getElementById("swal_p_kuber").value,
        deskripsi: document.getElementById("swal_p_desc").value
      })
    });
    if (formValues?.nama_produk && formValues?.harga_jual) {
      Swal.showLoading();
      await axios.post("/admin/akrab/products", formValues);
      router.reload();
    }
  };
  const handleDeleteProduct = async (id) => {
    const check = await Swal.fire({ title: "Hapus Varian?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444" });
    if (check.isConfirmed) {
      Swal.showLoading();
      await axios.post("/admin/akrab/products/delete", { id });
      router.reload();
    }
  };
  const handleLoginOtp = async () => {
    const { value: msisdn } = await Swal.fire({ title: "Request OTP Baru", input: "number", inputPlaceholder: "0819xxxx", showCancelButton: true });
    if (msisdn) {
      Swal.fire({ title: "Mengirim OTP...", didOpen: () => Swal.showLoading() });
      const res = await axios.post("/admin/akrab/req-otp", { msisdn });
      if (res.data.status || res.data.success) {
        const { value: otp } = await Swal.fire({ title: "Masukkan Kode OTP", input: "text", showCancelButton: true });
        if (otp) {
          Swal.fire({ title: "Verifikasi Sesi...", didOpen: () => Swal.showLoading() });
          const loginRes = await axios.post("/admin/akrab/submit-otp", { msisdn, otp });
          if (loginRes.data.status || loginRes.data.success) {
            Swal.fire("Aktif", "Sesi Pengelola Berhasil Diinjeksi!", "success");
            router.reload();
          } else {
            Swal.fire("Gagal", "OTP salah atau expired.", "error");
          }
        }
      } else {
        Swal.fire("Gagal", res.data.message || "Gagal mengirim OTP.", "error");
      }
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "MilaStore Akrab V14.3" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 text-slate-800 pb-12 font-sans", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white px-6 py-5 shadow-sm border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          currentView === "slots" ? /* @__PURE__ */ jsx("button", { onClick: () => {
            setCurrentView("list");
            setSearchQuery("");
          }, className: "mr-4 text-2xl text-slate-400 hover:text-indigo-600 transition-colors", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-left" }) }) : /* @__PURE__ */ jsx("div", { className: "mr-4 text-3xl text-indigo-600", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-shield-halved" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h6", { className: "mb-0 font-black text-xl text-slate-800 tracking-tight", children: "MILASTORE AKRAB" }),
            /* @__PURE__ */ jsx("small", { className: "text-indigo-500 font-bold tracking-widest text-[10px] uppercase", children: "Enterprise V14.3 Final" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex relative w-72 shadow-sm rounded-full", children: [
          /* @__PURE__ */ jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: currentView === "list" ? "Cari induk (Ex: 0819...)" : "Cari anggota (Nama / No HP)...", className: "w-full bg-slate-100 border-none rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium" }),
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass absolute left-4 top-3 text-slate-400" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4", children: [
        isMassSyncing && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl border border-slate-100", children: [
          /* @__PURE__ */ jsx("h5", { className: "font-bold text-lg text-slate-900 mb-1", children: "Mass Sync Berjalan..." }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-slate-100 h-6 rounded-full overflow-hidden mb-2 mt-4 p-1 border", children: /* @__PURE__ */ jsxs("div", { className: "bg-[#10b981] h-full flex items-center justify-center text-white text-[11px] font-black rounded-full transition-all duration-300", style: { width: `${syncProgress}%` }, children: [
            syncProgress,
            "%"
          ] }) })
        ] }) }),
        currentView === "list" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-6", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("pengelola"), className: `px-6 py-2.5 font-bold rounded-full text-xs shadow-sm transition-all flex items-center ${activeTab === "pengelola" ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`, children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-sitemap mr-2" }),
              " PENGELOLA"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("produk"), className: `px-6 py-2.5 font-bold rounded-full text-xs shadow-sm transition-all flex items-center ${activeTab === "produk" ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`, children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-boxes-stacked mr-2" }),
              " PRODUK"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("otp"), className: `px-6 py-2.5 font-bold rounded-full text-xs shadow-sm transition-all flex items-center ${activeTab === "otp" ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`, children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-key mr-2" }),
              " OTP & SESI"
            ] })
          ] }),
          activeTab === "pengelola" && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl shadow-sm border border-slate-200 p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6 border-b border-slate-100 pb-4", children: [
              /* @__PURE__ */ jsx("h6", { className: "font-bold text-lg text-slate-800", children: "Daftar Induk Aktif" }),
              /* @__PURE__ */ jsxs("button", { onClick: runMassSync, className: "bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-full shadow-sm text-xs transition-all", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-rotate mr-2" }),
                " MASS SYNC (",
                managersArray.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", children: filteredManagers.map((m, idx) => /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-slate-100 hover:border-indigo-300 rounded-2xl p-5 shadow-sm transition-all", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start border-b border-slate-100 pb-3 mb-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h5", { className: "font-bold text-xl text-slate-800 font-mono mb-1", children: m.msisdn }),
                  /* @__PURE__ */ jsxs("span", { className: "inline-block bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px]", children: [
                    "Tgl Reset: ",
                    m.tanggal_restok || 1
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { className: `inline-block font-black px-2 py-1 rounded-md text-[10px] uppercase border ${m.status_pengelola === "open" || !m.status_pengelola ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"}`, children: m.status_pengelola || "OPEN" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 rounded-xl p-3.5 mb-4 text-xs font-medium space-y-2 border border-slate-100", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-slate-500", children: [
                  /* @__PURE__ */ jsx("span", { children: "Total Kuota Induk:" }),
                  /* @__PURE__ */ jsxs("strong", { className: "text-slate-800", children: [
                    m.total_quota_gb || 0,
                    " GB"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-slate-500", children: [
                  /* @__PURE__ */ jsx("span", { children: "Sisa Tersedia:" }),
                  /* @__PURE__ */ jsxs("strong", { className: "text-emerald-600 text-sm font-black bg-emerald-50 px-2 py-0.5 rounded", children: [
                    m.sisa_quota_gb || 0,
                    " GB"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => loadSlotsFromDB(m.msisdn), className: "w-full bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold py-2.5 rounded-xl transition-all text-xs border border-indigo-100", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-right-to-bracket mr-1" }),
                " BUKA PETA SLOT"
              ] })
            ] }, idx)) })
          ] }),
          activeTab === "produk" && /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl shadow-sm border border-slate-200 p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
              /* @__PURE__ */ jsx("h6", { className: "font-bold text-lg text-slate-800", children: "Master Varian Paket" }),
              /* @__PURE__ */ jsxs("button", { onClick: () => handleProductForm(), className: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-sm", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-plus mr-1" }),
                " BUAT VARIAN"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "overflow-x-auto border border-slate-200 rounded-2xl", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm whitespace-nowrap", children: [
              /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider", children: /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("th", { className: "p-4", children: "Nama Produk" }),
                /* @__PURE__ */ jsx("th", { className: "p-4", children: "Jatah Kuber" }),
                /* @__PURE__ */ jsx("th", { className: "p-4", children: "Harga Jual" }),
                /* @__PURE__ */ jsx("th", { className: "p-4 text-center", children: "Aksi" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: productsArray.map((p) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 transition-colors", children: [
                /* @__PURE__ */ jsxs("td", { className: "p-4 font-bold text-slate-800", children: [
                  p.nama_produk,
                  /* @__PURE__ */ jsx("br", {}),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 font-normal", children: p.deskripsi || "-" })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "p-4", children: /* @__PURE__ */ jsxs("span", { className: "bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-md text-[11px] font-black", children: [
                  p.kuber_gb,
                  " GB"
                ] }) }),
                /* @__PURE__ */ jsxs("td", { className: "p-4 text-emerald-600 font-black text-base", children: [
                  "Rp ",
                  p.harga_jual?.toLocaleString("id-ID")
                ] }),
                /* @__PURE__ */ jsxs("td", { className: "p-4 text-center flex justify-center gap-2", children: [
                  /* @__PURE__ */ jsx("button", { onClick: () => handleProductForm(p), className: "text-slate-600 bg-slate-100 hover:bg-slate-200 w-9 h-9 rounded-xl transition-colors", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-pen text-xs" }) }),
                  /* @__PURE__ */ jsx("button", { onClick: () => handleDeleteProduct(p.id), className: "text-rose-600 bg-rose-50 hover:bg-rose-100 w-9 h-9 rounded-xl transition-colors", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-trash text-xs" }) })
                ] })
              ] }, p.id)) })
            ] }) })
          ] }),
          activeTab === "otp" && /* @__PURE__ */ jsxs("div", { className: "bg-white p-10 rounded-3xl border border-slate-200 text-center max-w-md mx-auto shadow-sm mt-10", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-indigo-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5 text-indigo-500 text-3xl border border-indigo-100 shadow-inner", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-mobile-screen-button" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-black text-slate-800 mb-2", children: "Injeksi Sesi XL Baru" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-xs mb-8 max-w-xs mx-auto leading-relaxed", children: "Login via OTP untuk menambahkan nomor pengelola induk baru ke dalam sistem MILASTORE." }),
            /* @__PURE__ */ jsxs("button", { onClick: handleLoginOtp, className: "w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl shadow-md text-xs tracking-wider transition-all", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-key mr-2" }),
              " REQUEST OTP SEKARANG"
            ] })
          ] })
        ] }),
        currentView === "slots" && selectedMsisdn && /* @__PURE__ */ jsxs("div", { children: [
          parentData && /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl mb-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-white relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute -right-10 -top-10 text-white/5 text-9xl", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-server" }) }),
            /* @__PURE__ */ jsxs("div", { className: "z-10", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black bg-black/20 px-3 py-1 rounded-md border border-white/10 tracking-widest uppercase mb-2 inline-block", children: "MONITOR INDUK MILASTORE" }),
              /* @__PURE__ */ jsx("h2", { className: "text-4xl font-black font-mono drop-shadow-md", children: parentData.msisdn })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "z-10 flex gap-8 text-sm font-bold bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 w-full md:w-auto", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-indigo-200 block text-[10px] uppercase mb-1", children: "Total Alokasi" }),
                /* @__PURE__ */ jsx("strong", { className: "text-3xl", children: parentData.total_quota_gb || 0 }),
                /* @__PURE__ */ jsx("small", { className: "font-normal ml-1", children: "GB" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-px bg-white/20" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "text-emerald-200 block text-[10px] uppercase mb-1", children: "Sisa Tersedia" }),
                /* @__PURE__ */ jsx("strong", { className: "text-3xl text-emerald-300 drop-shadow-md", children: parentData.sisa_quota_gb || 0 }),
                /* @__PURE__ */ jsx("small", { className: "font-normal ml-1 text-emerald-200", children: "GB" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
            /* @__PURE__ */ jsxs("h6", { className: "font-black text-slate-800 text-lg ml-2", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-network-wired text-indigo-500 mr-2" }),
              " Peta Jalur Anggota"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => syncIndividualSlot(selectedMsisdn), className: "bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-md transition-all", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-cloud-arrow-down mr-2" }),
              " TARIK DATA XL"
            ] })
          ] }),
          loading ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20 text-slate-400 font-bold", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-notch fa-spin text-3xl mb-3 block text-indigo-500" }),
            " Memuat Peta..."
          ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredSlots?.map((m, idx) => {
            const isFilled = m.status_slot === "filled";
            const fid = m.family_id_filled || m.family_id_empty;
            return /* @__PURE__ */ jsxs("div", { className: `bg-white border-2 rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between ${m.mapped_product_id ? "border-slate-200 hover:border-indigo-400" : "border-rose-300 bg-rose-50/50"}`, children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxs("span", { className: "text-[10px] bg-slate-800 text-white font-black px-2.5 py-1 rounded-md shadow-sm", children: [
                    "SLOT ",
                    m.slot_id
                  ] }) }),
                  /* @__PURE__ */ jsx("span", { className: `text-[10px] font-black px-3 py-1 rounded-full ${isFilled ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}`, children: isFilled ? "TERISI" : "KOSONG" })
                ] }),
                /* @__PURE__ */ jsx("h5", { className: "font-black text-slate-800 text-xl truncate", children: m.member_name || (isFilled ? "Tanpa Nama" : "Menunggu Buyer") }),
                /* @__PURE__ */ jsx("small", { className: "text-slate-500 font-mono font-bold block text-sm mt-1 mb-4", children: m.member_msisdn || "-" }),
                isFilled && /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-2 mb-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-slate-500", children: [
                    /* @__PURE__ */ jsx("span", { children: "Alokasi Kuber:" }),
                    /* @__PURE__ */ jsxs("strong", { className: "text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-sm", children: [
                      m.quota_limit || 0,
                      " GB"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-slate-500", children: [
                    /* @__PURE__ */ jsx("span", { children: "Terpakai:" }),
                    /* @__PURE__ */ jsxs("strong", { className: "text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-sm", children: [
                      m.quota_used || 0,
                      " GB"
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border-t border-dashed border-slate-200 pt-4", children: [
                /* @__PURE__ */ jsxs("label", { className: "text-[10px] text-slate-400 font-black block mb-2", children: [
                  /* @__PURE__ */ jsx("i", { className: "fa-solid fa-link mr-1" }),
                  "SUNTIK KE VARIAN PRODUK"
                ] }),
                /* @__PURE__ */ jsxs("select", { value: m.mapped_product_id || "", onChange: (e) => handleMapSlot(m.slot_id, e.target.value), className: "w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs p-3 font-bold mb-4 focus:ring-2 focus:ring-indigo-500", children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "-- JANGAN DIJUAL --" }),
                  productsArray.map((p) => /* @__PURE__ */ jsxs("option", { value: p.id, children: [
                    p.nama_produk,
                    " (",
                    p.kuber_gb,
                    "GB)"
                  ] }, p.id))
                ] }),
                isFilled ? /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxs("button", { onClick: () => handleForceKuber(fid), className: "flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-md text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all", children: [
                    /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bolt-lightning" }),
                    " KUBER"
                  ] }),
                  /* @__PURE__ */ jsx("button", { onClick: () => confirmKick(m.slot_id, fid, m.member_name, m.member_msisdn), className: "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-user-xmark" }) })
                ] }) : /* @__PURE__ */ jsxs("button", { onClick: async () => {
                  const { value: target } = await Swal.fire({ title: "Invite Manual", input: "number", inputPlaceholder: "0819xxxx", showCancelButton: true, confirmButtonColor: "#4f46e5" });
                  if (target) actionHit("invite", { slot_id: m.slot_id, family_member_id: fid, target_msisdn: target });
                }, className: "w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all", children: [
                  /* @__PURE__ */ jsx("i", { className: "fa-solid fa-user-plus" }),
                  " INVITE PEMBELI"
                ] })
              ] })
            ] }, idx);
          }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  AkrabManager as default
};
