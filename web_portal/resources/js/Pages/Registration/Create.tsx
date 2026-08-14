import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FiUploadCloud, FiChevronLeft } from 'react-icons/fi';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        plate_number: '',
        vehicle_type: 'motorcycle',
        brand: '',
        model: '',
        engine_capacity_cc: '',
        stnk_file: null as File | null,
        vehicle_photo: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/registrations');
    };

    const handleFileChange = (field: 'stnk_file' | 'vehicle_photo') => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData(field, e.target.files[0]);
        }
    };

    return (
        <AppLayout title="Pendaftaran Baru">
            <Head title="Pendaftaran Baru" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/registrations" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-primary transition">
                    <FiChevronLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Form Pendaftaran Kendaraan</h2>
                    <p className="text-gray-500 text-sm mt-1">Isi data kendaraan dan unggah dokumen dengan jelas.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-3xl">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Pelat</label>
                            <input 
                                type="text" 
                                value={data.plate_number}
                                onChange={e => setData('plate_number', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20 uppercase"
                                placeholder="Misal: BL 1234 AB"
                                required
                            />
                            {errors.plate_number && <p className="text-red-500 text-xs mt-1">{errors.plate_number}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kendaraan</label>
                            <select 
                                value={data.vehicle_type}
                                onChange={e => setData('vehicle_type', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                            >
                                <option value="motorcycle">Sepeda Motor</option>
                                <option value="car">Mobil / Kendaraan Pribadi</option>
                                <option value="truck">Truk</option>
                                <option value="bus">Bus</option>
                            </select>
                            {errors.vehicle_type && <p className="text-red-500 text-xs mt-1">{errors.vehicle_type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Merek</label>
                            <input 
                                type="text" 
                                value={data.brand}
                                onChange={e => setData('brand', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                placeholder="Misal: Honda"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                            <input 
                                type="text" 
                                value={data.model}
                                onChange={e => setData('model', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                placeholder="Misal: Vario 150"
                            />
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Mesin (CC)</label>
                            <input 
                                type="number" 
                                value={data.engine_capacity_cc}
                                onChange={e => setData('engine_capacity_cc', e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                placeholder="Misal: 150"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* STNK Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload STNK</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange('stnk_file')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required
                                />
                                <FiUploadCloud className="text-gray-400 text-3xl mb-2" />
                                <span className="text-sm text-gray-600">
                                    {data.stnk_file ? data.stnk_file.name : 'Pilih File STNK'}
                                </span>
                            </div>
                            {errors.stnk_file && <p className="text-red-500 text-xs mt-1">{errors.stnk_file}</p>}
                        </div>

                        {/* Vehicle Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Foto Fisik Kendaraan</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange('vehicle_photo')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required
                                />
                                <FiUploadCloud className="text-gray-400 text-3xl mb-2" />
                                <span className="text-sm text-gray-600">
                                    {data.vehicle_photo ? data.vehicle_photo.name : 'Pilih Foto Kendaraan'}
                                </span>
                            </div>
                            {errors.vehicle_photo && <p className="text-red-500 text-xs mt-1">{errors.vehicle_photo}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Kirim Pendaftaran'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
