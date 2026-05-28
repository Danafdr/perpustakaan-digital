import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ThemeProvider } from './Contexts/ThemeContext';
import { SpeedInsights } from "@vercel/speed-insights/react";

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.tsx`, // <--- MAKE SURE THIS SAYS .tsx
        import.meta.glob('./Pages/**/*.tsx') // <--- AND THIS TOO
    ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ThemeProvider>
                <App {...props} />
                <SpeedInsights />
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});