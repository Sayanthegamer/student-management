import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, GraduationCap, Database, FileOutput, IndianRupee, X, LogOut, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SyncIndicator from './SyncIndicator';

/**
 * The main sidebar navigation component.
 * Refined for a premium, high-end aesthetic with subtle interactions.
 */
const Sidebar = ({ onClose, syncStatus, onSync }) => {
    const { signOut, user } = useAuth();
    const { showToast } = useToast();
    const menuItems = [
        { path: '/overview', label: 'Overview', icon: LayoutDashboard },
        { path: '/students', label: 'Students', icon: Users },
        { path: '/payment-history', label: 'Fee History', icon: IndianRupee },
        { path: '/admission', label: 'Admissions', icon: ClipboardCheck },
        { path: '/promotions', label: 'Promotions', icon: ArrowUpRight },
        { path: '/tc', label: 'Certificates', icon: FileOutput },
        { path: '/data', label: 'Settings', icon: Database },
    ];

    return (
        <div className="sidebar h-full flex flex-col py-6 px-4">
            {/* Profile / Project Selector Header */}
            <div className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl transition-all duration-200 hover:bg-[var(--bg-card)] group relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent-primary)]/20">
                    <span className="text-sm font-bold text-white">{user?.email?.[0]?.toUpperCase() || 'S'}</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)] truncate tracking-tight">{user?.email?.split('@')[0] || 'Administrator'}</span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] truncate font-mono">student-manager-pro</span>
                </div>
                <button
                    onClick={async () => {
                        if (syncStatus === 'syncing') {
                            showToast('Please wait for synchronization to finish before signing out.', 'warning');
                            return;
                        }
                        try {
                            await signOut();
                            showToast('Signed out successfully', 'success');
                        } catch (err) {
                            showToast('Sign out failed: ' + (err?.message || 'Unknown error'), 'error');
                        }
                    }}
                    className="p-2 text-[var(--text-muted)] hover:text-rose-400 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    aria-label="Sign out"
                >
                    <LogOut size={14} />
                </button>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent my-4" />

            <div className="flex-1 overflow-y-auto">
                <div className="mb-3 px-3">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Navigation</span>
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
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-[var(--accent-light)] text-[var(--accent-primary)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                                    }
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <span 
                                                className="absolute -left-1 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--accent-primary)] rounded-full shadow-lg shadow-[var(--accent-primary)]/40" 
                                                style={{ animation: 'scale-in-anim 0.3s var(--spring-snappy) both' }}
                                            />
                                        )}
                                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-[var(--accent-primary)]/20' : 'bg-[var(--bg-card)]'}`}>
                                            <Icon size={16} className={`transition-colors duration-200 ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`} />
                                        </div>
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto pt-4">
                <div className="px-3 py-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                    <SyncIndicator status={syncStatus} onSync={onSync} />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;