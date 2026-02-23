import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

// Declare route for TypeScript if Ziggy types are not globally available
declare var route: any;

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Welcome Back" />

            <div className="text-center mb-8 relative z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Please sign in to your account</p>
            </div>

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-600 dark:text-green-400 font-medium text-center border border-green-100 dark:border-green-800">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5 relative z-10">
                <div>
                    <InputLabel htmlFor="username" value="Username" className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="pl-10 block w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-shadow py-2.5"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('username', e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>
                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 dark:text-gray-300 font-semibold mb-1.5" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="pl-10 block w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-shadow py-2.5"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                        />
                        <span className="ms-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition">Remember me</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg dark:shadow-none text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform active:scale-[0.98] ${processing ? 'opacity-75 cursor-wait' : ''}`}
                        disabled={processing}
                    >
                        {processing ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            href={route('register')}
                            className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
                        >
                            Register here
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}