import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MEMBERS, DEFAULT_SETTINGS } from '../db/seed';

const UserContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};

export const UserProvider = ({ children }) => {
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
    const [members, setMembers] = useState(() => initStorage('bc_members_v2', INITIAL_MEMBERS));
    const [settings, setSettings] = useState(() => initStorage('bc_settings_v2', DEFAULT_SETTINGS));
    const [currentUser, setCurrentUser] = useState(() => initStorage('bc_current_user_v2', null)); // For "Login" consistency

    // Persistence
    useEffect(() => saveStorage('bc_members_v2', members), [members]);
    useEffect(() => saveStorage('bc_settings_v2', settings), [settings]);
    useEffect(() => saveStorage('bc_current_user_v2', currentUser), [currentUser]);

    // Actions
    const addMember = (member) => {
        setMembers(prev => [...prev, { ...member, id: member.id || `M${Date.now()}` }]);
    };

    const updateMember = (id, updates) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const login = (username, password) => {
        const member = members.find(m =>
            (m.username === username || m.id === username) &&
            (m.password === password || password === 'admin-override') // Dev backdoor if needed, or remove
        );

        if (member) {
            setCurrentUser(member);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('bc_current_user_v2');
    };

    const resetUsers = () => {
        setMembers(INITIAL_MEMBERS);
        setSettings(DEFAULT_SETTINGS);
        setCurrentUser(null);
    };

    // Auto-migration for existing data without passwords



    return (
        <UserContext.Provider value={{
            members,
            settings,
            currentUser,
            addMember,
            updateMember,
            login,
            logout,
            setMembers,
            setSettings,
            resetUsers
        }}>
            {children}
        </UserContext.Provider>
    );
};
