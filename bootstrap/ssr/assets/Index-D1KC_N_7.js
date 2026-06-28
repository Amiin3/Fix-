import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, Link, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import axios from "axios";
import "moment";
function UserManagement({ auth, users, filters }) {
  const [search, setSearch] = useState(filters?.search || "");
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(parseFloat(n) || 0);
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route("admin.users"), { search }, { preserveState: true });
  };
  const reloadData = () => router.reload({ only: ["users"] });
  const handleEditInfo = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: "✏️ Edit Profile & WA",
      html: `
                <div class="space-y-4 text-left mt-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Nama Lengkap</label>
                        <input id="swal-name" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-bold text-slate-800 focus:border-blue-500 transition-colors" value="${user.name}">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Email Aktif</label>
                        <input id="swal-email" type="email" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-bold text-slate-800 focus:border-blue-500 transition-colors" value="${user.email}">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Nomor WhatsApp</label>
                        <input id="swal-phone" type="number" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-black text-blue-600 focus:border-blue-500 transition-colors" value="${user.phone || user.whatsapp || ""}" placeholder="08xxxxxxxxxx">
                    </div>
                </div>
            `,
      showCancelButton: true,
      confirmButtonText: "Simpan Perubahan",
      confirmButtonColor: "#2563eb",
      preConfirm: () => {
        const name = document.getElementById("swal-name").value;
        const email = document.getElementById("swal-email").value;
        if (!name || !email) return Swal.showValidationMessage("Nama dan Email wajib diisi!");
        return { name, email, phone: document.getElementById("swal-phone").value };
      }
    });
    if (formValues) {
      Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await axios.post(`/admin/users/${user.id}/update-info`, formValues);
        Swal.fire("Berhasil!", res.data.message, "success");
        reloadData();
      } catch (e) {
        Swal.fire("Error", e.response?.data?.message || "Gagal update data member.", "error");
      }
    }
  };
  const handleBalance = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: "💰 Atur Saldo",
      html: `
                <select id="swal-type" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl mb-4 font-bold py-3 text-slate-700">
                    <option value="add">➕ Tambah Saldo</option>
                    <option value="deduct">➖ Potong Saldo</option>
                </select>
                <input type="number" id="swal-amount" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-lg font-black text-emerald-600" placeholder="Nominal Rp...">
            `,
      showCancelButton: true,
      confirmButtonText: "Eksekusi",
      confirmButtonColor: "#2563eb",
      preConfirm: () => {
        const type = document.getElementById("swal-type").value;
        const amount = document.getElementById("swal-amount").value;
        if (!amount || amount <= 0) return Swal.showValidationMessage("Masukkan nominal!");
        return { type, amount };
      }
    });
    if (formValues) {
      Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await axios.post(`/admin/users/${user.id}/balance`, formValues);
        Swal.fire("Sukses!", res.data.message, "success");
        reloadData();
      } catch (e) {
        Swal.fire("Error", "Gagal proses saldo", "error");
      }
    }
  };
  const handleLevel = async (user) => {
    const { value: level } = await Swal.fire({
      title: "⭐ Ubah Level",
      input: "select",
      inputOptions: { user: "User Biasa", reseller: "Reseller", admin: "Admin" },
      inputValue: user.level || "user",
      showCancelButton: true,
      confirmButtonColor: "#2563eb"
    });
    if (level) {
      Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await axios.post(`/admin/users/${user.id}/level`, { level });
        Swal.fire("Sukses!", res.data.message, "success");
        reloadData();
      } catch (e) {
        Swal.fire("Error", "Gagal update level", "error");
      }
    }
  };
  const handlePassword = async (user) => {
    const { value: password } = await Swal.fire({
      title: "🔑 Reset Sandi",
      input: "text",
      inputPlaceholder: "Sandi baru...",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      inputValidator: (v) => v.length < 6 && "Minimal 6 karakter!"
    });
    if (password) {
      Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await axios.post(`/admin/users/${user.id}/password`, { password });
        Swal.fire("Sukses!", res.data.message, "success");
      } catch (e) {
        Swal.fire("Error", "Gagal reset sandi", "error");
      }
    }
  };
  const handleSuspend = async (user) => {
    const isSuspended = user.status === "suspended";
    const result = await Swal.fire({
      title: isSuspended ? "Buka Blokir?" : "Bekukan Akun?",
      text: isSuspended ? "Akun akan bisa login kembali." : "Akun tidak akan bisa login atau transaksi!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isSuspended ? "#10b981" : "#ef4444",
      confirmButtonText: isSuspended ? "Ya, Buka!" : "Ya, Bekukan!"
    });
    if (result.isConfirmed) {
      Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await axios.post(`/admin/users/${user.id}/suspend`);
        Swal.fire("Sukses!", res.data.message, "success");
        reloadData();
      } catch (e) {
        Swal.fire("Error", "Gagal proses aksi", "error");
      }
    }
  };
  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: "HAPUS PERMANEN?",
      html: `Data member <b class="text-rose-600">${user.name}</b> akan dimusnahkan. Tindakan ini tidak bisa dibatalkan!`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Lenyapkan!"
    });
    if (result.isConfirmed) {
      Swal.fire({ title: "Memusnahkan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await axios.delete(`/admin/users/${user.id}`);
        Swal.fire("Musnah!", res.data.message, "success");
        reloadData();
      } catch (e) {
        Swal.fire("Error", e.response?.data?.message || "Gagal menghapus member", "error");
      }
    }
  };
  const handleH2H = async (user) => {
    const { value: formValues } = await Swal.fire({
      title: "🔗 Pengaturan API H2H",
      html: `
                <div class="space-y-4 text-left mt-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400 ml-1">API Key</label>
                        <div class="flex gap-2">
                            <input id="swal-apikey" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-bold text-slate-800 focus:border-purple-500 transition-colors" value="${user.api_key || ""}" placeholder="Klik Generate...">
                            <button type="button" id="btn-generate" class="bg-slate-800 text-white px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-colors">Generate</button>
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400 ml-1">IP Whitelist (Pisahkan dgn koma)</label>
                        <input id="swal-ip" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-bold text-blue-600 focus:border-purple-500 transition-colors" value="${user.ip_whitelist || ""}" placeholder="Contoh: 12.34.56.78">
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Webhook URL</label>
                        <input id="swal-webhook" class="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-bold text-emerald-600 focus:border-purple-500 transition-colors" value="${user.webhook_url || ""}" placeholder="https://domain-reseller.com/api/callback">
                    </div>
                </div>
            `,
      showCancelButton: true,
      confirmButtonText: "Simpan H2H",
      confirmButtonColor: "#9333ea",
      didOpen: () => {
        document.getElementById("btn-generate").addEventListener("click", () => {
          const randomStr = "MILA-" + Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 10).toUpperCase();
          document.getElementById("swal-apikey").value = randomStr;
        });
      },
      preConfirm: () => {
        return {
          api_key: document.getElementById("swal-apikey").value,
          ip_whitelist: document.getElementById("swal-ip").value,
          webhook_url: document.getElementById("swal-webhook").value
        };
      }
    });
    if (formValues) {
      Swal.fire({ title: "Menyimpan Akses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const res = await axios.post(`/admin/users/${user.id}/update-h2h`, formValues);
        Swal.fire("Berhasil!", res.data.message, "success");
        reloadData();
      } catch (e) {
        Swal.fire("Error", e.response?.data?.message || "Gagal update H2H.", "error");
      }
    }
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Kelola Member - MilaStore" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50 pb-32 font-['Outfit'] pt-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Link, { href: route("dashboard"), className: "inline-flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-blue-600 transition-colors mb-3", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left" }),
          " Kembali ke Dashboard"
        ] }),
        /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-black text-slate-800 tracking-tight", children: [
          "Manajemen ",
          /* @__PURE__ */ jsx("span", { className: "text-blue-600", children: "Member" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs font-bold text-slate-500 mt-1", children: [
          "Total: ",
          /* @__PURE__ */ jsx("span", { className: "text-blue-600", children: users.total }),
          " pengguna terdaftar."
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 mb-8 relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-6 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass text-slate-400" }) }),
        /* @__PURE__ */ jsx("input", { type: "text", className: "w-full border-none bg-transparent pl-12 py-3 text-sm font-bold text-slate-800 focus:ring-0 placeholder:text-slate-300", placeholder: "Cari member...", value: search, onChange: (e) => setSearch(e.target.value) }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-blue-600 text-white px-8 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-colors", children: "Cari" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: users.data.map((user) => /* @__PURE__ */ jsxs("div", { className: `bg-white rounded-[24px] shadow-sm border transition-all ${user.status === "suspended" ? "border-rose-300 bg-rose-50/50" : "border-slate-200 hover:border-blue-300 hover:shadow-md"} overflow-hidden flex flex-col`, children: [
        /* @__PURE__ */ jsxs("div", { className: "p-6 flex gap-4 items-start relative", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4", children: user.status === "suspended" ? /* @__PURE__ */ jsx("span", { className: "bg-rose-100 text-rose-700 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-rose-200", children: "Diblokir" }) : /* @__PURE__ */ jsx("span", { className: "bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-emerald-200", children: "Aktif" }) }),
          /* @__PURE__ */ jsx("img", { src: `https://ui-avatars.com/api/?name=${user.name}&background=f8fafc&color=0f172a&bold=true`, className: "w-14 h-14 rounded-full border-2 border-slate-100 shadow-sm" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 pr-12", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-black text-slate-800 text-lg leading-none mb-1 truncate", children: user.name }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold text-slate-500 truncate mb-1", children: user.email }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] font-black text-blue-600 truncate", children: user.phone || user.whatsapp || "Belum diatur" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-6 pb-5 flex gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 bg-slate-50 border border-slate-100 p-3 rounded-2xl", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Saldo Akun" }),
            /* @__PURE__ */ jsxs("div", { className: "font-black text-slate-800 text-base", children: [
              "Rp ",
              formatRp(user.saldo)
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-center min-w-[80px]", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Level" }),
            /* @__PURE__ */ jsx("div", { className: "font-black text-blue-600 text-xs uppercase", children: user.level || "USER" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-2 mt-auto", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => handleEditInfo(user), className: "col-span-3 bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-pen-to-square" }),
            " Edit Profile & WA"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => handleH2H(user), className: "col-span-3 bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-link" }),
            " Pengaturan API H2H"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => handleBalance(user), className: "bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors", children: "💰 Saldo" }),
          /* @__PURE__ */ jsx("button", { onClick: () => handleLevel(user), className: "bg-white border border-slate-200 text-slate-700 hover:border-amber-500 hover:text-amber-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors", children: "⭐ Level" }),
          /* @__PURE__ */ jsx("button", { onClick: () => handlePassword(user), className: "bg-white border border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors", children: "🔑 Sandi" }),
          /* @__PURE__ */ jsx("button", { onClick: () => handleSuspend(user), className: `col-span-1 border py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${user.status === "suspended" ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white" : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white"}`, children: user.status === "suspended" ? "🔓 Buka" : "🚫 Ban" }),
          user.id !== 1 && /* @__PURE__ */ jsxs("button", { onClick: () => handleDelete(user), className: "col-span-2 border border-rose-200 bg-white text-rose-600 hover:bg-rose-600 hover:text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-trash mr-1" }),
            " Hapus Permanen"
          ] })
        ] })
      ] }, user.id)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-10 flex flex-wrap justify-center gap-1.5", children: users.links.map((link, i) => /* @__PURE__ */ jsx(Link, { href: link.url || "#", className: `px-4 py-2 rounded-lg text-[11px] font-black transition-all ${link.active ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-blue-400"}`, dangerouslySetInnerHTML: { __html: link.label } }, i)) })
    ] }) })
  ] });
}
export {
  UserManagement as default
};
