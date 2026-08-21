import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';
import { FiMail, FiCheck } from 'react-icons/fi';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    const isEmailValid = data.email.includes('@') && data.email.includes('.');

    return (
        <GuestLayout>
            <Head title="Forgot Password - Petrochain" />

            <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Reset your password
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                    Lupa password akun Anda? Masukkan alamat email terdaftar dan kami akan mengirimkan tautan pemulihan kata sandi.
                </p>
            </div>

            {status && (
                <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-xs sm:text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Email Field */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5"
                    >
                        E-mail Address
                    </label>

                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="Enter your registered email"
                            autoComplete="email"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 sm:py-3 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-[#980f12] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980f12]/15"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-gray-400">
                            {isEmailValid ? (
                                <FiCheck className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <FiMail className="w-4 h-4" />
                            )}
                        </div>
                    </div>

                    <InputError message={errors.email} className="mt-1.5 text-xs" />
                </div>

                {/* Dual Pill Action Buttons */}
                <div className="flex items-center gap-3 sm:gap-4 pt-4">
                    {/* Primary Button: Solid Red Pill */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-[#980f12] to-[#c9181b] text-white text-sm sm:text-base font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-center flex items-center justify-center"
                    >
                        {processing ? 'Sending...' : 'Send Link'}
                    </button>

                    {/* Secondary Button: Outlined Pill back to Login */}
                    <Link
                        href={route('login')}
                        className="flex-1 py-3 px-6 rounded-full bg-white border border-gray-300 text-gray-700 hover:text-[#980f12] hover:border-[#980f12] hover:bg-red-50/40 text-sm sm:text-base font-semibold shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center"
                    >
                        Sign In
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}

