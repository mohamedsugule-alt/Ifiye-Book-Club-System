import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

const Members = () => {
    const { members } = useUser();

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Member Directory</h2>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/10 text-white/90 text-sm uppercase tracking-wider">
                            <th className="p-4 font-bold">Name</th>
                            <th className="p-4 font-bold">Status</th>
                            <th className="p-4 font-bold text-right">Join Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(member => (
                            <tr key={member.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <Link to={`/members/${member.id}`} className="text-white font-bold hover:text-brand-primary transition-colors flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-xs font-bold text-glass-300 border border-white/10 group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all">
                                            {member.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        {member.name}
                                    </Link>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${member.active ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-white/5 text-glass-500 border-white/5'}`}>
                                        {member.active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </td>
                                <td className="p-4 text-glass-300 text-right font-medium">Jan 2026</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Members;
