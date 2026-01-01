import { useState } from 'react';
import { useBookClub } from '../context/BookClubContext';
import { Card, Badge, ProgressBar } from '../components/ui';
import { TrendingUp, Clock, BookOpen, CheckCircle, Trophy, MessageSquare, ChevronUp } from 'lucide-react';
import { getElapsedDays, getSessionDuration, calculateMemberMetrics } from '../utils/engine';
import MountainProgress from '../components/MountainProgress';

const StatCard = ({ title, value, sub, icon, trend, variant = 'default' }) => {
    const Icon = icon;

    // Dark/Glass Mode Icon Colors
    const iconColors = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        default: "text-glass-300 bg-white/5 border-white/10"
    };

    return (
        <div className={`glass-card p-6 relative group overflow-hidden transition-all duration-300 ${variant === 'blue' ? 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30' :
            variant === 'violet' ? 'bg-violet-500/20 hover:bg-violet-500/30 border-violet-500/30' :
                variant === 'emerald' ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30' :
                    variant === 'amber' ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30' :
                        'bg-white/5 hover:bg-white/10 border-white/10'
            }`}>
            {/* Hover Glow Effect */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100 duration-500 pointer-events-none ${variant === 'blue' ? 'bg-blue-500/30' :
                variant === 'violet' ? 'bg-violet-500/30' :
                    variant === 'emerald' ? 'bg-emerald-500/30' :
                        variant === 'amber' ? 'bg-amber-500/30' :
                            'bg-brand-primary/20'
                }`}></div>

            <div className={`p-3 rounded-xl border backdrop-blur-md transition-colors ${iconColors[variant] || iconColors.default}`}>
                <Icon size={24} className="text-current" />
            </div>
            {trend && (
                <Badge variant={trend === 'positive' ? 'success' : 'danger'} className="shadow-none border border-white/10 backdrop-blur-md bg-opacity-40">
                    {trend === 'positive' ? 'On Track' : 'Attention'}
                </Badge>
            )}

            <div className="relative z-10">
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${variant === 'blue' ? 'text-blue-200' :
                    variant === 'violet' ? 'text-violet-200' :
                        variant === 'emerald' ? 'text-emerald-200' :
                            variant === 'amber' ? 'text-amber-200' :
                                'text-glass-300'
                    }`}>{title}</p>
                <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">{value}</h3>
                <p className="text-xs text-white/80 mt-2 font-medium">{sub}</p>
            </div>
        </div >
    );
};

const LeaderboardRow = ({ rank, member }) => {
    const { stats } = member;
    if (!stats) return null;

    return (
        <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-glass-border hover:bg-white/5 transition-colors last:border-0">
            <div className="col-span-1 flex items-center justify-center">
                {rank === 1 ? (
                    <div className="w-8 h-8 bg-brand-yellow text-brand-base rounded-full flex items-center justify-center border border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]">
                        <Trophy size={16} />
                    </div>
                ) : (
                    <span className="text-white/60 font-bold text-lg">#{rank}</span>
                )}
            </div>

            <div className="col-span-3">
                <p className="font-bold text-white">{member.name}</p>
                <p className="text-xs text-glass-300">{stats.status}</p>
            </div>

            <div className="col-span-3">
                <div className="text-xs flex justify-between mb-1">
                    <span className="text-glass-300">Completion</span>
                    <span className="font-medium text-white">{Math.round(stats.completionPct)}%</span>
                </div>
                {/* Need to ensure ProgressBar supports dark mode or pass explicit colors if it uses defaults */}
                <ProgressBar value={stats.completionPct} variant={stats.status === 'RED_ZONE' ? 'danger' : 'brand'} />
            </div>

            <div className="col-span-2 text-center">
                <div className="text-2xl font-bold text-white">{stats.score}</div>
                <p className="text-xs text-glass-300">Score</p>
            </div>

            <div className="col-span-3 flex justify-end">
                {stats.status === 'COMPLETED' ? (
                    <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Completed</Badge>
                ) : stats.status === 'RED_ZONE' ? (
                    <Badge variant="danger" className="bg-red-500/20 text-red-300 border-red-500/30">Missed Target</Badge>
                ) : stats.status === 'BEHIND' ? (
                    <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/30">Behind</Badge>
                ) : (
                    <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">On Track</Badge>
                )}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { activeSession, activeBook, leaderboard, members, sessions, books, logs, discussionPoints, addDiscussionPoint, voteDiscussionPoint } = useBookClub();
    const [showDiscussionModal, setShowDiscussionModal] = useState(false);
    const [newDiscussionPoint, setNewDiscussionPoint] = useState({ text: '', memberId: members[0]?.id || '' });

    const handleDiscussionSubmit = (e) => {
        e.preventDefault();
        if (newDiscussionPoint.text && newDiscussionPoint.memberId) {
            addDiscussionPoint({
                text: newDiscussionPoint.text,
                sessionId: activeSession?.id,
                memberId: newDiscussionPoint.memberId
            });
            setShowDiscussionModal(false);
            setNewDiscussionPoint({ ...newDiscussionPoint, text: '' });
        }
    };


    if (!activeSession || !activeBook) return (
        <div className="p-8 text-center text-glass-400">
            <h2 className="text-2xl font-bold text-white mb-2">System Offline</h2>
            <p>No active session found. Please check Admin settings.</p>
        </div>
    );

    const duration = getSessionDuration(activeSession);
    const elapsed = getElapsedDays(activeSession);
    const daysLeft = Math.max(0, duration - elapsed);

    const activeMembers = members?.filter(m => m.active).length || 0;

    // Handle empty leaderboard stats safely
    const onTrackCount = (leaderboard || []).filter(m => m.stats?.status === 'ON_TRACK' || m.stats?.status === 'COMPLETED').length;
    const behindCount = Math.max(0, activeMembers - onTrackCount); // Ensure no negative

    const avgCompletion = activeMembers > 0
        ? Math.round((leaderboard || []).reduce((acc, m) => acc + (m.stats?.completionPct || 0), 0) / activeMembers)
        : 0;

    const totalPages = (leaderboard || []).reduce((acc, m) => acc + (m.stats?.pagesRead || 0), 0);

    // Calculate Yearly Stats (All Sessions)
    const yearlyStats = (members || []).flatMap(m =>
        (sessions || []).map(s => {
            const b = books?.find(bk => bk.id === s.bookId);
            // Safety: calculateMemberMetrics already hardened, but b might be undefined
            return b ? calculateMemberMetrics(m, s, b, logs) : null;
        })
    ).filter(Boolean);

    const yearTotalPages = yearlyStats.reduce((acc, m) => acc + (m?.pagesRead || 0), 0);
    const yearTotalGoal = yearlyStats.reduce((acc, m) => acc + (m?.totalPages || 0), 0);
    const yearProgress = yearTotalGoal > 0 ? Math.round((yearTotalPages / yearTotalGoal) * 100) : 0;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-glass-border pb-8">
                <div className="flex gap-6 items-end">
                    {/* Book Cover */}
                    <div className="w-32 h-48 flex-shrink-0 rounded-xl shadow-2xl shadow-black/50 overflow-hidden border border-white/10 relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        {activeBook.coverUrl ? (
                            <img
                                src={activeBook.coverUrl}
                                alt={activeBook.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none'; // Hide broken img
                                    e.target.nextSibling.style.display = 'flex'; // Show fallback
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-surface text-glass-400">
                                <BookOpen size={40} />
                            </div>
                        )}
                        {/* Fallback hidden by default, shown on error if we had a coverUrl that failed */}
                        <div className="hidden w-full h-full absolute inset-0 flex items-center justify-center bg-brand-surface text-glass-400">
                            <BookOpen size={40} />
                        </div>
                    </div>

                    <div className="mb-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary/20 text-brand-accent text-xs font-bold border border-brand-primary/30 mb-3 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-brand-accent mr-2 animate-pulse"></span>
                            Active Strategic Sprint
                        </div>
                        <h1 className="text-5xl font-black text-white mb-2 leading-tight tracking-tight drop-shadow-md">{activeBook.title}</h1>
                        <p className="text-glass-300 flex items-center gap-2 text-lg font-medium">
                            By {activeBook.author} • <span className="text-brand-yellow font-bold">{activeBook.category}</span>
                        </p>
                    </div>
                </div>

                <div className="glass-panel p-5 flex items-center gap-8 text-right bg-black/40 backdrop-blur-md border-glass-border/50">
                    <div>
                        <p className="text-[10px] text-glass-300 uppercase tracking-widest font-bold mb-1">Schedule</p>
                        <p className="text-base text-white font-mono flex items-center gap-2 font-bold">
                            <span>{new Date(activeSession.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            <span className="text-glass-300">→</span>
                            <span>{new Date(activeSession.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </p>
                    </div>
                    <div className="border-l border-glass-border pl-8">
                        <p className="text-[10px] text-glass-300 uppercase tracking-widest font-bold mb-1">Daily Target</p>
                        <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-3xl font-black text-brand-primary drop-shadow">{Math.ceil(activeBook.pages / duration)}</span>
                            <span className="text-sm text-white/80 font-medium">pgs/day</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ALERTS SECTION */}
            {(avgCompletion < ((elapsed / duration) * 100) || behindCount > 0) && (
                <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-sm rounded-xl p-4 flex items-start gap-4">
                    <div className="bg-red-500/20 p-2 rounded-lg text-red-400 mt-1">
                        <TrendingUp size={20} className="transform rotate-180" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-100 text-lg">Performance Warning</h3>
                        <div className="space-y-1 mt-1 text-sm text-red-300">
                            {avgCompletion < ((elapsed / duration) * 100) && (
                                <p>• The club is currently <span className="font-bold text-white">behind schedule</span> on {activeBook.title}. Increase output immediately.</p>
                            )}
                            {behindCount > 0 && (
                                <p>• <span className="font-bold text-white">{behindCount} Member(s)</span> are lagging behind target pace. Support required.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MOUNTAIN PROGRESS GRAPH */}
            <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">The Climb</h3>
                        <p className="text-sm text-glass-400">Club progress visualization</p>
                    </div>
                </div>
                <div className="min-h-[350px] w-full">
                    {/* Passing correct props to the graph */}
                    <MountainProgress books={books} activeBookId={activeBook?.id} />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Time Remaining"
                    value={`${daysLeft} Days`}
                    sub={`Day ${elapsed} of ${duration}`}
                    icon={Clock}
                    variant="blue"
                />
                <StatCard
                    title="Avg Completion"
                    value={`${avgCompletion}%`}
                    sub="Across all members"
                    icon={TrendingUp}
                    variant="violet"
                />
                <StatCard
                    title="On Track"
                    value={`${onTrackCount} / ${activeMembers}`}
                    sub="Members meeting pace"
                    icon={CheckCircle}
                    trend={behindCount > 0 ? 'negative' : 'positive'}
                    variant="emerald"
                />
                <StatCard
                    title="Total Production"
                    value={totalPages.toLocaleString()}
                    sub="Pages read this sprint"
                    icon={BookOpen}
                    variant="amber"
                />
            </div>

            {/* Progress Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Book Progress (Club Velocity) */}
                <div className="glass-card p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">Current Sprint Velocity</h3>
                            <p className="text-sm text-glass-400 mt-1">Average completion for {activeBook.title}</p>
                        </div>
                        <span className="text-4xl font-black text-brand-primary drop-shadow-lg">{avgCompletion}%</span>
                    </div>
                    <div className="relative pt-1">
                        <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-white/10 outline outline-1 outline-white/5">
                            <div
                                style={{ width: `${avgCompletion}%` }}
                                className={`shadow-[0_0_15px_rgba(0,0,0,0.3)] flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${avgCompletion >= ((elapsed / duration) * 100) ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'
                                    }`}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs font-mono text-glass-400 font-medium">
                            <span>0%</span>
                            <div className="text-center">
                                <span className={avgCompletion >= ((elapsed / duration) * 100) ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                    {avgCompletion >= ((elapsed / duration) * 100) ? 'Ahead of Pace' : 'Behind Pace'}
                                </span>
                                <span className="hidden md:inline ml-2 text-glass-400"> (Exp: {Math.round((elapsed / duration) * 100)}%)</span>
                            </div>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                {/* Yearly Progress */}
                <div className="glass-card p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">2026 Season Progress</h3>
                            <p className="text-sm text-glass-400 mt-1">Aggregate completion across all books</p>
                        </div>
                        <span className="text-4xl font-black text-brand-secondary drop-shadow-lg">{yearProgress}%</span>
                    </div>
                    <div className="relative pt-1">
                        <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-white/10 outline outline-1 outline-white/5">
                            <div style={{ width: `${yearProgress}%` }} className="shadow-lg flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-brand-secondary to-blue-400"></div>
                        </div>
                        <div className="flex justify-between text-xs font-mono text-glass-400 font-medium">
                            <span>Jan</span>
                            <span>Season Target</span>
                            <span>Dec</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Performance Leaderboard</h2>
                        <Badge variant="default" className="bg-white/10 text-glass-200 border-white/10">{activeSession.id} Rankings</Badge>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 p-4 bg-brand-primary/10 border-b border-glass-border text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md">
                            <div className="col-span-1 text-center">Rank</div>
                            <div className="col-span-3">Member</div>
                            <div className="col-span-3">Progress</div>
                            <div className="col-span-2 text-center">Score</div>
                            <div className="col-span-3 text-right">Status</div>
                        </div>

                        <div className="divide-y divide-glass-border">
                            {leaderboard.map((member, idx) => (
                                <LeaderboardRow
                                    key={member.id}
                                    member={member}
                                    rank={idx + 1}
                                    isSessionWinner={idx === 0}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Context */}
                <div className="space-y-6">
                    {/* Discussion Forge Widget */}


                    <div className="glass-card p-6 bg-gradient-to-br from-orange-500 to-orange-700 border-0 text-white shadow-[0_10px_40px_-10px_rgba(249,115,22,0.6)]">
                        <h3 className="text-lg font-bold mb-2">Current Leader</h3>
                        {leaderboard[0] && leaderboard[0].stats && leaderboard[0].stats.score > 0 ? (
                            <div className="mt-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl backdrop-blur-sm border border-white/30">
                                        1
                                    </div>
                                    <div>
                                        <p className="font-bold text-xl">{leaderboard[0].name}</p>
                                        <p className="text-white/80 text-sm">Score: {leaderboard[0].stats.score}</p>
                                    </div>
                                </div>
                                <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-full" style={{ width: `${leaderboard[0].stats.completionPct}%` }} />
                                </div>
                                <p className="mt-2 text-xs text-white/60">
                                    {leaderboard[0].stats.status === 'COMPLETED' ? 'Sprint Completed' : `Maintaining ${Math.round(leaderboard[0].stats.consistencyPct)}% consistency`}
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 text-white/60 text-sm">
                                <p>Race hasn't started yet.</p>
                                <p className="mt-2 text-xs opacity-75">Start logging pages to claim the throne.</p>
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold text-white mb-4">Sprint Rules</h3>
                        <ul className="space-y-3 text-sm text-glass-300">
                            <li className="flex justify-between border-b border-white/5 pb-2">
                                <span>Duration</span>
                                <span className="text-white font-medium">{duration} Days</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-2">
                                <span>Daily Target</span>
                                <span className="text-white font-medium">{Math.ceil(activeBook.pages / duration)} Pages</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Min Compliance</span>
                                <span className="text-brand-orange font-bold bg-orange-500/10 px-2 rounded border border-orange-500/20">75%</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* Discussion Add Modal */}
            {showDiscussionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-6">Start a Discussion</h3>
                        <form onSubmit={handleDiscussionSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-glass-300 mb-1">Topic / Question</label>
                                <textarea
                                    className="input-glass w-full min-h-[100px] text-base"
                                    placeholder="What's on your mind regarding the book?"
                                    value={newDiscussionPoint.text}
                                    onChange={e => setNewDiscussionPoint({ ...newDiscussionPoint, text: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-glass-300 mb-1">Posted By</label>
                                <select
                                    className="input-glass w-full"
                                    value={newDiscussionPoint.memberId}
                                    onChange={e => setNewDiscussionPoint({ ...newDiscussionPoint, memberId: e.target.value })}
                                    required
                                >
                                    {members.map(m => (
                                        <option key={m.id} value={m.id} className="bg-slate-800">{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowDiscussionModal(false)}
                                    className="text-glass-300 hover:text-white font-bold px-4 py-2 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-brand-primary/20"
                                >
                                    Post Topic
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Dashboard;
