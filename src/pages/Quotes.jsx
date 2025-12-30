import { useState } from 'react';
import { useBookClub } from '../context/BookClubContext';
import { Quote, Heart, Plus, User, BookOpen } from 'lucide-react';
import { Card, Badge } from '../components/ui';

const Quotes = () => {
    const { quotes, members, books, addQuote, likeQuote } = useBookClub();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newQuote, setNewQuote] = useState({ text: '', bookId: '', memberId: members[0]?.id || '', page: '' });

    const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';
    const getBookTitle = (id) => books.find(b => b.id === id)?.title || 'General';

    const handleLike = (id) => {
        likeQuote(id, 'CURRENT_USER'); // No auth yet
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newQuote.text && newQuote.memberId) {
            addQuote(newQuote);
            setShowAddModal(false);
            setNewQuote({ ...newQuote, text: '', page: '' });
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 p-6 glass-card border-0">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Quote className="text-brand-primary" size={32} /> The Quote Wall
                    </h1>
                    <p className="text-glass-300 mt-2">
                        Immortalize the best lines from our journey.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:scale-105"
                >
                    <Plus size={20} /> Add Quote
                </button>
            </div>

            {/* Grid */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {quotes.length > 0 ? [...quotes].reverse().map((quote) => (
                    <div key={quote.id} className="break-inside-avoid">
                        <Card className="glass-panel p-6 hover:bg-white/5 transition-colors border border-white/10">
                            <Quote size={24} className="text-white/20 mb-4" />
                            <p className="text-lg font-serif italic text-white/90 leading-relaxed mb-6">
                                "{quote.text}"
                            </p>

                            <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                                        <User size={14} className="text-brand-primary" />
                                        {getMemberName(quote.memberId)}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-glass-400">
                                        <BookOpen size={12} />
                                        <span className="truncate max-w-[150px]">{getBookTitle(quote.bookId)}</span>
                                        {quote.page && <span>(p. {quote.page})</span>}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleLike(quote.id)}
                                    className="flex items-center gap-1.5 text-xs text-pink-400 font-bold hover:text-pink-300 transition-colors bg-pink-500/10 px-3 py-1.5 rounded-full"
                                >
                                    <Heart size={14} className={quote.likes > 0 ? "fill-pink-400" : ""} /> {quote.likes}
                                </button>
                            </div>
                        </Card>
                    </div>
                )) : (
                    <div className="text-center py-20 col-span-full break-inside-avoid">
                        <p className="text-glass-400 italic text-xl">The wall is empty. Be the first to scribe.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-6">Add a Quote</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-glass-300 mb-1">Quote</label>
                                <textarea
                                    className="input-glass w-full min-h-[100px] text-lg font-serif"
                                    placeholder="Enter the quote..."
                                    value={newQuote.text}
                                    onChange={e => setNewQuote({ ...newQuote, text: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-glass-300 mb-1">Citer (Member)</label>
                                    <select
                                        className="input-glass w-full"
                                        value={newQuote.memberId}
                                        onChange={e => setNewQuote({ ...newQuote, memberId: e.target.value })}
                                        required
                                    >
                                        {members.map(m => (
                                            <option key={m.id} value={m.id} className="bg-slate-800">{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-glass-300 mb-1">Page #</label>
                                    <input
                                        type="number"
                                        className="input-glass w-full"
                                        value={newQuote.page}
                                        onChange={e => setNewQuote({ ...newQuote, page: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-glass-300 mb-1">From Book</label>
                                <select
                                    className="input-glass w-full"
                                    value={newQuote.bookId}
                                    onChange={e => setNewQuote({ ...newQuote, bookId: e.target.value })}
                                >
                                    <option value="" className="bg-slate-800">-- General / Other --</option>
                                    {books.map(b => (
                                        <option key={b.id} value={b.id} className="bg-slate-800">{b.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="text-glass-300 hover:text-white font-bold px-4 py-2 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-brand-primary/20"
                                >
                                    Post Quote
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quotes;
