import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
function Maintenance({ message }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-['Outfit'] text-center selection:bg-rose-500 selection:text-white", children: [
    /* @__PURE__ */ jsx(Head, { title: "Sistem Maintenance - MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "relative mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-rose-500 blur-3xl opacity-20 rounded-full animate-pulse" }),
      /* @__PURE__ */ jsx("div", { className: "w-28 h-28 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-5xl text-rose-500 relative z-10 shadow-2xl", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-person-digging animate-bounce" }) })
    ] }),
    /* @__PURE__ */ jsxs("h1", { className: "text-3xl md:text-4xl font-black text-white mb-3 tracking-widest uppercase", children: [
      "Under ",
      /* @__PURE__ */ jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500", children: "Maintenance" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm", children: /* @__PURE__ */ jsx("p", { className: "text-slate-300 text-sm md:text-base leading-relaxed font-medium", children: message || "MilaStore sedang melakukan pemeliharaan sistem. Kami akan kembali lebih cepat dari tebakan Anda!" }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 px-6 py-2.5 bg-slate-800/80 border border-slate-700 text-slate-400 rounded-full text-xs font-black tracking-[0.2em]", children: "MOHON TUNGGU SEBENTAR" })
  ] });
}
export {
  Maintenance as default
};
