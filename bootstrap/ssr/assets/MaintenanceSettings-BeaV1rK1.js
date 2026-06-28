import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head } from "@inertiajs/react";
import Swal from "sweetalert2";
import axios from "axios";
import "moment";
function MaintenanceSettings({ auth, config }) {
  const [data, setData] = useState({
    manual: config?.manual || false,
    mode: config?.mode || "total",
    message: config?.message || "Sistem sedang dalam pemeliharaan rutin. Kami akan segera kembali!",
    whitelist: config?.whitelist || "",
    start: config?.start || "",
    end: config?.end || ""
  });
  const [loading, setLoading] = useState(false);
  const getMyIp = async () => {
    try {
      Swal.fire({ title: "Melacak IP...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await axios.get("https://api.ipify.org?format=json");
      const myIp = res.data.ip;
      let currentIps = data.whitelist ? data.whitelist.split(",").map((ip) => ip.trim()).filter((ip) => ip) : [];
      if (!currentIps.includes(myIp)) {
        currentIps.push(myIp);
        setData({ ...data, whitelist: currentIps.join(", ") });
        Swal.fire("✅ Berhasil", `IP (${myIp}) masuk Jalur VIP!`, "success");
      } else {
        Swal.fire("ℹ️ Info", "IP sudah ada di Whitelist.", "info");
      }
    } catch (error) {
      Swal.fire("❌ Gagal", "Gagal melacak IP.", "error");
    }
  };
  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post("/admin/maintenance-settings", data).then((res) => Swal.fire({ title: "🎉 Berhasil!", text: res.data.message, icon: "success" })).catch((err) => Swal.fire({ title: "Error! 🚨", text: err.response?.data?.message || "Gagal menyimpan.", icon: "error" })).finally(() => setLoading(false));
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Maintenance Settings - Admin" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50 py-8 font-['Outfit']", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-black text-slate-800 tracking-tight", children: [
          "Ruang ",
          /* @__PURE__ */ jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500", children: "Karantina" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-sm font-medium mt-1", children: "Atur mode maintenance sesuai tingkat urgensi MilaStore." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSave, className: "bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: `p-8 border-b transition-colors duration-500 flex items-center justify-between ${data.manual ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-100"}`, children: [
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("h3", { className: `text-xl font-black tracking-widest ${data.manual ? "text-white" : "text-slate-700"}`, children: [
            /* @__PURE__ */ jsx("i", { className: `fa-solid ${data.manual ? "fa-power-off text-rose-500" : "fa-check text-emerald-500"} mr-3` }),
            data.manual ? "KARANTINA AKTIF" : "SISTEM NORMAL"
          ] }) }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer scale-125", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", className: "sr-only peer", checked: data.manual, onChange: (e) => setData({ ...data, manual: e.target.checked }) }),
            /* @__PURE__ */ jsx("div", { className: "w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `p-8 space-y-8 ${data.manual ? "block" : "opacity-50 grayscale pointer-events-none transition-all"}`, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-xs font-black text-slate-700 uppercase tracking-widest mb-4", children: "Pilih Varian Karantina" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { onClick: () => setData({ ...data, mode: "total" }), className: `cursor-pointer p-5 rounded-2xl border-2 transition-all ${data.mode === "total" ? "border-rose-500 bg-rose-50 shadow-md" : "border-slate-200 bg-white hover:border-rose-200"}`, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
                  /* @__PURE__ */ jsxs("h4", { className: `font-black text-lg ${data.mode === "total" ? "text-rose-700" : "text-slate-600"}`, children: [
                    /* @__PURE__ */ jsx("i", { className: "fa-solid fa-lock mr-2" }),
                    "Lockdown Total"
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.mode === "total" ? "border-rose-500" : "border-slate-300"}`, children: data.mode === "total" && /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 bg-rose-500 rounded-full" }) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-medium", children: "Web ditutup sepenuhnya. Member akan diarahkan ke halaman Maintenance (Tidak bisa lihat produk)." })
              ] }),
              /* @__PURE__ */ jsxs("div", { onClick: () => setData({ ...data, mode: "transaksi" }), className: `cursor-pointer p-5 rounded-2xl border-2 transition-all ${data.mode === "transaksi" ? "border-orange-500 bg-orange-50 shadow-md" : "border-slate-200 bg-white hover:border-orange-200"}`, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-2", children: [
                  /* @__PURE__ */ jsxs("h4", { className: `font-black text-lg ${data.mode === "transaksi" ? "text-orange-700" : "text-slate-600"}`, children: [
                    /* @__PURE__ */ jsx("i", { className: "fa-solid fa-cart-arrow-down mr-2" }),
                    "Lockdown Transaksi"
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: `w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.mode === "transaksi" ? "border-orange-500" : "border-slate-300"}`, children: data.mode === "transaksi" && /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 bg-orange-500 rounded-full" }) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-medium", children: "Web tetap bisa diakses (lihat harga, dll). Tapi tombol Order/Beli dimatikan sementara." })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs font-black text-slate-700 uppercase tracking-widest mb-2", children: "Pesan Peringatan" }),
              /* @__PURE__ */ jsx("textarea", { rows: "4", value: data.message, onChange: (e) => setData({ ...data, message: e.target.value }), className: "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none", placeholder: "Tulis alasan maintenance di sini..." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end mb-2", children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs font-black text-slate-700 uppercase tracking-widest", children: "Whitelist IP VIP" }),
                /* @__PURE__ */ jsxs("button", { type: "button", onClick: getMyIp, className: "text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors", children: [
                  /* @__PURE__ */ jsx("i", { className: "fa-solid fa-radar mr-1" }),
                  " Sedot IP Saya"
                ] })
              ] }),
              /* @__PURE__ */ jsx("textarea", { rows: "4", value: data.whitelist, onChange: (e) => setData({ ...data, whitelist: e.target.value }), className: "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-mono", placeholder: "192.168.1.1, 103.111.x.x" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-6 bg-slate-50 border-t border-slate-100 flex justify-end", children: /* @__PURE__ */ jsxs("button", { type: "submit", disabled: loading, className: "bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-3.5 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center", children: [
          loading ? /* @__PURE__ */ jsx("i", { className: "fa-solid fa-spinner fa-spin mr-2" }) : /* @__PURE__ */ jsx("i", { className: "fa-solid fa-floppy-disk mr-2" }),
          "Terapkan Mode"
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  MaintenanceSettings as default
};
