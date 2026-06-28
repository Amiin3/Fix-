import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { useForm, Head } from "@inertiajs/react";
function PaymentSetting({ methods }) {
  const { data, setData, post, processing, recentStatus } = useForm({
    methods: methods || []
  });
  const handleInputChange = (index, field, value) => {
    const updatedMethods = [...data.methods];
    updatedMethods[index][field] = value;
    setData("methods", updatedMethods);
  };
  const submit = (e) => {
    e.preventDefault();
    post("/admin/payment-settings", {
      preserveScroll: true,
      onSuccess: () => alert("Konfigurasi MilaPay Berhasil Disimpan!")
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-4 md:p-8 bg-slate-50 min-h-screen font-sans", children: [
    /* @__PURE__ */ jsx(Head, { title: "MilaPay V12 Settings" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-black italic tracking-tighter uppercase", children: [
              "MILA",
              /* @__PURE__ */ jsx("span", { className: "text-yellow-400", children: "PAY" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-indigo-400 text-xl", children: "V12" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1", children: "Payment Gateway Control Center" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex h-3 w-3", children: [
              /* @__PURE__ */ jsx("span", { className: "animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75" }),
              /* @__PURE__ */ jsx("span", { className: "relative inline-flex rounded-full h-3 w-3 bg-green-500" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-green-400", children: "System Live & Synchronized" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "p-6 md:p-10 space-y-8", children: [
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: data.methods.map((method, index) => /* @__PURE__ */ jsxs("div", { className: "group relative bg-slate-50 rounded-[2rem] p-6 border border-slate-100 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-6 flex items-center gap-2", children: /* @__PURE__ */ jsxs("span", { className: `px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${method.type === "QRIS" ? "bg-indigo-100 text-indigo-600" : "bg-orange-100 text-orange-600"}`, children: [
              method.type,
              " MODE"
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4 mt-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Nama Tampilan Website" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    className: "w-full mt-1 p-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-0 focus:border-indigo-500 transition-all shadow-sm",
                    value: method.name,
                    onChange: (e) => handleInputChange(index, "name", e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: method.type === "QRIS" ? "Payload Static QRIS (Raw)" : "Nomor Rekening" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    className: "w-full mt-1 p-3 bg-white border-2 border-slate-100 rounded-xl text-xs font-mono text-slate-600 focus:ring-0 focus:border-indigo-500 transition-all shadow-sm",
                    rows: method.type === "QRIS" ? 3 : 1,
                    value: method.value || "",
                    onChange: (e) => handleInputChange(index, "value", e.target.value),
                    placeholder: method.type === "QRIS" ? "000201010211..." : "Masukkan No Rek..."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1", children: "Atas Nama (Owner)" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    className: "w-full mt-1 p-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:ring-0 focus:border-indigo-500 transition-all shadow-sm",
                    value: method.holder || "",
                    onChange: (e) => handleInputChange(index, "holder", e.target.value)
                  }
                )
              ] })
            ] })
          ] }, method.id)) }),
          /* @__PURE__ */ jsx("div", { className: "pt-6 border-t border-slate-100", children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "group relative w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] overflow-hidden transition-all hover:bg-indigo-700 active:scale-[0.98] shadow-2xl shadow-slate-200",
              children: [
                /* @__PURE__ */ jsx("div", { className: "relative z-10 flex items-center justify-center gap-2 tracking-[0.2em]", children: processing ? "SYNCING DATA..." : "🚀 UPDATE & SIMPAN KONFIGURASI" }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" })
              ]
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-center mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]", children: "MilaPay Secure Engine © 2026" })
    ] }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            ` } })
  ] });
}
export {
  PaymentSetting as default
};
