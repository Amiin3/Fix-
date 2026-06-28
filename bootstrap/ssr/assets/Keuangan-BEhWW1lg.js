import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useForm, Head, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
function Keuangan({ stats, portofolio, deposits, users, success, error }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, setData, post, processing, reset } = useForm({
    username: "",
    aksi: "tambah",
    jumlah: ""
  });
  useEffect(() => {
    if (success) Swal.fire("Berhasil!", success, "success");
    if (error) Swal.fire("Oops!", error, "error");
  }, [success, error]);
  const submit = (e) => {
    e.preventDefault();
    post("/admin/keuangan/update", {
      onSuccess: () => reset("jumlah", "username")
    });
  };
  const filteredUsers = users.filter(
    (user) => user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const autoFillUser = (name) => {
    setData("username", name);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-6 bg-gray-50 min-h-screen text-gray-800 font-sans", children: [
    /* @__PURE__ */ jsx(Head, { title: "Manajemen Keuangan" }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-blue-100 p-3 rounded-lg text-blue-600", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold text-gray-900", children: "Manajemen Keuangan" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Pantau arus kas dan kelola saldo member MilaStore" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Link, { href: "/admin/dashboard", className: "px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition shadow-sm", children: "← KEMBALI" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs font-bold tracking-wide mb-1 uppercase", children: "Total Saldo Member" }),
        /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-black text-gray-800", children: [
          "Rp ",
          new Intl.NumberFormat("id-ID").format(stats.total_saldo)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs font-bold tracking-wide mb-1 uppercase", children: "Deposit Sukses Hari Ini" }),
        /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-black text-emerald-600", children: [
          "Rp ",
          new Intl.NumberFormat("id-ID").format(stats.depo_hari_ini)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs font-bold tracking-wide mb-1 uppercase", children: "Deposit Pending" }),
        /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-black text-amber-500", children: [
          stats.depo_pending,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Trx" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-xs font-bold tracking-wide mb-1 uppercase", children: "Total Member Aktif" }),
        /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-black text-purple-600", children: [
          stats.total_member,
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "User" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-extrabold text-gray-800 flex items-center gap-2 mb-6", children: [
        /* @__PURE__ */ jsx("span", { className: "bg-indigo-100 text-indigo-600 p-1.5 rounded-md", children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" }),
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" })
        ] }) }),
        "Portofolio & Performa Finansial (Keseluruhan)"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-indigo-50 to-white", children: [
          /* @__PURE__ */ jsx("p", { className: "text-indigo-500 text-xs font-bold uppercase mb-1", children: "Total Dana Masuk (All Time)" }),
          /* @__PURE__ */ jsxs("h4", { className: "text-2xl font-black text-indigo-700", children: [
            "Rp ",
            new Intl.NumberFormat("id-ID").format(portofolio.total_masuk)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-emerald-50 to-white", children: [
          /* @__PURE__ */ jsx("p", { className: "text-emerald-500 text-xs font-bold uppercase mb-1", children: "Dana Terpakai / Omset" }),
          /* @__PURE__ */ jsxs("h4", { className: "text-2xl font-black text-emerald-700", children: [
            "Rp ",
            new Intl.NumberFormat("id-ID").format(portofolio.dana_terpakai)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-amber-50 to-white", children: [
          /* @__PURE__ */ jsx("p", { className: "text-amber-500 text-xs font-bold uppercase mb-1", children: "Saldo Mengendap (Liabilities)" }),
          /* @__PURE__ */ jsxs("h4", { className: "text-2xl font-black text-amber-700", children: [
            "Rp ",
            new Intl.NumberFormat("id-ID").format(portofolio.saldo_mengendap)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Rasio Dana Terpakai (",
            portofolio.persentase_terpakai,
            "%)"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Saldo Mengendap (",
            100 - portofolio.persentase_terpakai,
            "%)"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full bg-amber-200 rounded-full h-4 flex overflow-hidden shadow-inner", children: /* @__PURE__ */ jsx("div", { className: "bg-emerald-500 h-4 rounded-l-full transition-all duration-1000", style: { width: `${portofolio.persentase_terpakai}%` } }) }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-3 text-center", children: "Visualisasi perbandingan antara total deposit yang sudah dibelanjakan oleh member dengan saldo yang masih utuh di sistem." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-1 space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-gray-100", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-extrabold mb-5 text-gray-800 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "bg-blue-100 text-blue-600 p-1.5 rounded-md", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }) }),
            "Update Saldo Cepat"
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "flex flex-col gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-gray-500 uppercase mb-1 block", children: "Nama / Email Member" }),
              /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Klik dari tabel di samping ➡", className: "w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition", value: data.username, onChange: (e) => setData("username", e.target.value), required: true })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-gray-500 uppercase mb-1 block", children: "Tindakan" }),
                /* @__PURE__ */ jsxs("select", { className: "w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-bold", value: data.aksi, onChange: (e) => setData("aksi", e.target.value), children: [
                  /* @__PURE__ */ jsx("option", { value: "tambah", children: "TAMBAH (+)" }),
                  /* @__PURE__ */ jsx("option", { value: "kurang", children: "KURANG (-)" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-gray-500 uppercase mb-1 block", children: "Nominal (Rp)" }),
                /* @__PURE__ */ jsx("input", { type: "number", placeholder: "10000", className: "w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition", value: data.jumlah, onChange: (e) => setData("jumlah", e.target.value), required: true })
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, className: "mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-lg font-bold shadow-md shadow-blue-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50", children: processing ? "MEMPROSES..." : "EKSEKUSI SALDO" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-6 rounded-xl shadow-sm border border-gray-100", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-extrabold mb-4 text-gray-800", children: "Riwayat Deposit Terbaru" }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsx("table", { className: "w-full text-left text-sm", children: /* @__PURE__ */ jsx("tbody", { children: (deposits || []).length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "py-4 text-center text-gray-400", children: "Belum ada deposit masuk." }) }) : deposits.map((d, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-50 last:border-0 hover:bg-gray-50 transition", children: [
            /* @__PURE__ */ jsxs("td", { className: "py-3", children: [
              /* @__PURE__ */ jsx("div", { className: "font-bold text-gray-800", children: d.buyer || "Guest" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: new Date(d.created_at).toLocaleDateString("id-ID") })
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "py-3 text-right", children: [
              /* @__PURE__ */ jsxs("div", { className: "font-bold text-emerald-600", children: [
                "+ Rp ",
                new Intl.NumberFormat("id-ID").format(d.amount)
              ] }),
              /* @__PURE__ */ jsx("span", { className: `inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${d.status === "Sukses" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`, children: d.status })
            ] })
          ] }, i)) }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-span-1 lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-extrabold text-gray-800 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "bg-purple-100 text-purple-600 p-1.5 rounded-md", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) }) }),
            "Data Saldo Member Aktif"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative w-full sm:w-64", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Cari nama / email...",
                className: "pl-10 w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto border border-gray-100 rounded-lg max-h-[600px] overflow-y-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left relative", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0 shadow-sm", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "p-4 font-bold", children: "Member Info" }),
            /* @__PURE__ */ jsx("th", { className: "p-4 font-bold", children: "No. HP" }),
            /* @__PURE__ */ jsx("th", { className: "p-4 font-bold text-right", children: "Saldo Saat Ini" }),
            /* @__PURE__ */ jsx("th", { className: "p-4 font-bold text-center", children: "Aksi" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100", children: filteredUsers.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "4", className: "p-8 text-center text-gray-400 font-medium", children: "Member tidak ditemukan." }) }) : filteredUsers.map((u, i) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-blue-50/50 transition", children: [
            /* @__PURE__ */ jsxs("td", { className: "p-4", children: [
              /* @__PURE__ */ jsx("div", { className: "font-bold text-gray-800", children: u.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: u.email })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "p-4 text-sm text-gray-600", children: u.phone || "-" }),
            /* @__PURE__ */ jsx("td", { className: "p-4 text-right", children: /* @__PURE__ */ jsxs("div", { className: "font-black text-gray-800", children: [
              "Rp ",
              new Intl.NumberFormat("id-ID").format(u.saldo)
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "p-4 text-center", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => autoFillUser(u.name),
                className: "bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded text-xs font-bold transition whitespace-nowrap",
                children: "Pilih & Update"
              }
            ) })
          ] }, i)) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  Keuangan as default
};
