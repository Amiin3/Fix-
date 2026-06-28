import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import Swal from "sweetalert2";
function Index() {
  const [auditUser, setAuditUser] = useState("");
  const [auditData, setAuditData] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [checkedDeposits, setCheckedDeposits] = useState({});
  const [checkedTrx, setCheckedTrx] = useState({});
  const formatRp = (angka) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);
  const fetchAuditData = async () => {
    if (!auditUser) return;
    setLoadingAudit(true);
    try {
      const res = await axios.get(`/admin/audit?audit_user=${auditUser}`);
      if (res.data.error) return Swal.fire("Gagal", res.data.error, "error");
      setAuditData(res.data);
      const initDep = {};
      res.data.deposits.forEach((d) => initDep[d.id] = true);
      const initTrx = {};
      res.data.transaksi.forEach((t) => initTrx[t.id] = true);
      setCheckedDeposits(initDep);
      setCheckedTrx(initTrx);
    } catch (e) {
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    } finally {
      setLoadingAudit(false);
    }
  };
  const calcValues = useMemo(() => {
    let calcDeposit = 0, calcTrxKeluar = 0, calcTrxMasuk = 0;
    if (auditData) {
      auditData.deposits.forEach((d) => {
        if (checkedDeposits[d.id]) calcDeposit += parseFloat(d.total_bayar);
      });
      auditData.transaksi.forEach((t) => {
        if (checkedTrx[t.id]) {
          let harga = parseFloat(t.harga);
          let sn = (t.sn || "").toLowerCase();
          let isMasuk = harga < 0 || t.kode_layanan === "MANUAL" && (sn.includes("tambah") || sn.includes("masuk") || sn.includes("refund"));
          if (isMasuk) calcTrxMasuk += Math.abs(harga);
          else calcTrxKeluar += Math.abs(harga);
        }
      });
    }
    return { calcDeposit, calcTrxKeluar, calcTrxMasuk, finalSaldo: calcDeposit + calcTrxMasuk - calcTrxKeluar };
  }, [auditData, checkedDeposits, checkedTrx]);
  const submitFixSaldo = () => {
    Swal.fire({
      title: "Yakin Timpa Saldo?",
      text: `Saldo akan diubah menjadi Rp ${formatRp(calcValues.finalSaldo)}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Sinkronkan!",
      confirmButtonColor: "#4f46e5"
    }).then((result) => {
      if (result.isConfirmed) {
        router.post("/admin/audit", { fix_saldo_user_id: auditData.user.id, new_saldo: calcValues.finalSaldo }, {
          onSuccess: () => {
            setAuditData(null);
            setAuditUser("");
            Swal.fire("Berhasil", "Saldo berhasil disinkronkan secara permanen!", "success");
          }
        });
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 font-sans pb-20", children: [
    /* @__PURE__ */ jsx(Head, { title: "Pusat Audit - MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-[#0f172a] pt-12 pb-24 px-6 rounded-b-[50px] shadow-2xl", children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-black text-white tracking-tight", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass-chart text-indigo-400 mr-2" }),
        " Pusat Audit Keuangan"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-[10px] font-bold uppercase tracking-[3px] mt-1", children: "X-Ray Ledger & Sinkronisasi Saldo" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 -mt-16 max-w-6xl mx-auto space-y-6 relative z-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[32px] p-4 shadow-xl flex flex-col md:flex-row gap-4 border border-slate-100", children: [
        /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Masukkan Nama / Email / WA Member untuk diaudit...", value: auditUser, onChange: (e) => setAuditUser(e.target.value), onKeyDown: (e) => e.key === "Enter" && fetchAuditData(), className: "flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" }),
        /* @__PURE__ */ jsx("button", { onClick: fetchAuditData, disabled: loadingAudit, className: "bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all", children: loadingAudit ? "Mencari..." : "Tarik Data" })
      ] }),
      auditData ? /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in slide-in-from-bottom-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[40px] p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 border border-indigo-800", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-10", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-indigo-300 uppercase tracking-widest", children: "Saldo Asli di Database" }),
              /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-slate-400 line-through mt-1", children: formatRp(auditData.user.saldo || 0) }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 font-bold mt-2", children: [
                "Member: @",
                auditData.user.name
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-l border-indigo-800 pl-10", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-emerald-400 uppercase tracking-widest", children: "Kalkulasi Mesin X-Ray" }),
              /* @__PURE__ */ jsx("h3", { className: `text-4xl font-black tracking-tight mt-1 ${calcValues.finalSaldo < 0 ? "text-rose-500" : "text-emerald-400"}`, children: formatRp(calcValues.finalSaldo) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: submitFixSaldo, className: "w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[3px] shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-rotate mr-2" }),
            " Timpa Saldo"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[40px] p-6 shadow-sm border border-slate-100", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black text-emerald-600 uppercase tracking-widest mb-6 px-2", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-down mr-2" }),
              " Deposit (Uang Masuk)"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar", children: auditData.deposits.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-400 text-center py-10", children: "Tidak ada riwayat." }) : auditData.deposits.map((d) => /* @__PURE__ */ jsxs("label", { className: `flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${checkedDeposits[d.id] ? "bg-emerald-50/50 border-emerald-500 shadow-sm" : "bg-slate-50 border-slate-200 grayscale opacity-60"}`, children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", className: "w-5 h-5 text-emerald-600 rounded-md", checked: checkedDeposits[d.id], onChange: () => setCheckedDeposits((p) => ({ ...p, [d.id]: !p[d.id] })) }),
              /* @__PURE__ */ jsxs("div", { className: "ml-4 flex-1", children: [
                /* @__PURE__ */ jsxs("p", { className: "text-sm font-black text-slate-800", children: [
                  d.metode,
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "float-right text-emerald-600", children: formatRp(d.total_bayar) })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-slate-400 mt-1", children: [
                  "ID: ",
                  d.id,
                  " • ",
                  new Date(d.created_at).toLocaleString("id-ID")
                ] })
              ] })
            ] }, d.id)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[40px] p-6 shadow-sm border border-slate-100", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black text-rose-600 uppercase tracking-widest mb-6 px-2", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-up mr-2" }),
              " Transaksi (Keluar / Manual)"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar", children: auditData.transaksi.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-400 text-center py-10", children: "Tidak ada riwayat." }) : auditData.transaksi.map((t) => {
              const harga = parseFloat(t.harga);
              const sn = (t.sn || "").toLowerCase();
              const isMasuk = harga < 0 || t.kode_layanan === "MANUAL" && (sn.includes("tambah") || sn.includes("masuk") || sn.includes("refund"));
              return /* @__PURE__ */ jsxs("label", { className: `flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${checkedTrx[t.id] ? isMasuk ? "bg-indigo-50/50 border-indigo-500 shadow-sm" : "bg-rose-50/50 border-rose-500 shadow-sm" : "bg-slate-50 border-slate-200 grayscale opacity-60"}`, children: [
                /* @__PURE__ */ jsx("input", { type: "checkbox", className: `w-5 h-5 rounded-md ${isMasuk ? "text-indigo-600" : "text-rose-600"}`, checked: checkedTrx[t.id], onChange: () => setCheckedTrx((p) => ({ ...p, [t.id]: !p[t.id] })) }),
                /* @__PURE__ */ jsxs("div", { className: "ml-4 flex-1", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-sm font-black text-slate-800", children: [
                    t.kode_layanan,
                    " ",
                    /* @__PURE__ */ jsxs("span", { className: `float-right ${isMasuk ? "text-indigo-600" : "text-rose-600"}`, children: [
                      isMasuk ? "+" : "-",
                      formatRp(Math.abs(harga))
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-bold text-slate-500 mt-1", children: [
                    "SN: ",
                    t.sn || "-"
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[9px] font-bold text-slate-400 mt-0.5", children: [
                    "ID: ",
                    t.id,
                    " • ",
                    new Date(t.created_at).toLocaleString("id-ID")
                  ] })
                ] })
              ] }, t.id);
            }) })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-24 bg-white rounded-[40px] border border-slate-100 border-dashed", children: [
        /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-box-open text-3xl text-slate-300" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-black text-slate-700", children: "Ruang Audit Kosong" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-400 mt-1", children: "Masukkan nama member di atas untuk memulai X-Ray keuangan." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }` })
  ] });
}
export {
  Index as default
};
