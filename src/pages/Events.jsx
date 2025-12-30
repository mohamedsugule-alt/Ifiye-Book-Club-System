import { useState } from 'react';
import { useBookClub } from '../context/BookClubContext';
import { Card, Badge } from '../components/ui';
import { Calendar, Clock, MapPin, User, PlusCircle, Book, Layers, Trash2, Edit2, CheckCircle, Wand2 } from 'lucide-react';
import { findBestDates } from '../utils/scheduler';
import { format } from 'date-fns';

const Events = () => {
    const context = useBookClub();

    // Hooks MUST be unconditional
    const [activeTab, setActiveTab] = useState('SCHEDULE'); // SCHEDULE | TOPICS

    // Schedule Form State
    const [formData, setFormData] = useState({
        topicId: '',
        memberId: '',
        date: '',
        time: '',
        location: '',
        type: 'ONLINE'
    });
    const [isSaved, setIsSaved] = useState(false);

    // Topic Form State
    const [topicData, setTopicData] = useState({
        topic: '',
        description: '',
        selectedBooks: []
    });
    const [isTopicSaved, setIsTopicSaved] = useState(false);

    // Scheduler State
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestedDates, setSuggestedDates] = useState([]);

    // Safety check AFTER hooks
    if (!context) {
        return <div className="p-10 text-glass-400 text-center">Loading Book Club Data...</div>;
    }

    const { syllabus = [], events = [], addEvent, deleteEvent, members = [], books = [], addSyllabusItem, deleteSyllabusItem, toggleAvailability, availability = [] } = context;

    // Fail-safe for empty data
    if (!events || !syllabus || !members || !books) {
        return <div className="p-10 text-glass-400 text-center">Initializing Book Club Data...</div>;
    }

    // --- ACTIONS ---
    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (formData.id) {
            // Assuming updateEvent exists in context
            // updateEvent(formData.id, payload);
            console.log("Update Event:", formData.id, payload); // Placeholder
        } else {
            addEvent(payload);
        }
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            if (!formData.id) setFormData({ topicId: '', memberId: '', date: '', time: '', location: '', type: 'ONLINE' });
        }, 2000);
    };

    const handleTopicSubmit = (e, nextAction = 'SAVE') => {
        e.preventDefault();

        let newTopicId = topicData.id;

        if (topicData.id) {
            // Assuming updateSyllabusItem exists in context
            // updateSyllabusItem(topicData.id, topicData);
            console.log("Update Syllabus Item:", topicData.id, topicData); // Placeholder
        } else {
            // Generates a temporary ID if we need to use it immediately, though addSyllabusItem usually does this.
            // Let's rely on addSyllabusItem returning the ID or us generating it here.
            newTopicId = `T${Date.now()}`;
            addSyllabusItem({ ...topicData, id: newTopicId });
        }

        setIsTopicSaved(true);
        setTimeout(() => setIsTopicSaved(false), 2000);

        if (nextAction === 'SCHEDULE') {
            setActiveTab('SCHEDULE');
            setFormData(prev => ({ ...prev, topicId: newTopicId }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setTopicData({ topic: '', description: '', selectedBooks: [] });
        }
    };

    const toggleBookSelection = (bookId) => {
        setTopicData(prev => {
            const exists = prev.selectedBooks.includes(bookId);
            return {
                ...prev,
                selectedBooks: exists
                    ? prev.selectedBooks.filter(id => id !== bookId)
                    : [...prev.selectedBooks, bookId]
            };
        });
    };

    // --- HELPERS ---
    const getTopicName = (id) => syllabus.find(s => s.id === id)?.topic || 'Unknown Topic';
    const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown Member';

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Revisited Books & Events</h1>
                    <p className="text-glass-400">Schedule sessions based on previous syllabus topics or create new ones.</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setActiveTab('SCHEDULE')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'SCHEDULE' ? 'bg-white/10 text-white shadow-sm' : 'text-glass-400 hover:text-white'}`}
                    >
                        Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('TOPICS')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'TOPICS' ? 'bg-white/10 text-white shadow-sm' : 'text-glass-400 hover:text-white'}`}
                    >
                        Topics & Books
                    </button>
                    <button
                        onClick={() => setActiveTab('AVAILABILITY')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'AVAILABILITY' ? 'bg-white/10 text-white shadow-sm' : 'text-glass-400 hover:text-white'}`}
                    >
                        Availability
                    </button>
                </div>
            </div>

            {activeTab === 'SCHEDULE' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* UPCOMING EVENTS */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Calendar className="text-brand-primary" /> Upcoming Sessions
                        </h2>
                        {events.length === 0 && <p className="text-glass-400">No events scheduled.</p>}
                        {events.map(event => (
                            <div key={event.id} className="glass-card p-6 rounded-xl flex gap-4 group relative hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-white/20 transition-all">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setFormData({ ...event });
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="text-glass-400 hover:text-brand-primary transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Cancel this event?')) deleteEvent(event.id);
                                        }}
                                        className="text-glass-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex-col items-center justify-center bg-white/10 p-3 rounded-lg w-20 text-center hidden sm:flex border border-white/10">
                                    <span className="text-xs text-glass-400 uppercase">{event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : '-'}</span>
                                    <span className="text-2xl font-bold text-white">{event.date ? new Date(event.date).getDate() : '?'}</span>
                                </div>
                                <div className="flex-1">
                                    <Badge variant="secondary" className="mb-2 bg-white/10 text-glass-300 border border-white/10">{event.type}</Badge>
                                    <h3 className="text-lg font-bold text-white mb-1">{getTopicName(event.topicId)}</h3>
                                    <div className="text-sm text-glass-400 space-y-1">
                                        <div className="flex items-center gap-2"><Clock size={14} className="text-glass-500" /> {event.time}</div>
                                        <div className="flex items-center gap-2"><MapPin size={14} className="text-glass-500" /> {event.location || 'Online Link'}</div>
                                        <div className="flex items-center gap-2 text-brand-primary font-medium"><User size={14} /> Presented by {getMemberName(event.memberId)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SCHEDULE FORM */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <PlusCircle className="text-brand-primary" /> Schedule New Session
                        </h2>
                        <div className="glass-panel p-6 shadow-xl space-y-6">
                            <form onSubmit={handleScheduleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-glass-300 mb-1">Select Topic</label>
                                    {formData.topicId ? (
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded p-2 text-emerald-400 font-bold flex items-center gap-2">
                                                <CheckCircle size={16} />
                                                {getTopicName(formData.topicId)}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, topicId: '' })}
                                                className="px-3 bg-white/5 text-glass-400 hover:text-white rounded border border-white/10 hover:bg-white/10"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    ) : (
                                        <select
                                            className="input-glass w-full text-white"
                                            value={formData.topicId}
                                            onChange={e => setFormData({ ...formData, topicId: e.target.value })}
                                            required
                                        >
                                            <option value="" className="text-black">-- Choose a Topic --</option>
                                            {syllabus.map(s => <option key={s.id} value={s.id} className="text-black">{s.topic}</option>)}
                                        </select>
                                    )}
                                </div>


                                <div>
                                    <label className="block text-sm font-bold text-glass-300 mb-1">Presenter (Member)</label>
                                    <select
                                        className="input-glass w-full text-white"
                                        value={formData.memberId}
                                        onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                                        required
                                    >
                                        <option value="" className="text-black">-- Choose Member --</option>
                                        {members.map(m => <option key={m.id} value={m.id} className="text-black">{m.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-glass-300 mb-1">Date</label>
                                        <input
                                            type="date"
                                            className="input-glass w-full text-white uppercase"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!showSuggestions) {
                                                    const best = findBestDates(availability, members);
                                                    setSuggestedDates(best);
                                                }
                                                setShowSuggestions(!showSuggestions);
                                            }}
                                            className="text-xs text-brand-primary hover:text-white mt-2 flex items-center gap-1 transition-colors"
                                        >
                                            <Wand2 size={12} /> Suggest Best Dates
                                        </button>

                                        {showSuggestions && (
                                            <div className="absolute z-50 mt-2 w-64 glass-panel p-2 shadow-xl border border-brand-primary/30 animate-in fade-in zoom-in-95 duration-200">
                                                <h5 className="text-xs font-bold text-white mb-2 px-2">Best Availability (Next 14 Days)</h5>
                                                <div className="space-y-1">
                                                    {suggestedDates.map((d, idx) => (
                                                        <button
                                                            key={d.dateStr}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, date: d.dateStr });
                                                                setShowSuggestions(false);
                                                            }}
                                                            className="w-full text-left p-2 rounded hover:bg-white/10 flex justify-between items-center group transition-colors"
                                                        >
                                                            <div>
                                                                <span className="block text-sm font-bold text-white">{format(d.date, 'MMM d, yyyy')}</span>
                                                                <span className="text-xs text-glass-400">{format(d.date, 'EEEE')}</span>
                                                            </div>
                                                            {d.conflictCount === 0 ? (
                                                                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">All Free</span>
                                                            ) : (
                                                                <span className="text-xs bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">{d.conflictCount} Busy</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-glass-300 mb-1">Time</label>
                                        <input
                                            type="time"
                                            className="input-glass w-full text-white"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-glass-300 mb-1">Location / Link</label>
                                        <input
                                            className="input-glass w-full text-white"
                                            placeholder="Zoom URL or Address"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-glass-300 mb-1">Type</label>
                                        <select
                                            className="input-glass w-full text-white"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="ONLINE" className="text-black">Online</option>
                                            <option value="IN_PERSON" className="text-black">In Person</option>
                                            <option value="HYBRID" className="text-black">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-3 rounded-lg font-bold transition-all ${isSaved ? 'bg-emerald-600 text-white' : 'btn-antigravity text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30'}`}
                                >
                                    {isSaved ? 'Session Scheduled!' : formData.id ? 'Update Session' : 'Schedule Session'}
                                </button>
                                {formData.id && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ topicId: '', memberId: '', date: '', time: '', location: '', type: 'ONLINE' })}
                                        className="w-full py-2 bg-white/5 text-glass-400 rounded hover:bg-white/10 text-sm font-medium border border-white/10"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'TOPICS' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* TOPIC LIST */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Layers className="text-brand-primary" /> Existing Syllabus Topics
                        </h2>
                        {syllabus.length === 0 && <p className="text-glass-400">No topics created.</p>}
                        {syllabus.map(s => (
                            <div key={s.id} className="glass-card p-6 rounded-xl relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-white/20 transition-all">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setActiveTab('SCHEDULE');
                                            setFormData(prev => ({ ...prev, topicId: s.id }));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        title="Schedule Session"
                                        className="text-glass-400 hover:text-emerald-400 transition-colors"
                                    >
                                        <Calendar size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setTopicData({ ...s, selectedBooks: s.books || [] });
                                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                        }}
                                        className="text-glass-400 hover:text-brand-primary transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this topic?')) deleteSyllabusItem(s.id);
                                        }}
                                        className="text-glass-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2">{s.topic}</h3>
                                <p className="text-sm text-glass-400 mb-4">{s.description || 'No description provided.'}</p>
                                <div className="space-y-2">
                                    {s.books ? (
                                        s.books.map(bid => {
                                            const b = books.find(x => x.id === bid);
                                            return b ? (
                                                <div key={bid} className="flex items-center gap-2 text-sm text-glass-500">
                                                    <Book size={14} className="text-emerald-400" /> {b.title}
                                                </div>
                                            ) : null;
                                        })
                                    ) : (
                                        s.book && <div className="flex items-center gap-2 text-sm text-glass-500">
                                            <Book size={14} className="text-emerald-400" /> {s.book}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* NEW TOPIC FORM */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <PlusCircle className="text-emerald-500" /> Create New Topic
                        </h2>
                        <div className="glass-panel p-6 shadow-xl space-y-6">
                            <form onSubmit={handleTopicSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-glass-300 mb-1">Topic Name</label>
                                    <input
                                        className="input-glass w-full text-white"
                                        placeholder="e.g. The Islamic Golden Age"
                                        value={topicData.topic}
                                        onChange={e => setTopicData({ ...topicData, topic: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-glass-300 mb-1">Description</label>
                                    <textarea
                                        className="input-glass w-full text-white h-24"
                                        placeholder="Briefly describe this theme..."
                                        value={topicData.description}
                                        onChange={e => setTopicData({ ...topicData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-glass-300 mb-2">Select Books (Previous & Library)</label>
                                    <div className="max-h-60 overflow-y-auto border border-white/10 rounded-lg p-2 space-y-2 custom-scrollbar bg-white/5">
                                        {books.map(book => (
                                            <div
                                                key={book.id}
                                                onClick={() => toggleBookSelection(book.id)}
                                                className="flex items-start gap-3 cursor-pointer p-2 hover:bg-white/10 rounded transition border border-transparent hover:border-white/10 group"
                                            >
                                                <div className={`w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${topicData.selectedBooks.includes(book.id) ? 'bg-brand-primary border-brand-primary' : 'bg-white/5 border-white/20'}`}>
                                                    {topicData.selectedBooks.includes(book.id) && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white select-none group-hover:text-brand-primary transition-colors">{book.title}</p>
                                                    <p className="text-xs text-glass-500 select-none">{book.author}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-glass-500 mt-2 text-right">{topicData.selectedBooks.length} books selected</p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        onClick={(e) => handleTopicSubmit(e, 'SAVE')}
                                        disabled={topicData.selectedBooks.length === 0}
                                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${isTopicSaved ? 'bg-emerald-600 text-white' : 'bg-white/5 text-glass-400 hover:bg-white/10 border border-white/10 disabled:opacity-50'}`}
                                    >
                                        {isTopicSaved ? 'Saved!' : 'Save Topic Only'}
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={(e) => handleTopicSubmit(e, 'SCHEDULE')}
                                        disabled={topicData.selectedBooks.length === 0}
                                        className="flex-1 py-3 rounded-lg font-bold btn-antigravity text-white hover:bg-brand-primary disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Calendar size={18} /> Save & Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <AvailabilityCalendar context={context} />
            )}
        </div >
    );
};

const AvailabilityCalendar = ({ context }) => {
    const { availability = [], toggleAvailability, members = [] } = context;
    const [viewDate, setViewDate] = useState(new Date());
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const [selectedMemberId, setSelectedMemberId] = useState(''); // Default to none (or current user if we had auth)

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun

    const dates = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return { day: d, dateStr };
    });

    // Helper: Is this date blocked by ANYONE?
    const getBlockedMembers = (dateStr) => {
        return availability
            .filter(a => a.date === dateStr && a.status === 'BUSY')
            .map(a => members.find(m => m.id === a.memberId));
    };

    // My status
    const isMyBlocked = (dateStr) => {
        return availability.some(a => a.memberId === selectedMemberId && a.date === dateStr && a.status === 'BUSY');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-6">
                {/* CONTROLS */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <User className="text-brand-primary" /> Select Member
                        </h3>
                        <p className="text-sm text-glass-400 mb-4">Select your name to update your availability.</p>
                        <select
                            className="input-glass w-full text-white mb-4"
                            value={selectedMemberId}
                            onChange={e => setSelectedMemberId(e.target.value)}
                        >
                            <option value="">-- View Team --</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        {selectedMemberId && (
                            <div className="text-xs text-glass-400 bg-brand-primary/10 border border-brand-primary/20 p-3 rounded">
                                <strong className="text-brand-primary">Instructions:</strong> Click on dates in the calendar to toggle your "Busy" status. Red dates indicate you are unavailable.
                            </div>
                        )}
                    </div>
                </div>

                {/* CALENDAR */}
                <div className="w-full md:w-2/3 glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                                className="p-2 hover:bg-white/10 rounded text-glass-400 hover:text-white"
                            >
                                &lt; Prev
                            </button>
                            <button
                                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                                className="p-2 hover:bg-white/10 rounded text-glass-400 hover:text-white"
                            >
                                Next &gt;
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-glass-500 uppercase">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {/* Spacers */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))}

                        {/* Days */}
                        {dates.map(({ day, dateStr }) => {
                            const blockedMembers = getBlockedMembers(dateStr);
                            const blockedCount = blockedMembers.length;
                            const isMine = isMyBlocked(dateStr);

                            // Intensity for Team View
                            let bgClass = "bg-white/5 hover:bg-white/10";
                            if (selectedMemberId && isMine) {
                                bgClass = "bg-red-500/50 border-red-500 hover:bg-red-500/60";
                            } else if (!selectedMemberId && blockedCount > 0) {
                                // Heatmap
                                if (blockedCount > 2) bgClass = "bg-rose-900/80 border-rose-800";
                                else if (blockedCount > 0) bgClass = "bg-rose-900/40 border-rose-900/50";
                            }

                            return (
                                <div
                                    key={dateStr}
                                    onClick={() => selectedMemberId && toggleAvailability(selectedMemberId, dateStr)}
                                    className={`
                                        aspect-square rounded-lg border border-white/5 flex flex-col items-center justify-center relative cursor-pointer transition-all group
                                        ${bgClass}
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isMine ? 'text-white' : 'text-glass-300'}`}>{day}</span>

                                    {/* Team View Dots */}
                                    {!selectedMemberId && blockedCount > 0 && (
                                        <div className="flex gap-0.5 mt-1">
                                            {Array.from({ length: Math.min(3, blockedCount) }).map((_, i) => (
                                                <div key={i} className="w-1 h-1 rounded-full bg-rose-400"></div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Hover Tooltip */}
                                    {blockedCount > 0 && (
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 w-max max-w-[150px] bg-black/90 backdrop-blur-xl border border-white/20 p-2 rounded text-xs text-glass-200 pointer-events-none shadow-xl">
                                            <strong>Unavailable:</strong>
                                            <ul className="mt-1 list-disc pl-3 space-y-0.5">
                                                {blockedMembers.map((m, idx) => (
                                                    m ? <li key={idx} className="text-white">{m.name.split(' ')[0]}</li> : null
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Events;
