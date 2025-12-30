import React, { useMemo, useState } from 'react';
import { Card } from './ui';
import { Flag, MapPin, BookOpen } from 'lucide-react';

const MountainProgress = ({ books = [], activeBookId }) => {
    const [hoveredBook, setHoveredBook] = useState(null);

    // 1. Filter & Sort 2026 Books
    const sortedBooks = useMemo(() => {
        return books
            .filter(b => b.id.startsWith('B26') || (b.year && parseInt(b.year) >= 2026)) // Strict 2026 Filter
            .sort((a, b) => {
                // Try to sort by ID B26_1, B26_2 etc if possible
                const numA = parseInt(a.id.split('_')[1]) || 0;
                const numB = parseInt(b.id.split('_')[1]) || 0;
                return numA - numB;
            });
    }, [books]);



    // 2. Calculate Coordinates
    // Canvas: 1000 x 300
    // Start: (50, 250)
    // End: (950, 50)
    const points = useMemo(() => {
        return sortedBooks.map((book, index) => {
            const progress = index / (sortedBooks.length - 1);

            // Add some "Mountain" randomness/curve to the Y
            // Base slope + sine wave for peaks
            const x = 50 + (progress * 900);

            // Linear rise: y = 250 - (progress * 200)
            // Add variances
            let y = 250 - (progress * 200);

            // Peak variation (make middle books zig-zag a bit)
            if (index > 0 && index < sortedBooks.length - 1) {
                const variance = Math.sin(index * 2) * 20;
                y += variance;
            }

            return { x, y, book, index };
        });
    }, [sortedBooks]);

    // Generate Path String
    const pathD = useMemo(() => {
        if (points.length === 0) return "";
        let d = `M 20 280 L ${points[0].x} ${points[0].y}`; // Start

        points.forEach((p, i) => {
            if (i > 0) d += ` L ${p.x} ${p.y}`;
        });

        d += ` L 980 280 Z`; // Close loop for fill
        return d;
    }, [points]);

    // Stroke Path (Ridge)
    const ridgeD = useMemo(() => {
        if (points.length === 0) return "";
        let d = `M ${points[0].x} ${points[0].y}`;
        points.forEach((p, i) => {
            if (i > 0) d += ` L ${p.x} ${p.y}`;
        });
        return d;
    }, [points]);

    const activeIndex = sortedBooks.findIndex(b => b.id === activeBookId);

    if (sortedBooks.length === 0) return null;

    return (
        <Card className="bg-white border-slate-200 p-8 relative overflow-visible mt-8 shadow-sm">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Flag className="text-emerald-600" /> 2026 Expansion Campaign
                    </h3>
                    <p className="text-slate-500 text-sm">Climbing the mountain of knowledge, one book at a time.</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-emerald-600">{activeIndex + 1} / {sortedBooks.length}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Books Conquered</p>
                </div>
            </div>

            <div className="relative h-[300px] w-full mt-8 group select-none">
                <svg viewBox="0 0 1000 320" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="mountainGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Mountain Fill */}
                    <path d={pathD} fill="url(#mountainGradient)" stroke="none" />

                    {/* Mountain Ridge */}
                    <path d={ridgeD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Points */}
                    {points.map((p, i) => {
                        const isActive = i === activeIndex;
                        const isPast = i < activeIndex;


                        return (
                            <g
                                key={p.book.id}
                                onMouseEnter={() => setHoveredBook(p.book)}
                                onMouseLeave={() => setHoveredBook(null)}
                                className="cursor-pointer transition-all duration-300"
                            >
                                {/* Line to bottom (optional guide) */}
                                {isActive && (
                                    <line x1={p.x} y1={p.y} x2={p.x} y2={300} stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                                )}

                                {/* Dot Circle */}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={isActive ? 8 : 5}
                                    fill={isActive ? '#10b981' : (isPast ? '#059669' : '#e2e8f0')}
                                    stroke={isActive ? '#ffffff' : (isPast ? '#10b981' : '#cbd5e1')}
                                    strokeWidth={3}
                                    className="transition-all duration-300 hover:r-8"
                                />

                                {/* Book Number Label (always visible for active or first/last) */}
                                {(isActive || i === 0 || i === points.length - 1) && (
                                    <text
                                        x={p.x}
                                        y={p.y - 15}
                                        textAnchor="middle"
                                        fill={isActive ? '#059669' : '#94a3b8'}
                                        fontSize="12"
                                        fontWeight="bold"
                                    >
                                        {i + 1}
                                    </text>
                                )}

                                {/* Active Pulsing Ring */}
                                {isActive && (
                                    <circle cx={p.x} cy={p.y} r="12" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.5">
                                        <animate attributeName="r" from="8" to="24" dur="1.5s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
                                    </circle>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Tooltip Overhead */}
                {hoveredBook && (
                    <div
                        className="absolute bg-white border border-slate-200 p-4 rounded-xl shadow-xl z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                        style={{
                            left: `${(points.find(p => p.book.id === hoveredBook.id)?.x / 1000) * 100}%`,
                            top: `${(points.find(p => p.book.id === hoveredBook.id)?.y / 320) * 100}%`
                        }}
                    >
                        <p className="text-slate-900 font-bold text-sm whitespace-nowrap mb-1">{hoveredBook.title}</p>
                        <p className="text-emerald-600 text-xs font-bold">{hoveredBook.author}</p>
                    </div>
                )}

                {/* Active Book Label (Static) if not hovering */}
                {!hoveredBook && activeIndex >= 0 && points[activeIndex] && (
                    <div
                        className="absolute bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg z-10 transform -translate-x-1/2 -translate-y-[150%] font-bold text-xs"
                        style={{
                            left: `${(points[activeIndex].x / 1000) * 100}%`,
                            top: `${(points[activeIndex].y / 320) * 100}%`
                        }}
                    >
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <MapPin size={12} fill="currentColor" />
                            <span>Current Camp: {books.find(b => b.id === activeBookId)?.title.substring(0, 20)}...</span>
                        </div>
                        {/* Triangle Arrow */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-emerald-600"></div>
                    </div>
                )}

            </div>
        </Card>
    );
};

export default MountainProgress;
