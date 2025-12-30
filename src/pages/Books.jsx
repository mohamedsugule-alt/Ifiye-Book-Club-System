import { useState } from 'react';
import { useBookClub } from '../context/BookClubContext';
import { Card, Badge } from '../components/ui';
import { Book as BookIcon, Star, Lock, Unlock, ExternalLink, Plus, Search, X, Save, Image as ImageIcon, Upload, Library, History } from 'lucide-react';

const Books = () => {
    const { books, bookRatings, assets, rateBook, addAsset, sessions, addBook } = useBookClub();
    const [selectedBook, setSelectedBook] = useState(null);
    const [activeTab, setActiveTab] = useState('CURRENT'); // CURRENT | ARCHIVE

    // Rating Modal
    const [showRateModal, setShowRateModal] = useState(false);
    const [ratingVal, setRatingVal] = useState(5);

    // Add Book Modal
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [newBookData, setNewBookData] = useState(null);

    // Bulk Upload Modal
    const [isBulkUploading, setIsBulkUploading] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [bulkPreview, setBulkPreview] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- GOOGLE BOOKS INTEGRATION ---
    const searchGoogleBooks = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setSearchResults(data.items || []);
        } catch (error) {
            console.error("Failed to fetch books", error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectGoogleBook = (item) => {
        const info = item.volumeInfo;
        const book = {
            title: info.title,
            author: info.authors ? info.authors.join(', ') : 'Unknown Author',
            pages: info.pageCount || 0,
            coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            description: info.description || '',
            googleId: item.id,
            category: info.categories ? info.categories[0] : 'General',
            year: '2026', // Default to target cycle for new additions
            publishedDate: info.publishedDate ? info.publishedDate.substring(0, 4) : ''
        };
        setNewBookData(book);
        setSearchResults([]);
    };

    const handleSaveBook = () => {
        if (!newBookData) return;
        addBook(newBookData);
        setIsAdding(false);
        setNewBookData(null);
        setSearchQuery('');
    };

    // --- BULK UPLOAD HANDLERS ---
    const parseBulkText = () => {
        if (!bulkText) return;
        const lines = bulkText.split('\n').filter(l => l.trim());
        const parsed = lines.map(line => {
            // Support Tab (Excel) or Comma
            const isTab = line.includes('\t');
            const parts = isTab ? line.split('\t') : line.split(',');
            const cleanParts = parts.map(p => p.trim());

            if (cleanParts.length < 2) return null;
            return {
                title: cleanParts[0],
                author: cleanParts[1],
                category: cleanParts[2] || 'Uncategorized',
                year: cleanParts[3] || '2025', // Default to previous year if missing
                pages: 0,
                coverUrl: ''
            };
        }).filter(b => b);
        setBulkPreview(parsed);
    };

    const confirmBulkUpload = async () => {
        setIsProcessing(true);
        const enrichedBooks = [];

        for (const book of bulkPreview) {
            let coverUrl = '';
            try {
                // Fetch cover
                const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(book.title + ' ' + book.author)}&maxResults=1`);
                const data = await res.json();
                if (data.items && data.items[0]) {
                    coverUrl = data.items[0].volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '';
                }
            } catch {
                console.error("Cover fetch failed for", book.title);
            }
            enrichedBooks.push({ ...book, coverUrl });
        }

        enrichedBooks.forEach(book => {
            addBook(book);
        });

        setIsProcessing(false);
        setIsBulkUploading(false);
        setBulkText('');
        setBulkPreview([]);
        setActiveTab('ARCHIVE'); // Switch to archive to show them
    };

    // --- DERIVED STATE ---
    const booksWithMeta = books.map(b => {
        const ratings = bookRatings.filter(r => r.bookId === b.id);
        const avg = ratings.length > 0
            ? ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length
            : 0;

        const qualified = avg >= 4.0 && ratings.length >= 1;
        const bookAssets = assets.filter(a => a.bookId === b.id);
        const session = sessions.find(s => s.bookId === b.id);

        return { ...b, avgRating: avg, ratingCount: ratings.length, qualified, assets: bookAssets, session };
    });

    const handleRate = () => {
        if (!selectedBook) return;
        rateBook({
            bookId: selectedBook.id,
            value: parseInt(ratingVal),
            timestamp: new Date().toISOString()
        });
        setShowRateModal(false);
        setRatingVal(5);
    };

    const handleAddAsset = () => {
        const url = prompt("Enter reference URL:");
        const desc = prompt("Enter description:");
        if (url && desc) {
            addAsset({
                bookId: selectedBook.id,
                url,
                description: desc,
                type: 'LINK'
            });
        }
    };

    // FILTERING LOGIC
    // Current: Year 2026 OR (Null Year AND Active)
    // Archive: Year < 2026
    const displayedBooks = booksWithMeta.filter(b => {
        // Strict Filter: 2026 Books must start with 'B26' OR explicitly have year >= 2026
        const isCurrentCycle = b.id.startsWith('B26') || (b.year && parseInt(b.year) >= 2026);

        if (activeTab === 'CURRENT') {
            return isCurrentCycle;
        } else {
            return !isCurrentCycle;
        }
    });

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Library & Resources</h2>
                    <p className="text-glass-300">Manage the club's collection.</p>
                </div>

                <div className="flex items-center gap-2 glass-panel p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('CURRENT')}
                        className={`px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 transition ${activeTab === 'CURRENT' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-glass-400 hover:text-white'}`}
                    >
                        <Library size={16} /> 2026 Reading List
                    </button>
                    <button
                        onClick={() => setActiveTab('ARCHIVE')}
                        className={`px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 transition ${activeTab === 'ARCHIVE' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-glass-400 hover:text-white'}`}
                    >
                        <History size={16} /> The Archives
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsBulkUploading(true)}
                        className="glass-card text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-white/10 transition"
                    >
                        <Upload size={20} /> Bulk Upload
                    </button>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn-antigravity text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Book
                    </button>
                </div>
            </div>

            {/* Book Grid */}
            {displayedBooks.length === 0 ? (
                <div className="text-center py-20 text-glass-400 glass-card rounded-xl border-dashed border-white/10">
                    <BookIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No books found in {activeTab === 'CURRENT' ? 'Current Cycle' : 'Archives'}.</p>
                    {activeTab === 'ARCHIVE' && <p className="text-sm mt-2">Use "Bulk Upload" to migrate previous years' books.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedBooks.map(book => (
                        <div key={book.id} className="glass-card p-0 overflow-hidden flex flex-col group h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-white/20 transition-all duration-300">
                            <div className="flex flex-col h-full">
                                {/* Cover Image Area */}
                                <div className="h-48 bg-black/40 relative overflow-hidden group-hover:opacity-100 transition-opacity">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-80"></div>
                                    {book.coverUrl ? (
                                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-glass-400 bg-white/5">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-20">
                                        <Badge variant="default" className="shadow-lg bg-black/60 backdrop-blur-md text-white border border-white/10">{book.category || 'General'}</Badge>
                                        {book.year && book.year < 2026 && <Badge variant="secondary" className="shadow-sm text-xs bg-white/10 text-glass-300 backdrop-blur-md">{book.year}</Badge>}
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full z-20 p-4 pt-12">
                                        <div className="flex items-center gap-1 text-brand-yellow font-bold drop-shadow-md">
                                            <Star size={16} fill="currentColor" />
                                            <span>{book.avgRating > 0 ? book.avgRating.toFixed(1) : '-'}</span>
                                            <span className="text-glass-400 font-normal text-xs">({book.ratingCount})</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-white mb-1 leading-tight line-clamp-2" title={book.title}>{book.title}</h3>
                                    <p className="text-glass-400 text-sm mb-4">{book.author} {book.year && `(${book.year})`}</p>

                                    {book.session && (
                                        <div className="mb-4 p-2 bg-emerald-500/10 rounded flex items-center justify-between text-xs font-mono text-emerald-300 border border-emerald-500/20">
                                            <span>{book.session.startDate}</span>
                                            <span className="font-bold">Active</span>
                                        </div>
                                    )}

                                    <div className="mt-auto space-y-4">
                                        {/* Assets Section */}
                                        {book.qualified ? (
                                            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                                <div className="flex items-center gap-2 text-emerald-300 mb-2 font-bold text-sm">
                                                    <Unlock size={14} /> Assets Unlocked
                                                </div>
                                                {book.assets.length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {book.assets.map(a => (
                                                            <li key={a.id}>
                                                                <a href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-glass-300 hover:text-emerald-300 hover:underline truncate transition-colors">
                                                                    <ExternalLink size={12} /> {a.description}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-xs text-glass-400">No assets added yet.</p>
                                                )}
                                                <button onClick={() => { setSelectedBook(book); handleAddAsset(); }} className="mt-3 text-xs flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-medium transition-colors">
                                                    <Plus size={12} /> Add Resource
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                                                <span className="text-xs text-glass-400">Assets Locked (&lt; 4.0 Rating)</span>
                                                <Lock size={14} className="text-glass-500" />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => { setSelectedBook(book); setShowRateModal(true); }}
                                            className="w-full py-2 rounded glass-card hover:bg-white/10 text-white font-bold text-sm transition-colors border border-white/10 shadow-sm"
                                        >
                                            Rate Book
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD BOOK MODAL */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-panel w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border flex flex-col items-stretch">
                        <button
                            onClick={() => { setIsAdding(false); setNewBookData(null); setSearchQuery(''); }}
                            className="absolute top-4 right-4 text-glass-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">Add New Book</h2>

                        {!newBookData ? (
                            <div className="space-y-6">
                                {/* Search Step */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="input-glass flex-1"
                                        placeholder="Search by Title (e.g. Atomic Habits)..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && searchGoogleBooks()}
                                    />
                                    <button
                                        onClick={searchGoogleBooks}
                                        disabled={isSearching}
                                        className="btn-antigravity px-6 rounded-lg text-white font-bold disabled:opacity-50 transition-colors"
                                    >
                                        {isSearching ? '...' : <Search size={20} />}
                                    </button>
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-glass-400">Select a book to import details:</p>
                                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {searchResults.map(item => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => selectGoogleBook(item)}
                                                    className="flex items-start gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition border border-white/5"
                                                >
                                                    {item.volumeInfo.imageLinks?.thumbnail && (
                                                        <img src={item.volumeInfo.imageLinks.thumbnail} className="w-12 h-16 object-cover rounded shadow-sm opacity-90" alt="" />
                                                    )}
                                                    <div>
                                                        <h4 className="font-bold text-white text-sm">{item.volumeInfo.title}</h4>
                                                        <p className="text-xs text-glass-400">{item.volumeInfo.authors?.join(', ')}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Review/Edit Step */}
                                <div className="flex gap-6">
                                    <div className="w-32 h-48 bg-black/40 rounded-lg flex-shrink-0 overflow-hidden shadow-sm border border-white/10">
                                        {newBookData.coverUrl ? (
                                            <img src={newBookData.coverUrl} className="w-full h-full object-cover" alt="Cover" />
                                        ) : <div className="flex items-center justify-center h-full text-glass-400">No Image</div>}
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <label className="text-xs text-glass-400 uppercase font-bold">Title</label>
                                            <input
                                                className="input-glass w-full"
                                                value={newBookData.title}
                                                onChange={e => setNewBookData({ ...newBookData, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-glass-400 uppercase font-bold">Author</label>
                                                <input
                                                    className="input-glass w-full"
                                                    value={newBookData.author}
                                                    onChange={e => setNewBookData({ ...newBookData, author: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-glass-400 uppercase font-bold">Pages</label>
                                                <input
                                                    type="number"
                                                    className="input-glass w-full"
                                                    value={newBookData.pages}
                                                    onChange={e => setNewBookData({ ...newBookData, pages: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-glass-400 uppercase font-bold">Category</label>
                                                <input
                                                    className="input-glass w-full"
                                                    value={newBookData.category}
                                                    onChange={e => setNewBookData({ ...newBookData, category: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-glass-400 uppercase font-bold">Reading Year</label>
                                                <input
                                                    type="number"
                                                    className="input-glass w-full"
                                                    value={newBookData.year}
                                                    onChange={e => setNewBookData({ ...newBookData, year: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveBook}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors"
                                >
                                    <Save size={20} /> Save to {newBookData.year < 2026 ? 'Archives' : 'Library'}
                                </button>
                                <button
                                    onClick={() => setNewBookData(null)}
                                    className="w-full py-2 text-glass-400 hover:text-white transition-colors"
                                >
                                    Back to Search
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* BULK UPLOAD MODAL */}
            {isBulkUploading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-panel w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
                        <button
                            onClick={() => { setIsBulkUploading(false); setBulkText(''); setBulkPreview([]); }}
                            className="absolute top-4 right-4 text-glass-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6">Bulk Upload - Previous Years</h2>

                        {bulkPreview.length === 0 ? (
                            <div className="space-y-4">
                                <p className="text-glass-300 text-sm">
                                    Paste your book list below. Each book on a new line.<br />
                                    <strong>Format:</strong> Excel Copy-Paste (Tab-separated) or CSV: Title, Author, Category, Year
                                </p>
                                <textarea
                                    className="input-glass w-full h-64 font-mono text-sm"
                                    placeholder={`The House of Wisdom, Jonathan Lyons, History, 2024\nLost Islamic History, Firas Alkhateeb, History, 2023\nScary Smart, Mo Gawdat, Tech, 2025`}
                                    value={bulkText}
                                    onChange={e => setBulkText(e.target.value)}
                                />
                                <button
                                    onClick={parseBulkText}
                                    disabled={!bulkText.trim()}
                                    className="btn-antigravity w-full py-3 text-white font-bold rounded-lg disabled:opacity-50"
                                >
                                    Process List
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-white font-bold">Preview: {bulkPreview.length} Books Found</p>
                                    <button onClick={() => setBulkPreview([])} className="text-sm text-glass-400 hover:text-white">Edit Raw Text</button>
                                </div>
                                <div className="max-h-64 overflow-y-auto border border-glass-border rounded bg-black/20 p-2 space-y-2">
                                    {bulkPreview.map((b, i) => (
                                        <div key={i} className="flex justify-between items-center p-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                                            <div>
                                                <p className="font-bold text-white text-sm">{b.title}</p>
                                                <p className="text-xs text-glass-400">{b.author} • {b.category}</p>
                                            </div>
                                            <Badge variant="secondary" className="bg-white/10 text-white">{b.year}</Badge>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={confirmBulkUpload}
                                    disabled={isProcessing}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                                >
                                    {isProcessing ? 'Fetching Covers & Importing...' : 'Confirm Upload to Archives'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRateModal && selectedBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
                    <div className="glass-panel w-full max-w-sm p-6 relative shadow-2xl">
                        <button onClick={() => setShowRateModal(false)} className="absolute top-2 right-2 text-glass-400 hover:text-white"><X size={20} /></button>
                        <h3 className="text-xl font-bold text-white mb-4">Rate {selectedBook.title}</h3>
                        <div className="flex justify-center gap-2 mb-8">
                            {[1, 2, 3, 4, 5].map(v => (
                                <button key={v} onClick={() => setRatingVal(v)} className="focus:outline-none transition-transform hover:scale-110">
                                    <Star
                                        size={32}
                                        className={v <= ratingVal ? 'text-brand-yellow fill-current drop-shadow-md' : 'text-white/20'}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleRate} className="flex-1 py-3 btn-antigravity text-white font-bold rounded-lg">Submit Rating</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Books;
