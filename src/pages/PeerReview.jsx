import { useState } from 'react';
import { useBookClub } from '../context/BookClubContext';
import { Card } from '../components/ui';
import { UserCheck, Shield, Send, CheckCircle, BookOpen } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const PeerReview = () => {
    const { members, activeSession, addPeerReview, sessions, books } = useBookClub();
    const [reviewSessionId, setReviewSessionId] = useState(activeSession?.id || (sessions.length > 0 ? sessions[0].id : ''));
    const [raterId, setRaterId] = useState(''); // Who is doing the rating?
    const [selectedPeerId, setSelectedPeerId] = useState('');
    const [step, setStep] = useState('SELECT'); // SELECT, RATE, SUCCESS
    const [formData, setFormData] = useState({
        preparation: 5,
        contribution: 5,
        comment: ''
    });

    const activeBook = books.find(b => b.id === activeSession?.bookId);

    // Filter out inactive members AND the current rater (prevent self-rating)
    const eligiblePeers = members.filter(m => m.active && m.id !== raterId);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Construct the review payload
        const review = {
            sessionId: reviewSessionId,
            raterId: raterId, // Now we track who rated
            rateeId: selectedPeerId,
            prep: formData.preparation,
            contrib: formData.contribution,
            comment: formData.comment,
            timestamp: new Date().toISOString()
        };

        addPeerReview(review);
        setStep('SUCCESS');

        // Reset after delay
        setTimeout(() => {
            setStep('SELECT');
            setSelectedPeerId('');
            setFormData({ preparation: 5, contribution: 5, comment: '' });
        }, 2000);
    };

    if (!reviewSessionId) {
        return <div className="p-8 text-center text-glass-400">No sessions available.</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Peer Evaluation</h2>
                    <p className="text-glass-400 mt-2">Rate your peers' preparation and contribution for the active session.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-brand-secondary/20 p-3 rounded-lg text-brand-secondary"><BookOpen size={24} /></div>
                        <div>
                            <p className="text-xs font-bold text-glass-400 uppercase">Active Book</p>
                            <h3 className="font-bold text-white text-lg">{activeBook?.title || 'No Active Book'}</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 shadow-sm">
                    <div className="space-y-2">
                        <label className="text-xs uppercase text-glass-400 font-bold block mb-1">Rating for Session...</label>
                        <select
                            className="input-glass w-full text-black"
                            value={reviewSessionId}
                            onChange={(e) => setReviewSessionId(e.target.value)}
                        >
                            {sessions.map(s => {
                                const b = books.find(bk => bk.id === s.bookId);
                                return <option key={s.id} value={s.id} className="text-black">{b?.title || s.id} ({s.startDate})</option>
                            })}
                        </select>
                    </div>
                </div>
            </div>

            {/* RATER SELECTOR */}
            <div className="glass-panel p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <label className="text-sm font-bold text-white whitespace-nowrap">I am:</label>
                <select
                    className="input-glass w-full md:w-auto flex-1 cursor-pointer text-black"
                    value={raterId}
                    onChange={(e) => setRaterId(e.target.value)}
                >
                    <option value="" className="text-gray-500">Select Your Name</option>
                    {members.filter(m => m.active).map(m => (
                        <option key={m.id} value={m.id} className="text-black">{m.name}</option>
                    ))}
                </select>
            </div>

            <AnimatePresence mode="wait">
                {step === 'SELECT' && raterId && (
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <h3 className="text-xl font-bold text-white">Select a Member to Rate</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {eligiblePeers.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => { setSelectedPeerId(m.id); setStep('RATE'); }}
                                    className="p-4 glass-card hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/10 transition-all flex items-center gap-4 text-left group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-white group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                        {m.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white group-hover:text-brand-primary transition-colors">{m.name}</p>
                                        <p className="text-xs text-glass-400">{m.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Motion.div>
                )}
                {step === 'SELECT' && !raterId && (
                    <div className="text-center py-12 text-glass-400 bg-white/5 rounded-xl border-2 border-white/10 border-dashed">
                        Please select your name above to start rating.
                    </div>
                )}

                {step === 'RATE' && (
                    <Motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="glass-panel p-8 shadow-xl shadow-brand-primary/10">
                            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Rating Criteria</h3>
                                    <p className="text-glass-400 text-sm">Be honest and constructive.</p>
                                </div>
                                <button onClick={() => setStep('SELECT')} className="text-sm font-bold text-glass-500 hover:text-white transition-colors">Change Member</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">

                                {/* Preparation Score */}
                                <div className="space-y-4">
                                    <label className="flex justify-between text-white font-bold">
                                        <span>Preparation</span>
                                        <span className="text-brand-primary text-xl">{formData.preparation}/5</span>
                                    </label>
                                    <input
                                        type="range" min="1" max="5"
                                        value={formData.preparation}
                                        onChange={(e) => setFormData({ ...formData, preparation: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                    />
                                    <p className="text-sm text-glass-400">Did they read the book and come prepared with insights?</p>
                                </div>

                                {/* Contribution Score */}
                                <div className="space-y-4">
                                    <label className="flex justify-between text-white font-bold">
                                        <span>Contribution</span>
                                        <span className="text-brand-primary text-xl">{formData.contribution}/5</span>
                                    </label>
                                    <input
                                        type="range" min="1" max="5" step="1"
                                        value={formData.contribution}
                                        onChange={(e) => setFormData({ ...formData, contribution: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                    />
                                    <p className="text-sm text-glass-400">Did they actively participate and drive the discussion forward?</p>
                                </div>

                                {/* Comment */}
                                <div className="space-y-2">
                                    <label className="text-white font-bold">Private Feedback (Optional)</label>
                                    <textarea
                                        className="input-glass w-full p-4 font-medium h-32"
                                        placeholder="Constructive feedback only..."
                                        value={formData.comment}
                                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-antigravity w-full py-4 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 hover:-translate-y-0.5"
                                >
                                    <Send size={20} /> Submit Evaluation
                                </button>
                            </form>
                        </div>
                    </Motion.div>
                )}

                {step === 'SUCCESS' && (
                    <Motion.div
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 glass-panel shadow-xl"
                    >
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/30">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Evaluation Recorded</h3>
                        <p className="text-glass-400 font-medium">Thank you for maintaining club standards.</p>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PeerReview;
