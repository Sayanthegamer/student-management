import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastStyles = {
  success: {
    border: 'border-[var(--success)]/30',
    bg: 'bg-[var(--bg-card)]',
    iconBg: 'bg-[var(--success)]/10',
    iconColor: 'text-[var(--success)]',
    textColor: 'text-[var(--text-primary)]',
    accent: 'bg-[var(--success)]',
  },
  error: {
    border: 'border-[var(--color-negative)]/30',
    bg: 'bg-[var(--bg-card)]',
    iconBg: 'bg-[var(--color-negative)]/10',
    iconColor: 'text-[var(--color-negative)]',
    textColor: 'text-[var(--text-primary)]',
    accent: 'bg-[var(--color-negative)]',
  },
  warning: {
    border: 'border-[var(--color-warning)]/30',
    bg: 'bg-[var(--bg-card)]',
    iconBg: 'bg-[var(--color-warning)]/10',
    iconColor: 'text-[var(--color-warning)]',
    textColor: 'text-[var(--text-primary)]',
    accent: 'bg-[var(--color-warning)]',
  },
  info: {
    border: 'border-[var(--border-color)]',
    bg: 'bg-[var(--bg-card)]',
    iconBg: 'bg-[var(--bg-main)]',
    iconColor: 'text-[var(--text-secondary)]',
    textColor: 'text-[var(--text-primary)]',
    accent: 'bg-[var(--text-secondary)]',
  },
};

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="fixed z-[200] flex flex-col gap-2 pointer-events-none"
      style={{
        top: 'max(1rem, env(safe-area-inset-top, 0px))',
        right: '1rem',
        left: 'auto',
        maxWidth: 'calc(100vw - 2rem)',
      }}
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { message, type, id, duration, exiting } = toast;
  const styles = toastStyles[type] || toastStyles.info;
  const Icon = toastIcons[type] || Info;

  return (
    <div
      className={`
        pointer-events-auto
        ${styles.bg}
        border ${styles.border} rounded-[12px]
        p-0
        flex flex-col
        shadow-lg
        max-w-sm
        w-[calc(100vw-2rem)]
        sm:w-auto
        sm:min-w-[320px]
        overflow-hidden
      `}
      style={{
        animation: exiting 
          ? 'slide-out-to-right 0.2s ease-in both' 
          : 'slide-in-from-right 0.5s var(--spring-bounce) both',
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-stretch">
        {/* Accent bar */}
        <div className={`w-1 ${styles.accent} shrink-0`} />

        {/* Icon */}
        <div className={`${styles.iconBg} p-3 flex items-center justify-center shrink-0`}>
          <Icon size={20} className={`${styles.iconColor} stroke-[3px]`} />
        </div>

        {/* Content */}
        <div className="flex-1 p-3 min-w-0 flex items-center">
          <p className={`${styles.textColor} text-sm font-medium leading-tight`}>
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => onDismiss(id)}
          className={`
            px-3
            ${styles.textColor}
            hover:bg-[var(--hover-overlay)]
            transition-colors
            flex items-center justify-center
            border-l border-[var(--border-color)]
          `}
          aria-label="Dismiss notification"
        >
          <X size={16} className="stroke-[3px] opacity-50 hover:opacity-100" />
        </button>
      </div>

      {/* Auto-dismiss countdown bar */}
      <div className="w-full h-[2px] bg-[var(--border-color)]/30">
        <div 
          className={`h-full ${styles.accent} opacity-40`}
          style={{ 
            animation: `toast-countdown ${duration || 4000}ms linear both`,
          }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const timeoutsRef = useRef(new Map());
  const exitTimeoutsRef = useRef(new Map());

  // Final removal — strips the toast from state
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    timeoutsRef.current.delete(id);
    exitTimeoutsRef.current.delete(id);
  }, []);

  // Marks a toast as exiting (triggers slide-out animation),
  // then schedules removal after 200ms for the animation to finish.
  const markToastExiting = useCallback((id) => {
    // Prevent double-exit
    if (exitTimeoutsRef.current.has(id)) return;

    // Clear any pending auto-dismiss timeout so it can't race
    const autoTimeoutId = timeoutsRef.current.get(id);
    if (autoTimeoutId) {
      clearTimeout(autoTimeoutId);
      timeoutsRef.current.delete(id);
    }

    // Set the exiting flag on the toast
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );

    // Remove after exit animation completes
    const exitId = setTimeout(() => removeToast(id), 200);
    exitTimeoutsRef.current.set(id, exitId);
  }, [removeToast]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdRef.current;
    const toast = { id, message, type, duration, exiting: false };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss: initiate the same exit flow after duration
    const timeoutId = setTimeout(() => {
      markToastExiting(id);
    }, duration);
    timeoutsRef.current.set(id, timeoutId);

    return id;
  }, [markToastExiting]);

  const value = {
    showToast,
    dismissToast: markToastExiting,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={markToastExiting} />
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
