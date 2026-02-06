import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, MoreHorizontal } from 'lucide-react';

const navItems = [
  { path: '/overview', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/admission', label: 'Admissions', icon: ClipboardCheck },
  { path: '/data', label: 'More', icon: MoreHorizontal },
];

const BottomNavigation = () => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-inset-bottom">
    <div className="mx-auto max-w-lg px-3 pb-3">
      <div className="bg-white/90 backdrop-blur-2xl border border-white/40 shadow-[0_-10px_30px_-20px_rgba(15,23,42,0.5)] rounded-2xl px-2 py-2 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl text-[11px] font-semibold transition-colors min-w-[72px]
                ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  </nav>
);

export default BottomNavigation;
