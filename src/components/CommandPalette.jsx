import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Book, LayoutDashboard, Settings, GraduationCap, Search, PenTool } from 'lucide-react';

const CommandPalette = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    // Toggle on Cmd+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [setIsOpen]);

    const runCommand = (command) => {
        setIsOpen(false);
        command();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-in fade-in duration-200">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <Command className="w-full max-w-lg glass-panel !rounded-xl !border-glass-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative z-10">
                <div className="flex items-center border-b border-glass-border px-3 bg-black/20" cmdk-input-wrapper="">
                    <Search className="w-5 h-5 text-glass-300 mr-2" />
                    <Command.Input
                        placeholder="Type a command or search..."
                        className="w-full h-14 bg-transparent outline-none text-white placeholder:text-glass-300 font-medium"
                    />
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
                    <Command.Empty className="py-6 text-center text-sm text-glass-300">
                        No results found.
                    </Command.Empty>

                    <Command.Group heading="Navigation" className="text-xs text-brand-orange font-bold uppercase tracking-wider px-2 py-1 mb-1">
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/'))}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 rounded-lg aria-selected:bg-brand-purple/20 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <LayoutDashboard size={16} />
                            <span>Dashboard</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/log'))}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 rounded-lg aria-selected:bg-brand-purple/20 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <PenTool size={16} />
                            <span>Log Progress</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/books'))}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 rounded-lg aria-selected:bg-brand-purple/20 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <Book size={16} />
                            <span>Library</span>
                        </Command.Item>
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/academy'))}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 rounded-lg aria-selected:bg-brand-purple/20 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <GraduationCap size={16} />
                            <span>Academy</span>
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="System" className="text-xs text-brand-orange font-bold uppercase tracking-wider px-2 py-1 mb-1 mt-2">
                        <Command.Item
                            onSelect={() => runCommand(() => navigate('/admin'))}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 rounded-lg aria-selected:bg-brand-purple/20 aria-selected:text-white cursor-pointer transition-colors"
                        >
                            <Settings size={16} />
                            <span>Admin Panel</span>
                        </Command.Item>
                    </Command.Group>
                </Command.List>

                <div className="border-t border-glass-border p-2 flex items-center justify-between text-[10px] text-glass-300 bg-black/40">
                    <span>Navigation</span>
                    <div className="flex gap-2">
                        <span className="bg-white/10 px-1 rounded">↵ Select</span>
                        <span className="bg-white/10 px-1 rounded">↓↑ Navigate</span>
                    </div>
                </div>
            </Command>
        </div>
    );
};

export default CommandPalette;
