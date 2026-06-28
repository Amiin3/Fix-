import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "moment";
function KhfyWarStation({ auth }) {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([{ time: (/* @__PURE__ */ new Date()).toLocaleTimeString(), msg: "[SYSTEM] Mesin Gatling Gun siap. Menunggu saklar dihidupkan...", type: "text-emerald-400" }]);
  const [poList, setPoList] = useState([]);
  const [cancelRef, setCancelRef] = useState("");
  const terminalEndRef = useRef(null);
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);
  const addLog = (msg, type = "text-yellow-400") => {
    setLogs((prev) => {
      const newLogs = [...prev, { time: (/* @__PURE__ */ new Date()).toLocaleTimeString(), msg, type }];
      return newLogs.slice(-100);
    });
  };
  const fetchTable = async () => {
    try {
      const res = await axios.get(route("admin.khfy.war.table"));
      setPoList(res.data);
    } catch (error) {
      console.error("Gagal memuat tabel");
    }
  };
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(async () => {
        try {
          const res = await axios.post(route("admin.khfy.war.shoot"));
          const statusColor = res.data.status === "shoot" ? "text-cyan-400" : res.data.status === "error" ? "text-rose-400" : "text-yellow-400";
          addLog(res.data.log, statusColor);
        } catch (error) {
          addLog("Koneksi Engine terputus. Mencoba lagi...", "text-rose-400");
        }
      }, 800);
    }
    return () => clearInterval(timer);
  }, [isRunning]);
  useEffect(() => {
    fetchTable();
    const interval = setInterval(fetchTable, 3e3);
    return () => clearInterval(interval);
  }, []);
  const handleSkip = async (kode) => {
    if (confirm(`Yakin men-SKIP seluruh antrian ${kode}?
(Semua saldo user dikembalikan otomatis)`)) {
      const res = await axios.post(route("admin.khfy.war.skip"), { kode });
      addLog(res.data.log, "text-yellow-400");
      fetchTable();
    }
  };
  const handleCancelRef = async () => {
    if (!cancelRef) return alert("Masukkan Ref ID!");
    executeCancel(cancelRef);
    setCancelRef("");
  };
  const cancelFromTable = (ref) => {
    executeCancel(ref);
  };
  const executeCancel = async (ref) => {
    if (confirm(`Batalkan transaksi ${ref}?
Saldo akan langsung dikembalikan ke user.`)) {
      try {
        const res = await axios.post(route("admin.khfy.war.cancel"), { ref_id: ref });
        addLog(res.data.log, res.data.status === "error" ? "text-rose-400" : "text-yellow-400");
        fetchTable();
      } catch (error) {
        addLog("Gagal menghubungi server database.", "text-rose-400");
      }
    }
  };
  const handleCancelAll = async () => {
    if (confirm("🚨 PERINGATAN DARURAT 🚨\nYakin ingin MEMBATALKAN SEMUA antrian Menunggu?\nSemua saldo user akan dikembalikan!")) {
      const res = await axios.post(route("admin.khfy.war.cancelAll"));
      addLog(res.data.log, "text-rose-400");
      fetchTable();
    }
  };
  const getStatusBadge = (status) => {
    if (status === "Menunggu") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (status === "Proses_API") return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    if (status === "Sukses") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    return "bg-rose-500/20 text-rose-400 border-rose-500/30";
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { header: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "PO War Station" }), children: [
    /* @__PURE__ */ jsx(Head, { title: "PO War Station - Khfy" }),
    /* @__PURE__ */ jsx("div", { className: "py-8 bg-[#0f172a] min-h-screen font-mono text-sky-400 pb-24", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1400px] mx-auto sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-white text-center font-black text-2xl mb-8 tracking-wider", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bolt text-yellow-400 mr-2" }),
        " COMMAND CENTER: PO WAR STATION"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setIsRunning(true);
              addLog("WAR DIMULAI! GATLING GUN AKTIF...", "text-cyan-400");
            },
            disabled: isRunning,
            className: `px-8 py-4 rounded-xl font-bold text-lg transition-all ${isRunning ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95"}`,
            children: "🚀 MULAI WAR (SAKLAR ON)"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setIsRunning(false);
              addLog("WAR DIHENTIKAN MANUAL. Mesin mendingin.", "text-rose-400");
            },
            disabled: !isRunning,
            className: `px-8 py-4 rounded-xl font-bold text-lg transition-all ${!isRunning ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700" : "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95"}`,
            children: "🛑 STOP WAR"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-sm", children: [
            /* @__PURE__ */ jsxs("h6", { className: "text-white font-bold mb-4 flex items-center", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-shield-halved text-cyan-400 mr-2" }),
              " MANAJEMEN DARURAT"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[11px] text-slate-400 mb-2 block uppercase tracking-wider", children: "Batalkan 1 Transaksi (Input Manual)" }),
              /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                /* @__PURE__ */ jsx("input", { type: "text", value: cancelRef, onChange: (e) => setCancelRef(e.target.value), placeholder: "Contoh: PO1708...", className: "bg-black/50 border border-slate-700 text-white rounded-l-lg px-3 py-2 w-full text-sm focus:ring-rose-500 focus:border-rose-500" }),
                /* @__PURE__ */ jsx("button", { onClick: handleCancelRef, className: "bg-rose-600 hover:bg-rose-500 text-white px-4 rounded-r-lg text-sm font-bold transition-colors", children: "Batal" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-[11px] text-slate-400 mb-2 block uppercase tracking-wider", children: "Aksi Massal" }),
              /* @__PURE__ */ jsxs("button", { onClick: handleCancelAll, className: "w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-2.5 rounded-lg text-sm font-bold transition-colors", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-skull-crossbones mr-2" }),
                " Kosongkan Semua Antrian"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-sm", children: [
            /* @__PURE__ */ jsxs("h6", { className: "text-white font-bold mb-2 flex items-center", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-forward-step text-yellow-400 mr-2" }),
              " MENU SKIP PRIORITAS"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400 mb-4", children: "Gunakan jika stok provider habis total." }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: ["XLA89", "XLA14", "XLA39", "XLA32", "XLA51", "XLA65"].map((kode, idx) => /* @__PURE__ */ jsxs("button", { onClick: () => handleSkip(kode), className: "w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 py-2 rounded-lg text-xs font-bold transition-colors", children: [
              "Skip ",
              kode
            ] }, kode)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 flex flex-col", children: [
          /* @__PURE__ */ jsxs("h5", { className: "text-white font-bold mb-3 flex items-center tracking-wide", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-terminal text-emerald-400 mr-2" }),
            " LIVE TERMINAL LOG"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-[#000000] border border-[#333333] rounded-xl p-4 flex-grow h-[420px] overflow-y-auto shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] custom-scrollbar", children: [
            logs.map((l, i) => /* @__PURE__ */ jsxs("div", { className: `text-[13px] mb-1 leading-relaxed ${l.type}`, children: [
              /* @__PURE__ */ jsxs("span", { className: "text-slate-500", children: [
                "[",
                l.time,
                "]"
              ] }),
              " ",
              l.msg
            ] }, i)),
            /* @__PURE__ */ jsx("div", { ref: terminalEndRef })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white/5 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-sm overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsxs("h5", { className: "text-white font-bold flex items-center tracking-wide", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-list-check text-cyan-400 mr-2" }),
            " DAFTAR PRE-ORDER (LIVE)"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold flex items-center uppercase tracking-wider", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-rotate fa-spin mr-2" }),
            " Auto-Sync Aktif"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto custom-scrollbar pb-2", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm text-center text-slate-300", children: [
          /* @__PURE__ */ jsx("thead", { className: "text-[11px] text-white uppercase bg-black/60 border-b-2 border-slate-700", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 rounded-tl-lg", children: "Waktu" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Ref ID" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Username" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Produk" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Tujuan" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Harga" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 rounded-tr-lg", children: "Aksi" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: poList.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: "8", className: "px-4 py-8 text-center text-slate-500", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-circle-notch fa-spin mr-2" }),
            " Memuat data real-time..."
          ] }) }) : poList.map((po, i) => {
            const wkt = new Date(po.tanggal).toLocaleTimeString("id-ID");
            return /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5 hover:bg-white/5 transition-colors", children: [
              /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-xs text-slate-500", children: wkt }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-3 font-bold text-cyan-400", children: po.ref_id }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-slate-400", children: po.username }),
              /* @__PURE__ */ jsxs("td", { className: "px-3 py-3 font-bold", children: [
                po.kode_produk,
                " ",
                /* @__PURE__ */ jsxs("sup", { className: "text-slate-500 text-[10px]", children: [
                  "P",
                  po.prioritas
                ] })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-3 font-mono text-white tracking-widest", children: po.tujuan }),
              /* @__PURE__ */ jsxs("td", { className: "px-3 py-3", children: [
                "Rp ",
                new Intl.NumberFormat("id-ID").format(po.harga)
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 border rounded text-[11px] font-bold ${getStatusBadge(po.status)}`, children: po.status }) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-3", children: po.status === "Menunggu" ? /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => cancelFromTable(po.ref_id),
                  title: "Batalkan & Refund",
                  className: "bg-transparent border border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-white px-2 py-1 rounded transition-colors",
                  children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-xmark" })
                }
              ) : /* @__PURE__ */ jsx("span", { className: "text-slate-600", children: "-" }) })
            ] }, i);
          }) })
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  KhfyWarStation as default
};
