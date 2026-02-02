import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, GraduationCap, Database, FileOutput, IndianRupee, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SyncIndicator from './SyncIndicator';

const Sidebar = ({ onClose, syncStatus, onSync }) => {
    const { signOut, user } = useAuth();
    const menuItems = [
        { path: '/overview', label: 'Overview', icon: LayoutDashboard },
        { path: '/students', label: 'Student Management', icon: Users },
        { path: '/payment-history', label: 'Fee History', icon: IndianRupee },
        { path: '/admission', label: 'Admission Status', icon: ClipboardCheck },
        { path: '/tc', label: 'Transfer Certificate', icon: FileOutput },
        { path: '/data', label: 'Data Management', icon: Database },
    ];

    return (
        <div className="sidebar bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl h-full p-6 flex flex-col gap-8 rounded-2xl text-white relative">
            {/* Mobile Close Button */}
            <button
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
                <X size={20} />
            </button>

            <div className="flex items-center gap-4 px-2 py-2">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                    <GraduationCap size={24} color="white" />
                </div>
                <div>
                    <h1 className="m-0 text-lg font-bold text-white leading-none tracking-tight">
                        Student Manager
                    </h1>
                    <span className="text-xs text-indigo-300 font-medium tracking-wide uppercase">Pro</span>
                </div>
            </div>

            <nav className="flex flex-col gap-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                                relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 font-medium'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-300 rounded-r-full"></div>
                                    )}
                                    <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span className="relative z-10">{item.label}</span>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
                <div className="px-2">
                    <SyncIndicator status={syncStatus} onSync={onSync} darkMode={true} />
                </div>

                <button
                    onClick={() => {
                        if (syncStatus === 'syncing') {
                            alert('Please wait for synchronization to finish before signing out.');
                            return;
                        }
                        signOut();
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group w-full text-left ${
                        syncStatus === 'syncing'
                            ? 'text-slate-600 cursor-not-allowed'
                            : 'text-slate-400 hover:bg-red-500/10 hover:text-red-400'
                    }`}
                    title={syncStatus === 'syncing' ? 'Sync in progress...' : 'Sign Out'}
                >
                    <LogOut size={20} className={syncStatus !== 'syncing' ? "group-hover:scale-110 transition-transform" : ""} />
                    <span>Sign Out</span>
                </button>

                <div className="flex items-center gap-3 px-2 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-medium text-white truncate max-w-[140px]">{user?.email || 'User'}</span>
                        <span className="text-[10px] text-indigo-300">Logged in</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
