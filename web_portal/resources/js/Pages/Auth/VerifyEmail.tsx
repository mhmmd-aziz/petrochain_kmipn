import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { FiMail, FiCheckCircle } from 'react-icons/fi';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verify Email - Petrochain" />

            <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#980f12] flex items-center justify-center mb-3">
                    <FiMail className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Verify your email
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                    Terima kasih telah mendaftar! Sebelum memulai, silakan verifikasi alamat email Anda dengan mengklik tautan yang baru saja kami kirimkan.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-5 p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs sm:text-sm font-medium text-green-700 flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Tautan verifikasi baru telah dikirim ke alamat email Anda.</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Dual Pill Action Buttons */}
                <div className="flex items-center gap-3 sm:gap-4 pt-2">
                    {/* Primary Button: Solid Red Pill */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-[#980f12] to-[#c9181b] text-white text-sm sm:text-base font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-center flex items-center justify-center"
                    >
                        {processing ? 'Sending...' : 'Resend Email'}
                    </button>

                    {/* Secondary Button: Outlined Pill to Log Out */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex-1 py-3 px-6 rounded-full bg-white border border-gray-300 text-gray-700 hover:text-[#980f12] hover:border-[#980f12] hover:bg-red-50/40 text-sm sm:text-base font-semibold shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}

