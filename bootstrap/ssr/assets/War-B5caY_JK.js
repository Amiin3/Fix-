import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
function War() {
  const [logs, setLogs] = useState(["[SISTEM] Radar Kaje aktif. Menunggu perintah..."]);
  const [queue, setQueue] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalEndRef = useRef(null);
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);
  const fetchList = () => {
    axios.get("/admin/kaje/war-po/list").then((res) => {
      setQueue(res.data.data);
    }).catch((err) => console.error("Gagal tarik antrean", err));
  };
  const runWar = () => {
    if (!isRunning) return;
    axios.post("/admin/kaje/war-po/execute").then((res) => {
      if (res.data.status === "stopped") {
        setIsRunning(false);
        addLog("🔴 Sistem dimatikan oleh Server.");
      } else if (res.data.log) {
        const newLogs = res.data.log.split(" | ");
        newLogs.forEach((log) => {
          if (log.trim() !== "") addLog(log);
        });
      }
    }).catch((err) => {
      addLog("🚨 Koneksi ke mesin server terputus!");
    });
  };
  useEffect(() => {
    fetchList();
    const listInterval = setInterval(fetchList, 3e3);
    return () => clearInterval(listInterval);
  }, []);
  useEffect(() => {
    let warInterval;
    if (isRunning) {
      addLog("⚡ GATLING GUN AKTIF! Menyerang Kaje...");
      runWar();
      warInterval = setInterval(runWar, 1500);
    }
    return () => clearInterval(warInterval);
  }, [isRunning]);
  const addLog = (msg) => {
    const time = (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID");
    setLogs((prev) => [...prev.slice(-99), `[${time}] ${msg}`]);
  };
  const handleAction = (actionType, refId = null) => {
    if (!confirm(`YAKIN BOSKU? Aksi ini akan menggagalkan pesanan!`)) return;
    axios.post("/admin/kaje/war-po/action", { action: actionType, ref_id: refId }).then((res) => {
      addLog(`⚙️ ${res.data.log}`);
      fetchList();
    }).catch((err) => addLog("🚨 Gagal melakukan aksi."));
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-100 p-4 md:p-8 font-sans", children: [
    /* @__PURE__ */ jsx(Head, { title: "Command Center - KAJE WAR" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center border-l-4 border-blue-600", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black text-gray-800 tracking-tight", children: "🎯 KAJE WAR-PO" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Mode Serangan: Full Auto-Pilot Tanpa Limit" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 md:mt-0 flex space-x-3", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => handleAction("refresh_all"), className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow transition-all", children: "🔄 Refresh Zombi" }),
          /* @__PURE__ */ jsx("button", { onClick: () => handleAction("cancel_all"), className: "px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition-all", children: "🧹 BATAL SEMUA TRX" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIsRunning(!isRunning),
              className: `px-8 py-2 rounded font-bold text-white shadow-lg transition-all ${isRunning ? "bg-yellow-500 hover:bg-yellow-600 animate-pulse text-gray-900" : "bg-green-600 hover:bg-green-700"}`,
              children: isRunning ? "🛑 STOP TEMBAK" : "🚀 MULAI TEMBAK"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }),
          /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }),
          /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" }),
          /* @__PURE__ */ jsx("span", { className: "ml-2 text-gray-400 font-mono text-sm tracking-widest", children: "TERMINAL_LOG" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "h-64 overflow-y-auto font-mono text-xs md:text-sm p-4 text-green-400 leading-relaxed tracking-wide", children: [
          logs.map((log, i) => /* @__PURE__ */ jsx("div", { className: "hover:bg-gray-800 px-1 rounded transition-colors", children: log }, i)),
          /* @__PURE__ */ jsx("div", { ref: terminalEndRef })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-md overflow-hidden border border-gray-200", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-5 py-4 border-b border-gray-200 flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-700 text-lg", children: "📋 Daftar Antrean (Target)" }),
          /* @__PURE__ */ jsxs("span", { className: "bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full", children: [
            "Total: ",
            queue.length,
            " TRX"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm text-left text-gray-600", children: [
          /* @__PURE__ */ jsx("thead", { className: "text-xs text-gray-500 uppercase bg-gray-100/50", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Waktu Masuk" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "No Target" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Kode Peluru" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-5 py-3 font-semibold text-right", children: "Aksi Manual" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-200", children: queue.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "5", className: "text-center py-8 text-gray-400 font-medium", children: "✨ Radar bersih. Menunggu pesanan masuk..." }) }) : queue.map((item) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-blue-50/50 transition-colors", children: [
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 whitespace-nowrap", children: item.waktu }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 font-bold text-gray-900", children: item.tujuan }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx("span", { className: "bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs", children: item.produk }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2.5 py-1 rounded-full text-xs font-bold shadow-sm
                                                ${item.status === "Menunggu" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : item.status === "Proses_API" ? "bg-blue-100 text-blue-700 border border-blue-200 animate-pulse" : "bg-gray-100 text-gray-700 border border-gray-200"}`, children: item.status === "Proses_API" ? "⚔️ Digempur" : item.status }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-5 py-3 text-right whitespace-nowrap space-x-2", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => handleAction("skip", item.ref), className: "bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm", children: "Tendang" }),
              /* @__PURE__ */ jsx("button", { onClick: () => handleAction("cancel_ref", item.ref), className: "bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm", children: "Batal TRX" })
            ] })
          ] }, item.id)) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  War as default
};
