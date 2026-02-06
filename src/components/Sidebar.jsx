import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, GraduationCap, Database, FileOutput, IndianRupee, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SyncIndicator from './SyncIndicator';

const Sidebar = ({ onClose, syncStatus, onSync }) => {
    const { signOut, user } = useAuth();
    const menuItems = [
        { path: '/overview', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/students', label: 'Students', icon: Users },
        { path: '/payment-history', label: 'Fee History', icon: IndianRupee },
        { path: '/admission', label: 'Admissions', icon: ClipboardCheck },
        { path: '/tc', label: 'Certificates', icon: FileOutput },
        { path: '/data', label: 'Settings', icon: Database },
    ];

    return (
        <div className="sidebar bg-slate-900/95 backdrop-blur-2xl border-r border-white/5 shadow-2xl h-full p-4 md:p-6 flex flex-col gap-8 text-white relative">
            {/* Mobile Close Button */}
            <button
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-95"
            >
                <X size={20} />
            </button>

            <div className="flex items-center gap-3 px-2">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center shrink-0">
                    <GraduationCap size={22} color="white" />
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="m-0 text-base font-bold text-white leading-none tracking-tight">
                        Student Manager
                    </h1>
                    <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase mt-1 block">Institutional</span>
                </div>
            </div>

            <nav className="flex flex-col gap-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                                relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden
                                ${isActive
                                    ? 'bg-white/10 text-white font-semibold'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-full"></div>
                                    )}
                                    <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'text-indigo-400' : 'group-hover:scale-110'}`} />
                                    <span className="text-sm tracking-wide">{item.label}</span>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none"></div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-6">
                <div className="px-2">
                    <SyncIndicator status={syncStatus} onSync={onSync} darkMode={true} />
                </div>

                <div className="flex items-center justify-between gap-3 px-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-inner">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-semibold text-slate-200 truncate">{user?.email?.split('@')[0] || 'User'}</span>
                            <span className="text-[10px] text-slate-500 font-medium">Administrator</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (syncStatus === 'syncing') {
                                alert('Please wait for synchronization to finish before signing out.');
                                return;
                            }
                            signOut();
                        }}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all active:scale-95"
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
