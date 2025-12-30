import { useParams, useNavigate } from 'react-router-dom';
import { useBookClub } from '../context/BookClubContext';
import { User, BookOpen, TrendingUp, Award, Calendar, Edit2, Users, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Card, Badge, ProgressBar } from '../components/ui';
import { calculateDynamicDailyTarget, getConsistencyHistory } from '../utils/analytics';
import { calculateAchievements } from '../utils/engine';
import { MemberJourney } from '../components/MemberJourney';
import { ConsistencyChart } from '../components/ConsistencyChart';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';

const MemberDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useBookClub();

    // 1. Safety Check: Context
    if (!context) return <div className="p-8 text-slate-500">Loading System...</div>;

    const { members = [], logs = [], sessions = [], books = [], activeSession, activeBook, courses = [], resetData, deleteLog } = context;

    // 2. Safety Check: Empty Data
    if (members.length === 0) {
        return (
            <div className="p-8 text-slate-900 bg-white rounded-xl border border-slate-200 max-w-2xl mx-auto mt-10 shadow-sm">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-red-500">
                    <AlertCircle /> Member Data Missing
                </h3>
                <p className="mb-4 text-slate-500">
                    The database appears to be empty.
                </p>
                <button
                    onClick={() => {
                        if (confirm("Load 2026 Plan Data now?")) {
                            resetData();
                            setTimeout(() => window.location.reload(), 500);
                        }
                    }}
                    className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition w-full md:w-auto"
                >
                    INITIALIZE 2026 DATA
                </button>
            </div>
        );
    }

    // Fallback for "Me" view or specific ID
    const memberId = id || members[0]?.id;
    const member = members.find(m => m.id === memberId);

    if (!member) return (
        <div className="p-8 text-center text-slate-400">
            <h2 className="text-2xl text-slate-900 font-bold mb-2">Member Not Found</h2>
            <p>Could not locate member ID: {memberId}</p>
            <button onClick={() => navigate('/members')} className="mt-4 text-primary hover:underline">Return to Member List</button>
        </div>
    );

    // --- DERIVE METRICS ---
    const memberLogs = logs.filter(l => l.memberId === memberId);
    const memberCourses = courses.filter(c => c.memberId === memberId);

    // 1. Dynamic Daily Target
    const dailyTarget = calculateDynamicDailyTarget(member, activeSession, activeBook, logs);

    // 1b. Static Target & Duration
    let staticTarget = 0;
    let duration = 0;
    if (activeSession && activeBook) {
        const start = parseISO(activeSession.startDate);
        const end = parseISO(activeSession.endDate);
        duration = differenceInCalendarDays(end, start) + 1;
        staticTarget = Math.ceil(activeBook.pages / duration);
    }

    // 2. Consistency History
    const consistencyHistory = activeSession ? getConsistencyHistory(member, activeSession, logs) : [];

    // 3. Stats per session (Portfolio)
    const history = (sessions || []).map(session => {
        const book = books.find(b => b.id === session.bookId);
        if (!book) return null;

        const sessionLogs = memberLogs.filter(l => l.sessionId === session.id);
        const pagesRead = sessionLogs.reduce((acc, l) => acc + l.pages, 0);
        const completion = Math.min(100, Math.round((pagesRead / book.pages) * 100));

        // Simulating a score for history
        const score = completion > 90 ? 9.5 : (completion / 10);

        return {
            session,
            book,
            pagesRead,
            completion,
            score,
            status: completion >= 100 ? 'COMPLETED' : 'IN_PROGRESS'
        };
    }).filter(Boolean).filter(h => h.completion > 0);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12">
            {/* Header Profile */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 glass-card border-0">
                <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center text-3xl font-bold text-white border-4 border-white/10 shrink-0 shadow-inner">
                    {member.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white mb-2">{member.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <Badge variant={member.active ? 'success' : 'secondary'} className="backdrop-blur-md">{member.role}</Badge>
                        <span className="text-glass-200 flex items-center gap-2 font-medium">
                            <BookOpen size={16} /> {history.length} Books Read
                        </span>
                    </div>
                </div>
                <div className="text-center md:text-right">
                    <p className="text-sm text-glass-300 font-bold uppercase tracking-wider mb-1">Total Pages Read</p>
                    <p className="text-4xl font-mono font-black text-brand-primary drop-shadow-md">
                        {memberLogs.reduce((acc, l) => acc + l.pages, 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Member Guide - Replaced/Enhanced by Member Journey */}
            <div className="mb-8">
                <MemberJourney
                    member={member}
                    activeSession={activeSession}
                    logs={logs}
                    discussionPoints={context.discussionPoints || []}
                    quotes={context.quotes || []}
                />
            </div>

            {/* Legacy Guide (Collapsed by default) */}
            <div className="glass-panel rounded-xl overflow-hidden mb-8 border border-white/10">
                <details className="group">
                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-4 text-white/90 hover:text-white bg-white/5 hover:bg-white/10 transition">
                        <span className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-brand-primary" /> Member Guide: How to Participate
                        </span>
                        <span className="transition group-open:rotate-180 text-glass-400">
                            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                        </span>
                    </summary>
                    <div className="text-glass-200 p-6 pt-0 border-t border-white/10 bg-black/20">
                        <ol className="list-decimal list-inside space-y-2 mt-4 ml-2">
                            <li><strong>Setup:</strong> Ensure your profile is active in the Members list.</li>
                            <li><strong>Daily Log:</strong> Visit the <span className="text-brand-primary font-bold">Log Page</span> daily. Select your name and the date.</li>
                            <li><strong>Edit Logs:</strong> Mistakes happen! You can edit past entries by simply selecting the same Date in the Log form.</li>
                            <li><strong>Bulk Upload:</strong> Add your past reads to the "Archives" via the Library page (copy-paste from Excel supported).</li>
                            <li><strong>Consistency:</strong> Try to hit your "Dynamic Daily Target" to keep your streak alive!</li>
                        </ol>
                    </div>
                </details>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Stats & Pace */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Today's Target Card */}
                    {activeSession ? (
                        <Card className="bg-gradient-to-br from-indigo-600 to-blue-600 border-0 p-8 relative overflow-hidden text-white shadow-lg shadow-blue-500/20">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Calendar size={180} className="text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium text-white/90 mb-1">Today's Dynamic Target</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-black text-white">{dailyTarget}</span>
                                            <span className="text-white/80 font-medium">pages</span>
                                        </div>
                                        <p className="text-white/90 mt-4 max-w-md font-medium leading-relaxed">
                                            To finish <span className="text-white font-bold underline decoration-2 decoration-white/30 underline-offset-4">{activeBook?.title}</span> by {activeSession?.endDate}, you need to read {dailyTarget} pages today.
                                        </p>
                                    </div>
                                    <div className="hidden md:block text-right space-y-3 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md">
                                        <div>
                                            <p className="text-xs text-white/70 uppercase tracking-wider font-bold">Book Duration</p>
                                            <p className="text-2xl font-black text-white">{duration} Days</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/70 uppercase tracking-wider font-bold">Original Goal</p>
                                            <p className="text-2xl font-black text-white">{staticTarget} pg/day</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="glass-card p-6 flex items-center justify-center text-glass-400">
                            <span>No Active Strategic Session</span>
                        </Card>
                    )}

                    {/* Consistency Chart */}
                    {activeSession && (
                        <Card className="glass-card p-6">
                            <h4 className="text-white/80 font-bold mb-4">Consistency Streak</h4>
                            <ConsistencyChart history={consistencyHistory} />
                        </Card>
                    )}

                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-8">
                        <Award className="text-brand-primary" /> Portfolio & History
                    </h3>
                    <div className="space-y-4">
                        {history.length > 0 ? history.map((h, idx) => (
                            <div key={idx} className="p-4 glass-panel hover:bg-white/10 transition-all flex gap-5 items-center border border-white/5">
                                <div className="w-12 h-16 bg-white/10 rounded flex items-center justify-center text-xs text-glass-300 text-center p-1 shrink-0 font-bold border border-white/10">
                                    {h.book.title.substring(0, 10)}...
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="font-bold text-white truncate">{h.book.title}</h4>
                                        <span className={`text-sm font-bold ${h.completion >= 100 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                            {h.completion}%
                                        </span>
                                    </div>
                                    <ProgressBar progress={h.completion} className="h-2.5" />
                                    <div className="flex justify-between mt-2 text-xs text-glass-300 font-medium">
                                        <span>{h.pagesRead} / {h.book.pages} pages</span>
                                        <span>Score: {h.score.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-glass-400 italic p-4 bg-white/5 rounded-lg border border-white/10">No history yet.</p>
                        )}
                    </div>


                    {/* Courses Section */}
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                            <Award className="text-brand-primary" /> Academy Courses
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {memberCourses.length > 0 ? memberCourses.map(course => (
                                <div key={course.id} className="glass-panel p-5 flex flex-col justify-between hover:bg-white/10 transition-colors border border-white/5">
                                    <div>
                                        <h4 className="font-bold text-white text-sm mb-1 line-clamp-2">{course.title}</h4>
                                        <p className="text-xs text-brand-primary font-bold mb-3">{course.platform}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                                        <Badge variant={course.status === 'COMPLETED' ? 'success' : 'warning'} className="text-xs">
                                            {course.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                                        </Badge>
                                        <span className="text-xs text-glass-400 font-medium">{course.duration}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-glass-400 italic p-4 bg-white/5 rounded-lg col-span-2 border border-white/10">No courses enrolled yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Col: Quick Actions */}
                <div className="space-y-6">
                    <Card className="glass-card p-6">
                        <h4 className="text-lg font-bold text-white mb-4">Quick Actions</h4>
                        <button
                            onClick={() => navigate('/log')}
                            className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition mb-3 flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] border border-white/10"
                        >
                            <Edit2 size={18} /> Log Reading
                        </button>
                        <button
                            onClick={() => navigate('/peer-review')}
                            className="w-full py-4 glass-panel text-white hover:bg-white/10 transition rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10"
                        >
                            <Users size={18} /> Peer Review
                        </button>
                    </Card>

                    <Card className="glass-card p-6">
                        <h4 className="text-lg font-bold text-white mb-4">Badges Earned</h4>
                        <div className="flex flex-wrap gap-2">
                            {calculateAchievements(member, logs, history).length > 0 ? (
                                calculateAchievements(member, logs, history).map(badge => (
                                    <Badge key={badge.id} variant={badge.variant} className="flex items-center gap-1" title={badge.description}>
                                        {badge.label}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-glass-400 text-sm italic">Read more to unlock badges!</p>
                            )}
                        </div>
                    </Card>

                    {/* Recent Activity Log Management */}
                    <Card className="glass-card p-6">
                        <h4 className="text-lg font-bold text-white mb-4">Recent Activity</h4>
                        <div className="space-y-3">
                            {memberLogs.length > 0 ? (
                                memberLogs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(log => (
                                    <div key={log.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center group">
                                        <div>
                                            <p className="text-white font-bold text-sm">{format(parseISO(log.date), 'MMM d, yyyy')}</p>
                                            <p className="text-glass-400 text-xs">
                                                {log.pagesRead > 0 ? `${log.pagesRead} pages` : 'Missed'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                title="Edit"
                                                onClick={() => navigate('/log', { state: { memberId: member.id, date: log.date } })}
                                                className="p-1.5 rounded-md hover:bg-white/10 text-brand-primary transition"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                title="Delete"
                                                onClick={() => {
                                                    if (confirm("Delete this log entry?")) {
                                                        deleteLog(log.id);
                                                    }
                                                }}
                                                className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-glass-400 text-sm italic">No logs recorded yet.</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/log')}
                            className="w-full mt-4 py-2 text-sm font-bold text-brand-primary hover:text-white border border-brand-primary/30 hover:bg-brand-primary/20 rounded-lg transition"
                        >
                            + Add New Entry
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
