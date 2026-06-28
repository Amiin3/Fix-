import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, Link, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import axios from "axios";
import "moment";
function TransactionManagement({ auth, transactions, filters }) {
  const [search, setSearch] = useState(filters?.search || "");
  const [localFilter, setLocalFilter] = useState("All");
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(parseFloat(n) || 0);
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route("admin.transaksi.index"), { search }, { preserveState: true });
  };
  const reloadData = () => router.reload({ only: ["transactions"] });
  const handleAction = async (trx) => {
    const { value: formValues } = await Swal.fire({
      title: "🛠️ Eksekusi Transaksi",
      html: `
                <div class="text-left mb-2 text-xs font-black text-slate-500 uppercase tracking-widest">Detail Trx:</div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-left text-sm">
                    <b>ID:</b> ${trx.ref_id}<br/>
                    <b>User:</b> ${trx.username}<br/>
                    <b>Tujuan:</b> <span class="text-blue-600 font-bold">${trx.tujuan}</span><br/>
                    <b>Harga:</b> Rp ${formatRp(trx.harga)}
                </div>
                <div class="text-left mb-2 text-xs font-black text-slate-500 uppercase tracking-widest">Ubah Status:</div>
                <select id="swal-status" class="w-full border-2 border-slate-200 focus:border-blue-500 rounded-xl mb-4 font-bold text-slate-700 py-3">
                    <option value="Pending" ${trx.status === "Pending" ? "selected" : ""}>⏳  Pending</option>
                    <option value="Sukses" ${trx.status === "Sukses" ? "selected" : ""}>✅  Sukses</option>
                    <option value="Gagal" ${trx.status === "Gagal" ? "selected" : ""}>❌  Gagal (Otomatis Refund Saldo)</option>
                </select>
                <div class="text-left mb-2 text-xs font-black text-slate-500 uppercase tracking-widest">Input/Edit SN (Serial Number):</div>
                <input type="text" id="swal-sn" class="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-700" value="${trx.sn || ""}" placeholder="Kosongkan jika tidak ada...">
            `,
      showCancelButton: true,
      confirmButtonText: "Simpan Eksekusi",
      preConfirm: () => {
        return {
          status: document.getElementById("swal-status").value,
          sn: document.getElementById("swal-sn").value
        };
      }
    });
    if (formValues) {
      Swal.fire({ title: "Mengeksekusi...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await axios.post(`/admin/transaksi/${trx.id}/status`, formValues);
        Swal.fire("Sukses!", res.data.message, "success");
        reloadData();
      } catch (e) {
        Swal.fire("Error", "Gagal memproses transaksi", "error");
      }
    }
  };
  const pageStats = useMemo(() => {
    let totalTrx = transactions.data.length;
    let totalRp = 0;
    let success = 0, pending = 0, failed = 0;
    transactions.data.forEach((trx) => {
      totalRp += parseFloat(trx.harga || 0);
      if (trx.status === "Sukses") success++;
      else if (trx.status === "Pending") pending++;
      else if (trx.status === "Gagal") failed++;
    });
    return { totalTrx, totalRp, success, pending, failed };
  }, [transactions.data]);
  const displayedTransactions = useMemo(() => {
    if (localFilter === "All") return transactions.data;
    return transactions.data.filter((trx) => trx.status === localFilter);
  }, [transactions.data, localFilter]);
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Pusat Kendali Transaksi - MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#F4F7FB] pb-32 font-['Outfit']", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 pt-10 pb-24 px-5 rounded-b-[40px] shadow-lg relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full filter blur-2xl translate-x-1/2 -translate-y-1/4" }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto relative z-10 flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(Link, { href: route("dashboard"), className: "w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all shadow-md", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black text-white tracking-tight drop-shadow-sm", children: "📡 Pusat Transaksi" }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold text-slate-300 uppercase tracking-widest", children: "Monitor & Eksekusi Delay" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-5 -mt-14 relative z-50", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-center", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Volume Halaman Ini" }),
            /* @__PURE__ */ jsxs("h3", { className: "text-lg font-black text-slate-800", children: [
              "Rp ",
              formatRp(pageStats.totalRp)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-emerald-500", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Total Sukses" }),
            /* @__PURE__ */ jsxs("h3", { className: "text-xl font-black text-emerald-600", children: [
              pageStats.success,
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: "Trx" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-amber-500", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Nyangkut (Pending)" }),
            /* @__PURE__ */ jsxs("h3", { className: "text-xl font-black text-amber-500", children: [
              pageStats.pending,
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: "Trx" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded-2xl shadow-md border border-slate-100 border-l-4 border-l-rose-500", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Gagal / Refund" }),
            /* @__PURE__ */ jsxs("h3", { className: "text-xl font-black text-rose-500", children: [
              pageStats.failed,
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: "Trx" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-3 rounded-2xl shadow-md border border-slate-100 flex flex-col md:flex-row gap-3 mb-6", children: [
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "flex-1 flex gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative w-full", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  className: "w-full border-0 bg-slate-50 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500",
                  placeholder: "Cari ID Ref, Username, atau No Tujuan...",
                  value: search,
                  onChange: (e) => setSearch(e.target.value)
                }
              ),
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass absolute left-4 top-4 text-slate-400" })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-slate-800 text-white px-6 rounded-xl font-black shadow-md hover:bg-slate-900 transition-all", children: "CARI" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-full md:w-48", children: /* @__PURE__ */ jsxs(
            "select",
            {
              value: localFilter,
              onChange: (e) => setLocalFilter(e.target.value),
              className: "w-full border-0 bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer",
              children: [
                /* @__PURE__ */ jsx("option", { value: "All", children: "Semua Status" }),
                /* @__PURE__ */ jsx("option", { value: "Pending", children: "⏳ Hanya Pending" }),
                /* @__PURE__ */ jsx("option", { value: "Sukses", children: "✅ Hanya Sukses" }),
                /* @__PURE__ */ jsx("option", { value: "Gagal", children: "❌ Hanya Gagal" })
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest font-black text-slate-500", children: [
            /* @__PURE__ */ jsx("th", { className: "p-4 whitespace-nowrap", children: "Detail Trx" }),
            /* @__PURE__ */ jsx("th", { className: "p-4 whitespace-nowrap", children: "Tujuan & Harga" }),
            /* @__PURE__ */ jsx("th", { className: "p-4 whitespace-nowrap", children: "SN / Keterangan" }),
            /* @__PURE__ */ jsx("th", { className: "p-4 whitespace-nowrap text-center", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "p-4 whitespace-nowrap text-center", children: "Aksi" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: displayedTransactions.length > 0 ? displayedTransactions.map((trx) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-50 hover:bg-slate-50/80 transition-colors", children: [
            /* @__PURE__ */ jsxs("td", { className: "p-4 whitespace-nowrap", children: [
              /* @__PURE__ */ jsx("div", { className: "font-black text-sm text-slate-800", children: trx.ref_id }),
              /* @__PURE__ */ jsxs("div", { className: "text-[11px] font-bold text-sky-600 mt-0.5", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-user mr-1 text-slate-400" }),
                " @",
                trx.username
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] font-mono text-slate-400 mt-1", children: trx.tanggal })
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "p-4 whitespace-nowrap", children: [
              /* @__PURE__ */ jsx("div", { className: "font-black text-blue-600 tracking-tight text-sm", children: trx.tujuan }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs font-bold text-slate-600 mt-0.5", children: [
                "Rp ",
                formatRp(trx.harga)
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "p-4 min-w-[200px] max-w-[300px]", children: /* @__PURE__ */ jsx("div", { className: "text-[10px] font-mono bg-slate-100 p-2 rounded-lg text-slate-700 break-all font-bold border border-slate-200 shadow-inner", children: trx.sn || /* @__PURE__ */ jsx("span", { className: "italic opacity-50 text-slate-400", children: "Menunggu SN..." }) }) }),
            /* @__PURE__ */ jsxs("td", { className: "p-4 whitespace-nowrap text-center", children: [
              trx.status === "Sukses" && /* @__PURE__ */ jsxs("span", { className: "bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-sm", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-check-circle mr-1" }),
                " Sukses"
              ] }),
              trx.status === "Pending" && /* @__PURE__ */ jsxs("span", { className: "bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-full animate-pulse shadow-sm", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-clock mr-1" }),
                " Pending"
              ] }),
              trx.status === "Gagal" && /* @__PURE__ */ jsxs("span", { className: "bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-sm", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-xmark-circle mr-1" }),
                " Gagal"
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "p-4 whitespace-nowrap text-center", children: /* @__PURE__ */ jsxs("button", { onClick: () => handleAction(trx), className: "bg-slate-800 hover:bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all shadow-md transform hover:scale-105", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-wrench mr-1" }),
              " Eksekusi"
            ] }) })
          ] }, trx.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: "5", className: "p-12 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3 border border-slate-200", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-inbox text-slate-400 text-lg" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-bold text-sm tracking-wide", children: "Data transaksi tidak ditemukan Bosku!" })
          ] }) }) })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-center gap-2 pb-10 flex-wrap", children: transactions.links.map((link, i) => /* @__PURE__ */ jsx(
          Link,
          {
            href: link.url || "#",
            className: `px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${link.active ? "bg-slate-800 text-white" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"} ${!link.url && "opacity-50 cursor-not-allowed"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          i
        )) })
      ] })
    ] })
  ] });
}
export {
  TransactionManagement as default
};
