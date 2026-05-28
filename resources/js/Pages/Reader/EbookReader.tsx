import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Book } from '../Student_Dashboard';

declare var route: any;

interface Bookmark {
    id: number;
    book_id: number;
    user_id: number;
    progress_marker: string | null;
}

interface EbookReaderProps {
    auth: any;
    book: Book;
    bookmarks: Bookmark[];
}

export default function EbookReader({ auth, book, bookmarks }: EbookReaderProps) {
    const streamUrl = route('digital.stream', book.id);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [marker, setMarker] = useState('');

    const handleAddBookmark = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('digital.bookmark', book.id), {
            progress_marker: marker,
        }, {
            preserveScroll: true,
            onSuccess: () => setMarker('')
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
            <Head title={`Reading: ${book.judul_buku}`} />

            {/* --- TOP BAR --- */}
            <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center justify-between px-4 sm:px-6 shadow-md z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold line-clamp-1">{book.judul_buku}</h1>
                        <p className="text-xs text-gray-400">{book.pengarang}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${sidebarOpen ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                        <span className="hidden sm:inline">Bookmarks</span>
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex overflow-hidden relative">
                
                {/* READER AREA */}
                <div className="flex-1 bg-gray-950 flex flex-col items-center justify-center p-4">
                    {book.file_type === 'audio' || (book.file_path && /\.(mp3|wav|m4a|ogg|flac|aac)$/i.test(book.file_path)) ? (
                        <div className="w-full max-w-2xl bg-gray-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center border border-gray-700 text-center">
                            <div className="w-48 h-48 bg-gray-700 rounded-2xl shadow-inner flex items-center justify-center mb-8 border border-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{book.judul_buku}</h2>
                            <p className="text-gray-400 mb-8">{book.pengarang}</p>
                            <audio controls className="w-full" controlsList="nodownload" src={streamUrl}>
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-700 flex items-center justify-center relative">
                            {/* Simple Iframe for PDF/EPUB via browser's native viewer */}
                            <iframe 
                                src={streamUrl + "#toolbar=0"} 
                                className="w-full h-full border-none"
                                title={book.judul_buku}
                            ></iframe>
                            
                            {/* Overlay to block easy right click if desired, though iframe makes it tricky */}
                            <div className="absolute top-0 left-0 right-0 h-12 bg-transparent z-10 pointer-events-none"></div>
                        </div>
                    )}
                </div>

                {/* SIDEBAR FOR BOOKMARKS */}
                <div className={`w-80 bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300 absolute right-0 top-0 bottom-0 z-10 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/90 backdrop-blur-sm">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-400">
                                <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                            </svg>
                            Bookmarks
                        </h3>
                        <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-700 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {bookmarks.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <p>No bookmarks yet.</p>
                                <p className="text-xs mt-1">Add one to save your progress or notes!</p>
                            </div>
                        ) : (
                            bookmarks.map(bm => (
                                <div key={bm.id} className="bg-gray-700 p-3 rounded-xl border border-gray-600 shadow-sm relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded">
                                            Marker
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-200">{bm.progress_marker || "No notes"}</p>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="p-4 border-t border-gray-700 bg-gray-800">
                        <form onSubmit={handleAddBookmark} className="space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-400 mb-1 block">Bookmark Marker (Page / Time / Note)</label>
                                    <input type="text" placeholder="e.g. Page 45, or 12:30" value={marker} onChange={e => setMarker(e.target.value)} className="w-full bg-gray-900 border-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-white" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-lg shadow-indigo-500/20">
                                Add Bookmark
                            </button>
                        </form>
                    </div>
                </div>

            </main>
        </div>
    );
}
