import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

/**
 * Auto-refresh hook that polls the server using Inertia partial reloads.
 * Only reloads the specified props, and pauses when the tab is hidden.
 *
 * @param props - Array of prop names to reload (partial reload)
 * @param intervalMs - Polling interval in milliseconds (default: 5000)
 */
export default function useAutoRefresh(props: string[], intervalMs: number = 5000) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const startPolling = () => {
            if (intervalRef.current) return; // already running
            intervalRef.current = setInterval(() => {
                router.reload({ only: props });
            }, intervalMs);
        };

        const stopPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Immediately reload when tab becomes visible again
                router.reload({ only: props });
                startPolling();
            } else {
                stopPolling();
            }
        };

        // Start polling immediately
        startPolling();

        // Listen for tab visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
}
