import { createContext, useContext, useState, useEffect } from 'react';
import { getActiveSession, calculateMemberMetrics } from '../utils/engine';
import { useUser } from './UserContext';
import { useData } from './DataContext';
import { supabase } from '../lib/supabaseClient';

const BookClubContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useBookClub = () => useContext(BookClubContext);

export const BookClubProvider = ({ children }) => {
    // Consume Isolate Providers
    const user = useUser();
    const data = useData();



    // --- ACTIVITY STATE (Logs, Reviews, Ratings) ---
    // These remain here for now as "Activity Context" effectively

    // Helpers
    const initStorage = (key, fallback) => {
        try {
            const saved = localStorage.getItem(key);
            if (!saved || saved === 'undefined' || saved === 'null') return fallback;
            return JSON.parse(saved);
        } catch (e) { console.error(`Storage Init Error (${key}):`, e); return fallback; }
    };

    const saveStorage = (key, value) => {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); }
    };

    const [logs, setLogs] = useState([]);
    const [peerReviews, setPeerReviews] = useState(() => initStorage('bc_reviews_v2', [])); // Keep local for now or add table later
    const [bookRatings, setBookRatings] = useState(() => initStorage('bc_ratings_v2', [])); // Keep local for now
    const [availability, setAvailability] = useState(() => initStorage('bc_availability_v1', []));
    const [quotes, setQuotes] = useState([]);
    const [discussionPoints, setDiscussionPoints] = useState([]);

    // Persistence for Local Only
    useEffect(() => saveStorage('bc_reviews_v2', peerReviews), [peerReviews]);
    useEffect(() => saveStorage('bc_ratings_v2', bookRatings), [bookRatings]);
    useEffect(() => saveStorage('bc_availability_v1', availability), [availability]);

    // FETCH ACTIVITY FROM SUPABASE
    useEffect(() => {
        const loadActivity = async () => {
            // Logs
            const { data: dbLogs } = await supabase.from('logs').select('*');
            if (dbLogs) {
                setLogs(dbLogs.map(l => ({
                    id: l.id,
                    memberId: l.member_id,
                    sessionId: l.session_id,
                    date: l.date,
                    pagesRead: l.pages_read,
                    notes: l.notes,
                    minutesRead: l.minutes_read
                })));
            }

            // Quotes
            const { data: dbQuotes } = await supabase.from('quotes').select('*');
            if (dbQuotes) {
                setQuotes(dbQuotes.map(q => ({
                    id: q.id,
                    text: q.text,
                    memberId: q.member_id,
                    bookId: q.book_id,
                    page: q.page_num,
                    likes: q.likes,
                    date: q.created_at
                })));
            }

            // Discussion
            const { data: dbDiscuss } = await supabase.from('discussion_points').select('*');
            if (dbDiscuss) {
                setDiscussionPoints(dbDiscuss.map(d => ({
                    id: d.id,
                    topic: d.topic,
                    memberId: d.member_id,
                    sessionId: d.session_id,
                    upvotes: d.upvotes,
                    date: d.created_at
                })));
            }
        };
        loadActivity();
    }, []);

    // --- ACTIONS (Activity) ---
    const addLog = async (newLog) => {
        // Optimistic
        const logId = `L${Date.now()}`;
        const logEntry = { ...newLog, id: logId };

        const existsIdx = logs.findIndex(l => l.memberId === newLog.memberId && l.sessionId === newLog.sessionId && l.date === newLog.date);

        if (existsIdx >= 0) {
            // Update local
            const updatedLogs = [...logs];
            updatedLogs[existsIdx] = { ...updatedLogs[existsIdx], ...newLog };
            setLogs(updatedLogs);

            // Update DB (Composite Key logic trickier, just using IDs usually better, but let's try update match)
            // Ideally we'd know the ID. If updating an existing log from UI, we should pass ID.
            // For now, assuming "Add Log" is always new or overwrite by date logic.
            // Let's assume Insert for simplicity or Update if we had ID.
            // If the user is logging for a date they already logged, we usually UPDATE.
            // But without the original ID easily, let's just INSERT and maybe duplicate? 
            // improved: The UI usually knows if it's editing. But here `addLog` checks exists.

            // NOTE: The `logs` table in schema expects a unique ID. 
            // If we find a local match, we should use its ID to update Supabase.
            const existingId = logs[existsIdx].id;
            await supabase.from('logs').update({
                pages_read: newLog.pagesRead || newLog.pages,
                minutes_read: newLog.minutesRead,
                notes: newLog.notes
            }).eq('id', existingId);

        } else {
            setLogs(prev => [...prev, logEntry]);
            await supabase.from('logs').insert([{
                id: logId,
                member_id: newLog.memberId,
                session_id: newLog.sessionId,
                date: newLog.date,
                pages_read: newLog.pagesRead || newLog.pages,
                minutes_read: newLog.minutesRead,
                notes: newLog.notes
            }]);
        }
    };

    const updateLog = (logId, updates) => {
        setLogs(prev => prev.map(l => l.id === logId ? { ...l, ...updates } : l));
        // Todo: Supabase update logic if needed explicitly
    };

    const deleteLog = async (logId) => {
        setLogs(prev => prev.filter(l => l.id !== logId));
        await supabase.from('logs').delete().eq('id', logId);
    };

    const savePeerReview = async (review) => {
        // 1. Optimistic Update (Local)
        const newReview = { ...review, id: review.id || `PR_${Date.now()}` };

        // Remove existing if updating
        const otherReviews = peerReviews.filter(r =>
            !(r.raterId === review.raterId && r.rateeId === review.rateeId && r.sessionId === review.sessionId)
        );
        setPeerReviews([...otherReviews, newReview]);

        // 2. Remote Update
        try {
            await supabase.from('peer_reviews').upsert({
                id: newReview.id,
                rater_id: newReview.raterId,
                ratee_id: newReview.rateeId,
                session_id: newReview.sessionId,
                prep: newReview.prep,
                contrib: newReview.contrib,
                comment: newReview.comment
            }, { onConflict: 'rater_id, ratee_id, session_id' }); // Use composite unique constraint if exists, otherwise ID
            // Ideally we rely on ID. If the UI passes the same ID, upsert works on ID. 
            // If UI passes strictly new ID but it matches logic, we need composite key or handled in UI.
            // For now, let's assume UI passes ID if editing.
        } catch (e) {
            console.error("Peer Review Save Error:", e);
        }
    };

    const rateBook = (rating) => {
        setBookRatings(prev => [...prev, { ...rating, id: `R${Date.now()}` }]);
    };

    const toggleAvailability = (memberId, date) => {
        setAvailability(prev => {
            const exists = prev.find(a => a.memberId === memberId && a.date === date);
            if (exists) {
                return prev.filter(a => !(a.memberId === memberId && a.date === date));
            } else {
                return [...prev, { id: `AV_${Date.now()}`, memberId, date, status: 'BUSY' }];
            }
        });
    };

    const addQuote = async (quote) => {
        const newQ = { ...quote, id: `Q${Date.now()}`, likes: 0, date: new Date().toISOString() };
        setQuotes(prev => [...prev, newQ]);
        await supabase.from('quotes').insert([{
            id: newQ.id,
            text: newQ.text,
            member_id: newQ.memberId,
            book_id: newQ.bookId,
            page_num: newQ.page,
            likes: 0
        }]);
    };

    const likeQuote = async (quoteId, memberId) => {
        setQuotes(prev => prev.map(q =>
            q.id === quoteId ? { ...q, likes: q.likes + 1 } : q
        ));
        // RPC or simple increment. Since no auth check strictness, just increment.
        // We'd need to fetch current likes to be safe or use rpc.
        // For now, client-side trust increment (race conditions possible).
        const q = quotes.find(x => x.id === quoteId);
        if (q) {
            await supabase.from('quotes').update({ likes: q.likes + 1 }).eq('id', quoteId);
        }
    };

    const addDiscussionPoint = async (point) => {
        const newP = { ...point, id: `DP_${Date.now()}`, upvotes: 0, date: new Date().toISOString() };
        setDiscussionPoints(prev => [...prev, newP]);
        await supabase.from('discussion_points').insert([{
            id: newP.id,
            topic: newP.topic || newP.prompt,
            member_id: newP.memberId,
            session_id: newP.sessionId,
            upvotes: 0
        }]);
    };

    const voteDiscussionPoint = async (id) => {
        setDiscussionPoints(prev => prev.map(p =>
            p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p
        ));
        const p = discussionPoints.find(x => x.id === id);
        if (p) {
            await supabase.from('discussion_points').update({ upvotes: p.upvotes + 1 }).eq('id', id);
        }
    };

    // --- AGGREGATED LOGIC (The Engine) ---
    const activeSession = getActiveSession(data.sessions);
    const activeBook = data.books.find(b => b.id === activeSession?.bookId);

    const memberStats = user.members.map(m => {
        const stats = calculateMemberMetrics(m, activeSession, activeBook, logs, peerReviews, data.courses);
        return { ...m, stats };
    });

    const leaderboard = [...memberStats].sort((a, b) => {
        const scoreDiff = (b.stats?.score || 0) - (a.stats?.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        // Tie-breaker: Alphabetical by Name
        return a.name.localeCompare(b.name);
    });

    // --- SYSTEM ACTIONS (Aggregated) ---
    const wipeDatabase = async () => {
        // 1. Wipe Remote Activity Data (FK constraints)
        // Deleting logs/quotes/discussions first because they reference Members/Sessions/Books
        try {
            await supabase.from('logs').delete().neq('id', '0');
            await supabase.from('quotes').delete().neq('id', '0');
            await supabase.from('discussion_points').delete().neq('id', '0');
            // Peer reviews, Ratings if table exists? (Currently local only in this context but good to prepare)
        } catch (e) {
            console.error("Activity Wipe Error:", e);
        }

        // 2. Wipe User Data (Local State)
        // We might want to keep members? Original logic: setMembers(INITIAL_MEMBERS)
        // Let's assume UserContext has a reset or we just set it manually via setMembers if exposed.
        // UserContext exposes setMembers.
        // For now, let's just wipe Activity.
        setLogs([]);
        setPeerReviews([]);
        setBookRatings([]);
        setAvailability([]);
        setQuotes([]);
        setDiscussionPoints([]);

        // 3. Wipe/Reset Data Context (Remote & Local)
        await data.hardResetLibrary();

        // 4. Reset User Context
        user.resetUsers();
    };

    // Alias
    const resetData = wipeDatabase;

    const exportData = () => {
        const exportPayload = {
            members: user.members,
            books: data.books,
            syllabus: data.syllabus,
            events: data.events,
            courses: data.courses,
            sessions: data.sessions,
            assets: data.assets,
            categories: data.categories,
            settings: user.settings,
            logs, peerReviews, bookRatings,
            version: '2.1.0',
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ifiye_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };

    const importData = (jsonData) => {
        try {
            const importPayload = JSON.parse(jsonData);
            if (!importPayload.members || !importPayload.books) throw new Error("Invalid Backup File");

            if (confirm("WARNING: All data will be overwritten. Continue?")) {
                // User
                user.setMembers(importPayload.members || []);
                if (importPayload.settings) user.setSettings(importPayload.settings);

                // Data
                data.setBooks(importPayload.books || []);
                data.setSyllabus(importPayload.syllabus || []);
                data.setEvents(importPayload.events || []);
                data.setCourses(importPayload.courses || []);
                data.setSessions(importPayload.sessions || []);
                data.setAssets(importPayload.assets || []);
                data.setCategories(importPayload.categories || []);

                // Activity
                setLogs(importPayload.logs || []);
                setPeerReviews(importPayload.peerReviews || []);
                setBookRatings(importPayload.bookRatings || []);

                alert("Restore Successful!");
                window.location.reload();
            }
        } catch (e) {
            console.error("Import Failed:", e);
            alert("Failed to restore backup.");
        }
    };

    // --- COMPOSITION ---
    const value = {
        // Flatten User Context
        ...user,
        // Flatten Data Context
        ...data,

        // Activity State
        logs,
        peerReviews,
        bookRatings,
        availability,
        quotes,
        discussionPoints,

        // Activity Actions
        addLog,
        updateLog,
        deleteLog,
        savePeerReview,
        rateBook,
        toggleAvailability,
        addQuote,
        likeQuote,
        addDiscussionPoint,
        voteDiscussionPoint,

        // Aggregated System Actions
        wipeDatabase,
        resetData,
        exportData,
        importData,

        // Derived
        activeSession,
        activeBook,
        leaderboard
    };

    return (
        <BookClubContext.Provider value={value}>
            {children}
        </BookClubContext.Provider>
    );
};
