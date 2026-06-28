import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import axios from "axios";
import Swal from "sweetalert2";
import "moment";
function HesdaIndex({ auth }) {
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [jenisPaket, setJenisPaket] = useState("pa");
  const formatRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  const loadBalance = () => {
    setLoadingBalance(true);
    axios.get("/admin/hesda/api/balance").then((res) => setBalance(res.data.status ? res.data.data.saldo : "Error")).catch(() => setBalance("Error")).finally(() => setLoadingBalance(false));
  };
  const loadPackages = (jenis) => {
    setLoadingPackages(true);
    axios.get(`/admin/hesda/api/packages?jenis=${jenis}`).then((res) => setPackages(res.data.status ? res.data.data : [])).catch(() => setPackages([])).finally(() => setLoadingPackages(false));
  };
  const handleCekStok = async () => {
    Swal.fire({ title: "Menarik Data Stok...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await axios.get("/admin/hesda/api/stock");
      if (res.data.status && res.data.data) {
        let htmlList = '<div class="grid grid-cols-2 gap-3 mt-4">';
        res.data.data.forEach((item) => {
          let color = item.stock > 0 ? "text-emerald-600" : "text-rose-500";
          let bg = item.stock > 0 ? "bg-emerald-50 border-emerald-200 shadow-sm" : "bg-rose-50 border-rose-200";
          let icon = item.stock > 0 ? "fa-box-check" : "fa-box-open";
          htmlList += `
                        <div class="p-4 border rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-105 ${bg}">
                            <span class="text-[10px] font-black uppercase text-slate-500 mb-1">${item.show_name} (${item.version})</span>
                            <div class="flex items-center gap-2">
                                <i class="fa-solid ${icon} ${color} text-lg"></i>
                                <span class="text-2xl font-black ${color}">${item.stock}</span>
                            </div>
                        </div>
                    `;
        });
        htmlList += "</div>";
        Swal.fire({
          title: '<i class="fa-solid fa-boxes-stacked text-indigo-500"></i> Stok Akrab Hesda',
          html: htmlList,
          confirmButtonColor: "#4f46e5",
          confirmButtonText: "Tutup Gudang",
          width: "36em"
        });
      } else {
        Swal.fire("Gagal!", res.data.message || "Gagal mengambil stok.", "error");
      }
    } catch (error) {
      Swal.fire("Error Sistem", "Terjadi kesalahan jaringan.", "error");
    }
  };
  useEffect(() => {
    loadBalance();
    loadPackages(jenisPaket);
  }, []);
  const handleJenisChange = (jenis) => {
    setJenisPaket(jenis);
    loadPackages(jenis);
  };
  const handleExecute = async (pkg) => {
    const { value: targetNumber } = await Swal.fire({
      title: "🎯 Tembak Paket Hesda",
      html: `
                <div class="text-left text-xs mb-4">
                    <p class="font-bold text-slate-500">Paket: <span class="text-indigo-600">${pkg.package_name_show}</span></p>
                    <p class="font-bold text-slate-500">Harga: <span class="text-emerald-600">${pkg.harga}</span></p>
                </div>
                <input id="swal-input-target" class="swal2-input w-full max-w-full text-center font-bold text-lg tracking-widest" placeholder="Masukkan Nomor XL Tujuan" type="number" autofocus>
            `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-rocket"></i> Proses Tembak!',
      confirmButtonColor: "#4f46e5",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const target = document.getElementById("swal-input-target").value;
        if (!target) {
          Swal.showValidationMessage("Nomor tujuan wajib diisi!");
          return false;
        }
        if (target.length < 10) {
          Swal.showValidationMessage("Nomor tujuan tidak valid!");
          return false;
        }
        return target;
      }
    });
    if (targetNumber) {
      Swal.fire({ title: "Memproses ke Server Hesda...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await axios.post("/admin/hesda/api/order", {
          package_id: pkg.package_id,
          parent_msisdn: targetNumber
        });
        if (res.data.status) {
          Swal.fire({
            icon: "success",
            title: "Tembakan Berhasil!",
            html: `
                            <div class="text-sm font-bold text-slate-600 text-left bg-slate-50 p-4 rounded-xl mt-4 border border-slate-200">
                                <p>No Tujuan: <span class="text-indigo-600">${res.data.data.parent_msisdn}</span></p>
                                <p>Masa Aktif: <span class="text-emerald-600">${res.data.data.end_date}</span></p>
                                <p class="text-[10px] text-slate-400 mt-2 truncate">TRX: ${res.data.data.trx_id}</p>
                            </div>
                        `,
            confirmButtonColor: "#10b981"
          });
          loadBalance();
        } else {
          Swal.fire("Gagal!", res.data.message || "Transaksi ditolak oleh server.", "error");
        }
      } catch (error) {
        Swal.fire("Error Sistem", "Terjadi kesalahan jaringan atau server Hesda sedang gangguan.", "error");
      }
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Provider Hesda - MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#0f172a] pt-12 pb-24 px-6 rounded-b-[50px] shadow-2xl relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" }),
      /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-black text-white tracking-tight relative z-10", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-server text-indigo-400 mr-2" }),
        " Hesda Provider"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-[10px] font-bold uppercase tracking-[3px] mt-2 relative z-10", children: "Pusat Integrasi & Eksekusi Paket Akrab" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 -mt-16 max-w-7xl mx-auto space-y-6 relative z-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8 shadow-xl shadow-indigo-500/20 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-indigo-200 text-xs font-black uppercase tracking-widest mb-1", children: "Total Saldo API Hesda" }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: loadingBalance ? /* @__PURE__ */ jsx("div", { className: "h-10 w-48 bg-white/20 animate-pulse rounded-xl" }) : /* @__PURE__ */ jsx("h2", { className: "text-4xl font-black text-white tracking-tighter", children: balance === "Error" ? /* @__PURE__ */ jsx("span", { className: "text-rose-400 text-2xl", children: "Gagal Tarik Data" }) : formatRp(balance) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 w-full md:w-auto", children: [
          /* @__PURE__ */ jsxs("button", { onClick: handleCekStok, className: "w-full sm:w-auto bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest backdrop-blur-md transition-all border border-amber-500/30 active:scale-95", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-boxes-stacked mr-2" }),
            " Cek Stok Gudang"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: loadBalance, disabled: loadingBalance, className: "w-full md:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest backdrop-blur-md transition-all border border-white/20 active:scale-95 disabled:opacity-50", children: [
            /* @__PURE__ */ jsx("i", { className: `fa-solid fa-rotate-right mr-2 ${loadingBalance ? "fa-spin" : ""}` }),
            " Refresh Saldo"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-8 mb-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-100 pb-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-lg font-black text-slate-800", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bolt text-amber-500 mr-2" }),
              " Eksekusi Transaksi Live"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-medium mt-1", children: "Pilih paket dan tembak langsung ke nomor pelanggan Anda." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => handleJenisChange("pa"), className: `flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${jenisPaket === "pa" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`, children: "PA (Add)" }),
            /* @__PURE__ */ jsx("button", { onClick: () => handleJenisChange("invite"), className: `flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${jenisPaket === "invite" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`, children: "Invite" }),
            /* @__PURE__ */ jsx("button", { onClick: () => handleJenisChange("bes"), className: `flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${jenisPaket === "bes" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`, children: "BES (Slot)" })
          ] })
        ] }),
        loadingPackages ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500" }) }) : packages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-folder-open text-4xl text-slate-300 mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-slate-500", children: "Tidak ada data paket ditemukan." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: packages.map((pkg, idx) => /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-slate-100 hover:border-indigo-200 rounded-3xl p-6 transition-colors flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-black text-slate-800 text-sm leading-tight", children: pkg.package_name_show }),
              /* @__PURE__ */ jsx("span", { className: "bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase shrink-0", children: pkg.jenis })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 font-bold mb-4", children: [
              "Kode: ",
              pkg.package_code
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 rounded-2xl p-3 mb-4 border border-slate-100 hidden", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1", children: "Package ID" }),
              /* @__PURE__ */ jsx("code", { className: "text-[10px] font-mono font-bold text-indigo-600 break-all", children: pkg.package_id })
            ] }),
            pkg.package_description_show && /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-500 font-medium mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl", dangerouslySetInnerHTML: { __html: pkg.package_description_show } })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-auto", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1", children: "Harga Modal" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xl font-black text-emerald-600", children: pkg.harga }),
              /* @__PURE__ */ jsxs("button", { onClick: () => handleExecute(pkg), className: "bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/30 active:scale-95 transition-all", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-rocket mr-1" }),
                " Tembak"
              ] })
            ] })
          ] })
        ] }, idx)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `.animate-blob { animation: blob 7s infinite; } @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }` } })
  ] });
}
export {
  HesdaIndex as default
};
