import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';

export default function GuestLayout({ children }: PropsWithChildren) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-gray-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
            {/* Theme Toggle Button - Fixed Position */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 z-50 ring-1 ring-gray-200 dark:ring-gray-700"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                )}
            </button>

            <div className="w-full max-w-md px-6 animate-fade-in-up transition-all duration-500">

                <div className="flex justify-center mb-10">
                    <Link href="/" className="group flex flex-col items-center gap-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 group-hover:shadow-xl group-hover:ring-indigo-200 dark:group-hover:ring-indigo-800 transition-all duration-300 transform group-hover:-translate-y-1">
                            <ApplicationLogo className="w-12 h-12 fill-current text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">DigiLib<span className="text-indigo-600 dark:text-indigo-400">Pro</span></span>
                    </Link>
                </div>

                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl px-8 py-10 shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 rounded-3xl relative overflow-hidden transition-colors duration-200">
                    {/* Decorative blurred blob */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 dark:bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>

                    {children}
                </div>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8 font-medium">
                    &copy; {new Date().getFullYear()} DigiLib Pro Library System
                </p>
            </div>
        </div>
    );
}