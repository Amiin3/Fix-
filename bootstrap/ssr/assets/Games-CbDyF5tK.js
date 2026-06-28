import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { A as AuthenticatedLayout } from "./AuthenticatedLayout-BMtUGg5W.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import Swal from "sweetalert2";
/* empty css                      */
import "axios";
import "moment";
const GameLogo = ({ gameName }) => {
  const [hasError, setHasError] = useState(false);
  const name = gameName.toLowerCase().replace(/[^a-z0-9]/g, "");
  let logoUrl = null;
  if (name.includes("mobilelegend") || name.includes("mlbb")) logoUrl = "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Mobile_Legends_Bang_Bang_logo.png/512px-Mobile_Legends_Bang_Bang_logo.png";
  else if (name.includes("freefire") || name.includes("ff")) logoUrl = "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Free_Fire_logo.svg/512px-Free_Fire_logo.svg.png";
  else if (name.includes("pubg")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/PUBG_logo.png/512px-PUBG_logo.png";
  else if (name.includes("genshin")) logoUrl = "https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Genshin_Impact_logo.svg/512px-Genshin_Impact_logo.svg.png";
  else if (name.includes("valorant")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Valorant_logo_-_pink_color_version.svg/512px-Valorant_logo_-_pink_color_version.svg.png";
  else if (name.includes("pointblank") || name.includes("pb")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Point_Blank_Logo.png/512px-Point_Blank_Logo.png";
  else if (name.includes("callofduty") || name.includes("codm")) logoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Call_of_Duty_Mobile_logo.png/512px-Call_of_Duty_Mobile_logo.png";
  else if (name.includes("arenaofvalor") || name.includes("aov")) logoUrl = "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Arena_of_Valor_logo.svg/512px-Arena_of_Valor_logo.svg.png";
  if (logoUrl && !hasError) {
    return /* @__PURE__ */ jsx("img", { src: logoUrl, alt: gameName, onError: () => setHasError(true), referrerPolicy: "no-referrer", className: "h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all group-hover:scale-110 group-hover:drop-shadow-[0_0_25px_rgba(139,92,246,0.6)]" });
  }
  return /* @__PURE__ */ jsx("span", { className: "font-black uppercase tracking-widest text-[11px] text-indigo-600 text-center leading-tight drop-shadow-sm", children: gameName });
};
function Games({ auth, groupedProducts, userBalance }) {
  const [activeProvider, setActiveProvider] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [showFavModal, setShowFavModal] = useState(false);
  const fakeMarkup = 0.05;
  const { transform, post, processing } = useForm({ tujuan: "", kode_layanan: "" });
  const formatRp = (n) => new Intl.NumberFormat("id-ID").format(Number(n) || 0);
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem("amifi_games_favs")) || [];
    setFavorites(savedFavs);
  }, []);
  const gameConfig = useMemo(() => {
    if (!activeProvider) return null;
    const name = activeProvider.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (name.includes("mobilelegend") || name.includes("mlbb")) return { type: "mlbb", label1: "User ID", label2: "Zone ID", placeholder1: "12345678", placeholder2: "1234" };
    if (name.includes("valorant") || name.includes("wildrift")) return { type: "riot", label1: "Riot ID", label2: "Tagline", placeholder1: "NamaPlayer", placeholder2: "1234" };
    if (name.includes("genshin") || name.includes("honkai")) return { type: "server", label1: "UID Player", label2: "Server", placeholder1: "800000000", options: ["os_asia", "os_usa", "os_euro", "os_cht"] };
    if (name.includes("freefire") || name.includes("ff") || name.includes("pubg") || name.includes("sausage")) return { type: "single", label1: "Player ID", placeholder1: "1234567890" };
    return { type: "single", label1: "User ID / Player ID", placeholder1: "Masukkan ID Game" };
  }, [activeProvider]);
  useEffect(() => {
    setField1("");
    setField2(gameConfig?.type === "server" ? gameConfig.options[0] : "");
    setSelected(null);
  }, [activeProvider, gameConfig]);
  const providers = Object.keys(groupedProducts || {});
  let activeProducts = activeProvider ? groupedProducts[activeProvider] || [] : [];
  if (search) activeProducts = activeProducts.filter((p) => p.nama_layanan.toLowerCase().includes(search.toLowerCase()) || p.harga_jual.toString().includes(search));
  const handleSaveFav = () => {
    if (!activeProvider || !gameConfig) return;
    if (field1.length < 3) return Swal.fire({ icon: "warning", title: "Oops", text: `${gameConfig.label1} tidak valid.`, confirmButtonColor: "#8b5cf6", customClass: { popup: "rounded-[24px]" } });
    if ((gameConfig.type === "mlbb" || gameConfig.type === "riot") && field2.length < 1) return Swal.fire({ icon: "warning", title: "Oops", text: `${gameConfig.label2} wajib diisi.`, confirmButtonColor: "#8b5cf6", customClass: { popup: "rounded-[24px]" } });
    Swal.fire({
      title: "Simpan Akun Game",
      input: "text",
      inputPlaceholder: "Misal: ML Utama / FF Sultan",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#8b5cf6",
      customClass: { popup: "rounded-[24px]", confirmButton: "rounded-xl", cancelButton: "rounded-xl" }
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        const newFavs = [...favorites, { id: Date.now(), name: res.value, f1: field1, f2: field2, prov: activeProvider }];
        setFavorites(newFavs);
        localStorage.setItem("amifi_games_favs", JSON.stringify(newFavs));
        Swal.fire({ icon: "success", title: "Tersimpan!", timer: 1500, showConfirmButton: false, customClass: { popup: "rounded-[24px]" } });
      }
    });
  };
  const handleDelFav = (id) => {
    const newFavs = favorites.filter((f) => f.id !== id);
    setFavorites(newFavs);
    localStorage.setItem("amifi_games_favs", JSON.stringify(newFavs));
  };
  const checkCooldown = (targetId, gameName) => {
    const lastTrx = JSON.parse(localStorage.getItem("last_game_trx"));
    if (lastTrx && lastTrx.id === targetId && lastTrx.game === gameName) {
      const diff = (/* @__PURE__ */ new Date()).getTime() - lastTrx.time;
      if (diff < 5 * 60 * 1e3) {
        const timeLeft = Math.ceil((5 * 60 * 1e3 - diff) / 1e3 / 60);
        Swal.fire({ icon: "warning", title: "Transaksi Ditahan!", text: `Tunggu ${timeLeft} menit lagi untuk mencegah double top-up ke ID ini!`, confirmButtonColor: "#8b5cf6", customClass: { popup: "rounded-[24px]" } });
        return false;
      }
    }
    return true;
  };
  const handleOrder = () => {
    if (!selected || !gameConfig) return;
    if (field1.length < 3) return Swal.fire({ icon: "warning", title: "ID Tidak Valid", text: `Masukkan ${gameConfig.label1} dengan benar.`, confirmButtonColor: "#8b5cf6", customClass: { popup: "rounded-[24px]" } });
    if ((gameConfig.type === "mlbb" || gameConfig.type === "riot") && field2.length < 1) return Swal.fire({ icon: "warning", title: "Data Tidak Lengkap", text: `${gameConfig.label2} wajib diisi.`, confirmButtonColor: "#8b5cf6", customClass: { popup: "rounded-[24px]" } });
    if (Number(userBalance) < Number(selected.harga_jual)) return Swal.fire({ icon: "error", title: "Saldo Kurang", text: "Silakan top up dompet Anda.", confirmButtonColor: "#8b5cf6", customClass: { popup: "rounded-[24px]" } });
    let finalTarget = field1;
    if (gameConfig.type === "mlbb") finalTarget = `${field1}${field2}`;
    else if (gameConfig.type === "riot") finalTarget = `${field1}#${field2}`;
    else if (gameConfig.type === "server") finalTarget = `${field1}${field2}`;
    if (!checkCooldown(finalTarget, activeProvider)) return;
    const hargaCoret = Math.round(selected.harga_jual * (1 + fakeMarkup));
    Swal.fire({
      title: `<div class="text-2xl font-black text-slate-800 tracking-tight mt-2 uppercase">Konfirmasi Top Up</div>`,
      html: `
                <div class="text-left mt-4 space-y-3">
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-solid fa-gamepad text-violet-500"></i> Target ID</span>
                        <span class="text-lg font-black text-slate-800 tracking-widest font-mono">${field1} ${field2 ? `<span class="text-slate-400 text-sm">(${field2})</span>` : ""}</span>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex justify-between items-center shadow-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-regular fa-gem text-violet-500"></i> Item</span>
                        <span class="text-[12px] font-black text-violet-600 text-right w-1/2 leading-tight">${selected.nama_layanan}</span>
                    </div>
                    <div class="bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 rounded-[24px] border border-violet-100/60 flex justify-between items-center shadow-inner mt-4 relative overflow-hidden">
                        <div class="absolute -right-5 -bottom-5 w-20 h-20 bg-violet-200/40 rounded-full blur-xl"></div>
                        <span class="text-[11px] font-black text-violet-700 uppercase tracking-widest relative z-10">Total Tagihan</span>
                        <div class="text-right flex flex-col relative z-10">
                            <span class="text-[11px] text-violet-600/60 line-through mb-0.5 font-bold">Rp ${formatRp(hargaCoret)}</span>
                            <span class="text-2xl font-black text-violet-700 tracking-tight">Rp ${formatRp(selected.harga_jual)}</span>
                        </div>
                    </div>
                </div>
            `,
      showCancelButton: true,
      cancelButtonText: "BATALKAN",
      confirmButtonText: '<i class="fa-solid fa-bolt mr-2"></i> TOP UP SEKARANG',
      buttonsStyling: false,
      reverseButtons: true,
      customClass: {
        confirmButton: "w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-black rounded-2xl px-5 py-4 mt-5 transition-all shadow-[0_8px_20px_rgba(139,92,246,0.3)] text-xs tracking-widest uppercase transform active:scale-95",
        cancelButton: "w-full bg-transparent hover:bg-slate-50 text-slate-500 font-black rounded-2xl px-5 py-3 mt-2 transition-all text-[11px] border border-slate-200 tracking-widest uppercase",
        popup: "rounded-[32px] p-6 w-full max-w-sm border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.12)]"
      }
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.setItem("last_game_trx", JSON.stringify({ id: finalTarget, game: activeProvider, time: (/* @__PURE__ */ new Date()).getTime() }));
        transform((data) => ({ ...data, tujuan: finalTarget, kode_layanan: selected.kode_layanan }));
        Swal.fire({
          title: '<div class="text-xl font-black text-slate-800 mt-2">Menyuntikkan Item...</div>',
          html: `
                        <div class="mt-6 mb-2 flex flex-col items-center justify-center">
                            <div class="relative w-20 h-20">
                                <div class="absolute inset-0 border-4 border-slate-100 rounded-full shadow-inner"></div>
                                <div class="absolute inset-0 border-4 border-violet-500 rounded-full animate-spin border-t-transparent shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
                                <div class="absolute inset-0 flex items-center justify-center"><i class="fa-solid fa-gamepad text-fuchsia-500 text-2xl animate-pulse"></i></div>
                            </div>
                            <p class="text-[11px] font-black text-slate-400 mt-8 tracking-[0.2em] uppercase animate-pulse">Menghubungi Server Game</p>
                        </div>
                    `,
          allowOutsideClick: false,
          showConfirmButton: false,
          buttonsStyling: false,
          customClass: { popup: "rounded-[32px] p-8 w-full max-w-sm border border-slate-100 shadow-[0_40px_80px_rgba(0,0,0,0.15)]" }
        });
        post(route("order.games.store"), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire({
              icon: "success",
              title: '<div class="text-xl font-black text-slate-800 mt-2">Suntikan Berhasil!</div>',
              html: '<p class="text-xs font-bold text-slate-500 mt-1">Mengarahkan ke Riwayat Transaksi...</p>',
              timer: 1500,
              timerProgressBar: true,
              showConfirmButton: false,
              customClass: { popup: "rounded-[32px] p-6 shadow-2xl border border-slate-100" }
            }).then(() => router.visit("/riwayat"));
          }
        });
      }
    });
  };
  return /* @__PURE__ */ jsxs(AuthenticatedLayout, { user: auth.user, children: [
    /* @__PURE__ */ jsx(Head, { title: "Topup Games - MilaStore" }),
    /* @__PURE__ */ jsx("style", { children: `.no-scrollbar::-webkit-scrollbar { display: none; }` }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#F4F7FB] font-['Outfit'] pb-[140px] md:pb-40", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-8 pb-20 text-white shadow-xl shadow-violet-200/50 relative overflow-hidden rounded-b-[45px]", style: { background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)" }, children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -top-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl" }),
        /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto flex justify-between items-center relative z-10", children: [
          /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "text-white hover:-translate-x-1 transition-transform w-8 h-8 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-md", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left-long" }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-black tracking-tight m-0 uppercase drop-shadow-md", children: "Top Up Games" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1.5 bg-black/20 backdrop-blur-md border border-white/20 inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-inner", children: [
              "Saldo: Rp ",
              formatRp(userBalance)
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "w-8" })
        ] }),
        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-headset absolute right-5 -bottom-5 text-8xl text-white opacity-10 -rotate-12" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-w-md mx-auto px-5 -mt-12 relative z-20", children: !activeProvider ? /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden", children: [
        /* @__PURE__ */ jsxs("h6", { className: "font-black text-slate-800 mb-5 tracking-tight flex items-center gap-2 relative z-10", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-violet-100 text-violet-600 w-8 h-8 rounded-full flex justify-center items-center", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-fire" }) }),
          "Pilih Game Favoritmu"
        ] }),
        providers.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold", children: "Layanan Sedang Kosong" }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 relative z-10", children: providers.map((prov) => /* @__PURE__ */ jsx("div", { onClick: () => setActiveProvider(prov), className: "bg-gradient-to-b from-slate-50 to-white p-4 h-[110px] rounded-[24px] border-2 border-slate-100 shadow-sm hover:border-violet-400 hover:shadow-[0_10px_20px_rgba(139,92,246,0.15)] cursor-pointer flex flex-col items-center justify-center transition-all hover:-translate-y-1.5 group", children: /* @__PURE__ */ jsx("div", { className: "group-active:scale-95 transition-transform flex items-center justify-center w-full h-full", children: /* @__PURE__ */ jsx(GameLogo, { gameName: prov }) }) }, prov)) })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "animate-in slide-in-from-right-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-[32px] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-slate-50 mb-6 relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute -top-10 -right-10 w-32 h-32 bg-violet-50 rounded-full blur-2xl" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 pb-3 border-b border-slate-100 relative z-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => {
                setActiveProvider(null);
                setSelected(null);
                setField1("");
                setField2("");
              }, className: "w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-violet-100 hover:text-violet-600 transition-colors shadow-sm", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-left text-sm" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col max-w-[150px]", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest", children: "TOP UP" }),
                /* @__PURE__ */ jsx("h6", { className: "font-black text-violet-600 m-0 uppercase tracking-tight text-xs leading-tight truncate drop-shadow-sm", children: activeProvider })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setShowFavModal(true), className: "text-[10px] font-black uppercase tracking-widest text-violet-500 bg-violet-50 px-3 py-2 rounded-xl hover:bg-violet-100 transition-colors flex items-center shadow-sm border border-violet-100", children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-list-ul mr-1.5" }),
              " Favorit"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-3 relative z-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 border-2 border-slate-100 rounded-2xl p-2.5 px-3 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-50 transition-all bg-slate-50 focus-within:bg-white relative", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[9px] font-black text-slate-400 uppercase block mb-1", children: gameConfig?.label1 }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: gameConfig?.type === "riot" ? "text" : "tel",
                  className: "w-full border-none bg-transparent focus:ring-0 font-mono text-lg font-black text-slate-800 p-0 placeholder-slate-300 tracking-wider",
                  placeholder: gameConfig?.placeholder1,
                  value: field1,
                  onChange: (e) => setField1(gameConfig?.type === "riot" ? e.target.value : e.target.value.replace(/\D/g, ""))
                }
              )
            ] }),
            gameConfig?.type === "mlbb" && /* @__PURE__ */ jsxs("div", { className: "w-[110px] border-2 border-slate-100 rounded-2xl p-2.5 px-2 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-50 transition-all bg-slate-50 focus-within:bg-white relative animate-in zoom-in fade-in", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[9px] font-black text-slate-400 uppercase block mb-1", children: gameConfig.label2 }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono text-lg font-black text-slate-300 mr-0.5", children: "(" }),
                /* @__PURE__ */ jsx("input", { type: "tel", className: "w-full border-none bg-transparent focus:ring-0 font-mono text-lg font-black text-slate-800 p-0 text-center placeholder-slate-300 px-0.5 tracking-wider", placeholder: gameConfig.placeholder2, value: field2, onChange: (e) => setField2(e.target.value.replace(/\D/g, "")), maxLength: "6" }),
                /* @__PURE__ */ jsx("span", { className: "font-mono text-lg font-black text-slate-300 ml-0.5", children: ")" })
              ] })
            ] }),
            gameConfig?.type === "riot" && /* @__PURE__ */ jsxs("div", { className: "w-[100px] border-2 border-slate-100 rounded-2xl p-2.5 px-3 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-50 transition-all bg-slate-50 focus-within:bg-white relative animate-in zoom-in fade-in", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[9px] font-black text-slate-400 uppercase block mb-1", children: gameConfig.label2 }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono text-lg font-black text-violet-500 mr-1", children: "#" }),
                /* @__PURE__ */ jsx("input", { type: "text", className: "w-full border-none bg-transparent focus:ring-0 font-mono text-lg font-black text-slate-800 p-0 placeholder-slate-300 tracking-wider", placeholder: gameConfig.placeholder2, value: field2, onChange: (e) => setField2(e.target.value), maxLength: "5" })
              ] })
            ] }),
            gameConfig?.type === "server" && /* @__PURE__ */ jsxs("div", { className: "w-[130px] border-2 border-slate-100 rounded-2xl p-2.5 px-3 focus-within:border-violet-500 transition-all bg-slate-50 focus-within:bg-white relative animate-in zoom-in fade-in", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[9px] font-black text-slate-400 uppercase block mb-1", children: gameConfig.label2 }),
              /* @__PURE__ */ jsx("select", { className: "w-full border-none bg-transparent focus:ring-0 font-bold text-xs text-slate-800 p-0 truncate", value: field2, onChange: (e) => setField2(e.target.value), children: gameConfig.options.map((opt) => /* @__PURE__ */ jsx("option", { value: opt, children: opt.replace("os_", "").toUpperCase() }, opt)) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-center relative z-10", children: /* @__PURE__ */ jsxs("button", { onClick: handleSaveFav, disabled: field1.length < 3, className: "text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-4 py-1.5 rounded-full hover:bg-violet-500 hover:text-white transition-all disabled:opacity-50 inline-flex items-center shadow-sm", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-bookmark mr-1.5" }),
            " Simpan ID"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative mb-5 px-1", children: [
          /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Cari Nominal Diamond / UC...", className: "w-full bg-white border border-slate-200 rounded-[20px] py-4 px-4 pl-12 font-bold text-sm text-slate-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-50 shadow-sm transition-all", value: search, onChange: (e) => setSearch(e.target.value) }),
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-search absolute left-5 top-4.5 text-violet-400 text-lg" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: activeProducts.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "col-span-2 text-center py-12 bg-white rounded-[24px] border border-slate-100 font-bold text-slate-400 shadow-sm flex flex-col items-center", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-box-open text-4xl mb-3 opacity-50 text-slate-300" }),
          " Produk tidak ditemukan."
        ] }) : activeProducts.map((p) => {
          const isSelected = selected?.kode_layanan === p.kode_layanan;
          const isGangguan = p.status === "empty" || p.status === "gangguan";
          let cleanName = p.nama_layanan.replace(new RegExp(activeProvider, "i"), "").replace(/^-?\s*/, "").trim();
          if (cleanName.length < 2) cleanName = p.nama_layanan;
          const hargaCoret = Math.round(p.harga_jual * (1 + fakeMarkup));
          return /* @__PURE__ */ jsxs("div", { onClick: () => !isGangguan && setSelected(p), className: `relative p-4 md:p-5 rounded-[24px] transition-all border-2 flex flex-col justify-between h-[125px] overflow-hidden ${isGangguan ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed" : isSelected ? "bg-violet-50 border-violet-500 shadow-[0_10px_25px_rgba(139,92,246,0.2)] scale-[1.02] z-10 ring-4 ring-violet-50 cursor-pointer" : "bg-white border-slate-100 shadow-sm hover:border-violet-300 hover:-translate-y-1 cursor-pointer"}`, children: [
            !isGangguan && /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg shadow-sm tracking-widest", children: "DISKON 5%" }),
            isGangguan && /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-sm", children: "GANGGUAN" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
                /* @__PURE__ */ jsx("i", { className: `fa-regular fa-gem text-xs ${isSelected ? "text-violet-600 animate-bounce" : "text-violet-400"}` }),
                /* @__PURE__ */ jsx("div", { className: `text-[9px] font-black uppercase tracking-widest ${isSelected ? "text-violet-700" : "text-slate-400"}`, children: "ITEM GAME" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: `font-black tracking-tight leading-snug line-clamp-2 text-sm ${isSelected ? "text-violet-800" : "text-slate-800"}`, children: cleanName })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              !isGangguan && /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-slate-400 line-through mb-0.5 font-bold", children: [
                "Rp ",
                formatRp(hargaCoret)
              ] }),
              /* @__PURE__ */ jsxs("div", { className: `font-black text-sm md:text-base ${isSelected ? "text-violet-600" : "text-violet-500"} ${isGangguan && "text-slate-400"}`, children: [
                "Rp ",
                formatRp(p.harga_jual)
              ] })
            ] })
          ] }, p.kode_layanan);
        }) })
      ] }) }),
      selected && activeProvider && field1.length >= 3 && /* @__PURE__ */ jsxs("div", { className: "fixed bottom-0 left-0 right-0 p-5 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.06)] z-50 animate-in slide-in-from-bottom rounded-t-[35px]", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5", children: "Total Bayar" }),
          /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-black text-violet-600 tracking-tighter drop-shadow-sm", children: [
            "Rp ",
            formatRp(selected.harga_jual)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: handleOrder, disabled: processing, className: "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-8 py-3.5 rounded-[16px] font-black text-[11px] uppercase tracking-widest shadow-[0_8px_20px_rgba(139,92,246,0.3)] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2", children: [
          "TOP UP ",
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-rocket text-sm ml-1" })
        ] })
      ] }),
      showFavModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-0 sm:p-5 animate-in fade-in", children: /* @__PURE__ */ jsxs("div", { className: "bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom max-h-[85vh] flex flex-col border border-white/20", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
          /* @__PURE__ */ jsxs("h4", { className: "font-black text-slate-800 text-lg m-0 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-heart text-violet-500" }),
            "ID Game Favorit"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => setShowFavModal(false), className: "w-8 h-8 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors", children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-chevron-down sm:hidden" }),
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-xmark hidden sm:block" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "overflow-y-auto custom-scrollbar flex-1 pr-1 pb-4", children: favorites.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 opacity-60", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-solid fa-ghost text-5xl mb-4 text-slate-400" }),
          /* @__PURE__ */ jsx("p", { className: "font-black text-[11px] uppercase tracking-widest text-slate-500", children: "Belum ada ID tersimpan." })
        ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: favorites.map((fav) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center p-4 border-2 border-slate-100 rounded-[20px] hover:border-violet-300 transition-all bg-white hover:shadow-md group cursor-pointer", onClick: () => {
          setField1(fav.f1);
          if (fav.f2) setField2(fav.f2);
          setActiveProvider(fav.prov);
          setShowFavModal(false);
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 pr-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "font-black text-slate-800 text-sm flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate", children: fav.name }),
              /* @__PURE__ */ jsx("span", { className: "bg-violet-100 text-violet-600 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest whitespace-nowrap shadow-sm", children: fav.prov })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "font-mono text-slate-500 font-bold tracking-widest text-xs mt-1", children: [
              "ID: ",
              /* @__PURE__ */ jsx("span", { className: "text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded", children: fav.f1 }),
              " ",
              fav.f2 && /* @__PURE__ */ jsx("span", { className: "text-slate-400 border-l-2 border-slate-200 pl-1.5 ml-1", children: fav.f2 })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: (e) => {
            e.stopPropagation();
            handleDelFav(fav.id);
          }, className: "w-9 h-9 shrink-0 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm", children: /* @__PURE__ */ jsx("i", { className: "fa-regular fa-trash-can" }) })
        ] }, fav.id)) }) })
      ] }) })
    ] })
  ] });
}
export {
  Games as default
};
