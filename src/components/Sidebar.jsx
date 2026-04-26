import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, GraduationCap, Database, FileOutput, IndianRupee, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SyncIndicator from './SyncIndicator';

const Sidebar = ({ onClose, syncStatus, onSync }) => {
    const { signOut, user } = useAuth();
    const { showToast } = useToast();
    const menuItems = [
        { path: '/overview', label: 'Overview', icon: LayoutDashboard },
        { path: '/students', label: 'Students', icon: Users },
        { path: '/payment-history', label: 'Fee History', icon: IndianRupee },
        { path: '/admission', label: 'Admissions', icon: ClipboardCheck },
        { path: '/tc', label: 'Certificates', icon: FileOutput },
        { path: '/data', label: 'Settings', icon: Database },
    ];

    return (
        <div className="sidebar bg-[var(--bg-sidebar)] h-full p-4 flex flex-col gap-6 text-[var(--text-primary)] relative">
            {/* Mobile Close Button */}
            <button
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-card-hover)] rounded-md transition-all"
            >
                <X size={18} />
            </button>

            {/* Profile / Project Selector Header */}
            <div className="flex items-center gap-3 px-2 py-2 mt-2 cursor-pointer hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 border border-[var(--border-color)]">
                    <span className="text-xs font-semibold text-white">{user?.email?.[0].toUpperCase() || 'S'}</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.email?.split('@')[0] || 'Administrator'}</span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] truncate">Student Manager Pro</span>
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
                    className="p-1.5 text-[var(--text-muted)] hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all rounded-md hover:bg-[var(--bg-card)]"
                    aria-label="Sign out"
                >
                    <LogOut size={14} />
                </button>
            </div>

            <div className="w-full h-px bg-[var(--border-color)] my-1"></div>

            <div className="flex-1 overflow-y-auto">
                <div className="mb-2 px-2 mt-4">
                    <span className="text-xs font-medium text-[var(--text-muted)] tracking-wide mb-2 block">Projects</span>
                </div>
                <nav className="flex flex-col gap-0.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 group
                                    ${isActive
                                        ? 'bg-[var(--bg-card)] text-white'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-white'
                                    }
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon size={16} className={`${isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-white'}`} />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex flex-col gap-4">
                <div className="px-2">
                    <SyncIndicator status={syncStatus} onSync={onSync} />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
