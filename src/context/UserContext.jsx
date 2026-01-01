import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { INITIAL_MEMBERS, DEFAULT_SETTINGS } from '../db/seed';

const UserContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};

export const UserProvider = ({ children }) => {
    // Helper: Init from Storage (ONLY for Settings & Auth State local persistence)
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
    const [members, setMembers] = useState([]); // Now empty default, fetch from DB
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState(() => initStorage('bc_settings_v2', DEFAULT_SETTINGS));
    const [currentUser, setCurrentUser] = useState(() => initStorage('bc_current_user_v2', null));

    // Persistence for Local Preferences
    useEffect(() => saveStorage('bc_settings_v2', settings), [settings]);
    useEffect(() => saveStorage('bc_current_user_v2', currentUser), [currentUser]);

    // FETCH MEMBERS FROM SUPABASE
    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase.from('members').select('*');
            if (error) throw error;
            if (data && data.length > 0) {
                setMembers(data);
            } else {
                // If DB empty, maybe fallback or just empty
                setMembers(INITIAL_MEMBERS); // Temporary fallback until synced
            }
        } catch (err) {
            console.error("Failed to fetch members:", err);
            // Fallback to local if offline
            const local = JSON.parse(localStorage.getItem('bc_members_v2') || 'null');
            if (local) setMembers(local);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);


    // Actions
    const addMember = async (member) => {
        const newMember = { ...member, id: member.id || `M${Date.now()}` };

        // Optimistic Update
        setMembers(prev => [...prev, newMember]);

        try {
            const { error } = await supabase.from('members').insert([{
                id: newMember.id,
                name: newMember.name,
                role: newMember.role,
                active: newMember.active,
                avatar_url: newMember.avatar || ''
            }]);
            if (error) throw error;
        } catch (err) {
            console.error("Error adding member to DB:", err);
            alert("Failed to save member to cloud.");
        }
    };

    const updateMember = async (id, updates) => {
        // Optimistic Update
        setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

        try {
            // Map keys to snake_case if necessary, but our schema uses basic names except avatar
            const dbUpdates = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.role) dbUpdates.role = updates.role;
            if (updates.active !== undefined) dbUpdates.active = updates.active;
            if (updates.avatar) dbUpdates.avatar_url = updates.avatar;

            const { error } = await supabase.from('members').update(dbUpdates).eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.error("Error updating member:", err);
        }
    };

    // Auth remains simple for now (Password/Name check against loaded members)
    const login = (username, password) => {
        const member = members.find(m =>
            (m.name === username || m.id === username) && // Changed from m.username to m.name as per schema
            (password === 'admin' || password === 'member' || password === 'admin-override') // Placeholder auth
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

    return (
        <UserContext.Provider value={{
            members,
            settings,
            currentUser,
            isLoading,
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
