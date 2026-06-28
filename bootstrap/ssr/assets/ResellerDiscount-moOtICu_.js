import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { useForm, Head } from "@inertiajs/react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { P as PrimaryButton } from "./PrimaryButton-DgVfVBwo.js";
import { T as TextInput } from "./TextInput-DDsS-qQQ.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import "axios";
import "moment";
function ResellerDiscount({ auth, khfy, adam, kaje }) {
  const { data, setData, post, processing } = useForm({ khfy, adam, kaje });
  const submit = (e) => {
    e.preventDefault();
    post(route("admin.reseller.discounts.update"));
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, header: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "Setting Diskon Reseller Flat" }), children: [
    /* @__PURE__ */ jsx(Head, { title: "Diskon Reseller" }),
    /* @__PURE__ */ jsx("div", { className: "py-12", children: /* @__PURE__ */ jsx("div", { className: "max-w-4xl mx-auto sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "bg-white overflow-hidden shadow-sm sm:rounded-lg p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-6 border-l-4 border-blue-500 bg-blue-50 p-4", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-blue-700", children: [
        /* @__PURE__ */ jsx("strong", { children: "Info Sultan:" }),
        " Angka yang dimasukkan di sini akan ",
        /* @__PURE__ */ jsx("b", { children: "otomatis mengurangi harga jual tabel" }),
        " khusus untuk member berlevel ",
        /* @__PURE__ */ jsx("b", { children: "Reseller" }),
        ". Harga Digiflazz tidak akan terpengaruh."
      ] }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "khfy", value: "Potongan Khfy (Rp)" }),
          /* @__PURE__ */ jsx(TextInput, { id: "khfy", type: "number", className: "mt-1 block w-full", value: data.khfy, onChange: (e) => setData("khfy", e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "adam", value: "Potongan Adam / PPOB (Rp)" }),
          /* @__PURE__ */ jsx(TextInput, { id: "adam", type: "number", className: "mt-1 block w-full", value: data.adam, onChange: (e) => setData("adam", e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "kaje", value: "Potongan Kaje (Rp)" }),
          /* @__PURE__ */ jsx(TextInput, { id: "kaje", type: "number", className: "mt-1 block w-full", value: data.kaje, onChange: (e) => setData("kaje", e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, children: "Simpan Konfigurasi" }) })
      ] })
    ] }) }) })
  ] });
}
export {
  ResellerDiscount as default
};
