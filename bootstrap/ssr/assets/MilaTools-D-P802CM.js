import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
function MilaTools() {
  const [activeTab, setActiveTab] = useState("xla");
  const [stokXLA, setStokXLA] = useState([]);
  const [stokXDA, setStokXDA] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loadingStok, setLoadingStok] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [searchArea, setSearchArea] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  useEffect(() => {
    axios.get("/api/areaxl/area-all").then((res) => {
      if (res.data.status === "success") setAreas(res.data.data);
    });
  }, []);
  const fetchStok = async (isSilent = false) => {
    if (!isSilent) setLoadingStok(true);
    try {
      const res = await axios.get("/api/areaxl/stok-filter");
      if (res.data.status === "success") {
        setStokXLA(res.data.data.filter((s) => s.kategori === "XLA"));
        setStokXDA(res.data.data.filter((s) => s.kategori === "KDA_PDAP"));
        const now = /* @__PURE__ */ new Date();
        setLastUpdate(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch (e) {
    }
    if (!isSilent) setLoadingStok(false);
  };
  useEffect(() => {
    fetchStok();
    if (autoRefresh) {
      intervalRef.current = setInterval(() => fetchStok(true), 5e3);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh]);
  const handleRefresh = () => fetchStok(false);
  const toggleAutoRefresh = () => {
    setAutoRefresh((prev) => {
      if (prev) clearInterval(intervalRef.current);
      else intervalRef.current = setInterval(() => fetchStok(true), 5e3);
      return !prev;
    });
  };
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 250);
  };
  const StatusBadge = ({ status }) => {
    let color, icon, glow;
    if (status === "Tersedia") {
      color = "bg-emerald-100 text-emerald-700 border-emerald-300";
      icon = "✓";
      glow = "shadow-[0_0_8px_rgba(16,185,129,0.3)]";
    } else if (status === "Kosong") {
      color = "bg-rose-100 text-rose-700 border-rose-300";
      icon = "✗";
      glow = "shadow-[0_0_8px_rgba(244,63,94,0.3)]";
    } else {
      color = "bg-amber-100 text-amber-700 border-amber-300";
      icon = "⚠";
      glow = "shadow-[0_0_8px_rgba(245,158,11,0.3)]";
    }
    return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border rounded-full ${color} ${glow}`, children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm", children: icon }),
      " ",
      status
    ] });
  };
  const ShimmerRow = () => /* @__PURE__ */ jsx("div", { className: "animate-shimmer bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 bg-[length:200%_100%] h-12 w-full rounded-sm" });
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-[#003366] via-[#0066CC] to-[#0099FF] text-white font-sans overflow-x-hidden relative", children: [
    /* @__PURE__ */ jsx(Head, { title: "Mila Store | XL Terminal Ultimate" }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 overflow-hidden pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-[100px] animate-pulse" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300/20 rounded-full blur-[100px] animate-pulse delay-1000" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px]" })
    ] }),
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-[#003366]/90 via-[#0066CC]/90 to-[#0099FF]/90 border-b border-white/20 shadow-xl", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/XL_Axiata_logo.svg/2560px-XL_Axiata_logo.svg.png",
            alt: "XL Axiata",
            className: "h-10 w-auto object-contain drop-shadow-lg",
            onError: (e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/120x40?text=XL";
            }
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "w-px h-8 bg-white/30" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-black tracking-tight text-white drop-shadow-md", children: "Mila Store" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-white/80 font-mono tracking-widest", children: "TERMINAL REAL-TIME PREMIUM" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-inner", children: [
          /* @__PURE__ */ jsxs("span", { className: "relative flex h-2.5 w-2.5", children: [
            /* @__PURE__ */ jsx("span", { className: `animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${!autoRefresh && "hidden"}` }),
            /* @__PURE__ */ jsx("span", { className: `relative inline-flex rounded-full h-2.5 w-2.5 ${autoRefresh ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-white/50"}` })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-mono font-semibold text-white/90 tracking-wider", children: autoRefresh ? `LIVE ${lastUpdate}` : "JEDA" })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: toggleAutoRefresh, className: `text-xs font-mono font-bold px-4 py-1.5 rounded-full transition-all duration-300 ${autoRefresh ? "bg-white/20 text-white border border-white/30 hover:bg-white/30 hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]" : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/20"}`, children: autoRefresh ? "⏸ JEDA" : "▶ OTOMATIS" }),
        /* @__PURE__ */ jsx("button", { onClick: handleRefresh, className: "text-xs font-mono font-bold px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 hover:bg-white/20 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-all duration-300", children: "⟳ SEGAR" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 border-b border-white/20 mb-8 pb-0", children: [
        { id: "xla", label: "[ STOK XLA ]" },
        { id: "xda", label: "[ STOK XDA ]" },
        { id: "area", label: "[ CEK AREA AKRAB ]" }
      ].map((tab) => /* @__PURE__ */ jsxs("button", { onClick: () => handleTabChange(tab.id), className: `relative px-7 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab.id ? "text-white" : "text-white/60 hover:text-white/90"}`, children: [
        tab.label,
        activeTab === tab.id && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-blue-300 rounded-full animate-pulse shadow-[0_0_8px_white]" })
      ] }, tab.id)) }),
      /* @__PURE__ */ jsxs("div", { className: `transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] transform ${isTransitioning ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"}`, children: [
        activeTab === "xla" && /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black text-white uppercase tracking-wider flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-white rounded-full animate-pulse" }),
              " Status Provider XLA"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono font-bold text-white/60 bg-white/10 px-2 py-1 rounded-full border border-white/20", children: [
              "ITEM: ",
              stokXLA.length
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
            /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-[#003366]/80 backdrop-blur-sm z-10", children: /* @__PURE__ */ jsxs("tr", { className: "text-white/60 text-[10px] uppercase tracking-widest border-b border-white/10", children: [
              /* @__PURE__ */ jsx("th", { className: "py-3 px-6 font-bold", children: "KODE SKU" }),
              /* @__PURE__ */ jsx("th", { className: "py-3 px-6 font-bold", children: "DESKRIPSI" }),
              /* @__PURE__ */ jsx("th", { className: "py-3 px-6 font-bold text-center", children: "STATUS" }),
              /* @__PURE__ */ jsx("th", { className: "py-3 px-6 font-bold text-right", children: "KETERSEDIAAN" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: loadingStok ? Array(5).fill().map((_, i) => /* @__PURE__ */ jsx(ShimmerRow, {}, i)) : stokXLA.length > 0 ? stokXLA.map((item, i) => /* @__PURE__ */ jsxs("tr", { className: "group hover:bg-white/5 transition-colors duration-200", children: [
              /* @__PURE__ */ jsx("td", { className: "py-3 px-6 font-bold text-white whitespace-nowrap text-sm font-mono", children: item.kode }),
              /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-white/80 text-sm group-hover:text-white/90", children: item.nama }),
              /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-center", children: /* @__PURE__ */ jsx(StatusBadge, { status: item.status }) }),
              /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-right text-xs font-mono font-bold text-white/80", children: item.stok_angka })
            ] }, i)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "4", className: "py-12 text-center text-white/40 font-mono text-sm", children: "TIDAK ADA DATA" }) }) })
          ] }) })
        ] }),
        activeTab === "xda" && /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm font-black text-white uppercase tracking-wider flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-white rounded-full animate-pulse" }),
              " Stok Live XDA (PDAP, KDA, PCRL)"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-mono font-bold text-white/60 bg-white/10 px-2 py-1 rounded-full border border-white/20", children: [
              "ITEM: ",
              stokXDA.length
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
            /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-[#003366]/80 backdrop-blur-sm z-10", children: /* @__PURE__ */ jsxs("tr", { className: "text-white/60 text-[10px] uppercase tracking-widest border-b border-white/10", children: [
              /* @__PURE__ */ jsx("th", { className: "py-3 px-6 font-bold", children: "KODE SKU" }),
              /* @__PURE__ */ jsx("th", { className: "py-3 px-6 font-bold", children: "DESKRIPSI" }),
              /* @__PURE__ */ jsx("th", { className: "py-3 px-6 font-bold text-center", children: "STATUS" }),
              /* @__PURE__ */ jsx("th", { className: "py-3 px-6 font-bold text-right", children: "KUANTITAS" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: loadingStok ? Array(5).fill().map((_, i) => /* @__PURE__ */ jsx(ShimmerRow, {}, i)) : stokXDA.length > 0 ? stokXDA.map((item, i) => /* @__PURE__ */ jsxs("tr", { className: "group hover:bg-white/5 transition-colors duration-200", children: [
              /* @__PURE__ */ jsx("td", { className: "py-3 px-6 font-bold text-white whitespace-nowrap text-sm font-mono", children: item.kode }),
              /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-white/80 text-sm group-hover:text-white/90", children: item.nama }),
              /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-center", children: /* @__PURE__ */ jsx(StatusBadge, { status: item.status }) }),
              /* @__PURE__ */ jsx("td", { className: "py-3 px-6 text-right text-sm font-mono font-black text-white/90", children: item.stok_angka })
            ] }, i)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "4", className: "py-12 text-center text-white/40 font-mono text-sm", children: "TIDAK ADA DATA" }) }) })
          ] }) })
        ] }),
        activeTab === "area" && /* @__PURE__ */ jsxs("div", { className: "animate-fadeIn", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-center gap-4 mb-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-black text-white uppercase tracking-wider", children: "Database Wilayah Akrab" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("input", { type: "text", value: searchArea, onChange: (e) => setSearchArea(e.target.value), placeholder: "Cari kota / wilayah...", className: "w-full sm:w-80 bg-white/10 border border-white/20 text-white rounded-full px-4 py-2 text-xs font-mono focus:border-white/50 outline-none placeholder-white/40 uppercase transition-all pl-9 backdrop-blur-sm" }),
              /* @__PURE__ */ jsx("svg", { className: "absolute left-3 top-2.5 w-4 h-4 text-white/40", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left border-collapse", children: [
            /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-[#003366]/80 backdrop-blur-sm z-10", children: /* @__PURE__ */ jsxs("tr", { className: "text-white/60 text-[10px] uppercase tracking-widest border-b border-white/10", children: [
              /* @__PURE__ */ jsx("th", { className: "py-3 px-6 font-bold w-1/4", children: "ZONA" }),
              /* @__PURE__ */ jsx("th", { className: "py-3 px-6 font-bold", children: "WILAYAH COVERAGE" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-white/5", children: areas.map((a, i) => {
              const filtered = a.cities.filter((c) => c.toLowerCase().includes(searchArea.toLowerCase()));
              if (filtered.length === 0 && searchArea !== "") return null;
              return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-white/5 transition-colors duration-200", children: [
                /* @__PURE__ */ jsx("td", { className: "py-5 px-6 align-top", children: /* @__PURE__ */ jsx("span", { className: "inline-block px-3 py-1 bg-white/10 text-white/80 border border-white/20 text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-sm", children: a.area.replace("Area", "Zona") }) }),
                /* @__PURE__ */ jsx("td", { className: "py-5 px-6", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: filtered.map((city, idx) => /* @__PURE__ */ jsx("span", { className: "bg-white/5 text-white/70 border border-white/10 px-2 py-1 rounded-full text-[11px] font-medium hover:border-white/30 hover:text-white transition-colors cursor-default backdrop-blur-sm", children: city }, idx)) }) })
              ] }, i);
            }) })
          ] }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("footer", { className: "py-6 text-center mt-10 border-t border-white/20", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-white/40 uppercase tracking-widest", children: "MILA STORE TERMINAL • PEMANTAUAN REAL-TIME XL AXIATA" }) })
    ] }),
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .font-mono { font-family: 'Space Grotesk', monospace; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .animate-shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.05) 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
                .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 8px; }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
            ` } })
  ] });
}
export {
  MilaTools as default
};
