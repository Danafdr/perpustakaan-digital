import Badge from '@/Components/Badge';
import { useState } from 'react';

interface PendingRequest {
    id: number;
    type: 'update_profile' | 'delete_account';
    data: any;
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    created_at: string;
    updated_at: string;
}

interface ProfileRequestsSectionProps {
    requests: PendingRequest[];
    className?: string;
}

export default function ProfileRequestsSection({ requests, className = '' }: ProfileRequestsSectionProps) {
    const [expandedRequest, setExpandedRequest] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedRequest(expandedRequest === id ? null : id);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="pending">Pending Approval</Badge>;
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
                return type;
        }
    };

    const renderRequestData = (request: PendingRequest) => {
        if (request.type === 'delete_account') {
            return (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                    <p className="text-sm text-red-700 dark:text-red-300">
                        You requested to delete your account permanently.
                    </p>
                </div>
            );
        }

        if (request.type === 'update_profile' && request.data) {
            return (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Requested Changes:</p>
                    <div className="space-y-1">
                        {Object.entries(request.data).map(([key, value]) => (
                            <div key={key} className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{key}:</span>{' '}
                                <span className="text-gray-600 dark:text-gray-400">{value as string}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return null;
    };

    if (!requests || requests.length === 0) {
        return null;
    }

    return (
        <section className={className}>
            <header>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            My Profile Requests
                        </h2>
                    </div>
                </div>
            </header>

            <div className="mt-6 space-y-3">
                {requests.length === 0 ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                            No requests found
                        </p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden transition-all duration-200 hover:shadow-md"
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {getRequestTypeLabel(request.type)}
                                            </h3>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Submitted on {formatDate(request.created_at)}
                                        </p>
                                        {request.status === 'pending' && (
                                            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/50">
                                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                                    ⏳ Waiting for administrator approval
                                                </p>
                                            </div>
                                        )}
                                        {request.status === 'rejected' && request.reason && (
                                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50">
                                                <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Reason for rejection:</p>
                                                <p className="text-xs text-red-600 dark:text-red-400">{request.reason}</p>
                                            </div>
                                        )}
                                    </div>
                                    {request.type === 'update_profile' && (
                                        <button
                                            onClick={() => toggleExpand(request.id)}
                                            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            <svg
                                                className={`w-5 h-5 transition-transform duration-200 ${expandedRequest === request.id ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {expandedRequest === request.id && renderRequestData(request)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {requests.some(r => r.status === 'pending') && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-semibold mb-1">About Request Approval</p>
                            <p>All profile updates and account deletions require administrator approval for security reasons. You'll be notified once your request is reviewed.</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
