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
        <div className="sidebar bg-[#050505] border-r border-white/20 h-full p-4 md:p-6 flex flex-col gap-8 text-[#e0e0e0] relative">
            {/* Mobile Close Button */}
            <button
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-95"
            >
                <X size={20} />
            </button>

            <div className="flex items-center gap-3 px-2">
                <div className="border border-[#CCFF00] bg-[#CCFF00] p-2.5 flex items-center justify-center shrink-0">
                    <GraduationCap size={22} className="text-black" />
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="m-0 text-base font-black text-white leading-none tracking-tight uppercase">
                        STD::MGR
                    </h1>
                    <span className="text-[10px] text-[#CCFF00] font-bold tracking-widest uppercase mt-1 block">[ INTERNAL ]</span>
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
                                relative flex items-center gap-4 px-4 py-3 transition-colors duration-150 group overflow-hidden border
                                ${isActive
                                    ? 'bg-[#CCFF00] text-black font-black border-[#CCFF00]'
                                    : 'text-white/60 hover:bg-white/10 hover:text-white font-bold border-transparent hover:border-white/20'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} className={`transition-transform duration-300 ${isActive ? 'text-black' : 'group-hover:scale-110'}`} />
                                    <span className="text-sm tracking-wider uppercase">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/20 flex flex-col gap-6">
                <div className="px-2">
                    <SyncIndicator status={syncStatus} onSync={onSync} darkMode={true} />
                </div>

                <div className="flex items-center justify-between gap-3 px-2 bg-[#0a0a0a] p-4 border border-white/20">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-white flex items-center justify-center text-[10px] font-black text-black shrink-0">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-black text-white truncate uppercase">{user?.email?.split('@')[0] || 'User'}</span>
                            <span className="text-[10px] text-white/50 font-mono">ADMINISTRATOR</span>
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
