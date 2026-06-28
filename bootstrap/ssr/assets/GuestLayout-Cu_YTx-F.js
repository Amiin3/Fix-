import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
function ApplicationLogo(props) {
  return /* @__PURE__ */ jsxs("span", { ...props, className: "font-black text-xl tracking-tighter text-blue-600", children: [
    "Mila",
    /* @__PURE__ */ jsx("span", { className: "text-slate-800", children: "Store" })
  ] });
}
function GuestLayout({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Link, { href: "/", children: /* @__PURE__ */ jsx(ApplicationLogo, { className: "h-20 w-20 fill-current text-gray-500" }) }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg", children })
  ] });
}
export {
  GuestLayout as G
};
