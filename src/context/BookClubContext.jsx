import { createContext, useContext, useState, useEffect } from 'react';
import { getActiveSession, calculateMemberMetrics } from '../utils/engine';
import { useUser } from './UserContext';
import { useData } from './DataContext';

const BookClubContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useBookClub = () => useContext(BookClubContext);

export const BookClubProvider = ({ children }) => {
    // Consume Isolate Providers
    const user = useUser();
    const data = useData();

    // --- ACTIVITY STATE (Logs, Reviews, Ratings) ---
    // These remain here for now as "Activity Context" effectively
    const initStorage = (key, fallback) => {
        try {
            const saved = localStorage.getItem(key);
            if (!saved || saved === 'undefined' || saved === 'null') return fallback;
            return JSON.parse(saved);
        } catch (e) {
            console.error(`Storage Init Error (${key}):`, e);
            return fallback;
        }
    };

    const saveStorage = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Storage Save Error (${key}):`, e);
        }
    };

    const [logs, setLogs] = useState(() => initStorage('bc_logs_v2', []));
    const [peerReviews, setPeerReviews] = useState(() => initStorage('bc_reviews_v2', []));
    const [bookRatings, setBookRatings] = useState(() => initStorage('bc_ratings_v2', []));
    const [availability, setAvailability] = useState(() => initStorage('bc_availability_v1', []));
    const [quotes, setQuotes] = useState(() => initStorage('bc_quotes_v1', [])); // { id, bookId, memberId, text, page, likes, date }
    const [discussionPoints, setDiscussionPoints] = useState(() => initStorage('bc_discussion_v1', []));

    useEffect(() => saveStorage('bc_logs_v2', logs), [logs]);
    useEffect(() => saveStorage('bc_reviews_v2', peerReviews), [peerReviews]);
    useEffect(() => saveStorage('bc_ratings_v2', bookRatings), [bookRatings]);
    useEffect(() => saveStorage('bc_availability_v1', availability), [availability]);
    useEffect(() => saveStorage('bc_quotes_v1', quotes), [quotes]);
    useEffect(() => saveStorage('bc_discussion_v1', discussionPoints), [discussionPoints]);

    // --- ACTIONS (Activity) ---
    const addLog = (newLog) => {
        const exists = logs.findIndex(l =>
            l.memberId === newLog.memberId &&
            l.sessionId === newLog.sessionId &&
            l.date === newLog.date
        );

        if (exists >= 0) {
            const updatedLogs = [...logs];
            updatedLogs[exists] = { ...updatedLogs[exists], ...newLog };
            setLogs(updatedLogs);
        } else {
            setLogs(prev => [...(Array.isArray(prev) ? prev : []), { ...newLog, id: Date.now().toString() }]);
        }
    };

    const updateLog = (logId, updates) => {
        setLogs(prev => prev.map(l => l.id === logId ? { ...l, ...updates } : l));
    };

    const deleteLog = (logId) => {
        setLogs(prev => prev.filter(l => l.id !== logId));
    };

    const addPeerReview = (review) => {
        setPeerReviews(prev => [...prev, { ...review, id: Date.now().toString() }]);
    };

    const rateBook = (rating) => {
        setBookRatings(prev => [...prev, { ...rating, id: `R${Date.now()}` }]);
    };

    const toggleAvailability = (memberId, date) => {
        setAvailability(prev => {
            const exists = prev.find(a => a.memberId === memberId && a.date === date);
            if (exists) {
                // Remove (Toggle Off)
                return prev.filter(a => !(a.memberId === memberId && a.date === date));
            } else {
                // Add (Toggle On - Busy)
                return [...prev, { id: `AV_${Date.now()}`, memberId, date, status: 'BUSY' }];
            }
        });
    };

    const addQuote = (quote) => {
        setQuotes(prev => [...prev, { ...quote, id: `Q${Date.now()}`, likes: 0, date: new Date().toISOString() }]);
    };

    const likeQuote = (quoteId, memberId) => {
        // Simple toggle or increment? Let's just increment for now given no auth
        // Or store array of likedBy
        setQuotes(prev => prev.map(q =>
            q.id === quoteId ? { ...q, likes: q.likes + 1 } : q
        ));
    };

    const addDiscussionPoint = (point) => {
        setDiscussionPoints(prev => [...prev, { ...point, id: `DP_${Date.now()}`, upvotes: 0, date: new Date().toISOString() }]);
    };

    const voteDiscussionPoint = (id) => {
        setDiscussionPoints(prev => prev.map(p =>
            p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p
        ));
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
    const wipeDatabase = () => {
        // 1. Wipe User Data
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

        // 2. Wipe/Reset Data Context
        data.resetLibraryData();

        // 3. Reset User Context
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
        addPeerReview,
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
