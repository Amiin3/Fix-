import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { useForm, router, Head, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
import axios from "axios";
import "moment";
function Index({ auth, deposits, settings = [], site, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const initialRender = useRef(true);
  const getSetting = (m, f) => (settings || []).find((s) => s.metode === m)?.[f] || "";
  const { data, setData, post, processing } = useForm({
    email: site?.bank_email || "",
    password: site?.bank_password || "",
    jago_acc: getSetting("JAGO", "nomor"),
    jago_name: getSetting("JAGO", "atas_nama"),
    seabank_acc: getSetting("SEABANK", "nomor"),
    seabank_name: getSetting("SEABANK", "atas_nama"),
    qris_gopay: getSetting("QRIS_GOPAY", "nomor"),
    qris_shopee: getSetting("QRIS_SHOPEE", "nomor")
  });
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      router.get("/admin/deposit", { search: searchTerm }, { preserveState: true, replace: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const handleSave = (e) => {
    e.preventDefault();
    post(route("admin.deposit.qris"), { onSuccess: () => Swal.fire("Tersimpan!", "Konfigurasi updated.", "success") });
  };
  const handleAction = async (id, status) => {
    const color = status === "Sukses" ? "#10b981" : "#ef4444";
    const result = await Swal.fire({
      title: `Setel ke ${status}?`,
      text: `Data deposit #${id} akan diubah statusnya.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: color,
      confirmButtonText: "Ya, Eksekusi!"
    });
    if (result.isConfirmed) {
      Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await axios.post(`/admin/deposit/${id}/action`, { status });
        if (res.data.success) {
          Swal.fire("Berhasil!", res.data.message, "success");
          router.reload({ only: ["deposits"] });
        } else {
          Swal.fire("Gagal", res.data.message, "error");
        }
      } catch (e) {
        Swal.fire("Error", "Gagal memproses server.", "error");
      }
    }
  };
  const formatRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Audit Keuangan - MilaStore" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50 font-['Outfit'] pb-32 pt-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-black text-slate-800 tracking-tighter uppercase italic", children: [
            "Financial ",
            /* @__PURE__ */ jsx("span", { className: "text-blue-600", children: "Audit" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Verifikasi & Konfigurasi Deposit Member" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsx("button", { onClick: () => document.getElementById("config-panel").scrollIntoView({ behavior: "smooth" }), className: "bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm", children: "Config" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 mb-8 relative", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" }),
        /* @__PURE__ */ jsx("input", { type: "text", className: "w-full border-none bg-transparent pl-12 py-3 text-sm font-bold text-slate-800 focus:ring-0", placeholder: "Cari Nama Member, Email, atau ID Deposit...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-12", children: deposits.data.map((d) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[28px] p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all", children: [
        /* @__PURE__ */ jsxs("div", { className: "absolute -top-2 -right-2 text-slate-50 font-black text-5xl italic group-hover:text-slate-100 transition-colors", children: [
          "#",
          d.id
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
            /* @__PURE__ */ jsx("img", { src: `https://ui-avatars.com/api/?name=${d.member_name}&background=random&color=fff&bold=true`, className: "w-10 h-10 rounded-full border border-slate-100 shadow-sm" }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-black text-slate-800 text-sm leading-tight truncate uppercase", children: d.member_name }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 truncate", children: d.member_email })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-3 rounded-2xl border border-slate-100", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Nominal" }),
              /* @__PURE__ */ jsx("p", { className: "font-black text-emerald-600 text-sm", children: formatRp(d.total_bayar) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-3 rounded-2xl border border-slate-100", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Metode" }),
              /* @__PURE__ */ jsx("p", { className: "font-black text-slate-700 text-[10px] uppercase", children: d.metode.replace("_", " ") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${d.status === "Sukses" ? "bg-emerald-100 text-emerald-600" : d.status === "Pending" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`, children: d.status }),
            d.status === "Pending" && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => handleAction(d.id, "Gagal"), className: "w-8 h-8 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-xmark" }) }),
              /* @__PURE__ */ jsx("button", { onClick: () => handleAction(d.id, "Sukses"), className: "w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-check" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-[8px] font-bold text-slate-300 italic text-right", children: new Date(d.created_at).toLocaleString("id-ID") })
        ] })
      ] }, d.id)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-center gap-1.5 flex-wrap", children: deposits.links.map((link, i) => /* @__PURE__ */ jsx(Link, { href: link.url || "#", className: `px-4 py-2 rounded-xl text-[10px] font-black transition-all ${link.active ? "bg-blue-600 text-white" : "bg-white text-slate-400 border border-slate-200 hover:bg-blue-50"}`, dangerouslySetInnerHTML: { __html: link.label } }, i)) }),
      /* @__PURE__ */ jsxs("div", { id: "config-panel", className: "mt-20 bg-white rounded-[40px] p-8 shadow-sm border border-slate-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-xl font-black text-slate-800", children: [
            "Payment ",
            /* @__PURE__ */ jsx("span", { className: "text-blue-600 italic", children: "Settings" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest", children: "Konfigurasi Rekening & QRIS" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-[9px] font-black text-slate-400 uppercase ml-1", children: "Gmail Bot" }),
              /* @__PURE__ */ jsx("input", { type: "email", value: data.email, onChange: (e) => setData("email", e.target.value), className: "w-full bg-white border-slate-200 rounded-xl p-3 text-xs font-bold" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-[9px] font-black text-slate-400 uppercase ml-1", children: "Gmail Password" }),
              /* @__PURE__ */ jsx("input", { type: "password", value: data.password, onChange: (e) => setData("password", e.target.value), className: "w-full bg-white border-slate-200 rounded-xl p-3 text-xs font-bold" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx("h5", { className: "text-[10px] font-black text-amber-500 uppercase tracking-widest", children: "Bank Jago" }),
              /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Rekening", value: data.jago_acc, onChange: (e) => setData("jago_acc", e.target.value), className: "w-full bg-white border-slate-200 rounded-xl p-3 text-xs font-bold" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx("h5", { className: "text-[10px] font-black text-orange-500 uppercase tracking-widest", children: "SeaBank" }),
              /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Rekening", value: data.seabank_acc, onChange: (e) => setData("seabank_acc", e.target.value), className: "w-full bg-white border-slate-200 rounded-xl p-3 text-xs font-bold" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { disabled: processing, className: "w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[4px] shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50", children: "Save Global Config" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Index as default
};
