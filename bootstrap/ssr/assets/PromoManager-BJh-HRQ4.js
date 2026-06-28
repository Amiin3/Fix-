import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import "axios";
import "moment";
function PromoManager({ auth, promos }) {
  const [form, setForm] = useState({ id: null, title: "", description: "", badge: "", theme: "indigo", icon: "fa-bolt", url: "", is_active: 1 });
  const [isEditing, setIsEditing] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      router.put(`/admin/promo/${form.id}`, form, { onSuccess: () => resetForm() });
    } else {
      router.post("/admin/promo", form, { onSuccess: () => resetForm() });
    }
  };
  const handleDelete = (id) => {
    Swal.fire({ title: "Hapus Promo?", icon: "warning", showCancelButton: true, confirmButtonColor: "#e11d48" }).then((res) => {
      if (res.isConfirmed) router.delete(`/admin/promo/${id}`);
    });
  };
  const resetForm = () => {
    setForm({ id: null, title: "", description: "", badge: "", theme: "indigo", icon: "fa-bolt", url: "", is_active: 1 });
    setIsEditing(false);
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Kelola Promo" }),
    /* @__PURE__ */ jsxs("div", { className: "py-12 px-4 max-w-4xl mx-auto font-sans", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center mb-6", children: /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-black text-slate-800", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bullhorn text-indigo-500 mr-2" }),
        " Kelola Promo & Banner"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-bold mb-4", children: isEditing ? "Edit Promo" : "Tambah Promo Baru" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Judul Promo", value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }), className: "border-slate-200 rounded-xl w-full", required: true }),
          /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Teks Lencana (Cth: HOT PROMO)", value: form.badge, onChange: (e) => setForm({ ...form, badge: e.target.value }), className: "border-slate-200 rounded-xl w-full" }),
          /* @__PURE__ */ jsx("textarea", { placeholder: "Deskripsi Singkat", value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), className: "border-slate-200 rounded-xl w-full col-span-2", rows: "2" }),
          /* @__PURE__ */ jsxs("select", { value: form.theme, onChange: (e) => setForm({ ...form, theme: e.target.value }), className: "border-slate-200 rounded-xl w-full", children: [
            /* @__PURE__ */ jsx("option", { value: "indigo", children: "Warna Ungu-Biru (Indigo)" }),
            /* @__PURE__ */ jsx("option", { value: "rose", children: "Warna Merah-Oranye (Rose)" }),
            /* @__PURE__ */ jsx("option", { value: "emerald", children: "Warna Hijau (Emerald)" }),
            /* @__PURE__ */ jsx("option", { value: "sky", children: "Warna Biru Muda (Sky)" })
          ] }),
          /* @__PURE__ */ jsxs("select", { value: form.icon, onChange: (e) => setForm({ ...form, icon: e.target.value }), className: "border-slate-200 rounded-xl w-full", children: [
            /* @__PURE__ */ jsx("option", { value: "fa-bolt", children: "Ikon Petir (Flash Sale)" }),
            /* @__PURE__ */ jsx("option", { value: "fa-gamepad", children: "Ikon Gamepad (Games)" }),
            /* @__PURE__ */ jsx("option", { value: "fa-gift", children: "Ikon Hadiah (Gift)" }),
            /* @__PURE__ */ jsx("option", { value: "fa-percent", children: "Ikon Persen (Diskon)" })
          ] }),
          /* @__PURE__ */ jsx("input", { type: "text", placeholder: "URL Tujuan (Opsional, awalan https://)", value: form.url, onChange: (e) => setForm({ ...form, url: e.target.value }), className: "border-slate-200 rounded-xl w-full" }),
          /* @__PURE__ */ jsxs("select", { value: form.is_active, onChange: (e) => setForm({ ...form, is_active: e.target.value }), className: "border-slate-200 rounded-xl w-full", children: [
            /* @__PURE__ */ jsx("option", { value: "1", children: "Aktif Tampil" }),
            /* @__PURE__ */ jsx("option", { value: "0", children: "Sembunyikan" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-2 flex gap-2 mt-2", children: [
            /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 w-full", children: isEditing ? "Simpan Perubahan" : "Tambahkan Promo" }),
            isEditing && /* @__PURE__ */ jsx("button", { type: "button", onClick: resetForm, className: "bg-slate-200 text-slate-600 px-6 py-2 rounded-xl font-bold w-1/3", children: "Batal" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 text-slate-500", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "p-4 font-bold", children: "Banner Promo" }),
          /* @__PURE__ */ jsx("th", { className: "p-4 font-bold", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "p-4 font-bold text-right", children: "Aksi" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          promos.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "3", className: "p-8 text-center text-slate-400", children: "Belum ada promo." }) }) : null,
          promos.map((p) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-slate-100", children: [
            /* @__PURE__ */ jsxs("td", { className: "p-4", children: [
              /* @__PURE__ */ jsx("div", { className: "font-bold text-slate-800", children: p.title }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-slate-500", children: [
                p.badge,
                " • Tema: ",
                p.theme
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "p-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded-md text-[10px] font-bold ${p.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`, children: p.is_active ? "Aktif" : "Disembunyikan" }) }),
            /* @__PURE__ */ jsxs("td", { className: "p-4 text-right space-x-2", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => {
                setForm(p);
                setIsEditing(true);
                window.scrollTo(0, 0);
              }, className: "text-indigo-500 bg-indigo-50 p-2 rounded-lg", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-pen" }) }),
              /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(p.id), className: "text-rose-500 bg-rose-50 p-2 rounded-lg", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-trash" }) })
            ] })
          ] }, p.id))
        ] })
      ] }) })
    ] })
  ] });
}
export {
  PromoManager as default
};
