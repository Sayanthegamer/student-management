import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, IndianRupee, ClipboardCheck, FileText, Settings } from 'lucide-react';

const navItems = [
  { path: '/overview', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/payment-history', label: 'Fee History', icon: IndianRupee },
  { path: '/admission', label: 'Admissions', icon: ClipboardCheck },
  { path: '/tc', label: 'Certificates', icon: FileText },
  { path: '/data', label: 'Settings', icon: Settings },
];

const BottomNavigation = () => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050505] border-t border-white/40 pb-[env(safe-area-inset-bottom,0px)]">
    <div className="w-full flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 py-3 flex-1 border-b-[3px] transition-colors
                ${isActive ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00]' : 'border-transparent text-white/50 active:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-[#CCFF00]' : 'text-white/50'} />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-center mt-1">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
    </div>
  </nav>
);

export default BottomNavigation;
