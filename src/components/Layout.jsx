import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useBookClub } from '../context/BookClubContext';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Trophy,
    Calendar,
    LogOut,
    Menu,
    X,
    PenTool,
    GraduationCap,
    Vote,
    Command,
    Search,
    Quote
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import CommandPalette from './CommandPalette';
import logo from '../assets/logo.png';
import appBg from '../assets/final-app-bg.png';

const NavItem = ({ to, icon, label, onClick }) => {
    const Icon = icon;
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
      ${isActive
                    ? 'bg-gradient-to-r from-brand-purple/20 to-brand-magenta/20 text-white border border-brand-purple/30 shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                    : 'text-brand-orange hover:text-white hover:bg-white/5'}
    `}
        >
            <Icon size={20} />
            <span className="font-medium tracking-wide">{label}</span>
            {/* Glow effect for active state */}
            <AnimatePresence>
                {({ isActive }) => isActive && (
                    <Motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 bg-brand-purple/10 rounded-xl blur-lg -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>
        </NavLink>
    );
};

const Layout = ({ children }) => {
    const { currentUser, logout, members } = useBookClub();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCommandOpen, setIsCommandOpen] = useState(false);


    // Find current member for avatar
    const currentMember = members.find(m => m.id === currentUser?.id);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close mobile menu on route change
    // useEffect(() => setIsMobileMenuOpen(false), [location]); // Optional optimization

    return (
        <div className="min-h-screen relative font-sans text-text-main overflow-hidden">
            {/* Premium CSS Background - "The Aurora" */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-brand-base">
                <img src={appBg} className="w-full h-full object-cover opacity-20" alt="Book Club Table Scene" />
                {/* Vignette & Gradient Fade: Dark edges to focus center */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-base/90 via-brand-base/50 to-brand-base/90" />
            </div>

            <CommandPalette isOpen={isCommandOpen} setIsOpen={setIsCommandOpen} />

            <div className="relative z-10 flex h-screen max-w-[1920px] mx-auto p-4 lg:p-6 gap-6">

                {/* Desktop Sidebar - Floating Glass */}
                <aside className="hidden lg:flex flex-col w-72 glass-panel p-6">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <img src={logo} alt="Logo" className="w-10 h-10 drop-shadow-md" />
                        <div>
                            <h1 className="font-serif font-bold text-xl tracking-wide text-white">IFIYE</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-orange">Book Club</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                        <NavItem to="/books" icon={BookOpen} label="Library" />
                        <NavItem to="/members" icon={Users} label="Members" />
                        <NavItem to="/log" icon={PenTool} label="Log Progress" />
                        <NavItem to="/academy" icon={GraduationCap} label="Academy" />
                        <NavItem to="/rankings" icon={Trophy} label="Leaderboard" />
                        <NavItem to="/peer-review" icon={Users} label="Peer Reviews" />
                        <NavItem to="/events" icon={Calendar} label="Events" />
                        <NavItem to="/quotes" icon={Quote} label="Quotes" />
                        {currentUser?.isAdmin && (
                            <div className="mt-4 pt-4 border-t border-glass-border">
                                <NavItem to="/admin" icon={LayoutDashboard} label="Admin Console" />
                            </div>
                        )}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="mt-6 pt-6 border-t border-glass-border space-y-4">
                        <div
                            onClick={() => setIsCommandOpen(true)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/20 text-brand-orange hover:text-white hover:bg-black/30 cursor-pointer transition text-sm"
                        >
                            <Search size={16} />
                            <span>Quick Search...</span>
                            <kbd className="ml-auto bg-white/10 px-2 py-0.5 rounded textxs font-mono">Ctrl+K</kbd>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-magenta p-[2px]">
                                    <div className="w-full h-full rounded-full bg-brand-base flex items-center justify-center font-bold text-sm">
                                        {currentMember?.name?.substring(0, 2).toUpperCase() || 'ME'}
                                    </div>
                                </div>
                                <div className="leading-tight">
                                    <p className="font-bold text-sm text-white">{currentMember?.name?.split(' ')[0]}</p>
                                    <p className="text-xs text-brand-yellow">Member</p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="text-brand-orange hover:text-brand-magenta transition">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Logo" className="w-8 h-8" />
                        <span className="font-serif font-bold text-lg">Ifiye</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <Motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            className="fixed inset-0 z-40 bg-brand-base/95 backdrop-blur-xl lg:hidden pt-20 px-6 pb-6 flex flex-col"
                        >
                            <nav className="space-y-4 flex-1">
                                <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/" icon={LayoutDashboard} label="Dashboard" />
                                <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/books" icon={BookOpen} label="Library" />
                                <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/log" icon={PenTool} label="Log Progress" />
                                <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/quotes" icon={Quote} label="Quotes" />
                                <NavItem onClick={() => setIsMobileMenuOpen(false)} to="/vote" icon={Vote} label="Voting" />
                            </nav>
                            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 font-bold mt-8">
                                <LogOut /> Logout
                            </button>
                        </Motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 flex flex-col pt-16 lg:pt-0 h-full">
                    {/* Dynamic Header could go here in future */}

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 lg:pr-4 pb-4 relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
