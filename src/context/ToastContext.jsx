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
    border: 'border-[#CCFF00]',
    bg: 'bg-[#0a0a0a]',
    iconBg: 'bg-[#CCFF00]',
    iconColor: 'text-black',
    textColor: 'text-white',
    accent: 'bg-[#CCFF00]',
  },
  error: {
    border: 'border-rose-500',
    bg: 'bg-[#0a0a0a]',
    iconBg: 'bg-rose-500',
    iconColor: 'text-black',
    textColor: 'text-white',
    accent: 'bg-rose-500',
  },
  warning: {
    border: 'border-amber-400',
    bg: 'bg-[#0a0a0a]',
    iconBg: 'bg-amber-400',
    iconColor: 'text-black',
    textColor: 'text-white',
    accent: 'bg-amber-400',
  },
  info: {
    border: 'border-white/40',
    bg: 'bg-[#0a0a0a]',
    iconBg: 'bg-white',
    iconColor: 'text-black',
    textColor: 'text-white',
    accent: 'bg-white',
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
  const { message, type, id } = toast;
  const styles = toastStyles[type] || toastStyles.info;
  const Icon = toastIcons[type] || Info;

  return (
    <div
      className={`
        pointer-events-auto
        ${styles.bg}
        border-2 ${styles.border}
        p-0
        flex items-stretch
        shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
        slide-down
        max-w-sm
        w-[calc(100vw-2rem)]
        sm:w-auto
        sm:min-w-[320px]
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Accent bar */}
      <div className={`w-1 ${styles.accent} shrink-0`} />

      {/* Icon */}
      <div className={`${styles.iconBg} p-3 flex items-center justify-center shrink-0`}>
        <Icon size={20} className={`${styles.iconColor} stroke-[3px]`} />
      </div>

      {/* Content */}
      <div className="flex-1 p-3 min-w-0 flex items-center">
        <p className={`${styles.textColor} text-sm font-black uppercase tracking-wide leading-tight`}>
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(id)}
        className={`
          px-3
          ${styles.textColor}
          hover:bg-white/10
          transition-colors
          flex items-center justify-center
          border-l-2 ${styles.border}
        `}
        aria-label="Dismiss notification"
      >
        <X size={16} className="stroke-[3px] opacity-50 hover:opacity-100" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const timeoutsRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    // Clear timeout if exists
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdRef.current;
    const toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss after duration
    const timeoutId = setTimeout(() => {
      dismissToast(id);
    }, duration);
    timeoutsRef.current.set(id, timeoutId);

    return id;
  }, [dismissToast]);

  const value = {
    showToast,
    dismissToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
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
