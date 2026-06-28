import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { useForm, Head } from "@inertiajs/react";
function Debug({ tables, badProducts, logs, env }) {
  const { post, processing } = useForm();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#0f172a] text-slate-300 p-4 md:p-8 font-mono text-sm", children: [
    /* @__PURE__ */ jsx(Head, { title: "ULTIMATE DEBUG - AMIFI" }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-8 border-b border-slate-700 pb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black text-red-500 tracking-tighter", children: "MASTER DEBUG ULTIMATE v2.0" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: "System Diagnostik Amifi Store - 2026" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => post("/debug-system/clear"),
          disabled: processing,
          className: "bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95",
          children: processing ? "⚡ CLEANING..." : "🧹 PURGE SYSTEM CACHE"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 p-5 rounded-2xl border border-slate-700", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-blue-400 font-black mb-4 flex items-center", children: "📡 DATABASE INTEGRITY" }),
          Object.entries(tables).map(([name, data]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3 p-2 bg-slate-900/50 rounded-lg", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-400", children: name }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("div", { className: data.exists ? "text-emerald-400" : "text-red-500", children: data.exists ? `✅ ${data.count} Rows` : "❌ MISSING" }),
              !data.has_provider && data.exists && /* @__PURE__ */ jsx("div", { className: "text-[10px] text-amber-500", children: "⚠ No Provider Col" })
            ] })
          ] }, name))
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 p-5 rounded-2xl border border-red-900/30", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-red-400 font-black mb-4", children: "🚨 BIANG KEROK BLANK (BAD DATA)" }),
          badProducts.length > 0 ? badProducts.map((p) => /* @__PURE__ */ jsxs("div", { className: "text-[10px] mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded", children: [
            "[ID:",
            p.id,
            "] ",
            p.nama_layanan,
            " (",
            p.kode_layanan,
            ") - ",
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Provider Kosong!" })
          ] }, p.id)) : /* @__PURE__ */ jsx("div", { className: "text-emerald-500 text-xs italic", children: "Data Provider Bersih." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 p-5 rounded-2xl border border-slate-700 h-full", children: [
        /* @__PURE__ */ jsxs("h3", { className: "text-amber-400 font-black mb-4 flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "📜 REAL-TIME ERROR HEADS" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-500", children: "storage/logs/laravel.log" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4 overflow-y-auto max-h-[600px] pr-2", children: logs.length > 0 ? logs.map((log, i) => /* @__PURE__ */ jsxs("div", { className: "p-4 bg-black/40 rounded-xl border-l-4 border-red-600 font-sans text-xs leading-relaxed", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-red-400 font-bold mb-1", children: [
            "ERROR RECORD #",
            i + 1
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-slate-300", children: log })
        ] }, i)) : /* @__PURE__ */ jsx("div", { className: "text-center py-20 text-slate-600 italic", children: "Tidak ada error yang terdeteksi. Sistem stabil." }) })
      ] }) })
    ] })
  ] });
}
export {
  Debug as default
};
