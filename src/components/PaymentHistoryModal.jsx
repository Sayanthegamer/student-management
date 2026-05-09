import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, IndianRupee, FileText, Edit2 } from 'lucide-react';
import EditFeeModal from './EditFeeModal';

/**
 * Modal component to display the detailed payment history for a specific student.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.student - The student object whose history is to be displayed.
 * @param {Object[]} props.allStudents - All students in the system.
 * @param {Function} props.onEditFee - Callback function to edit a fee.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @returns {JSX.Element} The rendered payment history modal component.
 */
const PaymentHistoryModal = ({ student, allStudents, onEditFee, onClose }) => {
    const history = student.feeHistory || [];
    const [isClosing, setIsClosing] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const dialogRef = useRef(null);
    const previousActiveElementRef = useRef(null);

    // ⚡ Bolt Optimization: Memoize the sorted history to prevent O(N log N) sorting on every render
    const sortedHistory = useMemo(() => {
        return [...history].sort((a, b) => b.date.localeCompare(a.date));
    }, [history]);

    // ⚡ Bolt Optimization: Memoize the total calculation to prevent O(N) reduction on every render
    const totalPaid = useMemo(() => {
        return history.reduce((sum, p) => sum + Number(p.amount) + Number(p.fine || 0), 0);
    }, [history]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    const handleEditClick = (payment) => {
        setEditingPayment(payment);
    };

    // Focus trap and keyboard handling
    useEffect(() => {
        // Save previously focused element
        previousActiveElementRef.current = document.activeElement;

        // Focus the first focusable element inside the dialog
        if (dialogRef.current) {
            const focusableElements = dialogRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }

        // Keyboard handler for focus trap and Escape key
        const handleKeyDown = (e) => {
            if (!dialogRef.current) return;

            // Handle Escape key
            if (e.key === 'Escape') {
                if (editingPayment) {
                    setEditingPayment(null);
                } else {
                    handleClose();
                }
                return;
            }

            // Handle Tab key for focus trap
            if (e.key === 'Tab') {
                const focusableElements = dialogRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        if (dialogRef.current) {
            dialogRef.current.addEventListener('keydown', handleKeyDown);
        }

        // Cleanup: restore focus and remove event listener
        return () => {
            if (dialogRef.current) {
                dialogRef.current.removeEventListener('keydown', handleKeyDown);
            }
            if (previousActiveElementRef.current) {
                previousActiveElementRef.current.focus();
            }
        };
    }, [editingPayment]);

    return createPortal(
        <div 
            className={`fixed inset-0 bg-slate-900/80 z-50 flex items-start md:items-center p-3 md:p-4 backdrop-blur-sm modal-backdrop safe-area-inset-bottom ${isClosing ? 'closing' : ''}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div ref={dialogRef} className={`bg-[var(--bg-main)] rounded-[16px] shadow-lg w-full max-w-2xl max-h-[100dvh] md:max-h-[90vh] mx-auto my-4 md:my-auto flex flex-col overflow-hidden border border-[var(--border-color)] ${isClosing ? 'scale-out' : 'scale-in'}`} role="dialog" aria-modal="true" aria-labelledby="payment-ledger-title" aria-describedby="payment-ledger-desc">

                <div className="bg-[var(--bg-card)] px-4 md:px-6 py-5 md:py-6 text-[var(--text-primary)] relative flex-shrink-0 border-b border-[var(--border-color)]">
                    <div className="relative z-10 pr-12">
                        <h3 id="payment-ledger-title" className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3 break-words leading-tight">
                            <FileText className="text-[var(--accent-primary)] stroke-[2.5px] shrink-0" size={24} />
                            Payment Ledger
                        </h3>
                        <p id="payment-ledger-desc" className="text-[var(--text-secondary)] mt-2 text-xs sm:text-sm leading-tight">
                            Beneficiary: <span className="text-[var(--text-primary)] font-bold">{student.name}</span> <br className="sm:hidden" /> <span className="hidden sm:inline">—</span> {student.class}-{student.section}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        aria-label="Close payment ledger"
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 min-h-[40px] min-w-[40px] bg-transparent border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] text-[var(--text-secondary)] rounded-[12px] transition-colors z-20 flex items-center justify-center shrink-0"
                    >
                        <X size={20} className="stroke-[2.5px]" />
                    </button>
                </div>

                <div className="overflow-y-auto min-h-0 p-4 md:p-8 flex-1 bg-[var(--bg-main)]">
                    {sortedHistory.length === 0 ? (
                        <div className="text-center py-20 bg-[var(--bg-card)] rounded-[12px] border border-[var(--border-color)]">
                            <Calendar size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
                            <p className="text-[var(--text-secondary)] font-medium text-sm">No transactions recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-[12px] border border-[var(--border-color)] shadow-sm bg-[var(--bg-card)]">
                            <table className="hidden md:table w-full text-left border-collapse">
                                <thead className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-[10px] font-bold tracking-wider uppercase border-b border-[var(--border-color)]">
                                    <tr>
                                        <th className="px-5 py-4 border-b border-[var(--border-color)]">Type</th>
                                        <th className="px-5 py-4 border-b border-[var(--border-color)]">Date</th>
                                        <th className="px-5 py-4 border-b border-[var(--border-color)]">Period</th>
                                        <th className="px-5 py-4 border-b border-[var(--border-color)] text-right">Base</th>
                                        <th className="px-5 py-4 border-b border-[var(--border-color)] text-right">Fine</th>
                                        <th className="px-5 py-4 border-b border-[var(--border-color)] text-right">Total</th>
                                        <th className="px-5 py-4 border-b border-[var(--border-color)] text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]">
                                    {sortedHistory.map((payment) => {
                                        const displayType = payment.type === 'Admission' ? 'Admission' : payment.type === 'Promotion' ? 'Promotion' : 'Monthly';
                                        return (
                                        <tr key={payment.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                                            <td className="px-5 py-5">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-[6px] border uppercase tracking-wider ${
                                                    displayType === 'Admission'
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        : displayType === 'Promotion'
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {displayType}
                                                </span>
                                            </td>
                                            <td className="px-5 py-5 text-[var(--text-primary)] font-semibold text-sm">
                                                {new Date(payment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-5">
                                                {payment.month ? (
                                                    <span className="bg-[var(--accent-light)] text-[var(--accent-primary)] px-2 py-1 rounded-[8px] text-[10px] font-bold border border-[var(--accent-primary)]/20">
                                                        {payment.month}
                                                    </span>
                                                ) : (
                                                    <span className="text-[var(--text-muted)] text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-5 text-[var(--text-primary)] font-mono font-semibold text-right text-sm">
                                                ₹{Number(payment.amount).toLocaleString()}
                                                {payment.itemized_breakdown && Object.keys(payment.itemized_breakdown).length > 0 && (
                                                    <div className="text-[10px] text-[var(--text-muted)] font-sans font-normal mt-1 flex flex-col items-end gap-0.5 opacity-80">
                                                        {Number(payment.itemized_breakdown.tuition) > 0 && <span>Tuition: ₹{payment.itemized_breakdown.tuition}</span>}
                                                        {Number(payment.itemized_breakdown.smartBoard) > 0 && <span>SmartBoard: ₹{payment.itemized_breakdown.smartBoard}</span>}
                                                        {Number(payment.itemized_breakdown.computer) > 0 && <span>Computer: ₹{payment.itemized_breakdown.computer}</span>}
                                                        {Number(payment.itemized_breakdown.admission) > 0 && <span>Admission: ₹{payment.itemized_breakdown.admission}</span>}
                                                        {payment.itemized_breakdown.annual && Object.keys(payment.itemized_breakdown.annual).length > 0 && <span>Annual: ₹{Object.values(payment.itemized_breakdown.annual).reduce((a,b)=>a+Number(b),0)}</span>}
                                                        {payment.itemized_breakdown.subsidiary && Object.keys(payment.itemized_breakdown.subsidiary).length > 0 && <span>Subsidiary: ₹{Object.values(payment.itemized_breakdown.subsidiary).reduce((a,b)=>a+Number(b),0)}</span>}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-5 text-[var(--color-negative)] text-right font-mono font-bold text-sm">
                                                {payment.fine > 0 ? `₹${payment.fine}` : '—'}
                                            </td>
                                            <td className="px-5 py-5 text-[var(--color-positive)] font-bold text-right text-sm">
                                                ₹{(Number(payment.amount) + Number(payment.fine || 0)).toLocaleString()}
                                            </td>
                                            <td className="px-5 py-5 text-center">
                                                <button
                                                    onClick={() => handleEditClick(payment)}
                                                    className="p-2 hover:bg-[var(--bg-main)] text-[var(--accent-primary)] rounded-[8px] transition-colors border border-transparent hover:border-[var(--accent-primary)]/20"
                                                    title="Edit transaction"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                    })}
                                </tbody>
                                <tfoot className="bg-[var(--bg-main)] text-[var(--text-primary)] border-t border-[var(--border-color)] font-medium">
                                    <tr>
                                        <td colSpan="5" className="px-5 py-5 text-right text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">Cumulative Settlement:</td>
                                        <td className="px-5 py-5 text-right text-lg font-bold text-[var(--color-positive)]">
                                            ₹{totalPaid.toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="md:hidden flex flex-col divide-y divide-[var(--border-color)]">
                                {sortedHistory.map((payment) => {
                                    const displayType = payment.type === 'Admission' ? 'Admission' : payment.type === 'Promotion' ? 'Promotion' : 'Monthly';
                                    return (
                                    <div key={payment.id} className="p-5 bg-[var(--bg-card)]">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] border uppercase tracking-wider ${
                                                        displayType === 'Admission'
                                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                            : displayType === 'Promotion'
                                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                        {displayType}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">{new Date(payment.date).toLocaleDateString()}</p>
                                                {payment.month && (
                                                    <div className="mt-3">
                                                        <span className="inline-block bg-[var(--accent-light)] text-[var(--accent-primary)] px-2 py-1 rounded-[8px] text-[10px] font-bold border border-[var(--accent-primary)]/20">
                                                            {payment.month}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <p className="text-base font-bold text-[var(--color-positive)]">
                                                    ₹{(Number(payment.amount) + Number(payment.fine || 0)).toLocaleString()}
                                                </p>
                                                {payment.itemized_breakdown && Object.keys(payment.itemized_breakdown).length > 0 && (
                                                    <div className="text-[10px] text-[var(--text-muted)] font-sans font-normal mt-1 flex flex-col items-end gap-0.5 opacity-80">
                                                        {Number(payment.itemized_breakdown.tuition) > 0 && <span>Tuition: ₹{payment.itemized_breakdown.tuition}</span>}
                                                        {Number(payment.itemized_breakdown.smartBoard) > 0 && <span>SmartBoard: ₹{payment.itemized_breakdown.smartBoard}</span>}
                                                        {Number(payment.itemized_breakdown.computer) > 0 && <span>Computer: ₹{payment.itemized_breakdown.computer}</span>}
                                                        {Number(payment.itemized_breakdown.admission) > 0 && <span>Admission: ₹{payment.itemized_breakdown.admission}</span>}
                                                        {payment.itemized_breakdown.annual && Object.keys(payment.itemized_breakdown.annual).length > 0 && <span>Annual: ₹{Object.values(payment.itemized_breakdown.annual).reduce((a,b)=>a+Number(b),0)}</span>}
                                                        {payment.itemized_breakdown.subsidiary && Object.keys(payment.itemized_breakdown.subsidiary).length > 0 && <span>Subsidiary: ₹{Object.values(payment.itemized_breakdown.subsidiary).reduce((a,b)=>a+Number(b),0)}</span>}
                                                    </div>
                                                )}
                                                {payment.fine > 0 && (
                                                    <p className="text-xs text-[var(--color-negative)] font-medium mt-1 bg-rose-500/10 px-2 py-0.5 rounded-[6px] inline-block">
                                                        Incl. ₹{payment.fine} fine
                                                    </p>
                                                )}
                                                <button
                                                    onClick={() => handleEditClick(payment)}
                                                    className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[8px] text-[var(--accent-primary)] text-xs font-bold hover:bg-[var(--accent-light)] transition-colors"
                                                >
                                                    <Edit2 size={12} />
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                                })}
                                <div className="bg-[var(--bg-main)] p-5 text-[var(--text-primary)] border-t border-[var(--border-color)]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-[var(--text-secondary)]">Grand Total Paid</span>
                                        <span className="text-xl font-bold text-[var(--color-positive)]">₹{totalPaid.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {editingPayment && (
                <EditFeeModal
                    payment={editingPayment}
                    student={student}
                    allStudents={allStudents}
                    onSave={onEditFee}
                    onClose={() => setEditingPayment(null)}
                />
            )}
        </div>,
        document.body
    );
};

export default PaymentHistoryModal;
