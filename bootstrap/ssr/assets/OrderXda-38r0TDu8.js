import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
function OrderSultan({ user }) {
  const [tujuan, setTujuan] = useState("");
  const [produkList, setProdukList] = useState([]);
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  useEffect(() => {
    fetchProduk();
    const interval = setInterval(() => fetchProduk(), 8e3);
    return () => clearInterval(interval);
  }, []);
  const fetchProduk = async () => {
    try {
      const response = await axios.post("/order/xda/poll");
      if (response.data.status === "success") {
        setProdukList(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data Live Polling", error);
    } finally {
      setIsFetching(false);
    }
  };
  const saldoUser = parseInt(user?.saldo || user?.balance || 0);
  const handleCheckout = async () => {
    if (!tujuan) {
      Swal.fire("Oops!", "Nomor tujuan wajib diisi, Bos!", "warning");
      return;
    }
    if (!selectedProduk) {
      Swal.fire("Oops!", "Pilih produknya dulu dong!", "warning");
      return;
    }
    const hargaProduk = parseInt(selectedProduk.harga_jual);
    if (saldoUser < hargaProduk) {
      Swal.fire({
        icon: "error",
        title: "Saldo Kurang!",
        text: `Saldo Bos Rp ${saldoUser.toLocaleString("id-ID")} tidak cukup untuk membeli layanan seharga Rp ${hargaProduk.toLocaleString("id-ID")}.`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Topup Sekarang"
      });
      return;
    }
    const result = await Swal.fire({
      title: "Konfirmasi Pesanan",
      html: `Produk: <b>${selectedProduk.nama_layanan}</b><br/>
                   Tujuan: <b>${tujuan}</b><br/>
                   Harga: <b>Rp ${hargaProduk.toLocaleString("id-ID")}</b>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Gas Beli! 🚀",
      cancelButtonText: "Batal"
    });
    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await axios.post("/order/xda", {
          kode_layanan: selectedProduk.kode_layanan,
          tujuan
        });
        if (response.data.status === "success") {
          Swal.fire("Berhasil! 🎉", response.data.message, "success").then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire("Gagal 🔴", response.data.message, "error");
        }
      } catch (error) {
        Swal.fire("Sistem Sibuk", "Terjadi kesalahan jaringan, coba lagi nanti.", "error");
      } finally {
        setIsLoading(false);
      }
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen pb-32", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl mb-6 transform transition-all hover:scale-[1.01]", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold opacity-90", children: "Saldo Anda" }),
      /* @__PURE__ */ jsxs("div", { className: "text-4xl font-extrabold mt-1 tracking-tight", children: [
        "Rp ",
        saldoUser.toLocaleString("id-ID")
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl p-6 shadow-md mb-6 border border-gray-100", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-gray-700 font-bold mb-2 text-lg", children: "Nomor Tujuan / Target" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          className: "w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
          placeholder: "Contoh: 081234567890",
          value: tujuan,
          onChange: (e) => setTujuan(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Pilihan Layanan Sultan 💎" }),
    isFetching ? /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: produkList.map((item) => {
      const isSelected = selectedProduk?.kode_layanan === item.kode_layanan;
      const isKosong = item.stok == 0 || item.status === "inactive";
      const hargaInt = parseInt(item.harga_jual);
      return /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => !isKosong && setSelectedProduk(item),
          className: `relative p-5 rounded-2xl cursor-pointer transition-all duration-200 
                                    ${isKosong ? "bg-gray-100 opacity-60 cursor-not-allowed" : "bg-white hover:shadow-lg hover:-translate-y-1"}
                                    ${isSelected ? "ring-4 ring-blue-500 shadow-xl" : "border border-gray-200"}
                                `,
          children: [
            /* @__PURE__ */ jsx("div", { className: "font-bold text-gray-800 text-lg mb-1", children: item.nama_layanan }),
            /* @__PURE__ */ jsxs("div", { className: "text-blue-600 font-extrabold text-xl mb-3", children: [
              "Rp ",
              hargaInt.toLocaleString("id-ID")
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center text-sm font-semibold mt-auto", children: isKosong ? /* @__PURE__ */ jsx("span", { className: "bg-red-100 text-red-600 py-1 px-3 rounded-full", children: "● Habis / Gangguan" }) : /* @__PURE__ */ jsx("span", { className: "bg-green-100 text-green-600 py-1 px-3 rounded-full", children: "⚡ Stok Aman" }) })
          ]
        },
        item.kode_layanan
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm font-semibold", children: "Total Bayar" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-black text-gray-800", children: selectedProduk ? `Rp ${parseInt(selectedProduk.harga_jual).toLocaleString("id-ID")}` : "Rp 0" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleCheckout,
          disabled: isLoading || !selectedProduk,
          className: `px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:scale-105 active:scale-95
                            ${isLoading || !selectedProduk ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"}
                        `,
          children: isLoading ? "⏳ Memproses..." : "BAYAR SEKARANG 🚀"
        }
      )
    ] }) })
  ] });
}
export {
  OrderSultan as default
};
