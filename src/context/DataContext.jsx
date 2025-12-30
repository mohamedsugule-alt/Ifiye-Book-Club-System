import { createContext, useContext, useState, useEffect } from 'react';
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
    const [books, setBooks] = useState(() => initStorage('bc_books_v2', INITIAL_BOOKS));
    const [syllabus, setSyllabus] = useState(() => initStorage('bc_syllabus_v2', PREVIOUS_SYLLABUS));
    const [events, setEvents] = useState(() => initStorage('bc_events_v2', INITIAL_EVENTS));
    const [courses, setCourses] = useState(() => initStorage('bc_courses_v2', []));
    const [sessions, setSessions] = useState(() => initStorage('bc_sessions_v2', INITIAL_SESSIONS));
    const [assets, setAssets] = useState(() => initStorage('bc_assets_v2', []));
    const [categories, setCategories] = useState(() => initStorage('bc_categories_v2', [
        'Context', 'Mindset', 'Toolkit', 'Business', 'Tech', 'Application'
    ]));

    // Persistence
    useEffect(() => saveStorage('bc_books_v2', books), [books]);
    useEffect(() => saveStorage('bc_syllabus_v2', syllabus), [syllabus]);
    useEffect(() => saveStorage('bc_events_v2', events), [events]);
    useEffect(() => saveStorage('bc_courses_v2', courses), [courses]);
    useEffect(() => saveStorage('bc_sessions_v2', sessions), [sessions]);
    useEffect(() => saveStorage('bc_assets_v2', assets), [assets]);
    useEffect(() => saveStorage('bc_categories_v2', categories), [categories]);

    // Data Sanitization / Migration
    // Data Sanitization / Migration
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBooks(prev => {
            const currentIds = new Set(prev.map(b => b.id));
            const missing = ARCHIVE_BOOKS.filter(b => !currentIds.has(b.id));
            if (missing.length > 0) {
                console.log('DataContext: Merging missing archive books:', missing.length);
                return [...prev, ...missing];
            }
            return prev;
        });
    }, []);

    // Actions
    const addBook = (book) => setBooks(prev => [...prev, { ...book, id: book.id || `B${Date.now()}` }]);
    const updateBook = (id, updates) => setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

    const addEvent = (event) => setEvents(prev => [...prev, { ...event, id: `E${Date.now()}` }]);
    const updateEvent = (id, updates) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    const deleteEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id));

    const addCourse = (course) => setCourses(prev => [...(Array.isArray(prev) ? prev : []), { ...course, id: `C${Date.now()}`, status: 'IN_PROGRESS', progress: 0 }]);
    const updateCourse = (id, updates) => setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const deleteCourse = (id) => setCourses(prev => prev.filter(c => c.id !== id));

    const addSession = (session) => setSessions(prev => [...(prev || []), { ...session, id: session.id || `S${Date.now()}` }]);
    const updateSession = (id, updates) => setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const deleteSession = (sessionId) => setSessions(prev => prev.filter(s => s.id !== sessionId));

    const addSyllabusItem = (item) => setSyllabus(prev => [...prev, { ...item, id: `S${Date.now()}` }]);
    const updateSyllabusItem = (id, updates) => setSyllabus(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const deleteSyllabusItem = (id) => setSyllabus(prev => prev.filter(s => s.id !== id));

    const addAsset = (asset) => setAssets(prev => [...prev, { ...asset, id: `A${Date.now()}` }]);

    const addCategory = (category) => {
        if (!categories.includes(category)) setCategories(prev => [...prev, category]);
    };
    const deleteCategory = (category) => setCategories(prev => prev.filter(c => c !== category));

    // Reset Data Helper
    const resetLibraryData = () => {
        setBooks(INITIAL_BOOKS);
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
            resetLibraryData
        }}>
            {children}
        </DataContext.Provider>
    );
};
