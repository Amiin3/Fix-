import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, Link, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import "moment";
function PushToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const ONESIGNAL_APP_ID = "d285d368-7e50-48fd-a0cb-59c6b3bf3669";
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    document.head.appendChild(script);
    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        console.log("OneSignal: Memulai Inisialisasi...");
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true
        });
        const subId = OneSignal.User.PushSubscription.id;
        if (subId) {
          console.log("OneSignal: User sudah terdaftar dengan ID:", subId);
          setIsSubscribed(true);
        }
      });
    };
  }, []);
  const activatePush = () => {
    setLoading(true);
    window.OneSignalDeferred.push(async function(OneSignal) {
      try {
        console.log("OneSignal: Meminta Izin Notifikasi...");
        await OneSignal.Notifications.requestPermission();
        await OneSignal.User.PushSubscription.optIn();
        const subId = OneSignal.User.PushSubscription.id;
        if (subId) {
          console.log("OneSignal: ID Berhasil didapat:", subId);
          setIsSubscribed(true);
          await axios.post("/api/save-push-token", { token: subId });
          alert("SUKSES! HP Sultan Terkoneksi. ID: " + subId);
        } else {
          console.error("OneSignal: Izin diberikan tapi ID tidak keluar.");
          alert("Coba Refresh Halaman & Klik Lagi Bang.");
        }
      } catch (err) {
        console.error("OneSignal Error:", err);
        alert("Error: " + err.message);
      }
      setLoading(false);
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-[2rem] shadow-xl mb-8 border border-blue-50 flex justify-between items-center transition-all duration-500", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5", children: [
      /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-colors ${isSubscribed ? "bg-green-500" : "bg-blue-600"}`, children: /* @__PURE__ */ jsx("i", { className: `fa-solid ${isSubscribed ? "fa-check" : "fa-bell"} text-xl ${!isSubscribed && "animate-bounce"}` }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-black text-slate-800 tracking-tight", children: "Notifikasi Sultan v2.1" }),
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1", children: [
          "Status: ",
          /* @__PURE__ */ jsx("span", { className: isSubscribed ? "text-green-600" : "text-orange-500", children: isSubscribed ? "Aktif Terpercaya" : "Belum Terhubung" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: activatePush,
        disabled: loading || isSubscribed,
        className: `px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all active:scale-95 ${isSubscribed ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"}`,
        children: isSubscribed ? "READY" : loading ? "WAIT..." : "AKTIFKAN"
      }
    )
  ] });
}
const ultimateStyles = `
    .cyber-bg {
        background-color: #f8fafc;
        background-image: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.05), transparent 50%);
        min-height: 100vh;
    }
    .notif-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
    }
    .notif-card.unread {
        background: #f0f9ff;
        border-color: #bae6fd;
        box-shadow: 0 4px 15px -3px rgba(56, 189, 248, 0.2);
    }
    .notif-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.15);
        border-color: #bfdbfe;
    }
    .glow-text { text-shadow: 0 0 15px rgba(255, 255, 255, 0.6); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
`;
function NotificationIndex({ auth, notifications, unreadCount }) {
  const markRead = (id) => {
    axios.post(`/notifikasi/${id}/read`).then(() => router.reload({ preserveScroll: true }));
  };
  const markAllRead = () => {
    Swal.fire({
      title: '<div class="text-xl font-black text-slate-800 tracking-tight uppercase">Tandai Semua?</div>',
      html: '<p class="text-sm font-bold text-slate-500">Semua notifikasi akan ditandai sebagai telah dibaca.</p>',
      icon: "question",
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-check-double mr-1"></i> Ya, Baca Semua',
      cancelButtonText: "Batal",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "w-full bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl px-5 py-3 mt-4 transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] text-[11px] tracking-widest uppercase",
        cancelButton: "w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black rounded-xl px-5 py-3 mt-2 transition-all text-[11px] tracking-widest uppercase",
        popup: "rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-slate-100"
      }
    }).then((result) => {
      if (result.isConfirmed) {
        router.post("/notifikasi/read-all", {}, {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire({
              icon: "success",
              title: "Berhasil!",
              text: "Semua pesan telah dibaca.",
              timer: 1500,
              showConfirmButton: false,
              customClass: { popup: "rounded-3xl border border-slate-100" }
            });
          }
        });
      }
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Pusat Pesan - MilaStore" }),
    /* @__PURE__ */ jsx("style", { children: ultimateStyles }),
    /* @__PURE__ */ jsxs("div", { className: "cyber-bg pb-[140px] md:pb-32 font-['Outfit']", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 pt-12 pb-24 px-5 rounded-b-[45px] shadow-xl relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 w-full", children: [
            /* @__PURE__ */ jsx(Link, { href: route("dashboard"), className: "w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/30 transition-all text-white border border-white/10 shadow-lg active:scale-95 shrink-0", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black italic tracking-tighter text-white glow-text uppercase mb-0.5", children: "Pusat Pesan" }),
              /* @__PURE__ */ jsx("p", { className: "text-blue-200/80 text-[10px] font-bold tracking-widest uppercase", children: "MilaStore Notifikasi" })
            ] })
          ] }),
          unreadCount > 0 && /* @__PURE__ */ jsxs("button", { onClick: markAllRead, className: "absolute right-0 top-1.5 text-[9px] font-black uppercase bg-white/20 border border-white/20 text-white px-3 py-1.5 rounded-lg hover:bg-white/30 transition-all shadow-md active:scale-95 flex items-center gap-1.5 backdrop-blur-sm", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-check-double" }),
            " Baca Semua"
          ] })
        ] }),
        unreadCount > 0 && /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto mt-6 relative z-10 animate-in fade-in zoom-in duration-300", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center bg-white/10 border border-white/20 px-4 py-2 rounded-2xl backdrop-blur-md", children: [
          /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 bg-red-400 rounded-full animate-ping mr-2 shadow-[0_0_10px_rgba(248,113,113,0.8)]" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-white tracking-widest uppercase", children: [
            unreadCount,
            " Pesan Baru"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-5 -mt-10 relative z-20", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(PushToggle, {}) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: notifications.data.length > 0 ? notifications.data.map((notif, idx) => {
          const isUnread = !notif.read_at;
          const isPromo = notif.data.type === "promo" || notif.data.title?.toLowerCase().includes("promo");
          const isSystem = notif.data.type === "system" || notif.data.title?.toLowerCase().includes("sistem");
          let iconClass = notif.data.icon || "fa-bell";
          let colorClass = "bg-blue-50 text-blue-500 border-blue-100";
          if (isPromo) {
            iconClass = "fa-tag";
            colorClass = "bg-orange-50 text-orange-500 border-orange-100";
          } else if (isSystem) {
            iconClass = "fa-gear";
            colorClass = "bg-slate-100 text-slate-500 border-slate-200";
          } else if (notif.data.title?.toLowerCase().includes("sukses")) {
            iconClass = "fa-circle-check";
            colorClass = "bg-emerald-50 text-emerald-500 border-emerald-100";
          }
          return /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: () => isUnread && markRead(notif.id),
              className: `notif-card rounded-[24px] p-5 relative overflow-hidden animate-in slide-in-from-bottom-4 fade-in ${isUnread ? "unread group" : "opacity-80 grayscale-[20%]"}`,
              style: { animationDelay: `${idx * 50}ms` },
              children: [
                isUnread && /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-4 items-start", children: [
                  /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${colorClass} ${isUnread ? "ring-4 ring-blue-50 transition-all group-hover:scale-110" : ""}`, children: /* @__PURE__ */ jsx("i", { className: `fa-solid ${iconClass} text-xl` }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-1.5", children: [
                      /* @__PURE__ */ jsx("h4", { className: `text-sm font-black truncate pr-2 ${isUnread ? "text-slate-800" : "text-slate-500"}`, children: notif.data.title }),
                      isUnread && /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse mt-1" })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: `text-xs leading-relaxed ${isUnread ? "text-slate-600 font-medium" : "text-slate-400"}`,
                        dangerouslySetInnerHTML: { __html: notif.data.message }
                      }
                    ),
                    /* @__PURE__ */ jsx("div", { className: "mt-3 flex items-center gap-1.5", children: /* @__PURE__ */ jsxs("div", { className: `px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isUnread ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`, children: [
                      /* @__PURE__ */ jsx("i", { className: "fa-regular fa-clock mr-1" }),
                      new Date(notif.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                    ] }) })
                  ] })
                ] })
              ]
            },
            notif.id
          );
        }) : /* @__PURE__ */ jsxs("div", { className: "bg-white p-12 rounded-[32px] text-center shadow-sm border border-slate-100 mt-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bell-slash text-3xl text-slate-300" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-black text-slate-700 mb-1 uppercase tracking-widest", children: "Hening Sekali" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-bold", children: "Belum ada pemberitahuan untuk Anda." })
        ] }) }),
        notifications.links && notifications.data.length > 0 && notifications.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-2 mt-8", children: notifications.links.map((link, index) => {
          if (!link.url && !link.active) return null;
          return /* @__PURE__ */ jsx(
            Link,
            {
              href: link.url || "#",
              preserveScroll: true,
              dangerouslySetInnerHTML: { __html: link.label.replace("Previous", '<i class="fa-solid fa-chevron-left"></i>').replace("Next", '<i class="fa-solid fa-chevron-right"></i>') },
              className: `px-4 py-2 rounded-xl text-xs font-black transition-all border ${link.active ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105" : !link.url ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"}`
            },
            index
          );
        }) })
      ] })
    ] })
  ] });
}
export {
  NotificationIndex as default
};
