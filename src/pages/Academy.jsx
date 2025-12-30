import { useState } from 'react';
import { useBookClub } from '../context/BookClubContext';
import { Book, CheckCircle, Clock, Plus, Award, Save, User, Trash2, Edit2 } from 'lucide-react';
import { Card, Badge } from '../components/ui';
import { triggerConfetti } from '../utils/confetti';

const Academy = () => {
    const context = useBookClub();

    // Hooks MUST be called unconditionally
    const [isAdding, setIsAdding] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        memberId: '',
        title: '',
        platform: '',
        duration: '', // e.g. "4 weeks" or "10 hours"
    });

    // Safety check for context AFTER hooks
    if (!context) return null;

    const { courses = [], addCourse, updateCourse, members = [] } = context;
    const activeMembers = members.filter(m => m?.active);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Check addCourse existence explicitly
        if (!addCourse || typeof addCourse !== 'function') {
            console.error("Context Error: addCourse action missing or invalid");
            alert("System Error: Cannot add course. Please reload.");
            return;
        }

        try {
            addCourse({
                ...formData,
                status: 'IN_PROGRESS',
                progress: 0,
                dateAdded: new Date().toISOString()
            });

            setSuccessMsg('Course Enrolled Successfully!');
            setTimeout(() => {
                setSuccessMsg('');
                setIsAdding(false);
                setFormData({ memberId: '', title: '', platform: '', duration: '' });
            }, 1500);
        } catch (error) {
            console.error("Enrollment Crash:", error);
            alert("Failed to enroll course. Please try again.");
        }
    };

    const handleComplete = (courseId) => {
        if (!updateCourse) return;
        if (confirm('Mark this course as fully completed? This will add points to your profile.')) {
            updateCourse(courseId, {
                status: 'COMPLETED',
                progress: 100,
                dateCompleted: new Date().toISOString()
            });
            triggerConfetti();
        }
    };

    const getMemberName = (id) => (members || []).find(m => m.id === id)?.name || 'Unknown';

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Knowledge Academy</h1>
                    <p className="text-glass-400">Enroll in external courses to boost your growth rating.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-antigravity flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold transition shadow-lg shadow-brand-primary/20"
                >
                    <Plus size={20} /> Enroll New Course
                </button>
            </div>

            {/* ADD COURSE FORM */}
            {isAdding && (
                <div className="glass-panel text-white p-6 animate-in slide-in-from-top-4 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-glass-300 mb-1 font-bold">Select Member</label>
                                <select
                                    className="input-glass w-full text-black"
                                    value={formData.memberId}
                                    onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                                    required
                                >
                                    <option value="" className="text-gray-500">Who is taking this course?</option>
                                    {activeMembers.map(m => (
                                        <option key={m.id} value={m.id} className="text-black">{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-glass-300 mb-1 font-bold">Course Title</label>
                                <input
                                    type="text"
                                    className="input-glass w-full"
                                    placeholder="e.g. Advanced Data Science"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-glass-300 mb-1 font-bold">Platform / Institute</label>
                                <input
                                    type="text"
                                    className="input-glass w-full"
                                    placeholder="e.g. Coursera, Udemy, MIT"
                                    value={formData.platform}
                                    onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-glass-300 mb-1 font-bold">Estimated Duration</label>
                                <input
                                    type="text"
                                    className="input-glass w-full"
                                    placeholder="e.g. 20 Hours"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-glass-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-6 py-2 rounded font-bold transition-all ${successMsg ? 'bg-emerald-600 text-white scale-105' : 'bg-brand-primary text-white hover:bg-orange-600'}`}
                            >
                                {successMsg ? (
                                    <span className="flex items-center gap-2"><Save size={18} /> {successMsg}</span>
                                ) : 'Start Course'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* COURSE LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(courses || []).length === 0 && (
                    <div className="col-span-full py-12 text-center text-glass-400 bg-white/5 rounded-xl border border-white/10 border-dashed">
                        No active courses found. Start learning today!
                    </div>
                )}

                {(courses || []).map(course => (
                    <div key={course.id} className="glass-card p-5 flex flex-col h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <Badge variant={course.status === 'COMPLETED' ? 'success' : 'warning'} className="backdrop-blur-md bg-opacity-20 border-opacity-20">
                                {course.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                            </Badge>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsAdding(true);
                                        setFormData(course);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="text-glass-500 hover:text-brand-primary transition opacity-0 group-hover:opacity-100"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (context.deleteCourse && confirm('Delete this enrollment?')) {
                                            context.deleteCourse(course.id);
                                        }
                                    }}
                                    className="text-glass-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <span className="text-xs text-glass-500 mb-1 block">{new Date(course.dateAdded).toLocaleDateString()}</span>

                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-brand-secondary mb-4 font-medium">{course.platform}</p>

                        <div className="mt-auto space-y-4">
                            <div className="text-sm text-glass-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-glass-500" /> {getMemberName(course.memberId)}
                            </div>
                            <div className="text-sm text-glass-300 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-glass-500" /> {course.duration}
                            </div>

                            {course.status !== 'COMPLETED' ? (
                                <button
                                    onClick={() => handleComplete(course.id)}
                                    className="w-full py-2 bg-white/5 hover:bg-emerald-500/20 text-emerald-400 border border-white/10 hover:border-emerald-500/30 rounded transition flex items-center justify-center gap-2 text-sm font-bold"
                                >
                                    <CheckCircle size={16} /> Mark Completed
                                </button>
                            ) : (
                                <div className="w-full py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded flex items-center justify-center gap-2 text-sm font-bold">
                                    <Award size={16} /> +50 Points Earned
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Academy;
