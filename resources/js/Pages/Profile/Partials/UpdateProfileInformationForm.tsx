import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import DateInput from '@/Components/DateInput'; // Import new component
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, ChangeEvent, useState } from 'react';
import { PageProps } from '@/types';

// Tell TypeScript that 'route' exists globally (from Ziggy)
declare var route: any;

interface UpdateProfileInformationProps {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
    isEditing?: boolean;
}

export default function UpdateProfileInformation({
    mustVerifyEmail, // kept for prop compatibility but unused
    status,
    className = '',
    isEditing = false,
}: UpdateProfileInformationProps) {
    const user = usePage<PageProps>().props.auth.user;
    const isStudent = user.role === 'student';
    // Demo state for Date Input (not persisted to DB yet)
    const [birthDate, setBirthDate] = useState<Date | null>(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            nis: user.nis || '',
        });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Profile Information
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Update your account's profile information.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                {/* ID Field for Admin */}
                {!isStudent && (
                    <div>
                        <InputLabel htmlFor="id" value="ID" className="text-gray-700 dark:text-gray-300" />
                        <TextInput
                            id="id"
                            className="mt-1 block w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 cursor-not-allowed"
                            value={String(user.id)}
                            disabled
                        />
                        <p className="mt-1 text-xs text-gray-500">Unique ID (Cannot be changed)</p>
                    </div>
                )}

                <div>
                    <InputLabel htmlFor="name" value="Name" className="text-gray-700 dark:text-gray-300" />
                    <TextInput
                        id="name"
                        className={`mt-1 block w-full border-gray-300 dark:border-gray-600 dark:text-gray-100 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800 cursor-default opacity-80' : 'bg-white dark:bg-gray-700'}`}
                        value={data.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                        required
                        isFocused={isEditing}
                        autoComplete="name"
                        disabled={!isEditing}
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* NIS Field for Student */}
                {isStudent && (
                    <div>
                        <InputLabel htmlFor="nis" value="NIS" className="text-gray-700 dark:text-gray-300" />
                        <TextInput
                            id="nis"
                            className={`mt-1 block w-full border-gray-300 dark:border-gray-600 dark:text-gray-100 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800 cursor-default opacity-80' : 'bg-white dark:bg-gray-700'}`}
                            value={data.nis}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setData('nis', value);
                            }}
                            required
                            placeholder="Enter Student ID Number (NIS)"
                            disabled={!isEditing}
                        />
                        <InputError className="mt-2" message={errors.nis} />
                        <p className="mt-1 text-xs text-gray-500">Updating NIS requires admin approval.</p>
                    </div>
                )}

                {/* Date Dropdown Demo */}
                <div className={!isEditing ? 'opacity-60 pointer-events-none' : ''}>
                    <InputLabel value="Date Selection" className="text-gray-700 dark:text-gray-300" />
                    <DateInput
                        value={birthDate}
                        onChange={setBirthDate}
                        className="mt-1"
                    />
                    {/* Optional: Show selected date value for debugging/proof */}
                    {birthDate && (
                        <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                            Selected: {birthDate.toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isEditing ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="flex items-center gap-4 pt-4">
                            {/* Animate button appearance */}
                            <PrimaryButton disabled={processing}>
                                Save Changes
                            </PrimaryButton>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Saved!</p>
                            </Transition>

                            {status === 'request-sent' && (
                                <div className="text-sm font-medium text-amber-600 dark:text-amber-400 animate-pulse">
                                    Request sent for approval.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}