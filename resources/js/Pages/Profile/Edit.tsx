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
    bookmarks?: any[];
    holds?: any[];
    transactionHistory?: any[];
}

export default function Edit({ mustVerifyEmail, status, userRequests = [], bookmarks = [], holds = [], transactionHistory = [] }: EditProfileProps) {
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


                        {/* Digital Library Activity */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 transition-colors duration-200 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
                                Digital Library Activity
                            </h2>

                            {/* Bookmarks */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                    </svg>
                                    My Bookmarks
                                </h3>
                                {bookmarks.length === 0 ? (
                                    <p className="text-sm text-gray-500">No bookmarks saved yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {bookmarks.map((bm: any) => (
                                            <div key={bm.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-750">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{bm.book?.judul_buku}</h4>
                                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">Marker</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{bm.progress_marker || "No marker provided"}"</p>
                                                <Link href={route('books.read', bm.book_id)} className="text-xs text-indigo-600 hover:underline mt-2 inline-block font-medium">Continue Reading &rarr;</Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Hold Requests */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-amber-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    Hold Requests
                                </h3>
                                {holds.length === 0 ? (
                                    <p className="text-sm text-gray-500">No active holds.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {holds.map((hold: any) => (
                                            <li key={hold.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{hold.book?.judul_buku}</p>
                                                    <p className="text-xs text-gray-500">Requested on: {new Date(hold.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${hold.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {hold.status.toUpperCase()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Transaction History */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                                    </svg>
                                    Loan History
                                </h3>
                                {transactionHistory.length === 0 ? (
                                    <p className="text-sm text-gray-500">No past loans found.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Borrowed Date</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {transactionHistory.map((t: any) => (
                                                    <tr key={t.id}>
                                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{t.book?.judul_buku}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{new Date(t.tanggal_pinjam).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2 text-sm">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.status === 'pinjam' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                                {t.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

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