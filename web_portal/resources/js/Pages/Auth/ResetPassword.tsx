import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler, useState } from 'react';
import { FiMail, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const isEmailValid = data.email.includes('@') && data.email.includes('.');

    return (
        <GuestLayout>
            <Head title="Set New Password - Petrochain" />

            <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Set new password
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                    Masukkan kata sandi baru untuk memulihkan akses ke akun Anda.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-3.5 sm:space-y-4">
                {/* Email Field */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1"
                    >
                        E-mail Address
                    </label>

                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="Enter your email"
                            autoComplete="username"
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

                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                {/* Password Field */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1"
                    >
                        New Password
                    </label>

                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 sm:py-3 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-[#980f12] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980f12]/15"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <FiEyeOff className="w-4 h-4" />
                            ) : (
                                <FiEye className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1 text-xs" />
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label
                        htmlFor="password_confirmation"
                        className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1"
                    >
                        Confirm New Password
                    </label>

                    <div className="relative">
                        <input
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 sm:py-3 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-[#980f12] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980f12]/15"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? (
                                <FiEyeOff className="w-4 h-4" />
                            ) : (
                                <FiEye className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1 text-xs"
                    />
                </div>

                {/* Dual Pill Action Buttons */}
                <div className="flex items-center gap-3 sm:gap-4 pt-4">
                    {/* Primary Button: Solid Red Pill */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-[#980f12] to-[#c9181b] text-white text-sm sm:text-base font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-center flex items-center justify-center"
                    >
                        {processing ? 'Saving...' : 'Reset Password'}
                    </button>

                    {/* Secondary Button: Outlined Pill to Login */}
                    <Link
                        href={route('login')}
                        className="flex-1 py-3 px-6 rounded-full bg-white border border-gray-300 text-gray-700 hover:text-[#980f12] hover:border-[#980f12] hover:bg-red-50/40 text-sm sm:text-base font-semibold shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}

