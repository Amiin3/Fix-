import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, router } from "@inertiajs/react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import Swal from "sweetalert2";
import "axios";
import "moment";
function KhfyManager({ auth, layanan, categories, filter_cat }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isMarkupSelected, setIsMarkupSelected] = useState(false);
  const bulkForm = useForm({ action_type: "", bulk_mode: "flat", bulk_val: "", ids: [] });
  const syncForm = useForm({ markup_value: 1e3, reset_harga: true });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", nama_layanan: "", deskripsi: "", harga_jual: "" });
  const submitEdit = (e) => {
    e.preventDefault();
    router.post(route("admin.khfy.update_single"), editForm, {
      onSuccess: () => {
        setShowEditModal(false);
        Swal.fire("Berhasil!", "Data sukses diperbarui.", "success");
      }
    });
  };
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n);
  const runBulk = (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return Swal.fire("Error", "Pilih produk dulu, Bos!", "error");
    if (bulkForm.action_type === "markup" && !bulkForm.bulk_val) return Swal.fire("Error", "Isi nominal profitnya!", "error");
    router.post(route("admin.khfy.bulk"), { ...bulkForm.data, ids: selectedIds }, {
      onSuccess: () => {
        setSelectedIds([]);
        bulkForm.reset();
        setIsMarkupSelected(false);
        Swal.fire("Berhasil!", "Aksi massal sukses.", "success");
      }
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Khfy Manager - MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "py-10 px-6 max-w-7xl mx-auto font-['Outfit']", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-8 bg-slate-900 p-8 rounded-[40px] shadow-2xl text-white", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black tracking-tighter", children: "Produk KhfyPay" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1", children: "Sultan Edition V3.1" })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setShowSyncModal(true), className: "bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs hover:bg-emerald-400 transition-all shadow-lg", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-rotate mr-2" }),
          " SMART SYNC"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-4 items-center justify-between", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: runBulk, className: "flex flex-wrap gap-3 items-center", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: bulkForm.action_type,
              onChange: (e) => {
                bulkForm.setData("action_type", e.target.value);
                setIsMarkupSelected(e.target.value === "markup");
              },
              className: "rounded-xl border-slate-200 bg-slate-50 text-xs font-black focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "- Pilih Aksi -" }),
                /* @__PURE__ */ jsx("option", { value: "markup", children: "Update Profit (Markup)" }),
                /* @__PURE__ */ jsx("option", { value: "active", children: "Aktifkan (ON)" }),
                /* @__PURE__ */ jsx("option", { value: "inactive", children: "Matikan (OFF)" }),
                /* @__PURE__ */ jsx("option", { value: "delete", children: "Hapus Produk" })
              ]
            }
          ),
          isMarkupSelected && /* @__PURE__ */ jsxs("div", { className: "flex gap-2 transition-all duration-300", children: [
            /* @__PURE__ */ jsxs("select", { value: bulkForm.bulk_mode, onChange: (e) => bulkForm.setData("bulk_mode", e.target.value), className: "rounded-xl border-slate-200 bg-slate-50 text-xs font-bold", children: [
              /* @__PURE__ */ jsx("option", { value: "flat", children: "Rp" }),
              /* @__PURE__ */ jsx("option", { value: "percent", children: "%" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                value: bulkForm.bulk_val,
                onChange: (e) => bulkForm.setData("bulk_val", e.target.value),
                placeholder: "Isi Nominal",
                className: "w-32 rounded-xl border-slate-200 bg-indigo-50 text-xs font-black text-indigo-600 focus:ring-indigo-500 shadow-inner"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] hover:bg-black transition-all", children: "TERAPKAN" })
        ] }),
        /* @__PURE__ */ jsxs("select", { value: filter_cat || "", onChange: (e) => router.get(route("admin.khfy.index"), { cat: e.target.value }), className: "rounded-xl border-slate-200 bg-slate-50 text-xs font-black", children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "Semua Kategori" }),
          categories.map((c) => /* @__PURE__ */ jsx("option", { value: c, children: c }, c))
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50/50 border-b border-slate-100", children: /* @__PURE__ */ jsxs("tr", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: [
          /* @__PURE__ */ jsx("th", { className: "p-6 w-10", children: /* @__PURE__ */ jsx("input", { type: "checkbox", onChange: (e) => e.target.checked ? setSelectedIds(layanan.map((l) => l.id)) : setSelectedIds([]), checked: selectedIds.length === layanan.length && layanan.length > 0 }) }),
          /* @__PURE__ */ jsx("th", { className: "p-6", children: "Produk Khfy" }),
          /* @__PURE__ */ jsx("th", { className: "p-6", children: "Hrg Beli" }),
          /* @__PURE__ */ jsx("th", { className: "p-6", children: "Hrg Jual" }),
          /* @__PURE__ */ jsx("th", { className: "p-6 text-center", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "p-6 text-center", children: "Aksi" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-50", children: layanan.map((p) => /* @__PURE__ */ jsxs("tr", { className: `hover:bg-slate-50/50 transition-all ${selectedIds.includes(p.id) ? "bg-indigo-50/30" : ""}`, children: [
          /* @__PURE__ */ jsx("td", { className: "p-6", children: /* @__PURE__ */ jsx("input", { type: "checkbox", checked: selectedIds.includes(p.id), onChange: () => setSelectedIds((prev) => prev.includes(p.id) ? prev.filter((i) => i !== p.id) : [...prev, p.id]) }) }),
          /* @__PURE__ */ jsxs("td", { className: "p-6", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-black text-slate-800", children: p.nama_layanan }),
            /* @__PURE__ */ jsxs("div", { className: "text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter", children: [
              p.kode_layanan,
              " • ",
              /* @__PURE__ */ jsx("span", { className: "text-indigo-500", children: p.kategori })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "p-6 text-[11px] font-black text-slate-400", children: [
            "Rp ",
            formatRp(p.harga_beli)
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "p-6 text-sm font-black text-indigo-600", children: [
            "Rp ",
            formatRp(p.harga_jual)
          ] }),
          /* @__PURE__ */ jsx("td", { className: "p-6 text-center", children: /* @__PURE__ */ jsx("span", { className: `px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${p.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`, children: p.status === "active" ? "ON" : "OFF" }) }),
          /* @__PURE__ */ jsx("td", { className: "p-6 text-center", children: /* @__PURE__ */ jsx("button", { onClick: () => {
            setEditForm({ id: p.id, nama_layanan: p.nama_layanan, deskripsi: p.deskripsi || "", harga_jual: p.harga_jual });
            setShowEditModal(true);
          }, className: "bg-slate-100 text-slate-800 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-200", children: "EDIT" }) })
        ] }, p.id)) })
      ] }) })
    ] }),
    showEditModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-slate-800 tracking-tighter mb-4", children: "Edit Detail Produk" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submitEdit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1", children: "Nama Produk" }),
          /* @__PURE__ */ jsx("input", { type: "text", value: editForm.nama_layanan, onChange: (e) => setEditForm({ ...editForm, nama_layanan: e.target.value }), className: "w-full rounded-2xl border-slate-100 bg-slate-50 font-bold focus:ring-indigo-500 text-sm", required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1", children: "Harga Jual (Rp)" }),
          /* @__PURE__ */ jsx("input", { type: "number", value: editForm.harga_jual, onChange: (e) => setEditForm({ ...editForm, harga_jual: e.target.value }), className: "w-full rounded-2xl border-slate-100 bg-slate-50 font-black text-indigo-600 focus:ring-indigo-500", required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1", children: "Deskripsi / Format Kuota" }),
          /* @__PURE__ */ jsx("textarea", { value: editForm.deskripsi, onChange: (e) => setEditForm({ ...editForm, deskripsi: e.target.value }), placeholder: "Ketik format deskripsi disini...", className: "w-full rounded-2xl border-slate-100 bg-slate-50 font-medium focus:ring-indigo-500 text-xs min-h-[120px]" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-4", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowEditModal(false), className: "flex-1 py-4 text-xs font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all", children: "BATAL" }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs shadow-xl hover:bg-indigo-700 active:scale-95 transition-all", children: "SIMPAN PERUBAHAN" })
        ] })
      ] })
    ] }) }),
    showSyncModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-slate-800 tracking-tighter mb-4", children: "Sync Khfy Settings" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1", children: "Profit Default (Rp)" }),
          /* @__PURE__ */ jsx("input", { type: "number", value: syncForm.markup_value, onChange: (e) => syncForm.setData("markup_value", e.target.value), className: "w-full rounded-2xl border-slate-100 bg-slate-50 font-black focus:ring-indigo-500" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-4", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setShowSyncModal(false), className: "flex-1 py-4 text-xs font-black text-slate-400", children: "BATAL" }),
          /* @__PURE__ */ jsx("button", { onClick: (e) => {
            e.preventDefault();
            syncForm.post(route("admin.khfy.sync"), { onSuccess: () => setShowSyncModal(false) });
          }, className: "flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all", children: "MULAI SYNC" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  KhfyManager as default
};
