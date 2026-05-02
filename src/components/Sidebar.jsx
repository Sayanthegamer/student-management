import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, GraduationCap, Database, FileOutput, IndianRupee, LogOut, ArrowUpRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SyncIndicator from './SyncIndicator';

/**
 * The Kinetic Ledger Sidebar Navigation
 * Glassmorphic depth with Electric Indigo active indicators
 */
const Sidebar = ({ onClose, syncStatus, onSync }) => {
    const { signOut, user } = useAuth();
    const { showToast } = useToast();
    const menuItems = [
        { path: '/overview', label: 'Overview', icon: LayoutDashboard },
        { path: '/students', label: 'Directory', icon: Users },
        { path: '/payment-history', label: 'Fee History', icon: IndianRupee },
        { path: '/admission', label: 'Admissions', icon: ClipboardCheck },
        { path: '/promotions', label: 'Promotions', icon: ArrowUpRight },
        { path: '/tc', label: 'Certificates', icon: FileOutput },
        { path: '/data', label: 'Settings', icon: Database },
    ];

    return (
        <div className="sidebar h-full flex flex-col py-5 px-3 relative">
            {/* Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/20 to-transparent" />
            
            {/* Profile / Project Header */}
            <div className="flex items-center gap-3 px-3 py-3.5 cursor-pointer rounded-xl transition-all duration-200 hover:bg-[var(--bg-card-hover)] group relative mb-1">
                {/* Avatar with electric glow */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-muted)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent-primary)]/20 relative">
                    {/* Subtle glow behind avatar */}
                    <div className="absolute inset-0 rounded-xl bg-[var(--accent-primary)] blur-md opacity-30" />
                    <span className="text-sm font-bold text-white relative z-10">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)] truncate tracking-tight">{user?.email?.split('@')[0] || 'Administrator'}</span>
                        <Zap size={10} className="text-[var(--accent-primary)] fill-current" />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] truncate font-mono">kinetic-ledger</span>
                </div>
                <button
                    onClick={async () => {
                        if (syncStatus === 'syncing') {
                            showToast('Please wait for sync to complete before signing out.', 'warning');
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

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent my-3" />

            {/* Navigation Label */}
            <div className="mb-2 px-3">
                <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Navigation</span>
            </div>

            {/* Navigation Items */}
            <nav className="flex flex-col gap-1 flex-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                                ${isActive
                                    ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Electric Indigo active indicator */}
                                    {isActive && (
                                        <span 
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full"
                                            style={{
                                                background: 'linear-gradient(180deg, var(--accent-primary) 0%, var(--accent-muted) 100%)',
                                                boxShadow: '0 0 16px var(--accent-glow), 0 0 4px var(--accent-primary)'
                                            }}
                                        />
                                    )}
                                    
                                    {/* Icon container */}
                                    <div 
                                        className={`
                                            p-2 rounded-lg transition-all duration-200 relative
                                            ${isActive 
                                                ? 'bg-[var(--accent-primary)]/15' 
                                                : 'bg-[var(--bg-card)]'
                                            }
                                        `}
                                    >
                                        <Icon 
                                            size={16} 
                                            className={`
                                                transition-colors duration-200
                                                ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}
                                            `} 
                                        />
                                    </div>
                                    
                                    <span className={`text-sm font-medium ${isActive ? 'text-[var(--text-primary)]' : ''}`}>
                                        {item.label}
                                    </span>
                                    
                                    {/* Hover shimmer */}
                                    {isActive && (
                                        <div className="absolute inset-0 shimmer-sweep opacity-30 pointer-events-none" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Sync Status Footer */}
            <div className="mt-auto pt-3">
                <div className="px-3 py-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] relative overflow-hidden">
                    {/* Subtle top accent */}
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/30 to-transparent" />
                    <SyncIndicator status={syncStatus} onSync={onSync} />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;