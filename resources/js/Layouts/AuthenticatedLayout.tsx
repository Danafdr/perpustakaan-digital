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
                                <span className="ml-2 font-bold text-gray-800 dark:text-gray-100 text-lg md:hidden lg:block">DigiLib<span className="text-indigo-600 dark:text-indigo-400">Pro</span></span>
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

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden transition-all duration-300'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route(dashboardRoute)}
                            active={route().current(dashboardRoute)}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pb-3 pt-3 px-4">
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                            {theme === 'light' ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                                    </svg>
                                    <span>Dark Mode</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                    </svg>
                                    <span>Light Mode</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-100">
                                {renderWithAppleEmojis(user.name)}
                            </div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            {/* Admin Settings Link */}
                            {user.role === 'admin' && (
                                <ResponsiveNavLink href={route('admin.settings')}>
                                    Settings
                                </ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex flex-col">{children}</main>
        </div>
    );
}