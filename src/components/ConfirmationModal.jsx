import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, X } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const closeTimeoutRef = useRef(null);
    const previousFocusRef = useRef(null);
    const cancelBtnRef = useRef(null);
    const confirmBtnRef = useRef(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    // Focus management on open/close
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            // Focus cancel button by default for safety
            if (cancelBtnRef.current) cancelBtnRef.current.focus();
        } else if (!isClosing && previousFocusRef.current) {
            previousFocusRef.current.focus();
        }
    }, [isOpen, isClosing]);

    const doClose = useCallback(() => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setIsClosing(true);
        closeTimeoutRef.current = setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300); // matches the duration of the transition
    }, [onClose]);

    // Escape key handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                doClose();
            }
            // Basic focus trapping for Tab
            if (e.key === 'Tab' && isOpen) {
                if (e.shiftKey && document.activeElement === cancelBtnRef.current) {
                    e.preventDefault();
                    confirmBtnRef.current?.focus();
                } else if (!e.shiftKey && document.activeElement === confirmBtnRef.current) {
                    e.preventDefault();
                    cancelBtnRef.current?.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, doClose]);

    if (!isOpen && !isClosing) return null;

    const handleConfirm = () => {
        onConfirm();
        doClose();
    };

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop backdrop-blur-md ${isClosing ? 'closing' : ''}`}
            style={{ backgroundColor: 'rgba(2, 2, 3, 0.85)' }}
            onClick={(e) => {
                if (e.target === e.currentTarget) doClose();
            }}
        >
            <div
                className={`
                    relative w-full max-w-sm overflow-hidden
                    bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl
                    ${isClosing ? 'scale-95 opacity-0' : 'scale-in'}
                    transition-all duration-300
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDestructive ? 'bg-rose-500/10 text-rose-500' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'}`}>
                            {isDestructive ? <AlertTriangle size={20} /> : <Info size={20} />}
                        </div>
                        <h2 id="confirm-modal-title" className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={doClose}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 py-6">
                    <p id="confirm-modal-desc" className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 bg-[var(--bg-sidebar)] border-t border-[var(--border-subtle)] flex justify-end gap-3">
                    <button
                        ref={cancelBtnRef}
                        onClick={doClose}
                        className="btn btn-secondary text-sm font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        ref={confirmBtnRef}
                        onClick={handleConfirm}
                        className={`text-sm font-bold ${isDestructive ? 'btn btn-danger' : 'btn btn-primary cta-primary'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
