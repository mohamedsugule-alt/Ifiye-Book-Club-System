import React from 'react';
import { cn } from '../utils/cn';
import { format, parseISO } from 'date-fns';

export const ConsistencyChart = ({ history }) => {
    // History: [{ date: '2025-01-01', status: 'HIT' | 'MISS' | 'PENDING', pagesRead: 10 }]

    const getStatusColor = (status) => {
        switch (status) {
            case 'HIT': return 'bg-emerald-500 hover:bg-emerald-400';
            case 'MISS': return 'bg-rose-500 hover:bg-rose-400';
            case 'PENDING': return 'bg-slate-700 hover:bg-slate-600 animate-pulse';
            default: return 'bg-slate-800';
        }
    };

    const getTooltip = (day) => {
        const d = format(parseISO(day.date), 'MMM d');
        if (day.status === 'PENDING') return `${d}: Today (Pending)`;
        return `${d}: ${day.status} (${day.pagesRead} pages)`;
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-slate-400">Consistency Streak</h4>
                <div className="flex gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-emerald-500"></div> Hit</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-rose-500"></div> Miss</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-1">
                {history.map((day) => (
                    <div
                        key={day.date}
                        className={cn(
                            "w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-all cursor-help relative group",
                            getStatusColor(day.status)
                        )}
                        title={getTooltip(day)}
                    >
                        {/* Simple Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 whitespace-nowrap">
                            <div className="bg-white text-slate-900 text-xs px-2 py-1 rounded shadow-lg border border-slate-200">
                                {getTooltip(day)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
