import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, IndianRupee, ClipboardCheck, FileText, Settings, ArrowUpRight, Menu, X } from 'lucide-react';

const mainNavItems = [
  { path: '/overview', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/payment-history', label: 'Fee History', icon: IndianRupee },
  { path: '/admission', label: 'Admissions', icon: ClipboardCheck },
];

const moreNavItems = [
  { path: '/promotions', label: 'Promotions', icon: ArrowUpRight },
  { path: '/tc', label: 'Certificates', icon: FileText },
  { path: '/data', label: 'Settings', icon: Settings },
];

/**
 * Mobile bottom navigation bar component.
 *
 * @returns {JSX.Element} The rendered bottom navigation component.
 */
const BottomNavigation = () => {
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMore(false);
      }
    };
    if (showMore) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside, { passive: true });
    };
  }, [showMore]);

  const isMoreActive = moreNavItems.some(item => location.pathname.startsWith(item.path));

  return (
    <>
      {/* Backdrop for more menu */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity" aria-hidden="true" />
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-main)]/95 backdrop-blur-md border-t border-[var(--border-color)] pb-[env(safe-area-inset-bottom,0px)]">
        {/* More Menu Popup */}
        <div
          ref={menuRef}
          id="moreMenuPopup"
          aria-hidden={!showMore}
          {...(!showMore ? { inert: "true" } : {})}
          className={`absolute bottom-full right-2 mb-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] shadow-lg overflow-hidden transition-all duration-200 origin-bottom-right ${showMore ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-2 pointer-events-none'}`}
        >
          <div className="flex flex-col py-2">
            {moreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  aria-label={item.label}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? 'text-[var(--accent-primary)] bg-[var(--accent-light)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-primary)]'}`}
                >
                  <Icon size={18} className="stroke-[2.5px]" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="w-full flex items-center justify-around pointer-events-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-label={item.label}
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

          {/* More Button */}
          <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                setShowMore(!showMore);
            }}
            className={`
              flex flex-col items-center justify-center gap-1 py-2.5 flex-1 transition-all duration-200 px-0.5 min-h-[56px] relative focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-primary)] outline-none rounded-[12px]
              ${(showMore || isMoreActive) ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}
            `}
            aria-label="Toggle more options"
            aria-expanded={showMore}
            aria-haspopup="menu"
            aria-controls="moreMenuPopup"
          >
            {/* Pill dot indicator */}
            <span
              className={`absolute top-1.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full bg-[var(--accent-primary)] transition-all duration-300 ${
                isMoreActive ? 'w-5 opacity-100' : 'w-0 opacity-0'
              }`}
            />
            {showMore ? (
               <X size={20} className="stroke-[2.5px] scale-110 text-[var(--accent-primary)] transition-transform duration-300" />
            ) : (
               <Menu size={20} className={`stroke-[2.5px] transition-transform duration-300 ${isMoreActive ? 'scale-110 text-[var(--accent-primary)]' : ''}`} />
            )}
            <span className={`text-[10px] font-medium uppercase tracking-tighter sm:tracking-normal text-center mt-0.5 truncate w-full px-0.5 leading-tight transition-colors duration-200 ${(showMore || isMoreActive) ? 'text-[var(--accent-primary)]' : ''}`}>More</span>
          </button>

        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;
