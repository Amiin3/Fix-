import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import Swal from "sweetalert2";
import "moment";
function MenuManager({ auth, adminMenus, appMenus, webSettings }) {
  const [activeTab, setActiveTab] = useState("all");
  const [localOrders, setLocalOrders] = useState({});
  const [webName, setWebName] = useState(webSettings?.name || "");
  const [webLogo, setWebLogo] = useState(null);
  const handleEditMenu = async (menu) => {
    const isApp = menu.type === "app";
    const isUploadedIcon = menu.icon && menu.icon.includes("/storage/");
    const result = await Swal.fire({
      title: `✏️ Edit Menu: ${menu.name}`,
      html: `
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Nama Menu</div>
                <input id="m_name" class="w-full border-2 p-2.5 mb-3 rounded-xl font-bold text-slate-800" value="${menu.name}">
                
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Ikon (FontAwesome Class / Link Web)</div>
                <input id="m_icon" class="w-full border-2 p-2.5 mb-3 rounded-xl font-mono text-xs text-slate-800" value="${isUploadedIcon ? "" : menu.icon || ""}" placeholder="fa-wifi">
                
                <div class="text-left text-xs font-black text-indigo-500 uppercase mb-1">🔥 ATAU Upload Logo Langsung dari Galeri HP</div>
                <input id="m_icon_file" type="file" accept="image/*" class="w-full border-2 p-2 rounded-xl text-xs bg-slate-50 text-slate-800 mb-3 cursor-pointer" />

                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Nama Route Laravel</div>
                <input id="m_route" class="w-full border-2 p-2.5 mb-3 rounded-xl font-mono text-xs text-slate-800" value="${menu.route || ""}" placeholder="order.pulsa">
                
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Atau Jalur URL Langsung</div>
                <input id="m_url" class="w-full border-2 p-2.5 mb-3 rounded-xl font-mono text-xs text-slate-800" value="${menu.url || ""}" placeholder="/admin/users">
                
                ${isApp ? `
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Warna Background (Tailwind)</div>
                <input id="m_bg" class="w-full border-2 p-2.5 mb-3 rounded-xl font-mono text-xs text-slate-800" value="${menu.bg || "bg-gradient-to-br from-blue-500 to-indigo-600"}" placeholder="bg-blue-600">
                ` : `<input type="hidden" id="m_bg" value="">`}
                
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Nomor Urutan Posisi</div>
                <input id="m_order" type="number" class="w-full border-2 p-2.5 rounded-xl font-bold text-slate-800" value="${menu.order_num || 0}">
            `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "💾 Simpan",
      denyButtonText: "🗑️ Hapus",
      cancelButtonText: "Batal",
      denyButtonColor: "#e11d48",
      confirmButtonColor: "#2563eb",
      preConfirm: () => ({
        id: menu.id,
        type: menu.type,
        name: document.getElementById("m_name").value,
        icon: document.getElementById("m_icon").value,
        icon_file: document.getElementById("m_icon_file").files[0] || null,
        route_name: document.getElementById("m_route").value,
        url: document.getElementById("m_url").value,
        bg: document.getElementById("m_bg").value,
        order_num: document.getElementById("m_order").value
      })
    });
    if (result.isConfirmed && result.value) {
      Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const formData = new FormData();
        Object.keys(result.value).forEach((key) => {
          if (result.value[key] !== null) formData.append(key, result.value[key]);
        });
        await axios.post("/admin/menus/store", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        Swal.fire({ icon: "success", title: "Tersimpan!", showConfirmButton: false, timer: 1e3 });
        router.reload();
      } catch (e) {
        Swal.fire("Error", "Gagal menyimpan data", "error");
      }
    } else if (result.isDenied) {
      const delConfirm = await Swal.fire({ title: "Yakin hapus menu ini?", icon: "warning", showCancelButton: true, confirmButtonText: "Ya, Hapus!", confirmButtonColor: "#e11d48" });
      if (delConfirm.isConfirmed) {
        Swal.fire({ title: "Menghapus...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
          await axios.post("/admin/menus/delete", { id: menu.id });
          Swal.fire({ icon: "success", title: "Terhapus!", showConfirmButton: false, timer: 1e3 });
          router.reload();
        } catch (e) {
          Swal.fire("Error", "Gagal menghapus", "error");
        }
      }
    }
  };
  const handleCreateMenu = async () => {
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "➕ Tambah Menu Baru",
      html: `
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Target Penempatan</div>
                <select id="m_type" class="w-full border-2 p-2.5 mb-3 rounded-xl font-bold text-slate-800">
                    <option value="app">📱 Menu User</option>
                    <option value="admin">🛡️ Menu Admin</option>
                </select>
                
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Nama Menu</div>
                <input id="m_name" class="w-full border-2 p-2.5 mb-3 rounded-xl font-bold text-slate-800" placeholder="Contoh: Pulsa Murah">
                
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Ikon / Logo (FontAwesome)</div>
                <input id="m_icon" class="w-full border-2 p-2.5 mb-3 rounded-xl font-mono text-xs text-slate-800" placeholder="fa-star">

                <div class="text-left text-xs font-black text-indigo-500 uppercase mb-1">📁 ATAU Upload Logo dari Galeri HP</div>
                <input id="m_icon_file" type="file" accept="image/*" class="w-full border-2 p-2 rounded-xl text-xs bg-slate-50 text-slate-800 mb-3 cursor-pointer" />
                
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Nama Route Laravel</div>
                <input id="m_route" class="w-full border-2 p-2.5 mb-3 rounded-xl font-mono text-xs text-slate-800" placeholder="order.pulsa">
                
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Atau Jalur URL</div>
                <input id="m_url" class="w-full border-2 p-2.5 mb-3 rounded-xl font-mono text-xs text-slate-800" placeholder="/custom-link">
                
                <div class="text-left text-xs font-black text-slate-500 uppercase mb-1">Background Gradient</div>
                <input id="m_bg" class="w-full border-2 p-2.5 rounded-xl font-mono text-xs text-slate-800" value="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            `,
      showCancelButton: true,
      confirmButtonText: "🚀 Daftarkan Menu",
      confirmButtonColor: "#16a34a",
      preConfirm: () => {
        const name = document.getElementById("m_name").value;
        if (!name) {
          Swal.showValidationMessage("Nama menu wajib diisi!");
          return false;
        }
        return {
          id: null,
          type: document.getElementById("m_type").value,
          name,
          icon: document.getElementById("m_icon").value,
          icon_file: document.getElementById("m_icon_file").files[0] || null,
          route_name: document.getElementById("m_route").value,
          url: document.getElementById("m_url").value,
          bg: document.getElementById("m_bg").value
        };
      }
    });
    if (isConfirmed && formValues) {
      Swal.fire({ title: "Mendaftarkan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      try {
        const formData = new FormData();
        Object.keys(formValues).forEach((key) => {
          if (formValues[key] !== null) formData.append(key, formValues[key]);
        });
        await axios.post("/admin/menus/store", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        Swal.fire({ icon: "success", title: "Menu Ditambahkan!", showConfirmButton: false, timer: 1e3 });
        router.reload();
      } catch (e) {
        Swal.fire("Error", "Gagal mendaftar", "error");
      }
    }
  };
  const saveWebSettings = (e) => {
    e.preventDefault();
    Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const formData = new FormData();
    formData.append("web_name", webName);
    if (webLogo) formData.append("web_logo", webLogo);
    router.post("/admin/settings/save", formData, {
      onSuccess: () => {
        Swal.fire({ icon: "success", title: "Tersimpan!", showConfirmButton: false, timer: 1e3 });
      },
      onError: () => Swal.fire("Error", "Gagal menyimpan.", "error")
    });
  };
  const renderIcon = (iconString) => {
    if (!iconString) return /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle text-lg" });
    if (iconString.includes("/") || iconString.includes("http")) {
      return /* @__PURE__ */ jsx("img", { src: iconString, alt: "icon", className: "w-8 h-8 object-contain rounded shadow-sm" });
    }
    return /* @__PURE__ */ jsx("i", { className: `fa-solid ${iconString} text-xl` });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "CMS Navigasi Menu" }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 bg-slate-900 min-h-screen text-white font-sans", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "font-black text-2xl tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400", children: "Pusat Kendali Navigasi v12" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-bold mt-1", children: "Klik langsung pada menu di bawah ini untuk mengedit nama, logo, jalur, atau menghapusnya secara instan." })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: handleCreateMenu, className: "bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform", children: "➕ Buat Menu Baru" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mb-8 bg-slate-800/60 p-2 rounded-2xl border border-slate-700/50 w-max", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("all"), className: `px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "all" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`, children: "✨ Semua Menu" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("app"), className: `px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "app" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`, children: [
          "📱 Menu User (",
          appMenus.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab("admin"), className: `px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "admin" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`, children: [
          "🛡️ Menu Admin (",
          adminMenus.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("identity"), className: `px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "identity" ? "bg-amber-500 text-slate-900 shadow-md" : "text-slate-400 hover:text-white"}`, children: "⚙️ Identitas Web" })
      ] }),
      activeTab === "identity" ? /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 rounded-3xl border border-slate-700 p-6 max-w-xl", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-black text-sm uppercase tracking-wider text-slate-400 mb-6", children: "⚙️ Pengaturan Identitas Web" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: saveWebSettings, children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2", children: "Nama Website" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: webName, onChange: (e) => setWebName(e.target.value), className: "w-full border-2 border-slate-700 bg-slate-900 rounded-xl p-3 font-bold text-white focus:border-amber-500 focus:ring-0", required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2", children: "Logo Website" }),
            webSettings?.logo && /* @__PURE__ */ jsx("div", { className: "mb-3 p-3 bg-slate-900 rounded-xl w-max border border-slate-700", children: /* @__PURE__ */ jsx("img", { src: webSettings.logo, alt: "Logo", className: "h-12 object-contain" }) }),
            /* @__PURE__ */ jsx("input", { type: "file", accept: "image/*", onChange: (e) => setWebLogo(e.target.files[0]), className: "w-full border-2 border-slate-700 bg-slate-900 rounded-xl p-2 font-bold text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-amber-500 file:text-slate-900 hover:file:bg-amber-400 cursor-pointer" })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-amber-500 text-slate-900 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-amber-400 w-full transition-colors", children: "Simpan Pengaturan" })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-10", children: [
        (activeTab === "all" || activeTab === "app") && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-indigo-500 animate-pulse" }),
            /* @__PURE__ */ jsx("h3", { className: "font-black text-sm uppercase tracking-widest text-slate-400", children: "Deretan Menu Aplikasi (User)" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 bg-slate-800/30 p-5 rounded-3xl border border-slate-800", children: appMenus.map((menu) => /* @__PURE__ */ jsxs("div", { onClick: () => handleEditMenu(menu), className: "flex flex-col items-center group cursor-pointer bg-slate-800/50 p-4 rounded-2xl border border-slate-700/40 hover:border-indigo-500/80 hover:bg-slate-800 transition-all transform hover:-translate-y-1", children: [
            /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md relative overflow-hidden mb-2 ${menu.bg || "bg-indigo-600"}`, children: renderIcon(menu.icon) }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-300 text-center leading-tight tracking-tight group-hover:text-white line-clamp-1", children: menu.name })
          ] }, menu.id)) })
        ] }),
        (activeTab === "all" || activeTab === "admin") && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-rose-500 animate-pulse" }),
            /* @__PURE__ */ jsx("h3", { className: "font-black text-sm uppercase tracking-widest text-slate-400", children: "Deretan Menu Kendali (Admin)" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 bg-slate-800/30 p-5 rounded-3xl border border-slate-800", children: adminMenus.map((menu) => /* @__PURE__ */ jsxs("div", { onClick: () => handleEditMenu(menu), className: "flex flex-col items-center group cursor-pointer bg-slate-800/50 p-4 rounded-2xl border border-slate-700/40 hover:border-rose-500/80 hover:bg-slate-800 transition-all transform hover:-translate-y-1", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-700 text-slate-200 border border-slate-600 group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-red-600 group-hover:text-white group-hover:border-transparent transition-all mb-2", children: renderIcon(menu.icon) }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-300 text-center leading-tight tracking-tight group-hover:text-white line-clamp-1", children: menu.name })
          ] }, menu.id)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  MenuManager as default
};
