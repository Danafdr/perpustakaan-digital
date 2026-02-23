import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEvent, useRef, ChangeEvent } from 'react';

// Declare route for TypeScript if Ziggy types are not globally defined
declare var route: any;

interface UpdatePasswordFormProps {
    className?: string;
    isEditing?: boolean;
}

export default function UpdatePasswordForm({
    className = '',
    isEditing = false,
}: UpdatePasswordFormProps) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e: FormEvent) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Update Password
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ensure your account is using a long, random password to stay secure.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                        className="text-gray-700 dark:text-gray-300"
                    />
                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        className={`mt-1 block w-full border-gray-300 dark:border-gray-600 dark:text-gray-100 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800 cursor-default opacity-80' : 'bg-white dark:bg-gray-700'}`}
                        autoComplete="current-password"
                        disabled={!isEditing}
                    />
                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" className="text-gray-700 dark:text-gray-300" />
                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setData('password', e.target.value)
                        }
                        type="password"
                        className={`mt-1 block w-full border-gray-300 dark:border-gray-600 dark:text-gray-100 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800 cursor-default opacity-80' : 'bg-white dark:bg-gray-700'}`}
                        autoComplete="new-password"
                        disabled={!isEditing}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm New Password"
                        className="text-gray-700 dark:text-gray-300"
                    />
                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className={`mt-1 block w-full border-gray-300 dark:border-gray-600 dark:text-gray-100 ${!isEditing ? 'bg-gray-50 dark:bg-gray-800 cursor-default opacity-80' : 'bg-white dark:bg-gray-700'}`}
                        autoComplete="new-password"
                        disabled={!isEditing}
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isEditing ? 'grid-rows-[1fr] delay-150' : 'grid-rows-[0fr] delay-0'}`}>
                    <div className="overflow-hidden">
                        <div className="flex items-center gap-4 pt-4">
                            <PrimaryButton disabled={processing}>
                                Update Password
                            </PrimaryButton>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Password Updated!</p>
                            </Transition>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}