import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { usePage, Link } from "@inertiajs/react";
import moment from "moment";
function EnablePush() {
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub === null) {
            setIsSubscribed(false);
            setTimeout(() => setIsVisible(true), 2e3);
          }
        });
      });
    }
  }, []);
  const subscribeUser = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return alert("Izin ditolak browser.");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BEYYihJuWmjhno1ecsYuWWGqgorIqdzHM6mYuA7JLw7z2ONVsavx0Bqnkkbu4M9dJ8u04O501rJamvrhaRAHG7E"
      });
      await axios.post("/push/subscribe", sub);
      setIsVisible(false);
      setTimeout(() => setIsSubscribed(true), 500);
    } catch (e) {
      console.error(e);
    }
  };
  if (isSubscribed || !isVisible) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[9999] animate-bounce-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white/90 backdrop-blur-lg border border-purple-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "h-2 bg-gradient-to-r from-purple-500 to-indigo-600" }),
      /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-purple-100 p-3 rounded-2xl", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 text-purple-600 animate-pulse", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-gray-900 font-bold text-lg leading-tight", children: "Radar Amifi Aktif?" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs mt-1", children: "Jangan sampai ketinggalan info War & PO penting!" })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setIsVisible(false), className: "text-gray-400 hover:text-gray-600", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-600", children: [
            /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-green-500" }),
            "Update Status PO Real-time"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-600", children: [
            /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-green-500" }),
            "Notifikasi Suara Saat Sukses"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: subscribeUser,
            className: "w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] transition-all active:scale-95 text-sm",
            children: "Aktifkan Sekarang"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
                @keyframes bounce-in {
                    0% { transform: translateY(100px); opacity: 0; }
                    60% { transform: translateY(-10px); opacity: 1; }
                    100% { transform: translateY(0); }
                }
                .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
            ` } })
  ] });
}
function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/get-my-notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Gagal ambil notif:", err);
    }
  };
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3e4);
    return () => clearInterval(interval);
  }, []);
  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const toggleDropdown = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      await axios.post("/api/read-my-notifications");
      setNotifications(notifications.map((n) => ({ ...n, read_at: /* @__PURE__ */ new Date() })));
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative inline-block", children: [
    /* @__PURE__ */ jsxs("button", { onClick: toggleDropdown, className: "relative p-2 text-slate-500 hover:text-blue-600 transition-colors", children: [
      /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bell text-xl animate-wiggle" }),
      unreadCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white", children: unreadCount })
    ] }),
    isOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[999]", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-3 border-b border-slate-50 flex justify-between items-center bg-blue-600 text-white", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-bold text-sm uppercase tracking-wider", children: "Notifikasi" }),
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-envelope-open-text opacity-50" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-80 overflow-y-auto", children: notifications.length > 0 ? notifications.map((n) => /* @__PURE__ */ jsxs("div", { className: `p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read_at ? "bg-blue-50/40" : ""}`, children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-black text-slate-800", children: n.data?.title || "Informasi" }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 mt-1 leading-relaxed", children: n.data?.message || "Ada pembaruan sistem baru." }),
        /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-slate-400 mt-2 block font-medium", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-regular fa-clock mr-1" }),
          moment(n.created_at).fromNow()
        ] })
      ] }, n.id)) : /* @__PURE__ */ jsxs("div", { className: "p-8 text-center", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-box-open text-slate-200 text-4xl mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-bold uppercase", children: "Belum ada notifikasi" })
      ] }) })
    ] })
  ] });
}
function AppLock({ children }) {
  const { auth } = usePage().props;
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [mode, setMode] = useState("VERIFY");
  const [tempPin, setTempPin] = useState("");
  const inputRefs = useRef([]);
  useEffect(() => {
    if (auth?.user) {
      const unlocked = sessionStorage.getItem("app_unlocked");
      if (!unlocked) {
        setIsLocked(true);
        axios.get("/check-pin-status").then((res) => {
          setMode(res.data.has_pin ? "VERIFY" : "CREATE");
          setIsChecking(false);
        }).catch(() => {
          setMode("VERIFY");
          setIsChecking(false);
        });
      } else {
        setIsChecking(false);
      }
    } else {
      setIsChecking(false);
    }
  }, [auth]);
  useEffect(() => {
    if (isLocked && !isChecking) {
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    }
  }, [isLocked, isChecking, mode]);
  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setErrorMsg("");
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (index === 5 && value !== "") {
      handlePinLogic([...newPin.slice(0, 5), value].join(""));
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handlePinLogic = (fullPin) => {
    if (mode === "CREATE") {
      setTempPin(fullPin);
      setMode("CONFIRM");
      setPin(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else if (mode === "CONFIRM") {
      if (fullPin !== tempPin) {
        setErrorMsg("PIN tidak cocok! Silakan buat ulang.");
        setMode("CREATE");
        setTempPin("");
        setPin(["", "", "", "", "", ""]);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        verifyApi(fullPin);
      }
    } else {
      verifyApi(fullPin);
    }
  };
  const verifyApi = async (fullPin) => {
    setIsLoading(true);
    try {
      const res = await axios.post("/verify-pin", { pin: fullPin });
      if (res.data.success) {
        sessionStorage.setItem("app_unlocked", "true");
        setIsLocked(false);
      }
    } catch (err) {
      setPin(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setErrorMsg(err.response?.data?.message || "PIN Tidak Valid!");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };
  if (!isLocked) return /* @__PURE__ */ jsx(Fragment, { children });
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F4F7FB] font-['Outfit']", children: [
    isChecking ? (
      /* 🚀 ANIMASI LOADING KEREN SAAT NGECEK DATABASE */
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center animate-pulse", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-shield-halved text-4xl text-blue-500 mb-4 animate-bounce" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-slate-500 tracking-widest uppercase", children: "Memeriksa Keamanan..." })
      ] })
    ) : /* @__PURE__ */ jsxs("div", { className: `relative z-10 bg-white border border-slate-100 p-8 rounded-[35px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] w-full max-w-sm text-center transform transition-all ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`, children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 mb-6 shadow-inner border border-blue-100", children: /* @__PURE__ */ jsx("i", { className: `fa-solid ${mode === "VERIFY" ? "fa-shield-halved text-blue-500" : "fa-key text-emerald-500"} text-3xl` }) }),
      /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-black text-slate-800 mb-2 tracking-wide", children: [
        mode === "VERIFY" && "Keamanan MilaStore",
        mode === "CREATE" && "Buat PIN Baru",
        mode === "CONFIRM" && "Konfirmasi PIN"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 mb-8 font-medium px-4", children: [
        mode === "VERIFY" && "Masukkan 6 digit PIN keamanan untuk masuk ke aplikasi.",
        mode === "CREATE" && "Demi keamanan, buat 6 digit PIN transaksi Anda sekarang.",
        mode === "CONFIRM" && "Masukkan kembali 6 digit PIN yang baru saja Anda buat."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center gap-2 mb-6", children: pin.map((digit, index) => /* @__PURE__ */ jsx(
        "input",
        {
          ref: (el) => inputRefs.current[index] = el,
          type: "password",
          inputMode: "numeric",
          maxLength: 1,
          value: digit,
          onChange: (e) => handleChange(index, e.target.value),
          onKeyDown: (e) => handleKeyDown(index, e),
          disabled: isLoading,
          className: "w-12 h-14 text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
        },
        index
      )) }),
      /* @__PURE__ */ jsx("div", { className: "h-6", children: errorMsg && /* @__PURE__ */ jsx("p", { className: "text-rose-500 font-bold text-sm animate-pulse", children: errorMsg }) }),
      isLoading && /* @__PURE__ */ jsxs("p", { className: "text-blue-500 font-bold text-sm mt-2 animate-pulse", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-notch fa-spin mr-2" }),
        "Memverifikasi..."
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    50% { transform: translateX(10px); }
                    75% { transform: translateX(-10px); }
                }
            ` })
  ] });
}
function AuthenticatedLayout({ children }) {
  const { url } = usePage();
  const showBottomNav = route().current("dashboard") || route().current("riwayat") || route().current("deposit.index") || route().current("profile.edit");
  return (
    /* 🚀 BUNGKUS SEMUANYA PAKE APPLOCK! */
    /* @__PURE__ */ jsx(AppLock, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#F4F7FB] relative pb-28 sm:pb-0", children: [
      /* @__PURE__ */ jsxs("main", { children: [
        /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto sm:px-6 lg:px-8 mt-4 print:hidden", children: /* @__PURE__ */ jsx(EnablePush, {}) }),
        children
      ] }),
      showBottomNav && /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 left-0 right-0 w-full z-[100] flex justify-center px-5 pointer-events-none sm:hidden print:hidden", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[360px] bg-white/90 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-full flex justify-between items-center p-2 border border-white pointer-events-auto relative", children: [
        /* @__PURE__ */ jsxs(Link, { href: route("dashboard"), className: `flex items-center gap-2 px-5 py-3 rounded-full transition-all active:scale-95 ${route().current("dashboard") ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30" : "text-slate-400 hover:text-blue-600 hover:bg-slate-50"}`, children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-house text-sm" }),
          route().current("dashboard") && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black tracking-widest uppercase", children: "Home" })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: "/riwayat", className: `flex flex-col items-center justify-center transition-colors w-12 group ${url.startsWith("/riwayat") ? "text-blue-600" : "text-slate-400 hover:text-blue-600"}`, children: /* @__PURE__ */ jsx("i", { className: `fa-solid fa-clock-rotate-left text-[20px] transition-transform ${url.startsWith("/riwayat") ? "-translate-y-1" : "group-hover:-translate-y-1"}` }) }),
        /* @__PURE__ */ jsx("div", { className: "relative w-12 flex justify-center", children: /* @__PURE__ */ jsxs(Link, { href: "/notifikasi", className: "absolute -top-10 w-14 h-14 bg-gradient-to-tr from-sky-400 to-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 border-4 border-[#F4F7FB] active:scale-95 transition-transform hover:-translate-y-1", children: [
          /* @__PURE__ */ jsx(NotificationBell, {}),
          /* @__PURE__ */ jsx("span", { className: "absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-pulse" })
        ] }) }),
        /* @__PURE__ */ jsx(Link, { href: route("deposit.index"), className: `flex flex-col items-center justify-center transition-colors w-12 group ${route().current("deposit.index") ? "text-blue-600" : "text-slate-400 hover:text-blue-600"}`, children: /* @__PURE__ */ jsx("i", { className: `fa-solid fa-wallet text-[20px] transition-transform ${route().current("deposit.index") ? "-translate-y-1" : "group-hover:-translate-y-1"}` }) }),
        /* @__PURE__ */ jsx(Link, { href: route("profile.edit"), className: `flex flex-col items-center justify-center transition-colors w-12 group mr-2 ${route().current("profile.edit") ? "text-blue-600" : "text-slate-400 hover:text-blue-600"}`, children: /* @__PURE__ */ jsx("i", { className: `fa-solid fa-user text-[20px] transition-transform ${route().current("profile.edit") ? "-translate-y-1" : "group-hover:-translate-y-1"}` }) })
      ] }) })
    ] }) })
  );
}
export {
  AuthenticatedLayout as A,
  NotificationBell as N
};
