import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import "axios";
import "moment";
function War({ auth, stockData }) {
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, header: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "Menu WAR XLA - KhfyPay" }), children: [
    /* @__PURE__ */ jsx(Head, { title: "WAR XLA Khfy" }),
    /* @__PURE__ */ jsx("div", { className: "py-12", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-white overflow-hidden shadow-sm sm:rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-slate-800", children: "📡 Live Cek Stok Akrab XL/Axis" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => window.location.reload(), className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-rotate-right mr-2" }),
          " Refresh Stok"
        ] })
      ] }),
      stockData?.status === false && stockData?.message && /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4", children: [
        /* @__PURE__ */ jsx("p", { className: "font-bold", children: "Gagal Menarik Data" }),
        /* @__PURE__ */ jsx("p", { children: stockData.message })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner border border-slate-700", children: /* @__PURE__ */ jsx("pre", { className: "text-emerald-400 font-mono text-sm leading-relaxed", children: JSON.stringify(stockData, null, 2) }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-xs text-slate-500 italic", children: "* Data ini ditarik secara real-time langsung dari server KhfyPay." })
    ] }) }) })
  ] });
}
export {
  War as default
};
