import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler, useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const isEmailValid = data.email.includes('@') && data.email.includes('.');

    return (
        <GuestLayout>
            <Head title="Sign In - Petrochain" />

            <div className="mb-4 sm:mb-5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Sign in to your account
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Masuk untuk mengelola data subsidi & verifikasi kendaraan
                </p>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-xs sm:text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-3.5 sm:space-y-4">
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
                            placeholder="Enter your email"
                            autoComplete="username"
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

                {/* Password Field */}
                <div>
                    <label
                        htmlFor="password"
                        className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5"
                    >
                        Password
                    </label>

                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="Enter your password"
                            autoComplete="current-password"
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

                    <InputError message={errors.password} className="mt-1.5 text-xs" />
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                            className="rounded text-[#980f12] focus:ring-[#980f12]"
                        />
                        <span className="ms-2 text-xs sm:text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs sm:text-sm font-medium text-gray-500 hover:text-[#980f12] transition-colors"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                {/* Dual Pill Action Buttons */}
                <div className="flex items-center gap-3 sm:gap-4 pt-4">
                    {/* Primary Button: Solid Red Pill */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-[#980f12] to-[#c9181b] text-white text-sm sm:text-base font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-center flex items-center justify-center"
                    >
                        {processing ? 'Signing In...' : 'Sign In'}
                    </button>

                    {/* Secondary Button: Outlined Pill to Register */}
                    <Link
                        href={route('register')}
                        className="flex-1 py-3 px-6 rounded-full bg-white border border-gray-300 text-gray-700 hover:text-[#980f12] hover:border-[#980f12] hover:bg-red-50/40 text-sm sm:text-base font-semibold shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center"
                    >
                        Sign Up
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}

