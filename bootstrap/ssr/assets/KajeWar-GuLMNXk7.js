import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
function KajeWar({ initialQueue, stats }) {
  const [logs, setLogs] = useState("Menghubungkan ke satelit...");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(route("admin.kaje.war.logs"));
        setLogs(res.data.logs);
      } catch (e) {
        setLogs("Gagal menarik log...");
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 4e3);
    return () => clearInterval(interval);
  }, []);
  const doAction = (id, action) => {
    if (confirm(`Konfirmasi tindakan ${action}?`)) {
      setLoading(true);
      router.post(route("admin.kaje.war.update"), { id, action }, {
        onFinish: () => setLoading(false)
      });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: `p-4 bg-slate-950 min-h-screen text-slate-200 ${loading ? "opacity-50 pointer-events-none" : ""}`, children: [
    /* @__PURE__ */ jsx(Head, { title: "CONTROL CENTER" }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-black text-white italic", children: "🛰️ WAR COMMAND" }),
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-500 uppercase tracking-widest", children: "Kaje Provider Gateway" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => router.post(route("admin.kaje.war.poll")), className: "bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full font-black text-xs shadow-lg shadow-blue-500/20", children: "🚀 JALANKAN BOT" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-black rounded-2xl border border-slate-800 overflow-hidden mb-6 shadow-2xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-slate-500", children: "system_monitor.sh" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-slate-700" }),
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-slate-700" }),
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-4 h-40 overflow-y-auto font-mono text-[10px] text-cyan-400/80 leading-relaxed", children: /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap", children: logs }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-[11px]", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-slate-800/50 text-slate-500 uppercase text-[9px] font-bold", children: [
        /* @__PURE__ */ jsx("th", { className: "p-4", children: "Target / User" }),
        /* @__PURE__ */ jsx("th", { className: "p-4 text-center", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "p-4 text-center", children: "Intervensi" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-800", children: initialQueue.map((item) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-800/30", children: [
        /* @__PURE__ */ jsxs("td", { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "font-black text-white", children: item.tujuan }),
          /* @__PURE__ */ jsxs("div", { className: "text-slate-500", children: [
            item.username,
            " - ",
            item.sku
          ] })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "p-4 text-center", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${item.status === "Sukses" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`, children: item.status }) }),
        /* @__PURE__ */ jsx("td", { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => doAction(item.id, "retry"), className: "bg-slate-800 hover:bg-amber-600 p-2 rounded-lg transition-colors", children: "🔄" }),
          /* @__PURE__ */ jsx("button", { onClick: () => doAction(item.id, "success"), className: "bg-slate-800 hover:bg-green-600 p-2 rounded-lg", children: "✅" }),
          /* @__PURE__ */ jsx("button", { onClick: () => doAction(item.id, "failed"), className: "bg-slate-800 hover:bg-red-600 p-2 rounded-lg", children: "❌" })
        ] }) })
      ] }, item.id)) })
    ] }) })
  ] });
}
export {
  KajeWar as default
};
