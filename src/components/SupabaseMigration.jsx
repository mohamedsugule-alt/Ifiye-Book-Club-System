import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, AlertCircle, CloudUpload, Loader } from 'lucide-react';

export const SupabaseMigration = () => {
    const [status, setStatus] = useState('IDLE'); // IDLE, MIGRATING, SUCCESS, ERROR
    const [logs, setLogs] = useState([]);

    const log = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const runMigration = async () => {
        if (!confirm("This will upload your local data to the Cloud. Continue?")) return;

        setStatus('MIGRATING');
        setLogs([]);
        log("Starting Migration...");

        try {
            // HELPER: Deduplicate Objects by ID (keeps last occurrence)
            const dedupe = (arr) => {
                const map = new Map();
                arr.forEach(item => map.set(String(item.id), item));
                return Array.from(map.values());
            };

            // 1. MEMBERS
            const localMembers = dedupe(JSON.parse(localStorage.getItem('bc_members_v2') || '[]'));
            if (localMembers.length > 0) {
                log(`Migrating ${localMembers.length} Unique Members...`);
                // Map to snake_case if needed, but our schema uses text match mostly
                const { error } = await supabase.from('members').upsert(localMembers.map(m => ({
                    id: String(m.id),
                    name: m.name,
                    role: m.role || 'MEMBER',
                    active: m.active !== false,
                    avatar_url: m.avatar
                })), { onConflict: 'id' });
                if (error) throw error;
            }

            // 2. BOOKS
            const localBooks = dedupe(JSON.parse(localStorage.getItem('bc_books_v2') || '[]'));
            if (localBooks.length > 0) {
                log(`Migrating ${localBooks.length} Unique Books...`);
                const { error } = await supabase.from('books').upsert(localBooks.map(b => ({
                    id: b.id, // UUID usually
                    title: b.title,
                    author: b.author,
                    pages: Number(b.pages || 0),
                    cover_url: b.coverUrl || b.image,
                    genre: b.genre
                })), { onConflict: 'id' });
                if (error) throw error;
            }

            // 3. SESSIONS
            const localSessions = dedupe(JSON.parse(localStorage.getItem('bc_sessions_v2') || '[]'));
            if (localSessions.length > 0) {
                log(`Migrating ${localSessions.length} Unique Sessions...`);
                const { error } = await supabase.from('sessions').upsert(localSessions.map(s => ({
                    id: s.id,
                    book_id: s.bookId,
                    start_date: s.startDate, // ISO string 'YYYY-MM-DD' works
                    end_date: s.endDate,
                    active: s.active
                })), { onConflict: 'id' });
                if (error) throw error;
            }

            // 4. LOGS
            const localLogs = dedupe(JSON.parse(localStorage.getItem('bc_logs_v2') || '[]'));
            if (localLogs.length > 0) {
                log(`Migrating ${localLogs.length} Unique Logs...`);
                // Batch insert can be limited, but for <1000 rows it's fine
                const { error } = await supabase.from('logs').upsert(localLogs.map(l => ({
                    id: String(l.id),
                    member_id: String(l.memberId),
                    session_id: String(l.sessionId),
                    date: l.date,
                    pages_read: Number(l.pages || l.pagesRead || 0),
                    notes: l.notes,
                    minutes_read: Number(l.minutesRead || 0)
                })), { onConflict: 'id' });
                if (error) throw error;
            }

            // 5. QUOTES
            const localQuotes = dedupe(JSON.parse(localStorage.getItem('bc_quotes_v1') || '[]'));
            if (localQuotes.length > 0) {
                log(`Migrating ${localQuotes.length} Unique Quotes...`);
                const { error } = await supabase.from('quotes').upsert(localQuotes.map(q => ({
                    id: String(q.id),
                    text: q.text,
                    member_id: String(q.memberId),
                    book_id: q.bookId,
                    page_num: Number(q.page || 0),
                    likes: Number(q.likes || 0)
                })), { onConflict: 'id' });
                if (error) throw error;
            }

            // 6. DISCUSSION
            const localDiscuss = dedupe(JSON.parse(localStorage.getItem('bc_discussion_v1') || '[]'));
            if (localDiscuss.length > 0) {
                log(`Migrating ${localDiscuss.length} Unique Points...`);
                const { error } = await supabase.from('discussion_points').upsert(localDiscuss.map(d => ({
                    id: String(d.id),
                    topic: d.prompt || d.topic, // handle variations
                    member_id: String(d.memberId),
                    session_id: d.sessionId,
                    upvotes: Number(d.votes || d.upvotes || 0)
                })), { onConflict: 'id' });
                if (error) throw error;
            }

            log("Migration Complete! ✅");
            setStatus('SUCCESS');

        } catch (err) {
            console.error("Migration Error:", err);
            log(`ERROR: ${err.message}`);
            setStatus('ERROR');
        }
    };

    return (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 text-white mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-indigo-400">
                <CloudUpload /> Cloud Migration Tool
            </h3>

            <p className="text-slate-400 text-sm mb-6">
                Push your local browser data (members, logs, books) to the shared Supabase cloud database.
                Run this once to sync your workspace with the team.
            </p>

            <button
                onClick={runMigration}
                disabled={status === 'MIGRATING'}
                className="btn-antigravity text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-50"
            >
                {status === 'MIGRATING' ? <Loader className="animate-spin" /> : <CloudUpload />}
                {status === 'MIGRATING' ? 'Uploading Data...' : 'Sync Local Data to Cloud'}
            </button>

            {/* Debug Info */}
            <div className="mt-4 p-2 text-[10px] text-slate-500 font-mono border-t border-slate-800">
                <p>Debug Config:</p>
                <p>URL: {import.meta.env.VITE_SUPABASE_URL ? import.meta.env.VITE_SUPABASE_URL : 'UNDEFINED'}</p>
                <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present (Starts with ' + import.meta.env.VITE_SUPABASE_ANON_KEY.slice(0, 5) + '...)' : 'UNDEFINED'}</p>
                <button
                    onClick={async () => {
                        log("Testing Connection...");
                        try {
                            const { count, error } = await supabase.from('members').select('*', { count: 'exact', head: true });
                            if (error) throw error;
                            log(`Connection OK! Found ${count !== null ? count : '0'} members in DB.`);
                            alert("Connection Success! You can Sync now.");
                        } catch (e) {
                            log(`Connection Failed: ${e.message}`);
                            if (e.message.includes("fetch")) {
                                log("Hint: Check ad-blockers or firewall.");
                            }
                            if (e.message.includes("relation")) {
                                log("Hint: Did you run the SQL script? Tables are missing.");
                            }
                        }
                    }}
                    className="mt-2 text-blue-400 hover:text-blue-300 underline"
                >
                    [Test Connectivity]
                </button>
            </div>

            {/* Logs Area */}
            {logs.length > 0 && (
                <div className="mt-6 p-4 bg-black/40 rounded font-mono text-xs text-green-400 max-h-40 overflow-y-auto space-y-1">
                    {logs.map((L, i) => (
                        <div key={i}>{L}</div>
                    ))}
                </div>
            )}

            {status === 'SUCCESS' && (
                <div className="mt-4 p-4 bg-emerald-500/20 text-emerald-300 rounded flex items-center gap-2">
                    <CheckCircle /> Sync Successful! Your data is now in the cloud.
                </div>
            )}
            {status === 'ERROR' && (
                <div className="mt-4 p-4 bg-red-500/20 text-red-300 rounded flex items-center gap-2">
                    <AlertCircle /> Sync Failed. Check the logs above.
                </div>
            )}
        </div>
    );
};
