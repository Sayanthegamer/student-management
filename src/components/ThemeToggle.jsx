import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ compact = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-custom-md transition-colors ${
        compact ? 'h-9 w-9' : 'px-3 py-2 text-xs font-medium'
      }`}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
      {!compact && <span>{isLight ? 'Dark' : 'Light'} mode</span>}
    </button>
  );
};

export default ThemeToggle;
