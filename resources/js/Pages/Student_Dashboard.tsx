import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import DateInput from '@/Components/DateInput';
import useAutoRefresh from '@/hooks/useAutoRefresh';
import { renderWithAppleEmojis } from '@/utils/appleEmoji';

// --- 1. Tell TypeScript 'route' exists ---
declare var route: any;

// --- 2. Strict Interfaces ---
export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    email_verified_at: string | null;
    role: string;
}

export interface Book {
    id: number;
    kode_buku: string;
    judul_buku: string;
    pengarang: string;
    penerbit: string;
    tahun: number;
}

export interface Transaction {
    id: number;
    user_id: number;
    book: Book;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    status: 'pinjam' | 'kembali';
}

interface StudentDashboardProps {
    auth: { user: User };
    books: Book[];
    activeTransactions: Transaction[];
}

export default function StudentDashboard({ auth, books, activeTransactions = [] }: StudentDashboardProps) {

    // --- AUTO-REFRESH ---
    useAutoRefresh(['books', 'activeTransactions']);

    // --- STATE ---
    const [activeTab, setActiveTab] = useState<'browse' | 'my-books'>('browse');

    // Borrow Modal State
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [borrowMode, setBorrowMode] = useState<'today' | 'later'>('today');
    const [durationHours, setDurationHours] = useState<string>('3');
    const [durationMinutes, setDurationMinutes] = useState<string>('0');
    const [endDate, setEndDate] = useState<string>('');

    // Return Modal State
    const [returnModalOpen, setReturnModalOpen] = useState<boolean>(false);
    const [transactionToReturn, setTransactionToReturn] = useState<Transaction | null>(null);

    const { reset } = useForm();
    // Search state for browsing books
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredBooks = books.filter((b) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        return (
            b.judul_buku.toLowerCase().includes(q) ||
            b.pengarang.toLowerCase().includes(q) ||
            b.kode_buku.toLowerCase().includes(q) ||
            String(b.tahun).includes(q)
        );
    });

    // --- HANDLERS ---
    const openBorrowModal = (book: Book) => {
        setSelectedBook(book);
        setBorrowMode('today');
        setDurationHours('3');
        setEndDate('');
    };

    const closeBorrowModal = () => {
        setSelectedBook(null);
        reset();
    };

    const handleBorrowConfirm = () => {
        if (!selectedBook) return;

        let calculatedDate = new Date();

        if (borrowMode === 'today') {
            const hours = parseInt(durationHours) || 0;
            const minutes = parseInt(durationMinutes) || 0;
            calculatedDate.setHours(calculatedDate.getHours() + hours);
            calculatedDate.setMinutes(calculatedDate.getMinutes() + minutes);
        } else {
            if (!endDate) return alert("Please pick a date!");
            calculatedDate = new Date(endDate);
            calculatedDate.setHours(23, 59, 0);
        }

        const offset = calculatedDate.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(calculatedDate.getTime() - offset)).toISOString().slice(0, 19).replace('T', ' ');

        router.post(route('transactions.store', selectedBook.id), {
            return_date: localISOTime
        }, {
            onSuccess: () => {
                closeBorrowModal();
                setActiveTab('my-books');
            }
        });
    };

    // --- RETURN MODAL HANDLERS ---
    const openReturnModal = (transaction: Transaction) => {
        setTransactionToReturn(transaction);
        setReturnModalOpen(true);
    };

    const closeReturnModal = () => {
        setReturnModalOpen(false);
        setTimeout(() => setTransactionToReturn(null), 200);
    };

    const confirmReturn = () => {
        if (transactionToReturn) {
            router.post(route('transactions.return', transactionToReturn.id), {}, {
                onSuccess: () => closeReturnModal()
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Library" />

            <div className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- WELCOME BANNER --- */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-10 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold mb-2">Welcome back, {auth.user.name.split(' ')[0]}! 👋</h1>
                            <p className="text-indigo-100 max-w-xl">Explore our vast collection of books and manage your loans easily. Happy reading!</p>
                        </div>
                    </div>

                    {/* --- TABS + SEARCH BAR --- */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex space-x-1 bg-gray-200/50 dark:bg-gray-700/50 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('browse')}
                                className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'browse'
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                Browse Books
                            </button>
                            <button
                                onClick={() => setActiveTab('my-books')}
                                className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'my-books'
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                Borrowed Books {activeTransactions.length > 0 && <span className="ml-1 px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-600 rounded-full">{activeTransactions.length}</span>}
                            </button>
                        </div>

                        {/* Search Bar - right side */}
                        {activeTab === 'browse' && (
                            <div className="w-full sm:w-80">
                                <label className="sr-only">Search books</label>
                                <div className="relative">
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by title, author, code or year..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z" /></svg>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- CONTENT: BROWSE --- */}
                    {activeTab === 'browse' && (
                        <div>

                            {filteredBooks.length === 0 ? (
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {filteredBooks.map((book) => (
                                        <div key={book.id} className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-indigo-500/20 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                                            </div>

                                            <div className="flex-1 z-10">
                                                <span className="inline-block px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-mono rounded mb-4 border border-gray-100 dark:border-gray-600">
                                                    {book.kode_buku}
                                                </span>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                                    {renderWithAppleEmojis(book.judul_buku)}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{renderWithAppleEmojis(book.pengarang)}</p>
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                    {book.pengarang}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <svg className="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                                    {book.penerbit} ({book.tahun})
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => openBorrowModal(book)}
                                                className="w-full mt-5 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg dark:group-hover:shadow-none z-10"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                                Borrow Now
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- CONTENT: MY BOOKS --- */}
                    {activeTab === 'my-books' && (
                        <div className="space-y-4">
                            {activeTransactions.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-200">
                                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-indigo-400 dark:text-indigo-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No active loans</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">You haven't borrowed any books yet. Browse our collection and find something new to read!</p>
                                    <button onClick={() => setActiveTab('browse')} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg dark:shadow-none transition-all">Start Browsing</button>
                                </div>
                            ) : (
                                activeTransactions.map((t) => {
                                    const isOverdue = new Date() > new Date(t.tanggal_kembali);
                                    return (
                                        <div key={t.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-all">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 19.477 5.754 20 7.5 20s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 19.477 18.247 20 16.5 20a6.5 6.5 0 01-3-0.844"></path></svg>
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${isOverdue ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                            {isOverdue ? 'OVERDUE' : 'ACTIVE LOAN'}
                                                        </span>
                                                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{t.book.kode_buku}</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{renderWithAppleEmojis(t.book.judul_buku)}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">by {renderWithAppleEmojis(t.book.pengarang)}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due Date: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatDate(t.tanggal_kembali)}</span></p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => openReturnModal(t)}
                                                className="w-full md:w-auto px-6 py-3 bg-white dark:bg-gray-700 border-2 border-indigo-100 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                Return Book
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- BORROW MODAL WITH HEADLESS UI --- */}
            <Transition appear show={!!selectedBook} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeBorrowModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95 translate-y-4"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 translate-y-4"
                            >
                                <Dialog.Panel className="w-full max-w-lg transform rounded-3xl bg-white dark:bg-gray-800 p-8 text-left align-middle shadow-2xl transition-all border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                                                Confirm Borrowing
                                            </Dialog.Title>
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Set your return schedule below.</p>
                                        </div>
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                                            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 19.477 5.754 20 7.5 20s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 19.477 18.247 20 16.5 20a6.5 6.5 0 01-3-0.844"></path></svg>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-600">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Selected Book</p>
                                        <p className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-1">{selectedBook && renderWithAppleEmojis(selectedBook.judul_buku)}</p>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <span className="bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded text-xs font-mono">{selectedBook?.kode_buku}</span>
                                            <span>by {selectedBook && renderWithAppleEmojis(selectedBook.pengarang)}</span>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
                                        <button
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${borrowMode === 'today' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                            onClick={() => setBorrowMode('today')}>
                                            Return Today
                                        </button>
                                        <button
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${borrowMode === 'later' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                            onClick={() => setBorrowMode('later')}>
                                            Return Later
                                        </button>
                                    </div>

                                    {borrowMode === 'today' ? (
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Hours</label>
                                                    <input type="number" min="1" max="10"
                                                        value={durationHours} onChange={e => setDurationHours(e.target.value)}
                                                        className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2.5" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Minutes</label>
                                                    <input type="number" min="0" max="59" step="15"
                                                        value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)}
                                                        className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2.5" />
                                                </div>
                                            </div>
                                            <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 p-4 rounded-xl text-sm flex items-center justify-between">
                                                <span className="font-medium">Must return by:</span>
                                                <span className="font-bold text-lg">
                                                    {(() => {
                                                        const d = new Date();
                                                        d.setHours(d.getHours() + (parseInt(durationHours) || 0));
                                                        d.setMinutes(d.getMinutes() + (parseInt(durationMinutes) || 0));
                                                        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Select Return Date</label>
                                                <DateInput
                                                    value={endDate ? new Date(endDate) : null}
                                                    onChange={(date) => {
                                                        if (date) {
                                                            // Adjust for timezone to ensure the string date is correct
                                                            const offset = date.getTimezoneOffset();
                                                            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                                                            setEndDate(localDate.toISOString().split('T')[0]);
                                                        } else {
                                                            setEndDate('');
                                                        }
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">Please return the book before the library closes on the selected date.</p>
                                        </div>
                                    )}

                                    <div className="mt-8 flex gap-3">
                                        <button
                                            type="button"
                                            className="flex-1 justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition"
                                            onClick={closeBorrowModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="flex-1 justify-center rounded-xl border border-transparent bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none shadow-lg dark:shadow-none transition"
                                            onClick={handleBorrowConfirm}
                                        >
                                            Confirm Borrow
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* --- RETURN CONFIRMATION MODAL --- */}
            <Transition appear show={returnModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeReturnModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95 translate-y-4"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 translate-y-4"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 text-left align-middle shadow-2xl transition-all border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-indigo-600 dark:text-indigo-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                            </svg>
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                                                Confirm Return
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Return this book to the library</p>
                                        </div>
                                    </div>

                                    <div className="mt-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            Are you sure you want to return <br />
                                            <span className="font-bold text-gray-900 dark:text-white">{transactionToReturn?.book.judul_buku}</span>?
                                        </p>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition"
                                            onClick={closeReturnModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition shadow-lg dark:shadow-none"
                                            onClick={confirmReturn}
                                        >
                                            Confirm Return
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayout >
    );
}