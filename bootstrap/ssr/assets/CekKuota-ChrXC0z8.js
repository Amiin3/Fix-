import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import Swal from "sweetalert2";
const ultimateStyles = `
    .cyber-bg {
        background-color: #0f172a;
        background-image: radial-gradient(circle at 50% -20%, rgba(56, 189, 248, 0.15), transparent 60%);
        min-height: 100vh;
    }
    .cyber-card {
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(56, 189, 248, 0.2);
        box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
    }
    .input-cyber {
        background: rgba(15, 23, 42, 0.5);
        border: 1px solid rgba(51, 65, 85, 0.8);
        color: #e2e8f0;
        transition: all 0.3s ease;
    }
    .input-cyber:focus-within {
        border-color: #38bdf8;
        box-shadow: 0 0 15px -2px rgba(56, 189, 248, 0.3);
        background: rgba(15, 23, 42, 0.8);
    }
    .glow-text { text-shadow: 0 0 20px rgba(56, 189, 248, 0.8); }
    .btn-cyber {
        background: linear-gradient(90deg, #0284c7 0%, #38bdf8 100%);
        box-shadow: 0 4px 15px -3px rgba(56, 189, 248, 0.4);
    }
    .btn-cyber:hover:not(:disabled) {
        background: linear-gradient(90deg, #0369a1 0%, #0284c7 100%);
        box-shadow: 0 6px 20px -3px rgba(56, 189, 248, 0.6);
    }
    .btn-cyber:disabled {
        background: rgba(51, 65, 85, 0.5);
        color: #94a3b8;
        box-shadow: none;
    }
    .radar-spinner {
        width: 70px; height: 70px;
        border-radius: 50%;
        border: 2px solid transparent;
        border-top-color: #38bdf8;
        border-bottom-color: #38bdf8;
        animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        position: relative;
    }
    .radar-spinner::before {
        content: ''; position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px;
        border-radius: 50%; border: 2px solid transparent;
        border-left-color: #818cf8; border-right-color: #818cf8;
        animation: spin-reverse 1s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes spin-reverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.3); border-radius: 10px; }
`;
const ProviderBadge = ({ phone }) => {
  const prefix = phone.substring(0, 4);
  let provider = null;
  let colors = "bg-slate-800 text-slate-400 border-slate-700";
  if (phone.length >= 4) {
    if (["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"].includes(prefix)) {
      provider = "TELKOMSEL";
      colors = "bg-red-500/20 text-red-400 border-red-500/50";
    } else if (["0814", "0815", "0816", "0855", "0856", "0857", "0858"].includes(prefix)) {
      provider = "INDOSAT";
      colors = "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    } else if (["0817", "0818", "0819", "0859", "0877", "0878", "0879"].includes(prefix)) {
      provider = "XL";
      colors = "bg-blue-500/20 text-blue-400 border-blue-500/50";
    } else if (["0831", "0832", "0833", "0838"].includes(prefix)) {
      provider = "AXIS";
      colors = "bg-purple-500/20 text-purple-400 border-purple-500/50";
    } else if (["0895", "0896", "0897", "0898", "0899"].includes(prefix)) {
      provider = "TRI";
      colors = "bg-slate-700 text-white border-slate-500";
    } else if (["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"].includes(prefix)) {
      provider = "SMARTFREN";
      colors = "bg-pink-500/20 text-pink-400 border-pink-500/50";
    }
  }
  if (!provider) return null;
  return /* @__PURE__ */ jsx("span", { className: `px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shadow-sm animate-in fade-in zoom-in ${colors}`, children: provider });
};
function CekKuota() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawResult, setRawResult] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const handleContactPicker = async () => {
    if (window.AndroidBridge && typeof window.AndroidBridge.bukaKontak === "function") {
      window._contactResolve = (data) => {
        if (data && data.length > 0) {
          let number = data[0].tel[0].replace(/\D/g, "");
          if (number.startsWith("62")) number = "0" + number.substring(2);
          setPhone(number);
        }
      };
      window.AndroidBridge.bukaKontak();
    } else if ("contacts" in navigator && "ContactsManager" in window) {
      try {
        const contacts = await navigator.contacts.select(["tel"], { multiple: false });
        if (contacts.length > 0 && contacts[0].tel.length > 0) {
          let number = contacts[0].tel[0].replace(/\D/g, "");
          if (number.startsWith("62")) number = "0" + number.substring(2);
          setPhone(number);
        }
      } catch (ex) {
      }
    }
  };
  const processApiData = (rawHtml) => {
    if (!rawHtml) return null;
    let text = rawHtml.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+(>|$)/g, "");
    let lines = text.split("\n").map((l) => l.trim()).filter((l) => l !== "");
    let info = [];
    let packages = [];
    let currentPackage = [];
    let isParsingPackages = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.match(/={3,}|-{3,}/)) {
        isParsingPackages = true;
        if (currentPackage.length > 0) {
          packages.push([...currentPackage]);
        }
        currentPackage = [];
        continue;
      }
      let key = "";
      let val = "";
      if (line.includes(":")) {
        const parts = line.split(":");
        key = parts.shift().trim();
        val = parts.join(":").trim();
      } else if (i + 1 < lines.length && !lines[i + 1].match(/={3,}|-{3,}/)) {
        key = line;
        val = lines[i + 1];
        i++;
      } else {
        key = line;
        val = "";
      }
      const cleanKey = key.replace(/[^a-zA-Z0-9 \-\/]/g, "").trim();
      if (isParsingPackages) {
        currentPackage.push({ key: cleanKey, val });
      } else {
        info.push({ key: cleanKey, val });
      }
    }
    if (currentPackage.length > 0) packages.push(currentPackage);
    return { info, packages };
  };
  const handleCheck = async () => {
    if (!phone || phone.length < 10) {
      return Swal.fire({
        icon: "warning",
        background: "#1e293b",
        color: "#f8fafc",
        title: "Format Tidak Valid",
        text: "Silakan masukkan nomor tujuan yang benar.",
        confirmButtonColor: "#38bdf8",
        customClass: { popup: "rounded-3xl border border-slate-700" }
      });
    }
    setLoading(true);
    setRawResult(null);
    setParsedData(null);
    try {
      const res = await axios.post(`/proxy/cek-kuota`, { msisdn: phone });
      if (res.data && res.data.status === true) {
        const raw = res.data.data.hasil;
        setRawResult(raw);
        setParsedData(processApiData(raw));
      } else {
        Swal.fire({
          icon: "error",
          background: "#1e293b",
          color: "#f8fafc",
          title: "Pengecekan Gagal",
          text: res.data?.message || "Nomor tidak terdaftar atau sistem pusat sedang sibuk.",
          confirmButtonColor: "#38bdf8",
          customClass: { popup: "rounded-3xl border border-slate-700" }
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        background: "#1e293b",
        color: "#f8fafc",
        title: "Gangguan Server",
        text: "Koneksi ke satelit penyedia layanan terputus. Coba lagi nanti.",
        confirmButtonColor: "#38bdf8",
        customClass: { popup: "rounded-3xl border border-slate-700" }
      });
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = () => {
    let textToCopy = `*CEK KUOTA MILASTORE*
Target: ${phone}

`;
    if (parsedData) {
      textToCopy += `*📌 INFO KARTU*
`;
      parsedData.info.forEach((item) => {
        if (item.key && item.val) textToCopy += `${item.key}: ${item.val}
`;
      });
      if (parsedData.packages.length > 0) {
        textToCopy += `
*📦 DETAIL PAKET/KUOTA*
`;
        parsedData.packages.forEach((pkg, idx) => {
          textToCopy += `
[Paket ${idx + 1}]
`;
          pkg.forEach((item) => {
            if (item.key && item.val) textToCopy += `- ${item.key}: ${item.val}
`;
          });
        });
      }
    } else if (rawResult) {
      textToCopy += rawResult.replace(/<[^>]*>?/gm, "");
    }
    textToCopy += `
_Terima kasih telah berlangganan!_`;
    navigator.clipboard.writeText(textToCopy);
    Swal.fire({
      icon: "success",
      title: "Berhasil Disalin!",
      text: "Hasil cek kuota siap ditempel ke WhatsApp pelanggan.",
      timer: 2e3,
      showConfirmButton: false,
      background: "#1e293b",
      color: "#f8fafc",
      customClass: { popup: "rounded-3xl border border-slate-700" }
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Radar Kuota - MilaStore" }),
    /* @__PURE__ */ jsx("style", { children: ultimateStyles }),
    /* @__PURE__ */ jsxs("div", { className: "cyber-bg font-sans text-slate-300 selection:bg-sky-500/30 selection:text-sky-200 min-h-screen pb-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative pt-10 pb-8 px-5 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -top-20 -right-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto relative z-10 flex flex-col items-center text-center", children: [
          /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "absolute left-0 top-1 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center rounded-xl text-sky-400 border border-slate-700 transition-all shadow-lg backdrop-blur-sm", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left" }) }),
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full bg-slate-900/80 border border-sky-500/50 text-sky-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(56,189,248,0.2)]", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-satellite-dish mr-2 animate-pulse text-sky-300" }),
            " MilaStore Core"
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold text-white tracking-tight glow-text mb-2 uppercase", children: "Radar Kuota" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-xs max-w-[280px] font-medium", children: "Pindai sisa paket data dan masa aktif nomor pelanggan secara real-time." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto px-5 relative z-20", children: [
        /* @__PURE__ */ jsxs("div", { className: "cyber-card rounded-[32px] p-6 mb-6 relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-sky-400 to-indigo-600" }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Target Pemindaian" }),
            /* @__PURE__ */ jsxs("button", { onClick: handleContactPicker, className: "text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-sky-500/30 transition-all active:scale-95", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-address-book mr-1.5" }),
              " Kontak"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "input-cyber rounded-2xl p-1 mb-5 flex items-center pr-2", children: [
            /* @__PURE__ */ jsx("div", { className: "px-4 text-sky-400", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-microchip text-lg" }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                className: "flex-1 w-full border-none focus:ring-0 bg-transparent text-xl font-black text-white placeholder-slate-600 py-4 px-0 tracking-widest font-mono",
                placeholder: "0812xxxx",
                value: phone,
                onChange: (e) => setPhone(e.target.value.replace(/\D/g, "")),
                onKeyDown: (e) => e.key === "Enter" && handleCheck(),
                maxLength: "15"
              }
            ),
            phone.length >= 4 && /* @__PURE__ */ jsx("div", { className: "pl-2 shrink-0", children: /* @__PURE__ */ jsx(ProviderBadge, { phone }) })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleCheck,
              disabled: loading || phone.length < 10,
              className: "btn-cyber w-full text-white py-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all active:scale-[0.98] flex justify-center items-center overflow-hidden relative shadow-lg",
              children: loading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-notch fa-spin mr-2.5 text-lg" }),
                " MEMINDAI..."
              ] }) : /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bolt mr-2 text-yellow-300 text-lg" }),
                " JALANKAN RADAR"
              ] })
            }
          )
        ] }),
        loading && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-300", children: [
          /* @__PURE__ */ jsx("div", { className: "radar-spinner mb-6 shadow-[0_0_30px_rgba(56,189,248,0.5)]" }),
          /* @__PURE__ */ jsxs("div", { className: "text-sky-400 font-mono text-xs uppercase tracking-widest animate-pulse font-black", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-satellite mr-2" }),
            " Menembak Satelit..."
          ] })
        ] }),
        !loading && parsedData && (parsedData.info.length > 0 || parsedData.packages.length > 0) && /* @__PURE__ */ jsxs("div", { className: "cyber-card rounded-[32px] p-6 animate-in slide-in-from-bottom-8 fade-in duration-500 relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-0 w-32 h-32 bg-sky-500/10 rounded-bl-full -z-10 blur-xl" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5 pb-4 border-b border-slate-700/50", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mr-3 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-database text-lg" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-black text-white tracking-wide text-sm", children: "Data Terekstrak" }),
                /* @__PURE__ */ jsx("p", { className: "text-[9px] text-emerald-400 font-mono font-bold tracking-widest mt-0.5", children: "STATUS: SUCCESS" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: copyToClipboard, className: "bg-sky-500 hover:bg-sky-400 text-white px-3 py-2 rounded-xl shadow-[0_4px_15px_rgba(56,189,248,0.4)] transition-all flex items-center gap-2 active:scale-95 text-[10px] font-black uppercase tracking-widest", title: "Copy untuk WhatsApp", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-regular fa-copy" }),
              " Copy"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-2", children: [
            parsedData.info.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
              /* @__PURE__ */ jsxs("h4", { className: "font-black text-sky-400 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-id-card" }),
                " Info Kartu"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: parsedData.info.map((item, idx) => {
                if (!item.key) return null;
                return /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 line-clamp-1", children: item.key }),
                  /* @__PURE__ */ jsx("div", { className: "text-white font-bold text-xs break-words", children: item.val || "-" })
                ] }, idx);
              }) })
            ] }),
            parsedData.packages.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("h4", { className: "font-black text-emerald-400 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-cubes" }),
                " Detail Paket & Kuota"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: parsedData.packages.map((pkg, pIdx) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/80 rounded-[20px] border border-slate-700/50 p-4 relative overflow-hidden", children: [
                /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-sky-500" }),
                pkg.map((item, iIdx) => {
                  if (iIdx === 0) {
                    return /* @__PURE__ */ jsxs("div", { className: "mb-3 pb-3 border-b border-slate-700/50", children: [
                      /* @__PURE__ */ jsx("div", { className: "text-[9px] text-sky-400 font-black uppercase tracking-widest mb-0.5", children: item.key }),
                      /* @__PURE__ */ jsx("div", { className: "font-black text-white text-sm", children: item.val || "-" })
                    ] }, iIdx);
                  }
                  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2 last:mb-0 gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase", children: item.key }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-slate-200 text-right text-wrap", children: item.val || "-" })
                  ] }, iIdx);
                })
              ] }, pIdx)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 pt-4 border-t border-slate-700/50 flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-slate-500 font-mono uppercase tracking-widest font-bold", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-shield-halved mr-1 text-slate-400" }),
              " MilaStore Encrypted"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-white font-mono text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700 font-bold", children: [
              "ID: MS-",
              Math.floor(Math.random() * 9e3) + 1e3
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  CekKuota as default
};
