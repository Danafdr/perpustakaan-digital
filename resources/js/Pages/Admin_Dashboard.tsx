import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, FormEvent, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Badge from '@/Components/Badge';
import SelectInput from '@/Components/SelectInput';
import useAutoRefresh from '@/hooks/useAutoRefresh';
import { renderWithAppleEmojis } from '@/utils/appleEmoji';

// --- 1. QUICK FIX: Tell TypeScript that 'route' exists ---
declare var route: any;

// --- 2. Interfaces ---
export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    email_verified_at: string | null;
    role: string;
    nis?: string;
    date_of_birth?: string;
    created_at?: string;
    is_approved: boolean; // Added approval status
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
    user: User;
    book: Book;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    status: 'pinjam' | 'kembali';
}

export interface PendingRequest {
    id: number;
    user: User;
    type: 'update_profile' | 'delete_account';
    data: any;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface AdminDashboardProps {
    auth: { user: User };
    totalBooks: number;
    totalMembers: number;
    totalTransactions: number;
    books: Book[];
    transactions: Transaction[];
    members: User[];
    pendingRequests?: PendingRequest[];
}

export default function AdminDashboard({
    auth,
    totalBooks,
    totalMembers,
    totalTransactions,
    books,
    transactions,
    members,
    pendingRequests = []
}: AdminDashboardProps) {

    // --- AUTO-REFRESH ---
    useAutoRefresh(['books', 'transactions', 'members', 'pendingRequests', 'totalBooks', 'totalMembers', 'totalTransactions']);

    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState<'books' | 'transactions' | 'members'>('books');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editBookId, setEditBookId] = useState<number | null>(null);

    console.log("Admin Dashboard Mounting...", { auth, totalBooks, books }); // DEBUG LOG

    // --- MODAL STATE ---
    const [returnModalOpen, setReturnModalOpen] = useState<boolean>(false);
    const [transactionToReturn, setTransactionToReturn] = useState<Transaction | null>(null);

    // --- DELETE BOOK MODAL STATE ---
    const [deleteBookConfirmOpen, setDeleteBookConfirmOpen] = useState<boolean>(false);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

    // --- MEMBER MODAL STATE ---
    const [memberModalOpen, setMemberModalOpen] = useState<boolean>(false);
    const [editingMember, setEditingMember] = useState<User | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
    const [memberToDelete, setMemberToDelete] = useState<User | null>(null);

    // Password Modal State
    const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
    const [memberPasswordId, setMemberPasswordId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Rejection Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
    const [requestToReject, setRequestToReject] = useState<PendingRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string>('');

    // Approval Modal State
    const [approveModalOpen, setApproveModalOpen] = useState<boolean>(false);
    const [requestToApprove, setRequestToApprove] = useState<PendingRequest | null>(null);

    // Member form
    const memberForm = useForm({
        name: '',
        email: '',
        nis: '',
        role: 'student', // Add role
    });

    const { data, setData, post, put, reset, errors } = useForm({
        judul_buku: '',
        pengarang: '',
        penerbit: '',
        tahun: '' as string | number,
    });

    // --- FORM HANDLERS ---
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEditing && editBookId) {
            put(route('books.update', editBookId), { onSuccess: () => resetForm() });
        } else {
            post(route('books.store'), { onSuccess: () => resetForm() });
        }
    };

    const handleEdit = (book: Book) => {
        setIsEditing(true);
        setEditBookId(book.id);
        setData({
            judul_buku: book.judul_buku,
            pengarang: book.pengarang,
            penerbit: book.penerbit,
            tahun: book.tahun,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (book: Book) => {
        setBookToDelete(book);
        setDeleteBookConfirmOpen(true);
    };

    const closeDeleteBookConfirm = () => {
        setDeleteBookConfirmOpen(false);
        setTimeout(() => setBookToDelete(null), 200);
    };

    const confirmDeleteBook = () => {
        if (bookToDelete) {
            router.delete(route('books.destroy', bookToDelete.id), {
                onSuccess: () => closeDeleteBookConfirm()
            });
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditBookId(null);
        reset();
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

    // --- MEMBER HANDLERS ---
    const openMemberModal = (member: User) => {
        setEditingMember(member);
        memberForm.setData({
            name: member.name,
            email: member.email,
            nis: member.nis || '',
            role: member.role || 'student', // Set role
        });
        setMemberModalOpen(true);
    };

    const closeMemberModal = () => {
        setMemberModalOpen(false);
        setTimeout(() => {
            setEditingMember(null);
            memberForm.reset();
        }, 200);
    };

    const handleMemberUpdate = (e: FormEvent) => {
        e.preventDefault();
        if (editingMember) {
            memberForm.put(route('members.update', editingMember.id), {
                onSuccess: () => closeMemberModal()
            });
        }
    };

    const openDeleteConfirm = (member: User) => {
        setMemberToDelete(member);
        setDeleteConfirmOpen(true);
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setTimeout(() => setMemberToDelete(null), 200);
    };

    const confirmDeleteMember = () => {
        if (memberToDelete) {
            router.delete(route('members.destroy', memberToDelete.id), {
                onSuccess: () => closeDeleteConfirm()
            });
        }
    };

    // --- APPROVAL & PASSWORD HANDLERS ---
    const handleApprove = (id: number) => {
        router.post(route('members.approve', id));
    };

    const handleReject = (id: number) => {
        if (confirm('Are you sure you want to reject and delete this user?')) {
            router.post(route('members.reject', id));
        }
    };

    const openPasswordModal = (id: number) => {
        setMemberPasswordId(id);
        setNewPassword('');
        setShowPassword(false);
        setPasswordModalOpen(true);
    };

    const closePasswordModal = () => {
        setPasswordModalOpen(false);
        setTimeout(() => setMemberPasswordId(null), 200);
    };

    const handlePasswordUpdate = (e: FormEvent) => {
        e.preventDefault();
        if (memberPasswordId) {
            router.put(route('members.password.update', memberPasswordId), {
                password: newPassword
            }, {
                onSuccess: () => closePasswordModal()
            });
        }
    };

    const openApproveModal = (request: PendingRequest) => {
        setRequestToApprove(request);
        setApproveModalOpen(true);
    };

    const closeApproveModal = () => {
        setApproveModalOpen(false);
        setTimeout(() => setRequestToApprove(null), 200);
    };

    const confirmApproveRequest = () => {
        if (requestToApprove) {
            router.post(route('requests.approve', requestToApprove.id), {}, {
                onSuccess: () => closeApproveModal()
            });
        }
    };

    const openRejectModal = (request: PendingRequest) => {
        setRequestToReject(request);
        setRejectionReason('');
        setRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        setRejectModalOpen(false);
        setTimeout(() => {
            setRequestToReject(null);
            setRejectionReason('');
        }, 200);
    };

    const handleRejectRequest = (e?: FormEvent) => {
        if (e) e.preventDefault();
        if (requestToReject) {
            router.post(route('requests.reject', requestToReject.id), {
                reason: rejectionReason || null
            }, {
                onSuccess: () => closeRejectModal()
            });
        }
    };

    // Helper: Format Date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="flex h-[calc(100vh-65px)] bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-200">

                {/* --- MODERN SIDEBAR --- */}
                <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-10 transition-colors duration-200">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="bg-indigo-600 rounded-lg p-2 shadow-lg dark:shadow-none">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                                    <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.472a.75.75 0 0 0 1-.707V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">DigiLib<span className="text-indigo-600 dark:text-indigo-400">Pro</span></span>
                        </div>

                        <nav className="space-y-1.5">
                            <button
                                onClick={() => setActiveTab('books')}
                                className={`w-full group flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ease-in-out ${activeTab === 'books' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 mb-1'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 transition-colors ${activeTab === 'books' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.472a.75.75 0 0 0 1-.707V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                                </svg>
                                Library Books
                            </button>

                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`w-full group flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ease-in-out ${activeTab === 'transactions' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 mb-1'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 transition-colors ${activeTab === 'transactions' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                                </svg>
                                Book Monitoring
                            </button>

                            <button
                                onClick={() => setActiveTab('members')}
                                className={`w-full group flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ease-in-out ${activeTab === 'members' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 mb-1'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 transition-colors ${activeTab === 'members' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                                </svg>
                                Members
                            </button>
                        </nav>

                        <div className="mt-auto pt-10">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
                                <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-1">Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-sm font-bold">System Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* --- MAIN CONTENT AREA --- */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto space-y-8">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back, Administrator</p>
                            </div>
                        </div>

                        {/* STATS ROW */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Total Books', value: totalBooks, icon: '📚', color: 'indigo', trend: '+12%' },
                                { title: 'Active Members', value: totalMembers, icon: '👥', color: 'emerald', trend: '+5%' },
                                { title: 'Borrowed Books', value: totalTransactions, icon: '🔄', color: 'amber', trend: '+8%' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                                            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</h3>
                                        </div>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${stat.color}-50`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">{stat.trend}</span>
                                        <span className="text-gray-400 text-xs">vs last month</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- TAB CONTENT: BOOKS --- */}
                        {activeTab === 'books' && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* FORM */}
                                <div className="xl:col-span-1">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-4 transition-colors duration-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    {isEditing ? 'Edit Book' : 'Add New Book'}
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">Enter book details below</p>
                                            </div>
                                            {isEditing && (
                                                <button onClick={resetForm} className="text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition">
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {[
                                                { id: 'judul_buku', label: 'Title', placeholder: 'Book Title' },
                                                { id: 'pengarang', label: 'Author', placeholder: 'Author Name' },
                                                { id: 'penerbit', label: 'Publisher', placeholder: 'Publisher Name' },
                                            ].map((field) => (
                                                <div key={field.id}>
                                                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
                                                    <input
                                                        type="text"
                                                        id={field.id}
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                                                        value={data[field.id as keyof typeof data]}
                                                        onChange={e => setData(field.id as any, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Year</label>
                                                <input
                                                    type="number"
                                                    placeholder="2024"
                                                    className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                                                    value={data.tahun}
                                                    onChange={e => setData('tahun', e.target.value)}
                                                />
                                            </div>

                                            <button type="submit" className={`w-full py-2.5 rounded-lg shadow-lg dark:shadow-none text-white font-semibold transition-all duration-200 transform active:scale-95 flex justify-center items-center gap-2 ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                                {isEditing ? (
                                                    <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg> Update Book</>
                                                ) : (
                                                    <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> Save Book</>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* TABLE */}
                                <div className="xl:col-span-2">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Library Collection</h3>
                                            <div className="relative">
                                                <input type="text" placeholder="Search books..." className="pl-9 pr-4 py-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 w-64" />
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-2.5 text-gray-400">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                                    <tr>
                                                        {['Code', 'Title', 'Author', 'Publisher', 'Year', 'Actions'].map((h, i) => (
                                                            <th key={i} className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                                    {books.map((book) => (
                                                        <tr key={book.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-mono">{book.kode_buku}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">{renderWithAppleEmojis(book.judul_buku)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{renderWithAppleEmojis(book.pengarang)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{book.penerbit}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{book.tahun}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleEdit(book)} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                                        </svg>
                                                                    </button>
                                                                    <button onClick={() => handleDelete(book)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- TAB CONTENT: TRANSACTIONS --- */}
                        {activeTab === 'transactions' && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Live Transaction Monitor</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Real-time borrowing statuses</p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Book</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                            {transactions && transactions.map((t) => {
                                                const isOverdue = new Date() > new Date(t.tanggal_kembali) && t.status === 'pinjam';
                                                return (
                                                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                                                                {t.user.name.charAt(0)}
                                                            </div>
                                                            {renderWithAppleEmojis(t.user.name)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{renderWithAppleEmojis(t.book.judul_buku)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            <div className={isOverdue ? 'text-red-600 font-bold flex items-center gap-1' : 'text-gray-700 dark:text-gray-300'}>
                                                                {formatDate(t.tanggal_kembali)}
                                                                {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded border border-red-200">OVERDUE</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${t.status === 'pinjam' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 my-auto ${t.status === 'pinjam' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                                                {t.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            {t.status === 'pinjam' ? (
                                                                <button
                                                                    onClick={() => openReturnModal(t)}
                                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1.5 px-3 py-1 rounded-md hover:bg-indigo-50 transition"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                                                    </svg>
                                                                    Return
                                                                </button>
                                                            ) : (
                                                                <span className="text-gray-400 flex items-center gap-1.5 opacity-60">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                    </svg>
                                                                    Done
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- TAB CONTENT: MEMBERS --- */}
                        {activeTab === 'members' && (
                            <div className="space-y-8">
                                {/* --- PENDING REQUESTS SECTION --- */}
                                {pendingRequests.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-600">
                                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z" clipRule="evenodd" />
                                                </svg>
                                                Pending Requests
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Approvals required for profile updates</p>
                                        </div>
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                            {pendingRequests.map((req) => (
                                                <div key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${req.type === 'delete_account' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {req.type.replace('_', ' ')}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(req.created_at)}</span>
                                                        </div>
                                                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                                                            <span className="font-bold">{req.user.name}</span> requested to {req.type === 'delete_account' ? 'delete their account' : 'update their profile'}.
                                                        </p>
                                                        {req.type === 'update_profile' && req.data && (
                                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 inline-block">
                                                                <div className="grid grid-cols-1 gap-1">
                                                                    {Object.entries(req.data).map(([key, value]) => (
                                                                        <div key={key} className="flex gap-2 text-sm">
                                                                            <span className="font-medium text-gray-500 dark:text-gray-400 capitalize min-w-[80px]">{key.replace('_', ' ')}:</span>
                                                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{String(value)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 self-start sm:self-center">
                                                        <button
                                                            onClick={() => openApproveModal(req)}
                                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(req)}
                                                            className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-sm font-bold rounded-lg shadow-sm transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Members</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage registered library members (Admins & Students)</p>
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{members.length} total members</span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIS</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {members.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                            No members found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    members.map((member) => (
                                                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                                                                    {member.nis || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${member.role === 'admin' ? 'bg-indigo-600' : (member.is_approved ? 'bg-gradient-to-br from-indigo-500 to-purple-500' : 'bg-gray-400')}`}>
                                                                        {member.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                                            {renderWithAppleEmojis(member.name)}
                                                                            {member.id === auth.user.id && <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">YOU</span>}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">{member.username}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${member.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                                                    {member.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {member.is_approved ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                                        Active
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                                        Pending
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <button
                                                                    onClick={() => openPasswordModal(member.id)}
                                                                    className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded transition flex items-center gap-2"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                                    </svg>
                                                                    Change Password
                                                                </button>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {!member.is_approved ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleApprove(member.id)}
                                                                                className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                                                                            >
                                                                                Approve
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleReject(member.id)}
                                                                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => openMemberModal(member)}
                                                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                                                                                title="Edit Details"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                                                </svg>
                                                                            </button>
                                                                            <Link
                                                                                href={route('members.requests', member.id)}
                                                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                                                                                title="View Request History"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                                </svg>
                                                                            </Link>
                                                                            <button
                                                                                onClick={() => openDeleteConfirm(member)}
                                                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                                                                                title="Delete Member"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                                </svg>
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>

            {/* --- DELETE BOOK CONFIRMATION MODAL --- */}
            <Transition appear show={deleteBookConfirmOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeDeleteBookConfirm}>
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
                                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-600 dark:text-red-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                                                Delete Book
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone</p>
                                        </div>
                                    </div>

                                    <div className="mt-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/50">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            Are you sure you want to delete <br />
                                            <span className="font-bold text-gray-900 dark:text-white">{bookToDelete?.judul_buku}</span>?
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Code: <span className="font-mono">{bookToDelete?.kode_buku}</span> · by {bookToDelete?.pengarang}
                                        </p>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition"
                                            onClick={closeDeleteBookConfirm}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition shadow-lg dark:shadow-none"
                                            onClick={confirmDeleteBook}
                                        >
                                            Delete Book
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* --- HEADLESS UI MODAL FOR CONFIRM RETURN --- */}
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
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Process book return transaction</p>
                                        </div>
                                    </div>

                                    <div className="mt-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                                        <p className="text-sm text-gray-600 dark:text-gray-200 leading-relaxed">
                                            Are you sure you want to mark <br />
                                            <span className="font-bold text-gray-900 dark:text-white">{transactionToReturn && renderWithAppleEmojis(transactionToReturn.book.judul_buku)}</span> <br />
                                            as returned by <span className="font-bold text-gray-900 dark:text-white">{transactionToReturn && renderWithAppleEmojis(transactionToReturn.user.name)}</span>?
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
                                            className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition shadow-lg dark:shadow-none"
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

            {/* --- MEMBER EDIT MODAL --- */}
            <Transition appear show={memberModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeMemberModal}>
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
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600 dark:text-indigo-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                                                Edit Member
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update member information</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleMemberUpdate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                                            <input
                                                type="text"
                                                value={memberForm.data.name}
                                                onChange={e => memberForm.setData('name', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                required
                                            />
                                            {memberForm.errors.name && <p className="text-red-500 text-xs mt-1">{memberForm.errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
                                            <SelectInput
                                                options={[
                                                    { value: 'student', label: 'Student' },
                                                    { value: 'admin', label: 'Admin' }
                                                ]}
                                                value={memberForm.data.role}
                                                onChange={(value) => memberForm.setData('role', value)}
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Hidden Email field to preserve existing value */}
                                        <input type="hidden" value={memberForm.data.email} />

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">NIS (Student ID)</label>
                                            <input
                                                type="text"
                                                value={memberForm.data.nis}
                                                onChange={e => memberForm.setData('nis', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            />
                                            {memberForm.errors.nis && <p className="text-red-500 text-xs mt-1">{memberForm.errors.nis}</p>}
                                        </div>

                                        <div className="mt-8 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition"
                                                onClick={closeMemberModal}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={memberForm.processing}
                                                className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition shadow-lg dark:shadow-none disabled:opacity-50"
                                            >
                                                {memberForm.processing ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* --- PASSWORD EDIT MODAL --- */}
            <Transition appear show={passwordModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closePasswordModal}>
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
                                        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600 dark:text-amber-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                                                Change Password
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set a new password for this user</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all pr-12"
                                                    required
                                                    minLength={8}
                                                    placeholder="Minimum 8 characters"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition"
                                                onClick={closePasswordModal}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center rounded-xl border border-transparent bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition shadow-lg dark:shadow-none"
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <Transition appear show={deleteConfirmOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeDeleteConfirm}>
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
                                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 dark:text-red-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                                                Delete Member
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone</p>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                                        <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                                            Are you sure you want to delete <span className="font-bold">{memberToDelete?.name}</span>?
                                            All their borrowing history will also be deleted.
                                        </p>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition"
                                            onClick={closeDeleteConfirm}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition shadow-lg dark:shadow-none"
                                            onClick={confirmDeleteMember}
                                        >
                                            Delete Member
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* --- REJECTION MODAL WITH REASON --- */}
            <Transition appear show={rejectModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeRejectModal}>
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
                                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 dark:text-red-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                                                Reject Request
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide feedback to the student</p>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 mb-4">
                                        <p className="text-sm text-amber-800 dark:text-amber-200">
                                            <span className="font-bold">{requestToReject?.user.name}</span> requested to{' '}
                                            {requestToReject?.type === 'delete_account' ? 'delete their account' : 'update their profile'}
                                        </p>
                                    </div>

                                    <form onSubmit={handleRejectRequest} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                                Reason for Rejection (Optional)
                                            </label>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                rows={4}
                                                placeholder="Provide a reason for rejecting this request..."
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                                                maxLength={500}
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {rejectionReason.length}/500 characters
                                            </p>
                                        </div>

                                        <div className="mt-8 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition"
                                                onClick={closeRejectModal}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition shadow-lg dark:shadow-none"
                                            >
                                                Reject Request
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* --- APPROVE CONFIRMATION MODAL --- */}
            <Transition appear show={approveModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeApproveModal}>
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
                                        <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600 dark:text-green-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                                                Approve Request
                                            </Dialog.Title>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Confirm profile update approval</p>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                                        <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                                            Are you sure you want to approve this request for <span className="font-bold">{requestToApprove?.user.name}</span>?
                                            The changes will be applied to their profile immediately.
                                        </p>
                                    </div>

                                    <div className="mt-8 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition"
                                            onClick={closeApproveModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl border border-transparent bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition shadow-lg dark:shadow-none"
                                            onClick={confirmApproveRequest}
                                        >
                                            Approve Request
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </AuthenticatedLayout>
    );
}