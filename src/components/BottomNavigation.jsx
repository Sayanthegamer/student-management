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
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
    <div className="mx-auto max-w-lg px-3 pb-3 pt-2 safe-area-inset-bottom bg-gradient-to-t from-slate-100/80 via-slate-50/40 to-transparent pointer-events-none">
      <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.15)] rounded-2xl px-1.5 py-2 flex items-center justify-between pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 min-w-[76px] touch-manipulation active:scale-95
                ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 active:text-slate-700'}
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={`transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="tracking-wide">{item.label}</span>
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
