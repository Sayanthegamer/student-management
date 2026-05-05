import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, IndianRupee } from 'lucide-react';

const EditFeeModal = ({ payment, student, allStudents, onSave, onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    
    // Form state
    const [amount, setAmount] = useState(payment.amount || 0);
    const [fine, setFine] = useState(payment.fine || 0);
    const [date, setDate] = useState(payment.date || '');
    const [type, setType] = useState(payment.type || 'Monthly');
    const [month, setMonth] = useState(payment.month || '');
    const [selectedStudentId, setSelectedStudentId] = useState(student.id);
    const modalRef = useRef(null);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 200);
    }, [onClose]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            } else if (e.key === 'Tab') {
                if (!modalRef.current) return;

                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Focus first element on open
        if (modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                 focusableElements[0].focus();
            }
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const updatedFee = {
            ...payment,
            amount: Number(amount),
            fine: Number(fine),
            date,
            type,
            month: type === 'Monthly' ? month : null,
        };

        await onSave(student.id, selectedStudentId, updatedFee);
        handleClose();
    };

    return createPortal(
        <div 
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-fee-title"
            className={`fixed inset-0 bg-slate-900/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm ${isClosing ? 'closing' : ''}`}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
            <div className={`bg-[var(--bg-card)] rounded-[16px] shadow-lg w-full max-w-md overflow-hidden border border-[var(--border-color)] ${isClosing ? 'scale-out' : 'scale-in'}`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                    <h3 id="edit-fee-title" className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                        <IndianRupee className="text-[var(--accent-primary)]" size={20} />
                        Edit Transaction
                    </h3>
                    <button onClick={handleClose} className="p-2 hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Assigned Student</label>
                        <select 
                            value={selectedStudentId} 
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[10px] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-primary)] outline-none"
                            required
                        >
                            {allStudents.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.class}-{s.section})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
                            <select 
                                value={type} 
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[10px] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-primary)] outline-none"
                                required
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Admission">Admission</option>
                                <option value="Promotion">Promotion</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date</label>
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[10px] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-primary)] outline-none"
                                required
                            />
                        </div>
                    </div>

                    {type === 'Monthly' && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Fee Month</label>
                            <input 
                                type="month" 
                                value={month} 
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[10px] px-3 py-2 text-[var(--text-primary)] focus:border-[var(--accent-primary)] outline-none"
                                required={type === 'Monthly'}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Base Amount (₹)</label>
                            <input 
                                type="number" 
                                min="0"
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[10px] px-3 py-2 text-[var(--text-primary)] font-mono focus:border-[var(--accent-primary)] outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Fine (₹)</label>
                            <input 
                                type="number" 
                                min="0"
                                value={fine} 
                                onChange={(e) => setFine(e.target.value)}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[10px] px-3 py-2 text-[var(--text-primary)] font-mono focus:border-[var(--accent-primary)] outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-color)] flex justify-end gap-3 mt-6">
                        <button 
                            type="button" 
                            onClick={handleClose}
                            className="px-4 py-2 rounded-[10px] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-main)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 rounded-[10px] bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-2 shadow-sm shadow-[var(--accent-primary)]/20"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EditFeeModal;
