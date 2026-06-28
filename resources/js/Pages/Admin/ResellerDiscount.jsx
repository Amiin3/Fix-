import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function ResellerDiscount({ auth, khfy, adam, kaje }) {
    const { data, setData, post, processing } = useForm({ khfy, adam, kaje });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.reseller.discounts.update'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Setting Diskon Reseller Flat</h2>}>
            <Head title="Diskon Reseller" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
                            <p className="text-sm text-blue-700">
                                <strong>Info Sultan:</strong> Angka yang dimasukkan di sini akan <b>otomatis mengurangi harga jual tabel</b> khusus untuk member berlevel <b>Reseller</b>. Harga Digiflazz tidak akan terpengaruh.
                            </p>
                        </div>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="khfy" value="Potongan Khfy (Rp)" />
                                <TextInput id="khfy" type="number" className="mt-1 block w-full" value={data.khfy} onChange={(e) => setData('khfy', e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel htmlFor="adam" value="Potongan Adam / PPOB (Rp)" />
                                <TextInput id="adam" type="number" className="mt-1 block w-full" value={data.adam} onChange={(e) => setData('adam', e.target.value)} required />
                            </div>
                            <div>
                                <InputLabel htmlFor="kaje" value="Potongan Kaje (Rp)" />
                                <TextInput id="kaje" type="number" className="mt-1 block w-full" value={data.kaje} onChange={(e) => setData('kaje', e.target.value)} required />
                            </div>
                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>Simpan Konfigurasi</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
