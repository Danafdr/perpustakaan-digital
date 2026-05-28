import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { renderWithAppleEmojis } from '@/utils/appleEmoji';

// Declare Ziggy route function
declare var route: any;

// Define the User interface based on your project's needs
interface User {
    id: number;
    name: string;
    email: string;
    role: string; // Added role property
    email_verified_at: string | null;
}

// Define the structure of the shared page props
interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: any;
}

interface AuthenticatedLayoutProps extends PropsWithChildren {
    header?: ReactNode;
}

export default function AuthenticatedLayout({ header, children }: AuthenticatedLayoutProps) {
    // Access typed page props
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    // Theme management
    const { theme, toggleTheme } = useTheme();

    // Determine dashboard route based on user role
    const dashboardRoute = user?.role === 'admin' ? 'admin.dashboard' : 'student.dashboard';

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors duration-200">
            <nav className="border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30 shadow-sm transition-colors duration-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-indigo-600 dark:text-indigo-400" />
                                </Link>
                                <span className="ml-2 font-bold text-gray-800 dark:text-gray-100 text-lg md:hidden lg:block">Dana's <span className="text-indigo-600 dark:text-indigo-400">Digital Library</span></span>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route(dashboardRoute)}
                                    active={route().current(dashboardRoute)}
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center gap-3">
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

                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-gray-500 dark:text-gray-300 transition duration-150 ease-in-out hover:text-gray-700 dark:hover:text-gray-100 focus:outline-none"
                                            >
                                                {renderWithAppleEmojis(user.name)}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        {/* Admin Settings Link */}
                                        {user.role === 'admin' && (
                                            <Dropdown.Link href={route('admin.settings')}>
                                                Settings
                                            </Dropdown.Link>
                                        )}
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 dark:text-gray-300 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modern Mobile Navigation Overlay */}
                <div
                    className={`sm:hidden absolute w-full left-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-2xl z-40 transition-all duration-300 ease-out origin-top ${
                        showingNavigationDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'
                    }`}
                >
                    <div className="px-4 pt-4 pb-6 space-y-6">
                        {/* User Profile Card */}
                        <div className="flex items-center gap-4 bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl ring-2 ring-white dark:ring-gray-800 shadow-inner">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                    {renderWithAppleEmojis(user.name)}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-1">
                            <Link
                                href={route(dashboardRoute)}
                                onClick={() => setShowingNavigationDropdown(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${route().current(dashboardRoute) ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.99 9a.75.75 0 101.06-1.06l-9-9a2.25 2.25 0 00-3.18 0l-9 9a.75.75 0 101.06 1.06l8.99-9z" />
                                    <path d="M12 2.25l-9 9V19.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 19.5v-8.25l-9-9z" />
                                </svg>
                                Dashboard
                            </Link>

                            <Link
                                href={route('profile.edit')}
                                onClick={() => setShowingNavigationDropdown(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                </svg>
                                Profile
                            </Link>

                            {user.role === 'admin' && (
                                <Link
                                    href={route('admin.settings')}
                                    onClick={() => setShowingNavigationDropdown(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a3.375 3.375 0 01-2.489 2.489l-.549.092a1.875 1.875 0 01-2.115-1.114l-.254-.674a1.875 1.875 0 01.626-2.138L6.2 2.226a1.875 1.875 0 012.33-.299l.66.452a3.375 3.375 0 011.666-1.572L11.828 2.25zm.344 19.5c.916 0 1.699-.663 1.85-1.567l.091-.549a3.375 3.375 0 012.489-2.489l.549-.092a1.875 1.875 0 012.115 1.114l.254.674a1.875 1.875 0 01-.626 2.138l-1.096.793a1.875 1.875 0 01-2.33.299l-.66-.452a3.375 3.375 0 01-1.666 1.572l-.972.863z" clipRule="evenodd" />
                                    </svg>
                                    Settings
                                </Link>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {theme === 'light' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-500">
                                            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                        </svg>
                                    )}
                                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                                </div>
                                <div className={`w-11 h-6 bg-gray-200 dark:bg-indigo-600 rounded-full relative transition-colors shadow-inner`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : ''}`}></div>
                                </div>
                            </button>

                            <Link
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                                </svg>
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex flex-col">{children}</main>
        </div>
    );
}