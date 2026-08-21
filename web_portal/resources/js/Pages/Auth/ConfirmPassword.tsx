import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler, useState } from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password - Petrochain" />

            <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Confirm your password
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
                    Ini adalah area aman aplikasi. Mohon konfirmasikan kata sandi Anda sebelum melanjutkan.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
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

                    <InputError message={errors.password} className="mt-1.5 text-xs" />
                </div>

                {/* Dual Pill Action Buttons */}
                <div className="flex items-center gap-3 sm:gap-4 pt-4">
                    {/* Primary Button: Solid Red Pill */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-[#980f12] to-[#c9181b] text-white text-sm sm:text-base font-bold shadow-lg shadow-red-900/20 hover:shadow-red-900/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-center flex items-center justify-center"
                    >
                        {processing ? 'Confirming...' : 'Confirm'}
                    </button>

                    {/* Secondary Button: Outlined Pill to Dashboard / Home */}
                    <Link
                        href={route('dashboard')}
                        className="flex-1 py-3 px-6 rounded-full bg-white border border-gray-300 text-gray-700 hover:text-[#980f12] hover:border-[#980f12] hover:bg-red-50/40 text-sm sm:text-base font-semibold shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}

