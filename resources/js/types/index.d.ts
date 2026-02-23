// 1. Import Config from ziggy-js so TypeScript knows what it is
import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    email_verified_at: string | null;
    role: string;
    nis?: string | null;
}

export type PageProps<T = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    ziggy: Config & { location: string };
    [key: string]: unknown; // Allows extra props without errors
};