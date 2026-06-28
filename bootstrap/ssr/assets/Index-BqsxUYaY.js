import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head, Link, router } from "@inertiajs/react";
import Swal from "sweetalert2";
function CsMenu({ isOpen, onClose }) {
  if (!isOpen) return null;
  const waNumber = "6287760390507";
  const waMessage = "Halo Admin Amifi Store, saya butuh bantuan nih Bang...";
  const linkChat = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
  const linkSaluran = "https://whatsapp.com/channel/0029VaRBcJEHrDZhT0G5GK3e";
  const linkGrup = "https://chat.whatsapp.com/DHi6CfDy87UDZiwRQCS1QM?mode=gi_t";
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 relative transform transition-all shadow-2xl animate-slide-up", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-headset" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-black text-slate-800", children: "Pusat Bantuan" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-medium mt-1", children: "Pilih jalur VVIP untuk menghubungi kami" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxs("a", { href: linkChat, target: "_blank", rel: "noreferrer", className: "flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-2xl border border-green-100 transition-colors group", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx("i", { className: "fa-brands fa-whatsapp" }) }),
          /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-green-800", children: "Chat Admin (WA)" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-green-600", children: "Fast response 24/7" })
          ] }),
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chevron-right ml-auto text-green-400" })
        ] }),
        /* @__PURE__ */ jsxs("a", { href: linkSaluran, target: "_blank", rel: "noreferrer", className: "flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-100 transition-colors group", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bullhorn" }) }),
          /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-blue-800", children: "Saluran Info Promo" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-blue-600", children: "Update harga & diskon" })
          ] }),
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chevron-right ml-auto text-blue-400" })
        ] }),
        /* @__PURE__ */ jsxs("a", { href: linkGrup, target: "_blank", rel: "noreferrer", className: "flex items-center p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl border border-emerald-100 transition-colors group", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-users" }) }),
          /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-emerald-800", children: "Grup Komunitas" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-emerald-600", children: "Mabar & Diskusi Santai" })
          ] }),
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chevron-right ml-auto text-emerald-400" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black rounded-xl uppercase tracking-wider transition-colors", children: "Tutup" })
    ] })
  ] });
}
function Profile({
  auth
}) {
  const { user } = auth;
  const [isCsOpen, setIsCsOpen] = useState(false);
  const fotoProfil = user.foto ? `/assets/img/profile/${user.foto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=128&bold=true`;
  const handleLogout = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Keluar Akun?",
      text: "Anda harus login kembali untuk bertransaksi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#cbd5e1",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      shape: "rounded-xl"
    }).then((result) => {
      if (result.isConfirmed) {
        router.post("/logout");
      }
    });
  };
  const handleComingSoon = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: "info",
      title: "Segera Hadir",
      text: "Fitur pengaturan ini sedang dalam pembaruan sistem.",
      confirmButtonColor: "#6366f1",
      confirmButtonText: "Mengerti"
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 font-sans pb-24", children: [
    /* @__PURE__ */ jsx(Head, { title: "Profil Akun - Amifi Store" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-b from-indigo-600 to-blue-500 pt-8 px-5 pb-20 rounded-b-[40px] shadow-lg relative", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto relative z-10 flex justify-between items-start text-white", children: [
        /* @__PURE__ */ jsx("h5", { className: "font-black text-xl tracking-wide", children: "Profil Akun" }),
        /* @__PURE__ */ jsx("div", { className: "bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20", children: user.role === "admin" ? "⭐ Admin" : "💎 Member" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-5 -mt-14 relative z-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[32px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center mb-6 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-24 h-24 bg-white rounded-[24px] p-1.5 shadow-md -mt-16 mb-3", children: /* @__PURE__ */ jsx("img", { src: fotoProfil, alt: "Profil", className: "w-full h-full object-cover rounded-[18px]" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-black text-slate-800 mb-0.5", children: user.name }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-500 mb-3", children: user.username || user.email }),
        /* @__PURE__ */ jsx("div", { className: "bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase", children: "Terdaftar" })
      ] }),
      /* @__PURE__ */ jsx("h6", { className: "font-black text-slate-400 text-[11px] uppercase tracking-[2px] ml-2 mb-3", children: "Pengaturan Akun" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[24px] shadow-sm border border-slate-100 mb-6 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("a", { href: "#", onClick: handleComingSoon, className: "flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors no-underline", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-lg", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-user-pen" }) }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700 text-sm", children: "Edit Profil" })
          ] }),
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chevron-right text-slate-300 text-xs" })
        ] }),
        /* @__PURE__ */ jsxs("a", { href: "#", onClick: handleComingSoon, className: "flex items-center justify-between p-4 hover:bg-slate-50 transition-colors no-underline", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-lg", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-lock" }) }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700 text-sm", children: "Ganti Password & PIN" })
          ] }),
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chevron-right text-slate-300 text-xs" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("h6", { className: "font-black text-slate-400 text-[11px] uppercase tracking-[2px] ml-2 mb-3", children: "Komunitas & Bantuan" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[24px] shadow-sm border border-slate-100 mb-6 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("a", { href: "https://chat.whatsapp.com/DHi6CfDy87UDZiwRQCS1QM?mode=gi_t", target: "_blank", rel: "noreferrer", className: "flex items-center justify-between p-4 border-b border-slate-50 hover:bg-emerald-50 transition-colors no-underline", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-[#25D366] text-white shadow-md shadow-green-200 rounded-2xl flex items-center justify-center text-xl", children: /* @__PURE__ */ jsx("i", { className: "fa-brands fa-whatsapp" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700 text-sm block", children: "Grup Diskusi WhatsApp" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-slate-400 block", children: "Gabung komunitas member." })
            ] })
          ] }),
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-up-right-from-square text-emerald-500 text-xs" })
        ] }),
        /* @__PURE__ */ jsxs("a", { href: "https://whatsapp.com/channel/0029VaRBcJEHrDZhT0G5GK3e", target: "_blank", rel: "noreferrer", className: "flex items-center justify-between p-4 border-b border-slate-50 hover:bg-teal-50 transition-colors no-underline", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-[#128C7E] text-white shadow-md shadow-teal-200 rounded-2xl flex items-center justify-center text-xl", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bullhorn" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700 text-sm block", children: "Saluran WhatsApp Resmi" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-slate-400 block", children: "Info & Promo PPOB tercepat." })
            ] })
          ] }),
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-up-right-from-square text-teal-500 text-xs" })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setIsCsOpen(true), className: "flex items-center justify-between p-4 hover:bg-slate-50 transition-colors no-underline w-full text-left", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-lg", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-headset" }) }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700 text-sm", children: "Hubungi Customer Service" })
          ] }),
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chevron-right text-slate-300 text-xs" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: handleLogout, className: "w-full bg-rose-50 text-rose-600 border border-rose-100 font-black py-4 rounded-[20px] hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-200 transition-all duration-300 flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-right-from-bracket" }),
        " KELUAR AKUN"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-center mt-6", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400", children: "Amifi Store System v2.0 © 2026" }) })
    ] }),
    /* @__PURE__ */ jsx(CsMenu, { isOpen: isCsOpen, onClose: () => setIsCsOpen(false) }),
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-100 pb-safe z-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-6 py-3 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs(Link, { href: "/dashboard", className: "flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors no-underline", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🏠" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black tracking-wider", children: "BERANDA" })
      ] }),
      /* @__PURE__ */ jsxs(Link, { href: "/riwayat", className: "flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors no-underline", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "🧾" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black tracking-wider", children: "RIWAYAT" })
      ] }),
      /* @__PURE__ */ jsxs(Link, { href: "/deposit", className: "flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors no-underline", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "💳" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black tracking-wider", children: "DEPOSIT" })
      ] }),
      /* @__PURE__ */ jsxs(Link, { href: "/profile", className: "flex flex-col items-center gap-1 text-indigo-600 no-underline", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xl", children: "👤" }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black tracking-wider", children: "PROFIL" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `.pb-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 10px); }` } })
  ] });
}
export {
  Profile as default
};
