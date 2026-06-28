import { jsxs, jsx } from "react/jsx-runtime";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { Head } from "@inertiajs/react";
import "react";
import "axios";
import "moment";
function Ketentuan({ auth }) {
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Syarat & Ketentuan - MilaStore" }),
    /* @__PURE__ */ jsx("div", { className: "py-12 px-6 max-w-2xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black text-slate-800 mb-6", children: "Syarat & Ketentuan" }),
      /* @__PURE__ */ jsxs("div", { className: "prose prose-slate text-sm font-medium leading-relaxed", children: [
        /* @__PURE__ */ jsx("p", { children: "1. Transaksi di MilaStore diproses otomatis oleh sistem H2H." }),
        /* @__PURE__ */ jsx("p", { children: "2. Saldo yang sudah dideposit tidak dapat diuangkan kembali." }),
        /* @__PURE__ */ jsx("p", { children: "3. Pengguna wajib menjaga kerahasiaan PIN dan Password." }),
        /* @__PURE__ */ jsx("p", { children: "4. MilaStore tidak bertanggung jawab atas kesalahan input nomor tujuan oleh pengguna." })
      ] })
    ] }) })
  ] });
}
export {
  Ketentuan as default
};
