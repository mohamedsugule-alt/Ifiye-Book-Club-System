import { useState, useRef } from 'react';
import { useBookClub } from '../context/BookClubContext';
import { Card, Badge } from '../components/ui';
import { Settings, Users, BookOpen, Calendar, Trash2, Edit2, Plus, AlertCircle, Save, Upload, FileSpreadsheet, Tag, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

const Admin = () => {
    const { members, books, sessions, logs, updateMember, addMember, updateBook, addBook, updateSession, deleteSession, wipeDatabase, categories, addCategory, deleteCategory, exportData, importData, addSession } = useBookClub();
    const [activeTab, setActiveTab] = useState('members');

    // Member Form State
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [memberForm, setMemberForm] = useState({ id: '', name: '', role: 'MEMBER', active: true, goal_factor: 1.0 });
    const [newCategory, setNewCategory] = useState('');

    // Book Form State
    const [showBookForm, setShowBookForm] = useState(false);
    const [bookForm, setBookForm] = useState({ title: '', author: '', pages: '', category: 'Context' });

    const handleSaveMember = () => {
        if (memberForm.id) {
            updateMember(memberForm.id, memberForm);
        } else {
            addMember(memberForm);
        }
        setShowMemberForm(false);
        setMemberForm({ id: '', name: '', role: 'MEMBER', active: true, goal_factor: 1.0 });
    };

    const handleEditMember = (m) => {
        setMemberForm(m);
        setShowMemberForm(true);
    };

    const handleSaveBook = () => {
        // Basic validation
        if (!bookForm.title || !bookForm.pages) return;

        if (bookForm.id) {
            updateBook(bookForm.id, { ...bookForm, pages: parseInt(bookForm.pages) });
        } else {
            addBook({ ...bookForm, pages: parseInt(bookForm.pages) });
        }
        setShowBookForm(false);
        setBookForm({ title: '', author: '', pages: '', category: 'Context' });
    };

    const fileInputRef = useRef(null);

    const handlePlanUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert("Spreadsheet is empty or format is invalid.");
                    return;
                }

                let newBooks = 0;

                data.forEach((row, index) => {
                    // Expected Columns: Title, Author, Pages, Category, StartDate, EndDate
                    if (!row.Title || !row.Pages) return;

                    const bookId = `B${Date.now()}_${index}`; // Ensure unique ID even in fast loop

                    // 1. Add Book
                    addBook({
                        id: bookId,
                        title: row.Title,
                        author: row.Author || 'Unknown',
                        pages: parseInt(row.Pages),
                        category: row.Category || 'Context',
                        coverUrl: '', // Default
                        rating: 0
                    });
                    newBooks++;

                    // 2. Add Session (if dates provided)
                    if (row.StartDate && row.EndDate) {
                        // Excel dates might be serial numbers or strings. Assuming Strings (YYYY-MM-DD) for simplicity first.
                        // Or use XLSX cell dates. `sheet_to_json` with raw: false might help? 
                        // Let's assume user provides YYYY-MM-DD strings.

                        // Fix Date parsing if Excel serial
                        const parseDate = (d) => {
                            if (typeof d === 'number') {
                                // Excel serial date conversion
                                return new Date(Math.round((d - 25569) * 86400 * 1000)).toISOString().split('T')[0];
                            }
                            return d; // Assume string
                        };

                        addSession({
                            id: `S${Date.now()}_${index}`,
                            bookId: bookId,
                            startDate: parseDate(row.StartDate),
                            endDate: parseDate(row.EndDate)
                        });
                    }
                });

                alert(`Import Successful!\nAdded ${newBooks} Books.`);
                // Reset form
                e.target.value = null;


            } catch (err) {
                console.error("Upload Error:", err);
                alert("Failed to parse Excel file. Ensure columns match: Title, Author, Pages, StartDate, EndDate");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleReset = () => {
        if (window.confirm("CRITICAL WARNING: This will delete ALL member progress, logs, and custom assets. ONLY Admin accounts will be preserved.\n\nAre you sure you want to proceed?")) {
            wipeDatabase();
            // Force reload to clear all states and re-initialize
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    };
    const handleEditBook = (b) => {
        setBookForm(b);
        setShowBookForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const downloadCSV = (type) => {
        let data = [];
        let filename = '';

        if (type === 'logs') {
            data = logs.map(l => ({
                Date: l.date,
                MemberID: l.memberId,
                BookID: l.bookId,
                Pages: l.pagesRead,
                Minutes: l.minutesRead,
                Notes: (l.notes || '').replace(/,/g, ' ') // Escape commas
            }));
            filename = 'book_club_logs.csv';
        } else if (type === 'members') {
            data = members.map(m => ({
                ID: m.id,
                Name: m.name,
                Role: m.role,
                Active: m.active
            }));
            filename = 'book_club_members.csv';
        }

        if (data.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(v => `${v}`).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">System Administration</h2>
                    <p className="text-glass-400">Settings, User Roles, and Strategic Plan.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <TabButton id="members" icon={Users} label="Members" active={activeTab} set={setActiveTab} />
                <TabButton id="books" icon={BookOpen} label="Books" active={activeTab} set={setActiveTab} />
                <TabButton id="plan" icon={Calendar} label="Plan" active={activeTab} set={setActiveTab} />
                <TabButton id="categories" icon={Tag} label="Categories" active={activeTab} set={setActiveTab} />
                <TabButton id="settings" icon={Settings} label="Settings" active={activeTab} set={setActiveTab} />
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">

                {activeTab === 'members' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Personnel Management</h3>
                            <button onClick={() => { setMemberForm({}); setShowMemberForm(true); }} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">
                                <Plus size={18} /> Add Member
                            </button>
                        </div>

                        {showMemberForm && (
                            <div className="glass-panel text-white p-6 animate-in slide-in-from-top-4 shadow-xl">
                                <h4 className="text-lg font-bold text-white mb-4">{memberForm.id ? 'Edit Member' : 'New Member'}</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input placeholder="Name" className="input-glass" value={memberForm.name || ''} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
                                    <select className="input-glass text-black" value={memberForm.role || 'MEMBER'} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}>
                                        <option value="MEMBER">Member</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={memberForm.active !== false} onChange={e => setMemberForm({ ...memberForm, active: e.target.checked })} className="w-5 h-5 rounded border-white/20 bg-white/10 text-brand-primary focus:ring-brand-primary" />
                                        <label className="text-glass-300">Active Status</label>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveMember} className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-orange-600">Save Changes</button>
                                    <button onClick={() => setShowMemberForm(false)} className="bg-white/10 text-glass-300 px-4 py-2 rounded hover:bg-white/20">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {members.map(m => (
                                <div key={m.id} className={`glass-card p-4 shadow-sm hover:shadow-md transition-all ${!m.active && 'opacity-60 grayscale'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border border-white/20">
                                                {m.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white leading-tight">{m.name}</p>
                                                <p className="text-xs text-glass-400">{m.role}</p>
                                            </div>
                                        </div>
                                        <Badge variant={m.active ? 'success' : 'secondary'} className="bg-opacity-20 backdrop-blur-md">{m.active ? 'Active' : 'Inactive'}</Badge>
                                    </div>
                                    <div className="flex justify-end pt-2 border-t border-white/10">
                                        <button onClick={() => handleEditMember(m)} className="text-sm text-glass-400 hover:text-white flex items-center gap-1 transition-colors">
                                            <Edit2 size={14} /> Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'books' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Library Database</h3>
                            <div className="flex gap-3">
                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    ref={fileInputRef}
                                    onChange={handlePlanUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                                >
                                    <Upload size={18} /> Upload Plan (Excel)
                                </button>
                                <button onClick={() => { setBookForm({}); setShowBookForm(true); }} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">
                                    <Plus size={18} /> Add Book
                                </button>
                            </div>
                        </div>


                        {showBookForm && (
                            <div className="glass-panel text-white p-6 animate-in slide-in-from-top-4 shadow-xl">
                                <h4 className="text-lg font-bold text-white mb-4">{bookForm.id ? 'Edit Book' : 'New Book'}</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="col-span-2 flex gap-2">
                                        <input
                                            placeholder="Book Title (e.g. Sapiens)"
                                            className="input-glass flex-1"
                                            value={bookForm.title || ''}
                                            onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
                                        />
                                        <button
                                            onClick={async () => {
                                                if (!bookForm.title) return;
                                                // Quick Google Books Fetch
                                                try {
                                                    const q = encodeURIComponent(bookForm.title);
                                                    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}`);
                                                    const data = await res.json();
                                                    if (data.items?.[0]) {
                                                        const info = data.items[0].volumeInfo;
                                                        setBookForm(prev => ({
                                                            ...prev,
                                                            title: info.title,
                                                            author: info.authors?.[0] || prev.author,
                                                            pages: info.pageCount || prev.pages,
                                                            coverUrl: info.imageLinks?.thumbnail || prev.coverUrl
                                                        }));
                                                    } else {
                                                        alert("Book not found.");
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                }
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded flex items-center gap-1 shadow-sm"
                                            title="Auto-fill details from Google Books"
                                        >
                                            <Search size={16} /> Auto-Fill
                                        </button>
                                    </div>

                                    <input placeholder="Author" className="input-glass w-full" value={bookForm.author || ''} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} />
                                    <input type="number" placeholder="Pages" className="input-glass w-full" value={bookForm.pages || ''} onChange={e => setBookForm({ ...bookForm, pages: e.target.value })} />
                                    <select className="input-glass w-full text-black" value={bookForm.category || 'Context'} onChange={e => setBookForm({ ...bookForm, category: e.target.value })}>
                                        {(categories || ['Context']).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <input
                                        placeholder="Cover Image URL (Optional)"
                                        className="input-glass w-full col-span-2"
                                        value={bookForm.coverUrl || ''}
                                        onChange={e => setBookForm({ ...bookForm, coverUrl: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleSaveBook} className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-orange-600 shadow-sm">Save to Library</button>
                                    <button onClick={() => setShowBookForm(false)} className="bg-white/10 text-glass-300 px-4 py-2 rounded hover:bg-white/20">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Library Database (2026 Plan)</h3>
                            <button onClick={() => setShowBookForm(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition shadow-sm">
                                <Plus size={18} /> Add Book
                            </button>
                        </div>

                        {/* 2026 PLAN BOOKS */}
                        <div className="space-y-2">
                            {books.filter(b => b.id.startsWith('B26')).map(b => (
                                <div key={b.id} className="p-4 glass-card rounded-lg flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-white text-lg">{b.title}</p>
                                            <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400 bg-emerald-500/10 backdrop-blur-sm">2026</Badge>
                                        </div>
                                        <p className="text-sm text-glass-400">{b.author} • {b.pages} pages • <span className="text-brand-primary font-medium">{b.category}</span></p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditBook(b)} className="p-2 hover:bg-white/10 rounded-full text-glass-500 hover:text-white transition-colors">
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Delete "${b.title}"?`)) {
                                                    // Add deleteBook logic here if needed
                                                }
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-full text-glass-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ARCHIVED BOOKS SECTION */}
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <h3 className="text-lg font-bold text-glass-400 mb-4 flex items-center gap-2">
                                <BookOpen size={18} /> Archived / Revisited Books
                            </h3>
                            <div className="space-y-2 opacity-75">
                                {books.filter(b => !b.id.startsWith('B26')).map(b => (
                                    <div key={b.id} className="p-3 glass-panel border border-white/5 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-glass-200">{b.title}</p>
                                            <p className="text-xs text-glass-500">{b.author}</p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs bg-white/10 text-glass-400">Archive</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'plan' && (
                    <div className="space-y-6">
                        <div className="text-center py-8 text-glass-400">
                            <h3 className="text-xl font-bold text-white mb-2">Strategic Roadmap</h3>
                            <p>Manage session timelines and book assignments.</p>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-4">
                            {sessions.map(session => {
                                const book = books.find(b => b.id === session.bookId);
                                return (
                                    <div key={session.id} className="p-4 glass-card rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between group hover:shadow-md transition-all">

                                        <div className="flex-1 min-w-0 text-center md:text-left">
                                            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                                                <Badge variant="default" className="text-white bg-white/10">{book?.category || 'Unknown'}</Badge>
                                                <span className="text-xs font-mono text-glass-500">Session {session.id}</span>
                                            </div>
                                            <p className="font-bold text-white truncate">{book?.title || 'Unknown Book'}</p>
                                        </div>

                                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                            <div className="flex flex-col">
                                                <label className="text-[10px] text-glass-500 uppercase font-bold pl-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    className="bg-transparent text-white text-sm border-none focus:ring-0 p-1 font-medium"
                                                    value={session.startDate}
                                                    onChange={(e) => updateSession(session.id, { startDate: e.target.value })}
                                                />
                                            </div>
                                            <span className="text-glass-500">→</span>
                                            <div className="flex flex-col">
                                                <label className="text-[10px] text-glass-500 uppercase font-bold pl-1">Deadline</label>
                                                <input
                                                    type="date"
                                                    className="bg-transparent text-white text-sm border-none focus:ring-0 p-1 font-medium"
                                                    value={session.endDate}
                                                    onChange={(e) => updateSession(session.id, { endDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="w-px h-8 bg-white/10 mx-2"></div>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this session? This cannot be undone.')) {
                                                        deleteSession(session.id);
                                                    }
                                                }}
                                                className="p-2 text-glass-500 hover:text-red-400 hover:bg-white/5 rounded transition-colors"
                                                title="Delete Session"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <div className="glass-panel text-white p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-white mb-4">Manage Book Categories</h3>
                            <div className="flex gap-2 mb-6">
                                <input
                                    placeholder="New Category Name"
                                    className="input-glass flex-1"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && newCategory.trim()) {
                                            addCategory(newCategory.trim());
                                            setNewCategory('');
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (newCategory.trim()) {
                                            addCategory(newCategory.trim());
                                            setNewCategory('');
                                        }
                                    }}
                                    className="btn-primary bg-emerald-600 hover:bg-emerald-700 px-4 rounded-lg text-white shadow-sm"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(categories || []).map(c => (
                                    <span key={c} className="px-3 py-1 bg-white/10 rounded-full text-glass-200 border border-white/20 flex items-center gap-2 group hover:shadow-sm transition-all hover:bg-white/20">
                                        {c}
                                        <button onClick={() => deleteCategory(c)} className="text-glass-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="glass-panel text-white p-8 space-y-6 shadow-sm">
                            <div className="flex items-center gap-4 text-emerald-400">
                                <div className="p-3 bg-emerald-500/10 rounded-full"><Save size={24} /></div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Export Data</h3>
                                    <p className="text-glass-400 text-sm">Download your data for backup or analysis.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onClick={() => downloadCSV('logs')} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition group">
                                    <p className="font-bold text-white group-hover:text-brand-primary transition-colors">Reading Logs (CSV)</p>
                                    <p className="text-xs text-glass-500">Date, Minutes, Pages</p>
                                </button>
                                <button onClick={() => downloadCSV('members')} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition group">
                                    <p className="font-bold text-white group-hover:text-brand-primary transition-colors">Member List (CSV)</p>
                                    <p className="text-xs text-glass-500">Names, Roles, Status</p>
                                </button>
                            </div>
                        </div>

                        <div className="glass-panel border-red-500/30 p-8 space-y-6">
                            <div className="flex items-center gap-4 text-red-400 mb-2">
                                <div className="p-3 bg-red-500/10 rounded-full"><AlertCircle size={24} /></div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Database Management</h3>
                                    <p className="text-glass-400 text-sm">Backup, Restore, or Reset.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-card p-6 flex flex-col items-center text-center shadow-sm">
                                    <Save className="text-emerald-500 mb-3" size={32} />
                                    <h4 className="font-bold text-white mb-2">Backup</h4>
                                    <p className="text-xs text-glass-400 mb-4">Download full JSON backup.</p>
                                    <button onClick={exportData} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition text-sm shadow-sm">
                                        Download
                                    </button>
                                </div>

                                <div className="glass-card p-6 flex flex-col items-center text-center shadow-sm">
                                    <Upload className="text-blue-500 mb-3" size={32} />
                                    <h4 className="font-bold text-white mb-2">Restore</h4>
                                    <p className="text-xs text-glass-400 mb-4">Overwrite data from JSON.</p>
                                    <div className="relative w-full">
                                        <input
                                            type="file"
                                            accept=".json"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = (evt) => importData(evt.target.result);
                                                reader.readAsText(file);
                                                e.target.value = null;
                                            }}
                                        />
                                        <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded transition text-sm border border-white/10">
                                            Select File
                                        </button>
                                    </div>
                                </div>

                                <div className="glass-card p-6 flex flex-col items-center text-center border-red-500/30 shadow-sm">
                                    <AlertCircle className="text-red-500 mb-3" size={32} />
                                    <h4 className="font-bold text-white mb-2">Reset</h4>
                                    <p className="text-xs text-glass-400 mb-4">Wipe all data.</p>
                                    <button onClick={handleReset} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-2 rounded transition text-sm">
                                        Factory Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TabButton = ({ id, icon, label, active, set }) => {
    const Icon = icon;
    return (
        <button
            onClick={() => set(id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors
            ${active === id ? 'border-brand-primary text-white' : 'border-transparent text-glass-400 hover:text-white'}
        `}
        >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </button>
    );
};

export default Admin;
