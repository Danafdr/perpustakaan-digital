import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Badge from '@/Components/Badge';
import { PageProps } from '@/types';
import useAutoRefresh from '@/hooks/useAutoRefresh';

interface User {
    id: number;
    name: string;
    email: string;
}

interface PendingRequest {
    id: number;
    type: 'update_profile' | 'delete_account';
    data: any;
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    created_at: string;
}

interface MemberRequestsProps extends PageProps {
    member: User;
    requests: PendingRequest[];
}

export default function MemberRequests({ auth, member, requests }: MemberRequestsProps) {
    useAutoRefresh(['requests']);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="pending">Pending</Badge>;
            case 'approved':
                return <Badge variant="approved">Approved</Badge>;
            case 'rejected':
                return <Badge variant="rejected">Rejected</Badge>;
            default:
                return <Badge variant="info">{status}</Badge>;
        }
    };

    const getRequestTypeLabel = (type: string) => {
        switch (type) {
            case 'update_profile':
                return 'Profile Update';
            case 'delete_account':
                return 'Account Deletion';
            default:
                return type.replace('_', ' ');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Requests: ${member.name}`} />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('admin.dashboard')}
                                className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                            </Link>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    Member Requests History
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Viewing history for <span className="font-semibold text-gray-900 dark:text-gray-200">{member.name}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="p-6">
                            {requests.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">No request history found for this member</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Details
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {requests.map((request) => (
                                                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {getRequestTypeLabel(request.type)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDate(request.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(request.status)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {request.type === 'delete_account' ? (
                                                            <span className="text-red-600 dark:text-red-400">Request to delete account</span>
                                                        ) : (
                                                            request.data && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {Object.entries(request.data).map(([key, value]) => (
                                                                        <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                                            {key}: {String(value)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )
                                                        )}
                                                        {request.status === 'rejected' && request.reason && (
                                                            <div className="mt-1 text-xs text-red-500">
                                                                Reason: {request.reason}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
