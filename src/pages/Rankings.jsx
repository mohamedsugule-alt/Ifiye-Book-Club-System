import { useState } from 'react';
import { useBookClub } from '../context/BookClubContext';
import { calculateAggregateStats } from '../utils/analytics';
import { Card, Badge, ProgressBar } from '../components/ui';
import { Trophy, Star, Award, Crown, BookOpen } from 'lucide-react';

const TopCard = ({ title, icon, winner, label, value, subLabel, color }) => {
    const Icon = icon;
    return (
        <div className={`p-6 rounded-2xl shadow-xl relative overflow-hidden text-white ${color}`}>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                        <Icon size={32} className="text-white" />
                    </div>
                    <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-md shadow-none font-bold">{title}</Badge>
                </div>

                {winner && value > 0 ? (
                    <div>
                        <p className="text-white/90 text-sm font-bold uppercase tracking-widest mb-1">{label}</p>
                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">{winner.name}</h3>
                        <div className="flex items-baseline gap-2 text-white">
                            <span className="text-4xl font-mono font-black drop-shadow-md">{value}</span>
                            <span className="text-sm opacity-90 font-bold">{subLabel}</span>
                        </div>
                    </div>
                ) : (
                    <div className="h-24 flex items-center text-white/60 font-bold text-lg">
                        No Data Available
                    </div>
                )}
            </div>
            {/* Background Decoration */}
            <Icon size={180} className="absolute -bottom-8 -right-8 text-white opacity-20 rotate-12 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

    );
};

const UsersIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const Rankings = () => {
    const context = useBookClub();
    const { members = [], sessions = [], books = [], logs = [], peerReviews = [] } = context || {};

    const [view, setView] = useState('CURRENT'); // CURRENT, ALL_TIME

    // FAIL-SAFE:
    if (!context || !members || !sessions || !books) {
        return <div className="p-10 text-glass-400 text-center">Loading Hall of Fame...</div>;
    }

    // 1. Current Session Data
    const { leaderboard = [] } = context || {};

    // 2. All Time Data
    // Ensure allTimeStats is robust
    const allTimeStats = (members || []).map(m => calculateAggregateStats(m, sessions, books, logs, peerReviews) || {
        memberId: m.id, name: m.name, totalPages: 0, avgScore: 0, totalScore: 0, avgPeerRating: 0, sessionsCount: 0
    });

    const sortedByAvgScore = [...allTimeStats].sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));
    const sortedByPages = [...allTimeStats].sort((a, b) => (b.totalPages || 0) - (a.totalPages || 0));
    const sortedByPeer = [...allTimeStats].sort((a, b) => (b.avgPeerRating || 0) - (a.avgPeerRating || 0));

    // Helpers to get safe winners
    const getWinner = (list, sortFn) => {
        if (!list || list.length === 0) return null;
        const sorted = [...list].sort(sortFn);
        return sorted[0];
    };

    const sessionReaderMVP = getWinner(leaderboard, (a, b) => (b.stats?.pagesRead || 0) - (a.stats?.pagesRead || 0));
    const sessionPeerMVP = getWinner(leaderboard, (a, b) => (b.stats?.peerScoreRaw || 0) - (a.stats?.peerScoreRaw || 0));
    const sessionLeader = leaderboard.length > 0 ? leaderboard[0] : null;

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Hall of Fame</h2>
                    <p className="text-glass-400">Celebrating excellence and consistency.</p>
                </div>
                <div className="flex glass-panel p-1 rounded-xl">
                    <button
                        onClick={() => setView('CURRENT')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'CURRENT' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-glass-400 hover:text-white'}`}
                    >
                        Current Session
                    </button>
                    <button
                        onClick={() => setView('ALL_TIME')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'ALL_TIME' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-glass-400 hover:text-white'}`}
                    >
                        All Time Legends
                    </button>
                </div>
            </div>

            {view === 'CURRENT' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TopCard
                            title="Session MVP"
                            icon={Crown}
                            winner={sessionLeader}
                            label="Current Leader"
                            value={sessionLeader?.stats?.score}
                            subLabel="Points"
                            color="bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400/30"
                        />
                        <TopCard
                            title="Page Turner"
                            icon={BookOpen}
                            winner={sessionReaderMVP}
                            label="Most Pages Read"
                            value={sessionReaderMVP?.stats?.pagesRead}
                            subLabel="Pages"
                            color="bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400/30"
                        />
                        <TopCard
                            title="Peer Favorite"
                            icon={UsersIcon}
                            winner={sessionPeerMVP}
                            label="Highest Rated"
                            value={sessionPeerMVP?.stats?.peerScoreRaw?.toFixed(1)}
                            subLabel="/ 5.0"
                            color="bg-gradient-to-br from-purple-500 to-pink-600 border border-purple-400/30"
                        />
                    </div>

                    <div className="glass-panel text-white">
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-white mb-6">Full Session Leaderboard</h3>
                            <div className="space-y-4">
                                {leaderboard.map((m, i) => (
                                    <div key={m.id || i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all">
                                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center font-black text-xl rounded-full ${i === 0 ? 'bg-brand-yellow text-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-white/10 text-glass-400'}`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white text-lg">{m.name}</h4>
                                            <div className="flex items-center gap-6 text-sm text-glass-400 mt-1">
                                                <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-blue-400" /> <span className="font-medium text-glass-200">{m.stats?.pagesRead || 0}</span> pages</span>
                                                <span className="flex items-center gap-1.5"><Star size={14} className="text-brand-yellow" /> Peer: <span className="font-medium text-glass-200">{(m.stats?.peerScoreRaw || 0).toFixed(1)}</span></span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-brand-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{m.stats?.score || 0}</div>
                                            <p className="text-[10px] uppercase text-glass-500 font-bold tracking-wider">Total Score</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {view === 'ALL_TIME' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <TopCard
                            title="The G.O.A.T."
                            icon={Trophy}
                            winner={sortedByAvgScore[0]}
                            label="Highest Avg Score"
                            value={sortedByAvgScore[0]?.avgScore}
                            subLabel="pts / session"
                            color="bg-gradient-to-br from-amber-500/80 to-orange-600/80 border border-amber-500/30"
                        />
                        <TopCard
                            title="Archive Master"
                            icon={BookOpen}
                            winner={sortedByPages[0]}
                            label="Total Pages Read"
                            value={sortedByPages[0]?.totalPages?.toLocaleString()}
                            subLabel="Pages"
                            color="bg-gradient-to-br from-cyan-500/80 to-blue-600/80 border border-cyan-500/30"
                        />
                        <TopCard
                            title="Community Hero"
                            icon={Star}
                            winner={sortedByPeer[0]}
                            label="Avg Peer Rating"
                            value={sortedByPeer[0]?.avgPeerRating}
                            subLabel="/ 5.0"
                            color="bg-gradient-to-br from-pink-500/80 to-rose-600/80 border border-pink-500/30"
                        />
                        <div className="glass-card p-6 border-dashed border-white/20 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/5 z-0" />
                            <Award size={48} className="text-glass-500 mb-4 relative z-10 group-hover:text-brand-primary transition-colors" />
                            <h3 className="text-lg font-bold text-white relative z-10">2026 Season</h3>
                            <p className="text-sm text-glass-400 mt-2 relative z-10">More awards unlocking at year end.</p>
                        </div>
                    </div>

                    <div className="glass-panel overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr className="text-xs font-bold text-glass-400 uppercase border-b border-white/10">
                                    <th className="p-5">Member</th>
                                    <th className="p-5 text-center">Sessions</th>
                                    <th className="p-5 text-right">Total Pages</th>
                                    <th className="p-5 text-right">Avg Peer</th>
                                    <th className="p-5 text-right">Total Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedByAvgScore.map(stat => (
                                    <tr key={stat.memberId} className="hover:bg-white/5 transition-colors">
                                        <td className="p-5 font-bold text-white">{stat.name}</td>
                                        <td className="p-5 text-center text-glass-400 font-medium">{stat.sessionsCount}</td>
                                        <td className="p-5 text-right font-mono text-glass-300 font-medium">{stat.totalPages?.toLocaleString()}</td>
                                        <td className="p-5 text-right font-mono text-brand-yellow font-bold">{stat.avgPeerRating}</td>
                                        <td className="p-5 text-right font-black text-white text-lg">{stat.totalScore}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rankings;
