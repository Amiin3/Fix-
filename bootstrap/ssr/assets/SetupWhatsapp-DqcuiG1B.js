import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { useForm, Head } from "@inertiajs/react";
import Swal from "sweetalert2";
function SetupWhatsapp({ email }) {
  const { data, setData, post, processing, errors } = useForm({
    email,
    whatsapp: ""
  });
  const submit = (e) => {
    e.preventDefault();
    Swal.fire({ title: "Mendaftarkan Nomor...", didOpen: () => {
      Swal.showLoading();
    } });
    post(route("whatsapp.send"), {
      onSuccess: () => {
        Swal.close();
      },
      onError: (err) => {
        Swal.fire({ icon: "error", title: "Gagal", text: err.whatsapp || "Terjadi kesalahan!" });
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-rose-50 via-white to-teal-50 flex items-center justify-center p-6 font-sans", children: [
    /* @__PURE__ */ jsx(Head, { title: "Lengkapi WA - Mila Store" }),
    /* @__PURE__ */ jsx("div", { className: "w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-white", children: /* @__PURE__ */ jsxs("div", { className: "p-8 sm:p-10 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white shadow-xl shadow-emerald-200 mb-6", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.5", d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black text-slate-800 tracking-tight mb-2", children: "Lengkapi Data" }),
      /* @__PURE__ */ jsx("p", { className: "text-[13px] text-slate-500 font-medium mb-8", children: "Masukkan nomor WhatsApp Anda untuk menerima kode OTP." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: data.whatsapp,
              onChange: (e) => setData("whatsapp", e.target.value),
              className: "w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-bold",
              placeholder: "Contoh: 081234567890",
              required: true
            }
          ),
          errors.whatsapp && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-2 font-bold", children: errors.whatsapp })
        ] }),
        /* @__PURE__ */ jsx("button", { disabled: processing, className: "w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[13px] font-black uppercase tracking-widest py-4 px-4 rounded-2xl shadow-lg shadow-emerald-200 transform transition-all active:scale-[0.98]", children: processing ? "MENGIRIM KODE..." : "KIRIM OTP WHATSAPP" })
      ] })
    ] }) })
  ] });
}
export {
  SetupWhatsapp as default
};
