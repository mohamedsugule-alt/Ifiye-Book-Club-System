import { useState, useEffect } from 'react';
import { useBookClub } from '../context/BookClubContext';
import { useLocation } from 'react-router-dom'; // Added useLocation
import { AlertCircle, CheckCircle, Save } from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const Log = () => {
    const context = useBookClub();
    const location = useLocation(); // Hook for state

    // Hooks MUST be unconditional
    const [formData, setFormData] = useState({
        memberId: location.state?.memberId || '',
        pages: '',
        date: location.state?.date || format(new Date(), 'yyyy-MM-dd'),
        isMissed: false
    });
    const [status, setStatus] = useState('IDLE');

    // Destructure context safely
    const { members = [], activeSession, activeBook, addLog, logs = [], updateLog, deleteLog, sessions = [], books = [] } = context || {};

    // Load existing log if available
    // Load existing log if available
    const foundLog = (Array.isArray(logs) && formData.memberId && formData.date)
        ? logs.find(l => String(l.memberId) === String(formData.memberId) && l.date === formData.date)
        : null;

    // Sync form data with found log (only if pages/missed status differs)
    useEffect(() => {
        if (foundLog) {
            const isMissed = foundLog.pagesRead === 0 && !foundLog.notes;
            if (formData.pages !== foundLog.pagesRead || formData.isMissed !== isMissed) {
                // Only update if we haven't touched the form yet or if it's clearly a load action
                // For simplicity, we assume if foundLog exists, we populate it
                setFormData(prev => ({
                    ...prev,
                    pages: foundLog.pagesRead,
                    isMissed: isMissed
                }));
            }
        }
        // We do NOT reset to empty here to avoid overwriting user input while typing date
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [foundLog]); // Only re-run if the found log entry changes


    // 1. Context Missing Check
    if (!context) return (
        <div className="p-10 text-center text-red-500 bg-white h-screen">
            <AlertCircle className="mx-auto w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold">Critical Error: Context Missing</h1>
            <p>The application provider is not loaded.</p>
        </div>
    );

    // 2. Debug: If NO sessions at all
    if (!sessions || sessions.length === 0) {
        return (
            <div className="p-8 text-white glass-panel max-w-2xl mx-auto mt-10 shadow-xl">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-rose-400">
                    <AlertCircle /> System Data Empty
                </h3>
                <p className="mb-4 text-glass-400">
                    The database appears to be empty (0 Sessions).
                    This can happen after a factory reset if the new plan wasn't loaded.
                </p>
                <div className="bg-white/10 p-4 rounded mb-4 font-mono text-xs text-glass-400">
                    Debug: members={members?.length || 0}, books={books?.length || 0}
                </div>
                <button
                    onClick={() => {
                        if (confirm("Load 2026 Plan Data now?")) {
                            context.resetData();
                            setTimeout(() => window.location.reload(), 500);
                        }
                    }}
                    className="btn-antigravity text-white font-bold py-3 px-6 rounded-lg transition w-full md:w-auto"
                >
                    INITIALIZE 2026 DATA
                </button>
            </div>
        );
    }

    // Force Fallback if Engine returns null (e.g. before start date)
    const effectiveSession = activeSession || (sessions.length > 0 ? sessions[0] : null);
    const effectiveBook = activeBook || (effectiveSession ? books.find(b => b.id === effectiveSession.bookId) : null);

    // 3. book/session consistency check
    if (!effectiveSession || !effectiveBook) return (
        <div className="p-8 text-white glass-panel max-w-2xl mx-auto mt-10 shadow-lg">
            <h3 className="text-xl font-bold mb-2 text-orange-400">Configuration Issue</h3>
            <p>Session found {effectiveSession?.id} but mismatch book {effectiveSession?.bookId}</p>
        </div>
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.memberId || (!formData.pages && !formData.isMissed)) return;

        setStatus('SAVING');

        setTimeout(() => {
            if (foundLog && updateLog) {
                updateLog(foundLog.id, {
                    pages: parseInt(formData.pages || 0),
                });
            } else if (addLog) {
                addLog({
                    memberId: formData.memberId,
                    bookId: effectiveBook.id, // Ensure we log against the correct book ID from context
                    sessionId: effectiveSession.id,
                    pagesRead: parseInt(formData.pages || 0),
                    minutesRead: 0, // Simplified for now
                    date: formData.date,
                    notes: formData.isMissed ? 'Missed Day' : ''
                });

                // Confetti Trigger
                if (parseInt(formData.pages) >= effectiveBook.pages) {
                    triggerConfetti();
                }
            }
            setStatus('SAVED');
            setTimeout(() => {
                setStatus('IDLE');
                // Optional: navigate home?
                // navigate('/');
            }, 2000);
        }, 800);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Log Execution</h2>
                <p className="text-glass-400">Recording progress for: <span className="text-brand-primary font-bold">{effectiveBook.title}</span></p>
                <div className="text-xs text-glass-500 mt-1">Session: {effectiveSession.id} ({effectiveSession.startDate} - {effectiveSession.endDate})</div>
            </div>

            {/* Guidance */}
            <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-lg text-sm text-glass-300">
                <p><strong className="text-brand-primary">How to Log:</strong> Select your name and the date. Enter the <strong>number of pages read</strong>. If you missed a day, check "Mark as Missed".</p>
            </div>

            <div className="p-8 glass-panel border-t-4 border-t-brand-primary">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Member Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-glass-300">Select Member</label>
                        <select
                            value={formData.memberId}
                            onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                            className="input-glass w-full"
                            required
                        >
                            <option value="" className="text-black">Choose identifier...</option>
                            {(members || []).filter(m => m?.active).map(m => (
                                <option key={m.id} value={m.id} className="text-black">{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-glass-300">Date of Activity</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                max={new Date().toISOString().split('T')[0]} // Cannot log future
                                className="input-glass w-full text-white"
                                required
                            />
                            {/* Warning if date is outside session range */}
                            {(formData.date < effectiveSession.startDate && !formData.isMissed) && (
                                <p className="text-xs text-orange-400 flex items-center gap-1 font-medium">
                                    <AlertCircle size={12} />
                                    <span>Pre-start Entry (Session starts {effectiveSession.startDate})</span>
                                </p>
                            )}
                            {(formData.date > effectiveSession.endDate) && (
                                <p className="text-xs text-orange-400 flex items-center gap-1 font-medium">
                                    <AlertCircle size={12} />
                                    <span>Post-deadline Entry</span>
                                </p>
                            )}
                        </div>

                        {/* Pages Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="block text-sm font-bold text-glass-300">Pages Read</label>
                                <label className="flex items-center gap-2 text-sm text-glass-400 cursor-pointer hover:text-white transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.isMissed}
                                        onChange={(e) => setFormData({ ...formData, isMissed: e.target.checked, pages: e.target.checked ? '0' : '' })}
                                        className="rounded bg-white/10 border-white/20 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>Mark as Missed</span>
                                </label>
                            </div>
                            <input
                                type="number"
                                value={formData.pages}
                                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                                placeholder={formData.isMissed ? "Skipped" : "e.g. 50"}
                                disabled={formData.isMissed}
                                className="input-glass w-full disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-glass-500"
                                required={!formData.isMissed}
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        {foundLog && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this log entry?")) {
                                        deleteLog(foundLog.id);
                                        setFormData(prev => ({ ...prev, pages: '', isMissed: false }));
                                        setStatus('SUCCESS');
                                        setTimeout(() => setStatus('IDLE'), 2000);
                                    }
                                }}
                                className="px-6 py-4 rounded-lg font-bold text-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                            >
                                Delete
                            </button>
                        )}

                        <button
                            type="submit"
                            className={`flex-1 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg
                  ${status === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'btn-antigravity text-white'}`}
                        >
                            <AnimatePresence mode="wait">
                                {status === 'SUCCESS' ? (
                                    <Motion.div
                                        key="success"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle size={24} />
                                        <span>{foundLog ? 'Updated' : 'Submitted'}</span>
                                    </Motion.div>
                                ) : (
                                    <Motion.div
                                        key="idle"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Save size={24} />
                                        <span>{foundLog ? 'Update Log' : 'Commit Progress'}</span>
                                    </Motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>

                </form>
            </div>
        </div >
    );
};

export default Log;
