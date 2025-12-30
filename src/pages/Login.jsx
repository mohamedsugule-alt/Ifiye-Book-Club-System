import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookClub } from '../context/BookClubContext';
import { KeyRound, ShieldAlert, Sparkles, Loader, UserCircle } from 'lucide-react';
import loginBg from '../assets/final-app-bg.png';
import logo from '../assets/logo.png';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const { members, login, currentUser } = useBookClub();
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        try {
            // Simulate network delay for effect
            await new Promise(resolve => setTimeout(resolve, 800));

            const success = login(selectedId, password);
            if (success) {
                navigate('/');
            } else {
                setError('Invalid credentials. Please check your username and password.');
            }
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-brand-base overflow-hidden relative">

            {/* Left Side - Dramatic CSS Background */}
            <div className="hidden lg:block w-1/2 relative overflow-hidden bg-brand-base">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-transparent via-transparent to-brand-base/90" />
                <img
                    src={loginBg}
                    alt="Book Club Table Scene"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />

                <div className="absolute bottom-12 left-12 z-20 max-w-lg">
                    <h1 className="text-5xl font-serif font-bold text-white mb-4 leading-tight">
                        Discover. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-orange">Debate.</span> <br />
                        Evolve.
                    </h1>
                    <p className="text-brand-orange text-lg border-l-4 border-brand-magenta pl-4">
                        "A room without books is like a body without a soul."
                    </p>
                </div>
            </div>

            {/* Right Side - Glass Login Card */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Mobile Background */}
                <div className="lg:hidden absolute inset-0 z-0">
                    <img src={loginBg} className="w-full h-full object-cover opacity-20" alt="bg" />
                    <div className="absolute inset-0 bg-brand-base/90" />
                </div>

                <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="glass-panel w-full max-w-md p-10 relative z-10"
                >
                    <div className="text-center mb-8">
                        <img src={logo} alt="Ifiye Logo" className="w-24 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                        <h2 className="text-3xl font-bold text-white font-serif tracking-wide">Welcome Back</h2>
                        <p className="text-brand-orange mt-2 text-sm uppercase tracking-widest">Member Access Portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-yellow uppercase tracking-wider ml-1">Identity</label>
                            <div className="relative">
                                <UserCircle className="absolute left-3 top-3 text-brand-orange w-5 h-5" />
                                <select
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                    className="input-glass pl-10 appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" className="bg-brand-base text-gray-500">Select your profile...</option>
                                    {members.filter(m => m.active).map(member => (
                                        <option key={member.id} value={member.id} className="bg-brand-base text-white">
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-yellow uppercase tracking-wider ml-1">Passkey</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 text-brand-orange w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-glass pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <Motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 text-red-200 text-sm"
                                >
                                    <ShieldAlert size={16} />
                                    {error}
                                </Motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoggingIn || !selectedId || !password}
                            className="btn-antigravity w-full py-4 text-lg uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoggingIn ? (
                                <Loader className="animate-spin" />
                            ) : (
                                <>
                                    <span>Enter Club</span>
                                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-glass-border text-center">
                        <p className="text-glass-300 text-xs">
                            Ifiye Book Club &copy; {new Date().getFullYear()} <br />
                            <span className="opacity-50">v2.0 Antigravity Edition</span>
                        </p>
                    </div>
                </Motion.div>
            </div>
        </div>
    );
};

export default Login;
