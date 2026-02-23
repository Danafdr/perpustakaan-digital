import { ReactNode } from 'react';

interface BadgeProps {
    variant?: 'pending' | 'approved' | 'rejected' | 'success' | 'warning' | 'danger' | 'info';
    children: ReactNode;
    className?: string;
}

export default function Badge({ variant = 'info', children, className = '' }: BadgeProps) {
    const variantClasses = {
        pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
        approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        success: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        danger: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
        info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    };

    return (
        <span
            className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
                transition-colors duration-200
                ${variantClasses[variant]}
                ${className}
            `}
        >
            {children}
        </span>
    );
}
