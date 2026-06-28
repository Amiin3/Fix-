import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, router } from "@inertiajs/react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import Swal from "sweetalert2";
import "axios";
import "moment";
function KajeManager({ auth, layanan, categories }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const bulkForm = useForm({ profit_amount: "", kategori_target: "all" });
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);
  const handleSync = () => {
    Swal.fire({
      title: "Sync Kaje?",
      text: "Mengambil data terbaru dari provider...",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5"
    }).then((res) => {
      if (res.isConfirmed) {
        router.post(route("admin.kaje.sync"), {}, {
          onStart: () => Swal.showLoading(),
          onSuccess: () => Swal.fire("Berhasil!", "Data Kaje tersinkron.", "success")
        });
      }
    });
  };
  const handleBulk = (e) => {
    e.preventDefault();
    bulkForm.post(route("admin.kaje.mass-update"), {
      onSuccess: () => {
        bulkForm.reset();
        Swal.fire("Sukses!", "Harga massal berhasil diupdate.", "success");
      }
    });
  };
  const editProduct = (p) => {
    Swal.fire({
      title: `Edit ${p.kode_layanan}`,
      html: `
                <div class="text-left mb-2 text-sm font-bold">Harga Beli: Rp ${formatRp(p.harga_beli)}</div>
                <input type="number" id="swal-harga" class="swal2-input" placeholder="Harga Jual" value="${p.harga_jual}">
                <select id="swal-status" class="swal2-select">
                    <option value="active" ${p.status === "active" ? "selected" : ""}>Active</option>
                    <option value="inactive" ${p.status === "inactive" ? "selected" : ""}>Inactive</option>
                </select>
            `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      preConfirm: () => {
        return {
          id: p.id,
          harga_jual: document.getElementById("swal-harga").value,
          status: document.getElementById("swal-status").value,
          deskripsi: p.deskripsi
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route("admin.kaje.update"), result.value, {
          onSuccess: () => Swal.fire("Sukses!", "Data berhasil disimpan.", "success")
        });
      }
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Kaje Manager - MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "py-10 px-4 max-w-7xl mx-auto font-['Outfit']", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-slate-800 tracking-tight", children: "Kelola Produk Kaje" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest mt-1", children: "Provider: XDA / KAJE" })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: handleSync, className: "bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-sync mr-2" }),
          " Sync Provider"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden mb-6 p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleBulk, className: "flex flex-wrap gap-4 items-end", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1", children: "Kategori Target" }),
          /* @__PURE__ */ jsxs("select", { value: bulkForm.kategori_target, onChange: (e) => bulkForm.setData("kategori_target", e.target.value), className: "w-full rounded-xl border-slate-200 text-sm font-bold focus:ring-indigo-500", children: [
            /* @__PURE__ */ jsx("option", { value: "all", children: "Semua Kategori" }),
            categories && categories.map((cat, i) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, i))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1", children: "Markup (Keuntungan per trx)" }),
          /* @__PURE__ */ jsx("input", { type: "number", value: bulkForm.profit_amount, onChange: (e) => bulkForm.setData("profit_amount", e.target.value), className: "w-full rounded-xl border-slate-200 text-sm font-bold focus:ring-indigo-500", placeholder: "Contoh: 1000" })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: bulkForm.processing, className: "bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-slate-800 transition-all disabled:opacity-50", children: "Update Massal" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 border-b border-slate-100", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "p-5 text-[10px] font-black text-slate-400 uppercase", children: "Nama Produk" }),
          /* @__PURE__ */ jsx("th", { className: "p-5 text-[10px] font-black text-slate-400 uppercase", children: "Kategori" }),
          /* @__PURE__ */ jsx("th", { className: "p-5 text-[10px] font-black text-slate-400 uppercase", children: "Hrg Beli" }),
          /* @__PURE__ */ jsx("th", { className: "p-5 text-[10px] font-black text-slate-400 uppercase", children: "Hrg Jual" }),
          /* @__PURE__ */ jsx("th", { className: "p-5 text-[10px] font-black text-slate-400 uppercase text-center", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "p-5 text-[10px] font-black text-slate-400 uppercase text-center", children: "Aksi" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-50", children: layanan && layanan.map((p) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50/50 transition-all", children: [
          /* @__PURE__ */ jsxs("td", { className: "p-5", children: [
            /* @__PURE__ */ jsx("div", { className: "font-bold text-slate-700 text-sm", children: p.nama_layanan }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] font-mono text-slate-400", children: p.kode_layanan })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "p-5", children: /* @__PURE__ */ jsx("span", { className: "bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold", children: p.kategori }) }),
          /* @__PURE__ */ jsxs("td", { className: "p-5 text-sm font-black text-slate-600", children: [
            "Rp ",
            formatRp(p.harga_beli)
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "p-5 text-sm font-black text-emerald-600", children: [
            "Rp ",
            formatRp(p.harga_jual)
          ] }),
          /* @__PURE__ */ jsx("td", { className: "p-5 text-center", children: /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded-lg text-[9px] font-black uppercase ${p.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`, children: p.status }) }),
          /* @__PURE__ */ jsx("td", { className: "p-5 text-center", children: /* @__PURE__ */ jsx("button", { onClick: () => editProduct(p), className: "text-slate-400 hover:text-indigo-600 transition-colors", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-pen-to-square" }) }) })
        ] }, p.id)) })
      ] }) }) })
    ] })
  ] });
}
export {
  KajeManager as default
};
