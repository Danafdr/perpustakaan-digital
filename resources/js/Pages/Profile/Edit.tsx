import { Transition } from '@headlessui/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ProfileRequestsSection from './Partials/ProfileRequestsSection';

interface EditProfileProps {
    mustVerifyEmail: boolean;
    status?: string;
    userRequests?: any[];
}

export default function Edit({ mustVerifyEmail, status, userRequests = [] }: EditProfileProps) {
    // Correctly typed usePage hook
    const { auth } = usePage<PageProps>().props;

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account information and security</p>
                        </div>
                        <button
                            onClick={() => {
                                setIsEditing(!isEditing);
                                if (!isEditing) {
                                    // Slight delay to allow state update before focusing
                                    setTimeout(() => document.getElementById('name')?.focus(), 50);
                                }
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${isEditing
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {isEditing ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                    Cancel Editing
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                    Edit Profile
                                </>
                            )}
                        </button>
                    </div>

                    <div>
                        {/* Profile Information Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 transition-colors duration-200 mb-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className={`transition-all duration-300 ease-in-out ${isEditing ? 'max-w-full' : 'max-w-xl'}`}
                                isEditing={isEditing}
                            />
                        </div>

                        {/* Password Update Section */}
                        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isEditing ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                            <div className="overflow-hidden">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 transition-colors duration-200 mb-6">
                                    <UpdatePasswordForm
                                        className="max-w-full transition-all duration-300 ease-in-out"
                                        isEditing={isEditing}
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Profile Requests Section - Show user's pending/approved/rejected requests */}
                        {false && userRequests && userRequests.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 transition-colors duration-200 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        Recent Requests
                                    </h2>
                                    <Link
                                        href={route('profile.requests.index')}
                                        className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                                    >
                                        View All History
                                    </Link>
                                </div>
                                <ProfileRequestsSection
                                    requests={userRequests.slice(0, 2)}
                                    className="max-w-xl"
                                />
                            </div>
                        )}

                        {/* Danger Zone: Account Deletion Section */}
                        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 p-6 sm:p-8 transition-colors duration-200 ${!isEditing ? 'opacity-60 grayscale-[0.5] pointer-events-none' : ''}`}>
                            <div className="relative">
                                {!isEditing && (
                                    <div className="absolute inset-x-0 -top-2 flex justify-center z-10">
                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded">Locked</span>
                                    </div>
                                )}
                                <DeleteUserForm className="max-w-xl" status={status} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}