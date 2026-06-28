import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
function VpnManager({ products }) {
  const [editData, setEditData] = useState(null);
  const { data, setData, post, processing } = useForm({
    id: "",
    price_per_day: "",
    price_per_gb: "",
    price_per_ip: "",
    description: "",
    is_active: true
  });
  const openEdit = (p) => {
    setEditData(p);
    setData({
      id: p.id,
      price_per_day: p.price_per_day,
      price_per_gb: p.price_per_gb || 0,
      price_per_ip: p.price_per_ip || 0,
      description: p.description || "",
      is_active: p.is_active ? true : false
    });
  };
  const submit = (e) => {
    e.preventDefault();
    post("/admin/vpn-manager/update", {
      onSuccess: () => {
        setEditData(null);
        Swal.fire("Berhasil!", "Data Produk VPN telah diupdate", "success");
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50 p-6 font-sans", children: [
    /* @__PURE__ */ jsx(Head, { title: "Admin VPN - MilaStore" }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-black text-slate-800", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-server text-blue-600 mr-2" }),
            " VPN Manager"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-sm", children: "Atur harga Multi-Dimensi (Hari, GB, Limit IP) VPN V12." })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm", children: "Kembali" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-100 text-slate-600 font-bold uppercase text-xs", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "p-4", children: "Layanan" }),
          /* @__PURE__ */ jsx("th", { className: "p-4", children: "Tarif Dasar" }),
          /* @__PURE__ */ jsx("th", { className: "p-4", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "p-4 text-center", children: "Aksi" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: products.map((p) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50", children: [
          /* @__PURE__ */ jsxs("td", { className: "p-4 font-bold text-slate-800", children: [
            p.name,
            " ",
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-slate-400", children: p.protocol })
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "p-4 text-blue-600 font-bold", children: [
            "Rp ",
            Number(p.price_per_day).toLocaleString("id-ID"),
            "/Hari ",
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-400 font-medium", children: [
              "+ Rp ",
              Number(p.price_per_ip).toLocaleString("id-ID"),
              "/IP Extra"
            ] })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "p-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded-md text-[10px] font-bold ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`, children: p.is_active ? "AKTIF" : "NON-AKTIF" }) }),
          /* @__PURE__ */ jsx("td", { className: "p-4 text-center", children: /* @__PURE__ */ jsx("button", { onClick: () => openEdit(p), className: "bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold text-xs transition", children: "EDIT" }) })
        ] }, p.id)) })
      ] }) })
    ] }),
    editData && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl w-full max-w-md p-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-black mb-4", children: [
        "Edit ",
        editData.name
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-slate-500 mb-2", children: "Harga Per Hari (Rp)" }),
          /* @__PURE__ */ jsx("input", { type: "number", value: data.price_per_day, onChange: (e) => setData("price_per_day", e.target.value), className: "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold", required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-xs font-bold text-slate-500 mb-2", children: [
            "Harga Tambahan per Limit IP (Rp) - ",
            /* @__PURE__ */ jsx("i", { children: "Isi 0 jika gratis" })
          ] }),
          /* @__PURE__ */ jsx("input", { type: "number", value: data.price_per_ip, onChange: (e) => setData("price_per_ip", e.target.value), className: "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold", required: true })
        ] }),
        ["vmess", "vless", "trojan"].includes(editData.protocol) && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-slate-500 mb-2", children: "Harga Per GB (Rp)" }),
          /* @__PURE__ */ jsx("input", { type: "number", value: data.price_per_gb, onChange: (e) => setData("price_per_gb", e.target.value), className: "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold", required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-slate-500 mb-2", children: "Keterangan Layanan" }),
          /* @__PURE__ */ jsx("textarea", { value: data.description, onChange: (e) => setData("description", e.target.value), className: "w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm h-20", placeholder: "Cth: Dilarang Torrent." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsx("input", { type: "checkbox", checked: data.is_active, onChange: (e) => setData("is_active", e.target.checked), className: "w-5 h-5 rounded text-blue-600" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-700", children: "Layanan Aktif" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setEditData(null), className: "w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl", children: "Batal" }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, className: "w-full bg-blue-600 text-white font-bold py-3 rounded-xl", children: processing ? "Menyimpan..." : "Simpan" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  VpnManager as default
};
