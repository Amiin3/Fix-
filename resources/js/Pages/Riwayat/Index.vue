<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const page = usePage();

// 🔥 LOGIKA ANTI-CRASH TOTAL
const transactions = computed(() => {
    // Cari data di props.transactions.data atau props.transactions
    const trxProps = page.props.transactions;
    if (!trxProps) return [];
    
    // Jika ada properti .data (seperti yang dicari error Bos), ambil itu
    if (trxProps.data) return trxProps.data;
    
    // Jika ternyata dikirim sebagai array langsung
    if (Array.isArray(trxProps)) return trxProps;
    
    return [];
});

const formatDate = (d) => {
    if (!d) return '-';
    try {
        return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return '-'; }
};

const statusColor = (s) => {
    const status = s ? s.toLowerCase() : '';
    if (status === 'sukses') return 'bg-green-100 text-green-700';
    if (status === 'gagal') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
};
</script>

<template>
    <Head title="Riwayat" />
    <AuthenticatedLayout>
        <div class="py-8 px-4 max-w-3xl mx-auto">
            <h1 class="text-2xl font-black mb-6 text-gray-900">Riwayat Transaksi</h1>

            <div v-if="transactions?.length > 0" class="space-y-4">
                <div v-for="trx in transactions" :key="trx.id" class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <div class="flex justify-between items-start mb-4">
                        <div class="max-w-[70%]">
                            <h3 class="font-extrabold text-gray-900 leading-tight">{{ trx?.nama_layanan || 'Produk' }}</h3>
                            <p class="text-[10px] text-gray-400 mt-1 uppercase">{{ formatDate(trx?.created_at || trx?.tanggal) }}</p>
                        </div>
                        <span :class="`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColor(trx?.status)}`">
                            {{ trx?.status || 'PROSES' }}
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-y-2 text-sm border-t border-gray-50 pt-4">
                        <span class="text-gray-400">Tujuan</span>
                        <span class="text-right font-bold text-gray-800">{{ trx?.tujuan }}</span>
                        <span class="text-gray-400">Harga</span>
                        <span class="text-right font-black text-blue-600">Rp {{ Number(trx?.harga || 0).toLocaleString('id-ID') }}</span>
                    </div>

                    <div class="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p class="text-[9px] text-gray-400 font-bold uppercase mb-1">SN / KETERANGAN</p>
                        <p class="text-xs italic text-gray-600 break-all leading-relaxed">{{ trx?.sn || 'Sedang diproses...' }}</p>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <p class="text-gray-400 font-medium text-lg">📭 Belum ada riwayat transaksi.</p>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
