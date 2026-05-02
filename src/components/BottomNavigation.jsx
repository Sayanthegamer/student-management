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


/**
 * BottomNavigation Component
 * 
 * @returns {JSX.Element} The rendered component.
 */
const BottomNavigation = () => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-main)]/95 backdrop-blur-md border-t border-[var(--border-color)] pb-[env(safe-area-inset-bottom,0px)]">
    <div className="w-full flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 py-2.5 flex-1 transition-all duration-200 px-0.5 min-h-[56px] relative
                ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] active:text-[var(--accent-primary)]'}
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Pill dot indicator */}
                  <span 
                    className={`absolute top-1.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-[var(--accent-primary)] transition-all duration-300 ${
                      isActive ? 'w-5 opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                  <Icon 
                    size={20} 
                    className={`stroke-[2.5px] transition-transform duration-300 ${isActive ? 'text-[var(--accent-primary)] scale-110' : 'text-[var(--text-secondary)]'}`} 
                  />
                  <span className={`text-[10px] font-medium uppercase tracking-tighter sm:tracking-normal text-center mt-0.5 truncate w-full px-0.5 leading-tight transition-colors duration-200 ${isActive ? 'text-[var(--accent-primary)]' : ''}`}>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
    </div>
  </nav>
);

export default BottomNavigation;
