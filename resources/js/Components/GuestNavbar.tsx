import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';

declare var route: any;

export default function GuestNavbar() {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30 shadow-sm transition-colors duration-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex shrink-0 items-center">
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-indigo-600 dark:text-indigo-400" />
                            </Link>
                            <span className="ml-2 font-bold text-gray-800 dark:text-gray-100 text-lg">DigiLib<span className="text-indigo-600 dark:text-indigo-400">Pro</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
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

                        <div className="flex gap-4">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 ring-1 ring-gray-300 dark:ring-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-[#FF2D20] transition-colors"
                            >
                                Sign up
                            </Link>
                            <Link
                                href={route('login')}
                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 focus:outline-none focus-visible:ring-[#FF2D20] transition-all transform hover:-translate-y-0.5"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
