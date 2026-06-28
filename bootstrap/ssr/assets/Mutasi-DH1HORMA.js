import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { Link } from "@inertiajs/react";
function Mutasi() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-slate-50", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black", children: "MUTASI SALDO" }),
    /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Segera Hadir" }),
    /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl", children: "Kembali" })
  ] });
}
export {
  Mutasi as default
};
