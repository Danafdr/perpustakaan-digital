import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEvent, useRef, useState, ChangeEvent } from 'react';

// Tell TypeScript that the global 'route' function from Ziggy exists
declare var route: any;

interface DeleteUserFormProps {
    className?: string;
    status?: string;
}

export default function DeleteUserForm({ className = '', status }: DeleteUserFormProps) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState<boolean>(false);

    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm<{
        password: string;
    }>({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e: FormEvent) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Delete Account
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Once deleted, all your data will be permanently removed.
                        </p>
                    </div>
                </div>
            </header>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">
                    Once your account is deleted, all of its resources and data will be permanently deleted.
                    Before deleting your account, please download any data or information that you wish to retain.
                </p>
            </div>

            {status === 'deletion-request-sent' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200 animate-pulse">
                        Deletion request has been sent to the administrator.
                    </p>
                </div>
            )}

            <DangerButton onClick={confirmUserDeletion}>
                Delete Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 bg-white dark:bg-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete
                        your account.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-gray-700 dark:text-gray-300"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:text-gray-100"
                            isFocused
                            placeholder="Enter your password to confirm"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton disabled={processing}>
                            Delete Account
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}