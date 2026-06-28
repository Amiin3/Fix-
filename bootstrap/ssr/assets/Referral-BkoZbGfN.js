import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
import "axios";
import "moment";
function Referral({ auth, user: userProp, downlines = [], komisi = 0 }) {
  const user = userProp || auth.user;
  const refCode = user.kode_referral || "KLIK_REFRESH...";
  const refLink = `${window.location.origin}/register?ref=${refCode}`;
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(n || 0);
  const copyLink = () => {
    if (!user.kode_referral) return Swal.fire("Error", "Kode belum siap, coba refresh", "error");
    navigator.clipboard.writeText(refLink);
    Swal.fire({ title: "Tersalin!", text: "Link Referral siap dibagikan!", icon: "success", timer: 1500, showConfirmButton: false });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Referral Sultan - MilaStore" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50 pb-32 pt-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto px-5 space-y-6", children: [
      /* @__PURE__ */ jsxs(Link, { href: "/profile", className: "flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 w-max", children: [
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left" }),
        " Kembali"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-indigo-900 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-xl", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-black uppercase tracking-widest opacity-60", children: "Komisi Sultan" }),
        /* @__PURE__ */ jsxs("h2", { className: "text-4xl font-black", children: [
          "Rp ",
          formatRp(komisi)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-black text-slate-800 mb-4", children: "Link Referral" }),
        /* @__PURE__ */ jsxs("div", { className: "flex bg-slate-100 p-2 rounded-2xl items-center", children: [
          /* @__PURE__ */ jsx("input", { type: "text", readOnly: true, value: refLink, className: "flex-1 bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0" }),
          /* @__PURE__ */ jsx("button", { onClick: copyLink, className: "bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs", children: "Salin" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Referral as default
};
