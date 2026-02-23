import { FormEventHandler, useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import DateInput from '@/Components/DateInput';
import { Head, Link, useForm } from '@inertiajs/react';

// Declare Ziggy route function
declare var route: any;

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        nis: '',
        date_of_birth: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Create Account
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Register to access the library
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {/* Username */}
                <div>
                    <InputLabel htmlFor="name" value="Username" className="text-gray-700 dark:text-gray-300" />
                    <TextInput
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* NIS */}
                <div>
                    <InputLabel htmlFor="nis" value="NIS (Student ID)" className="text-gray-700 dark:text-gray-300" />
                    <TextInput
                        id="nis"
                        type="number"
                        name="nis"
                        value={data.nis}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        autoComplete="off"
                        onChange={(e) => setData('nis', e.target.value)}
                        required
                    />
                    <InputError message={errors.nis} className="mt-2" />
                </div>

                {/* Date of Birth - Improved with DateInput */}
                <div>
                    <InputLabel value="Date of Birth" className="text-gray-700 dark:text-gray-300 mb-2" />
                    <DateInput
                        value={data.date_of_birth ? new Date(data.date_of_birth) : null}
                        onChange={(date) => {
                            if (date) {
                                // Format date as YYYY-MM-DD for backend
                                const offset = date.getTimezoneOffset();
                                const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                                setData('date_of_birth', localDate.toISOString().split('T')[0]);
                            } else {
                                setData('date_of_birth', '');
                            }
                        }}
                        className="w-full"
                    />
                    <InputError message={errors.date_of_birth} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 dark:text-gray-300" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Confirm Password */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-gray-700 dark:text-gray-300" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton
                        className={`ms-4 ${processing ? 'opacity-75' : ''}`}
                        disabled={processing}
                    >
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}