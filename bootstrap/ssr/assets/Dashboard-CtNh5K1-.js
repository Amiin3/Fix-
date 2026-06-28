import { jsx } from "react/jsx-runtime";
import "react";
import { Head } from "@inertiajs/react";
import "sweetalert2";
function Dashboard({ auth, stats, recent_deposits, success, error }) {
  return /* @__PURE__ */ jsx("div", { className: "p-6 bg-slate-900 min-h-screen text-white", children: /* @__PURE__ */ jsx(Head, { title: "Admin Panel" }) });
}
export {
  Dashboard as default
};
