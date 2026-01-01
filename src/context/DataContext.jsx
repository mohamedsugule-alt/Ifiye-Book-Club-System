import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { INITIAL_BOOKS, INITIAL_SESSIONS, ARCHIVE_BOOKS } from '../db/seed';
import { PREVIOUS_SYLLABUS, INITIAL_EVENTS } from '../db/syllabus';

const DataContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within a DataProvider");
    return context;
};

export const DataProvider = ({ children }) => {
    // Helper: Init from Storage
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

    // State
    const [books, setBooks] = useState([]); // Fetch from DB
    const [sessions, setSessions] = useState([]); // Fetch from DB
    const [syllabus, setSyllabus] = useState(() => initStorage('bc_syllabus_v2', PREVIOUS_SYLLABUS));
    const [events, setEvents] = useState(() => initStorage('bc_events_v2', INITIAL_EVENTS));
    const [courses, setCourses] = useState(() => initStorage('bc_courses_v2', []));
    const [assets, setAssets] = useState(() => initStorage('bc_assets_v2', []));
    const [categories, setCategories] = useState(() => initStorage('bc_categories_v2', [
        'Context', 'Mindset', 'Toolkit', 'Business', 'Tech', 'Application'
    ]));

    // Persistence (Legacy/Helpers)
    useEffect(() => saveStorage('bc_syllabus_v2', syllabus), [syllabus]);
    useEffect(() => saveStorage('bc_events_v2', events), [events]);
    useEffect(() => saveStorage('bc_courses_v2', courses), [courses]);
    useEffect(() => saveStorage('bc_assets_v2', assets), [assets]);
    useEffect(() => saveStorage('bc_categories_v2', categories), [categories]);

    // FETCH DATA
    useEffect(() => {
        const loadLibrary = async () => {
            try {
                // Books
                const { data: dbBooks } = await supabase.from('books').select('*');
                if (dbBooks && dbBooks.length > 0) {
                    // Map db columns to app model if needed, but our schema matches mostly
                    setBooks(dbBooks.map(b => ({
                        id: b.id,
                        title: b.title,
                        author: b.author,
                        pages: b.pages,
                        coverUrl: b.cover_url,
                        genre: b.genre,
                        rating: 0 // Calc later or fetch
                    })));
                } else {
                    setBooks([...INITIAL_BOOKS, ...ARCHIVE_BOOKS]); // Fallback with Archives
                }

                // Sessions
                const { data: dbSessions } = await supabase.from('sessions').select('*');
                if (dbSessions && dbSessions.length > 0) {
                    setSessions(dbSessions.map(s => ({
                        id: s.id,
                        bookId: s.book_id,
                        startDate: s.start_date,
                        endDate: s.end_date,
                        active: s.active
                    })));
                } else {
                    setSessions(INITIAL_SESSIONS);
                }

            } catch (err) {
                console.error("Library Load Error:", err);
                // Fallback
                setBooks(JSON.parse(localStorage.getItem('bc_books_v2') || JSON.stringify([...INITIAL_BOOKS, ...ARCHIVE_BOOKS])));
                setSessions(JSON.parse(localStorage.getItem('bc_sessions_v2') || JSON.stringify(INITIAL_SESSIONS)));
            }
        };
        loadLibrary();
    }, []);

    // Actions
    const addBook = async (book) => {
        const newBook = { ...book, id: book.id || `B${Date.now()}` };
        setBooks(prev => [...prev, newBook]); // Optimistic
        try {
            await supabase.from('books').insert([{
                id: newBook.id,
                title: newBook.title,
                author: newBook.author,
                pages: newBook.pages,
                cover_url: newBook.coverUrl,
                genre: newBook.category || newBook.genre
            }]);
        } catch (e) {
            console.error(e);
        }
    };

    const updateBook = async (id, updates) => {
        setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
        try {
            const dbUp = {};
            if (updates.title) dbUp.title = updates.title;
            if (updates.author) dbUp.author = updates.author;
            if (updates.pages) dbUp.pages = updates.pages;
            if (updates.coverUrl) dbUp.cover_url = updates.coverUrl;

            await supabase.from('books').update(dbUp).eq('id', id);
        } catch (e) { console.error(e); }
    };

    const addSession = async (session) => {
        const newS = { ...session, id: session.id || `S${Date.now()}` };
        setSessions(prev => [...(prev || []), newS]);
        try {
            await supabase.from('sessions').insert([{
                id: newS.id,
                book_id: newS.bookId,
                start_date: newS.startDate,
                end_date: newS.endDate,
                active: newS.active
            }]);
        } catch (e) { console.error(e); }
    };

    const updateSession = async (id, updates) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        try {
            const dbUp = {};
            if (updates.startDate) dbUp.start_date = updates.startDate;
            if (updates.endDate) dbUp.end_date = updates.endDate;
            if (updates.active !== undefined) dbUp.active = updates.active;
            await supabase.from('sessions').update(dbUp).eq('id', id);
        } catch (e) { console.error(e); }
    };

    const deleteSession = async (sessionId) => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        try {
            await supabase.from('sessions').delete().eq('id', sessionId);
        } catch (e) { console.error(e); }
    };


    const addEvent = (event) => setEvents(prev => [...prev, { ...event, id: `E${Date.now()}` }]);
    const updateEvent = (id, updates) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    const deleteEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id));

    const addCourse = (course) => setCourses(prev => [...(Array.isArray(prev) ? prev : []), { ...course, id: `C${Date.now()}`, status: 'IN_PROGRESS', progress: 0 }]);
    const updateCourse = (id, updates) => setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const deleteCourse = (id) => setCourses(prev => prev.filter(c => c.id !== id));

    const addSyllabusItem = (item) => setSyllabus(prev => [...prev, { ...item, id: `S${Date.now()}` }]);
    const updateSyllabusItem = (id, updates) => setSyllabus(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const deleteSyllabusItem = (id) => setSyllabus(prev => prev.filter(s => s.id !== id));

    const addAsset = (asset) => setAssets(prev => [...prev, { ...asset, id: `A${Date.now()}` }]);

    const addCategory = (category) => {
        if (!categories.includes(category)) setCategories(prev => [...prev, category]);
    };
    const deleteCategory = (category) => setCategories(prev => prev.filter(c => c !== category));


    // Reset Data Helper
    const hardResetLibrary = async () => {
        if (!confirm("CRITICAL: This will DELETE ALL DATA on the remote database (Supabase) and reset it to default seeds. Are you sure?")) return;

        // 1. Remote Wipe (Delete All)
        // Order matters for FK constraints: Logs/Quotes/Discussion (handled in BookClubCtx) -> Sessions -> Books
        try {
            console.log("Resetting Remote Data...");

            // Delete Sessions first (FK to Books)
            const { error: sessErr } = await supabase.from('sessions').delete().neq('id', '0');
            if (sessErr) console.error("Session Delete Error:", sessErr);

            // Delete Books (parent)
            const { error: bookErr } = await supabase.from('books').delete().neq('id', '0');
            if (bookErr) console.error("Book Delete Error:", bookErr);

            // 2. Re-Seed Books
            console.log("Seeding Books...");
            const allBooks = [...INITIAL_BOOKS, ...ARCHIVE_BOOKS];
            const { error: seedBookErr } = await supabase.from('books').insert(allBooks.map(b => ({
                id: b.id,
                title: b.title,
                author: b.author,
                pages: b.pages,
                cover_url: b.coverUrl,
                genre: b.category || b.genre
            })));
            if (seedBookErr) console.error("Book Seed Error:", seedBookErr);

            // 3. Re-Seed Sessions
            console.log("Seeding Sessions...");
            const { error: seedSessErr } = await supabase.from('sessions').insert(INITIAL_SESSIONS.map(s => ({
                id: s.id,
                book_id: s.bookId,
                start_date: s.startDate,
                end_date: s.endDate,
                active: s.active
            })));
            if (seedSessErr) console.error("Session Seed Error:", seedSessErr);

            alert("Remote Database Reset Complete.");

        } catch (e) {
            console.error("Hard Reset Failed:", e);
            alert("Reset Failed. Check console.");
        }

        // 4. Local State Reset
        resetLibraryData();
    };

    const resetLibraryData = () => {
        // Just local reset for now, detailed wipe is in Admin
        setBooks([...INITIAL_BOOKS, ...ARCHIVE_BOOKS]);
        setSessions(INITIAL_SESSIONS);
        setSyllabus(PREVIOUS_SYLLABUS);
        setEvents(INITIAL_EVENTS);
        setCourses([]);
        setAssets([]);
        setCategories(['Context', 'Mindset', 'Toolkit', 'Business', 'Tech', 'Application']);
    };

    return (
        <DataContext.Provider value={{
            books, syllabus, events, courses, sessions, assets, categories,
            setBooks, setSessions, setEvents, setSyllabus, setCourses, setAssets, setCategories,
            addBook, updateBook,
            addEvent, updateEvent, deleteEvent,
            addCourse, updateCourse, deleteCourse,
            addSession, updateSession, deleteSession,
            addSyllabusItem, updateSyllabusItem, deleteSyllabusItem,
            addAsset,
            addCategory, deleteCategory,
            resetLibraryData, hardResetLibrary
        }}>
            {children}
        </DataContext.Provider>
    );
};
