import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import "axios";
import "moment";
function WarPo({ auth }) {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [cancelRef, setCancelRef] = useState("");
  const terminalEndRef = useRef(null);
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);
  const addLog = (msg, type = "wait") => {
    const time = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    setLogs((prev) => {
      const newLogs = [...prev, { time, msg, type }];
      return newLogs.slice(-100);
    });
  };
  const fetchTable = () => {
    axios.post(route("admin.khfy.warengine.list")).then((res) => setTableData(res.data.data || [])).catch((err) => console.error("Tabel Sync Error"));
  };
  useEffect(() => {
    let timer;
    const runEngine = async () => {
      if (!isRunning) return;
      try {
        const res = await axios.post(route("admin.khfy.warengine.execute"));
        addLog(res.data.log, res.data.status);
      } catch (error) {
        addLog("Koneksi Engine terputus. Mencoba ulang...", "error");
      }
      if (isRunning) timer = setTimeout(runEngine, 1500);
    };
    if (isRunning) {
      addLog("⚡ WAR DIMULAI! Sistem Polling Async Aktif...", "shoot");
      runEngine();
    } else {
      clearTimeout(timer);
    }
    return () => clearTimeout(timer);
  }, [isRunning]);
  useEffect(() => {
    fetchTable();
    const syncTimer = setInterval(fetchTable, 3e3);
    return () => clearInterval(syncTimer);
  }, []);
  const handleAction = async (actionData, confirmMsg) => {
    if (!confirm(confirmMsg)) return;
    try {
      const res = await axios.post(route("admin.khfy.warengine.action"), actionData);
      addLog(res.data.log, res.data.status);
      fetchTable();
    } catch (error) {
      addLog("Gagal mengeksekusi perintah.", "error");
    }
  };
  const getLogColor = (type) => {
    if (type === "shoot" || type === "success") return "text-emerald-400 font-semibold";
    if (type === "error" || type === "warning" || type === "spamming") return "text-rose-400 font-semibold";
    return "text-slate-300";
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, header: /* @__PURE__ */ jsx("h2", { className: "font-bold text-2xl text-slate-800 leading-tight", children: "Command Center" }), children: [
    /* @__PURE__ */ jsx(Head, { title: "PO Command Center" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-slate-800", children: "Status Sistem Auto-PO" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Mesin Gatling Gun God Mode (Async Polling)" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => setIsRunning(true), disabled: isRunning, className: "flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: [
            /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full ${isRunning ? "bg-emerald-200 animate-pulse" : "bg-emerald-200"}` }),
            isRunning ? "SISTEM BERJALAN" : "MULAI WAR"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            setIsRunning(false);
            addLog("🛑 SISTEM DIHENTIKAN MANUAL.", "error");
          }, disabled: !isRunning, className: "flex items-center gap-2 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:border-slate-100 disabled:text-slate-400", children: "STOP WAR" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-sm border border-slate-100", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600", children: "🛡️" }),
              "Manajemen Darurat"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-slate-500 mb-1 block", children: "Batalkan Manual (Ref ID)" }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx("input", { type: "text", value: cancelRef, onChange: (e) => setCancelRef(e.target.value), className: "w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500", placeholder: "PO123..." }),
                  /* @__PURE__ */ jsx("button", { onClick: () => {
                    handleAction({ action: "cancel_ref", ref_id: cancelRef }, "Batalkan transaksi ini?");
                    setCancelRef("");
                  }, className: "bg-rose-500 hover:bg-rose-600 px-4 rounded-lg font-bold text-white text-sm transition-colors", children: "Batal" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("hr", { className: "border-slate-100" }),
              /* @__PURE__ */ jsx("button", { onClick: () => handleAction({ action: "cancel_all" }, "DARURAT! Kosongkan SEMUA antrean dan refund saldo user?"), className: "w-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white py-2.5 rounded-lg text-sm font-bold transition-colors", children: "☠️ Kosongkan Semua Antrean" }),
              /* @__PURE__ */ jsx("hr", { className: "border-slate-100 my-2" }),
              /* @__PURE__ */ jsx("button", { onClick: () => handleAction({ action: "kalibrasi" }, "Mulai Kalibrasi Manual? Sistem akan memaksa cek semua transaksi yang nyangkut lebih dari 3 menit."), className: "w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-2.5 rounded-lg text-sm font-bold transition-colors border border-blue-100", children: "🧹 Kalibrasi Manual (Sapu Jagat)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-2xl shadow-sm border border-slate-100", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600", children: "⏩" }),
              "Skip Prioritas"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: ["XLA89", "XLA14", "XLA39", "XLA32", "XLA51", "XLA65"].map((kode) => /* @__PURE__ */ jsxs("button", { onClick: () => handleAction({ action: "skip", kode }, `Lewati semua antrean ${kode} dan kembalikan saldo?`), className: "bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 text-xs py-2 rounded-lg font-bold transition-all", children: [
              "Skip ",
              kode
            ] }, kode)) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 rounded-2xl shadow-lg border border-slate-800 flex flex-col h-full overflow-hidden relative", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex justify-between items-center z-10", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2", children: [
              "System Monitor Log",
              /* @__PURE__ */ jsx("span", { className: "bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]", children: "Auto-Clean Aktif" })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex h-2 w-2 relative", children: [
              /* @__PURE__ */ jsx("span", { className: `animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? "bg-emerald-400" : "bg-slate-500"}` }),
              /* @__PURE__ */ jsx("span", { className: `relative inline-flex rounded-full h-2 w-2 ${isRunning ? "bg-emerald-500" : "bg-slate-500"}` })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 h-[400px] overflow-y-auto font-mono text-[13px] leading-relaxed relative z-0", children: [
            /* @__PURE__ */ jsx("div", { className: "text-slate-500 mb-2", children: "Sistem siap. Menunggu perintah operator..." }),
            logs.map((log, i) => /* @__PURE__ */ jsxs("div", { className: `mb-1.5 ${getLogColor(log.type)}`, children: [
              /* @__PURE__ */ jsxs("span", { className: "text-slate-500 mr-2", children: [
                "[",
                log.time,
                "]"
              ] }),
              " ",
              log.msg
            ] }, i)),
            /* @__PURE__ */ jsx("div", { ref: terminalEndRef })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-slate-800 uppercase tracking-wider", children: "📋 Daftar Antrean PO Live" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-semibold border border-indigo-100", children: "Auto-Sync 3s" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm whitespace-nowrap", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-white text-slate-500 text-xs uppercase font-bold border-b border-slate-100", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4", children: "Waktu" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4", children: "Ref ID" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4", children: "Username" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4", children: "Produk" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4", children: "Tujuan" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-center", children: "Aksi" }),
            " "
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-50 text-slate-700", children: tableData.length > 0 ? tableData.map((row, i) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 text-slate-500 text-xs", children: row.waktu }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-bold text-indigo-600", children: row.ref }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3", children: row.user }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-bold", children: row.produk }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3 font-mono", children: row.tujuan }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2.5 py-1 rounded-md text-[11px] font-bold ${row.status === "Sukses" ? "bg-emerald-100 text-emerald-700" : row.status === "Menunggu" ? "bg-amber-100 text-amber-700" : row.status === "Proses_API" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"}`, children: row.status }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-3 text-center flex justify-center items-center gap-2", children: [
              !["Sukses", "Dibatalkan"].includes(row.status) && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleAction({ action: "cancel_ref", ref_id: row.ref }, `Batalkan TRX ${row.ref} dan kembalikan saldo user?`),
                  className: "bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-rose-100 hover:border-rose-500 shadow-sm",
                  title: "Batalkan & Refund",
                  children: "❌ Cancel"
                }
              ),
              ["Proses_API", "Butuh_Review", "Gagal"].includes(row.status) && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleAction({ action: "refresh_ref", ref_id: row.ref }, `Paksa TRX ${row.ref} kembali ke Menunggu?`),
                  className: "bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-sky-100 hover:border-sky-500 shadow-sm",
                  title: "Paksa ke Menunggu",
                  children: "♻️ Refresh"
                }
              ),
              ["Sukses", "Dibatalkan"].includes(row.status) && /* @__PURE__ */ jsx("span", { className: "text-slate-400 text-xs italic", children: "-" })
            ] })
          ] }, i)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "7", className: "text-center py-8 text-slate-400", children: "Belum ada antrean masuk..." }) }) })
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  WarPo as default
};
