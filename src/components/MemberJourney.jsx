import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight, User, BookOpen, MessageSquare, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export const MemberJourney = ({ member, activeSession, logs, discussionPoints, quotes }) => {
    const navigate = useNavigate();

    if (!member) return null;

    // --- LOGIC: Determine Current Step ---
    const today = new Date().toISOString().split('T')[0];
    const hasLoggedToday = logs.some(l => l.memberId === member.id && l.date === today);
    // Rough check if they have participated in *any* discussion recently (improvement: check specific session)
    const hasDiscussed = discussionPoints.some(dp => dp.id) || quotes.some(q => q.memberId === member.id);

    // Steps Definition
    const steps = [
        {
            id: 'logger',
            label: 'Log Daily Reading',
            description: 'Keep your streak alive!',
            icon: BookOpen,
            path: '/log',
            isComplete: hasLoggedToday,
            action: 'Log Now'
        },
        {
            id: 'engagement',
            label: 'Join the Discussion',
            description: 'Vote on topics or add a quote.',
            icon: MessageSquare,
            path: '/', // Dashboard has the widget
            isComplete: hasDiscussed && hasLoggedToday, // Only suggest after logging
            action: 'Go to Dashboard'
        },
        {
            id: 'review',
            label: 'Peer Review',
            description: 'Support your fellow members.',
            icon: User,
            path: '/peer-review',
            isComplete: false, // Hard to automate "completeness" without more data, so always open
            action: 'Review Peers'
        }
    ];

    // Find the first incomplete step
    const currentStepIndex = steps.findIndex(s => !s.isComplete);
    const activeStep = steps[currentStepIndex] || steps[steps.length - 1]; // Fallback to last if all done

    const isAllDone = currentStepIndex === -1;

    return (
        <div className="glass-panel p-6 border-l-4 border-l-brand-primary relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <activeStep.icon size={120} />
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    {isAllDone ? (
                        <><CheckCircle className="text-emerald-400" /> All Caught Up!</>
                    ) : (
                        <><activeStep.icon className="text-brand-primary" /> Next Mission: {activeStep.label}</>
                    )}
                </h3>

                <p className="text-glass-300 mb-6 max-w-lg">
                    {isAllDone
                        ? "You've completed all your key actions for today. Great job keeping the momentum!"
                        : activeStep.description
                    }
                </p>

                {/* Progress Visual */}
                <div className="flex items-center gap-4 mb-6">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-2">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                                ${step.isComplete
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : idx === currentStepIndex
                                        ? 'bg-brand-primary/20 border-brand-primary text-brand-primary animate-pulse'
                                        : 'bg-white/5 border-white/10 text-glass-500'
                                }
                            `}>
                                {step.isComplete ? <CheckCircle size={16} /> : idx + 1}
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`h-1 w-8 rounded ${step.isComplete ? 'bg-emerald-500/30' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {!isAllDone && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(activeStep.path, { state: { memberId: member.id } })} // Pass memberId state for pre-filling
                        className="btn-antigravity text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                    >
                        {activeStep.action} <ArrowRight size={18} />
                    </motion.button>
                )}
            </div>
        </div>
    );
};
