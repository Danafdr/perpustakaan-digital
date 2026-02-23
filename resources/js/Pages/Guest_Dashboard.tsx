import GuestNavbar from '@/Components/GuestNavbar';
import { renderWithAppleEmojis } from '@/utils/appleEmoji';
import { Head, Link } from '@inertiajs/react';
import { Book } from './Student_Dashboard';
import useAutoRefresh from '@/hooks/useAutoRefresh';

declare var route: any;

interface GuestDashboardProps {
    books: Book[];
}

export default function Guest_Dashboard({ books }: GuestDashboardProps) {
    useAutoRefresh(['books']);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <GuestNavbar />

            <Head title="Welcome to DigiLib Pro" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* --- WELCOME BANNER --- */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-10 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold mb-2">Welcome to DigiLib Pro! 👋</h1>
                            <p className="text-indigo-100 max-w-xl">Explore our vast collection of books. Login to borrow and manage your loans.</p>
                            <div className="mt-6">
                                <Link
                                    href={route('login')}
                                    className="inline-block bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
                                >
                                    Login to Start Borrowing
                                </Link>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Available Books</h2>

                    {/* --- BOOKS GRID --- */}
                    {books.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400 dark:text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No books available</h3>
                            <p className="text-gray-500 dark:text-gray-400">Check back later for new additions to the library.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {books.map((book) => (
                                <div key={book.id} className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-indigo-500/20 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5 2h11l5 5v15a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm11.5 5.5v-3h-2v3a1 1 0 0 0 1 1h1v13h-13V3h3v3.5a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V3h1v4.5z" /></svg>
                                    </div>

                                    <div className="flex-1 z-10">
                                        <span className="inline-block px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-mono rounded mb-4 border border-gray-100 dark:border-gray-600">
                                            {book.kode_buku}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                            {renderWithAppleEmojis(book.judul_buku)}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{renderWithAppleEmojis(book.pengarang)}</p>
                                        <div className="space-y-1 mb-6">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                                {book.penerbit} ({book.tahun})
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href={route('login')}
                                        className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg dark:group-hover:shadow-none z-10"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                                        Login to Borrow
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
