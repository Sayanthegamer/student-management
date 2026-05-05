import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, IndianRupee, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import CustomMonthPicker from './CustomMonthPicker';
import { logActivity } from '../utils/storage';
import { calculateFine } from '../utils/constants';

/**
 * Helper to get local date string in YYYY-MM-DD format
 */
const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Helper to get local month string in YYYY-MM format
 */
const getLocalMonthString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

/**
 * High-Frequency Fee Payment Modal - Kinetic Ledger Design
 * Optimized for keyboard-fast entry and one-handed operation
 * Compact layout with instant feedback
 */
const FeePaymentModal = ({ student, onClose, onSave }) => {
    const [paymentDate, setPaymentDate] = useState(getLocalDateString);
    const [selectedMonth, setSelectedMonth] = useState(getLocalMonthString);
    const [isMultiMonth, setIsMultiMonth] = useState(false);
    const [endMonth, setEndMonth] = useState(getLocalMonthString);
    const [tuitionFee, setTuitionFee] = useState(student.tuitionFee || student.feesAmount || '');
    const [smartBoardFee, setSmartBoardFee] = useState(student.smartBoardFee || '');
    const [computerFee, setComputerFee] = useState(student.computerFee || '');
    const [fine, setFine] = useState(0);
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');
    const [totalPayable, setTotalPayable] = useState(0);
    const [isClosing, setIsClosing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Refs for focus management
    const amountRef = useRef(null);
    
    // Refs for timer cleanup to prevent setState after unmount
    const mountedRef = useRef(true);
    const closeTimeoutRef = useRef(null);
    const submitTimeoutRef = useRef(null);
    
    const isTransferred = student.admissionStatus === 'Transferred';

    // Cleanup timers on unmount and manage focus
    useEffect(() => {
        mountedRef.current = true;

        // Save the previously focused element before we move focus
        const previouslyFocusedElement = document.activeElement;

        // Move focus into the dialog for accessibility
        amountRef.current?.focus();
        amountRef.current?.select();

        return () => {
            mountedRef.current = false;
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
            if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);

            // Restore focus to the previously focused element if it still exists
            if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
                previouslyFocusedElement.focus();
            }
        };
    }, []);

    // Close handler with timer tracking
    const doClose = () => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setIsClosing(true);
        closeTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
                onClose();
                setIsClosing(false);
            }
        }, 200);
    };

    // Fine calculation
    useEffect(() => {
        if (!paymentDate || !selectedMonth) return;

        let calculatedFine = 0;
        let monthsCount = 1;

        if (isMultiMonth && endMonth) {
            if (endMonth < selectedMonth) {
                setError('End month cannot be before start month');
                setFine(0);
                setTotalPayable(0);
                return;
            }

            let current = new Date(selectedMonth + '-01');
            const end = new Date(endMonth + '-01');
            monthsCount = 0;

            while (current <= end) {
                const monthStr = getLocalMonthString(current);
                calculatedFine += calculateFine(monthStr, paymentDate);
                current.setMonth(current.getMonth() + 1);
                monthsCount++;
            }
        } else {
            calculatedFine = calculateFine(selectedMonth, paymentDate);
        }

        setError('');
        setFine(calculatedFine);

        const tFee = Number(tuitionFee) || 0;
        const sbFee = Number(smartBoardFee) || 0;
        const cFee = Number(computerFee) || 0;
        const total = ((tFee + sbFee + cFee) * monthsCount) + calculatedFine;
        setTotalPayable(total);

    }, [paymentDate, selectedMonth, endMonth, isMultiMonth, student.admissionDate, tuitionFee, smartBoardFee, computerFee]);

    // Escape key handler - inline to avoid dependency issues
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                doClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);



    // Submitting state to prevent duplicate submissions
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (error) return;
        if (isSubmitting) return;
        
        // Validate amount is numeric and greater than 0
        const numericTuitionFee = Number(tuitionFee) || 0;
        const numericSmartBoardFee = Number(smartBoardFee) || 0;
        const numericComputerFee = Number(computerFee) || 0;

        const totalFees = numericTuitionFee + numericSmartBoardFee + numericComputerFee;

        if (!Number.isFinite(totalFees) || totalFees <= 0) {
            setError('Please enter a valid total fee amount greater than 0');
            return;
        }


        
        setIsSubmitting(true);
        setShowSuccess(true);

        if (isMultiMonth && endMonth) {
            const payments = [];
            let current = new Date(selectedMonth + '-01');
            const end = new Date(endMonth + '-01');

            while (current <= end) {
                const monthStr = getLocalMonthString(current);
                const monthFine = calculateFine(monthStr, paymentDate);

                payments.push({
                    date: paymentDate,
                    month: monthStr,
                    amount: numericTuitionFee + numericSmartBoardFee + numericComputerFee,
                    fine: monthFine,
                    remarks: remarks,
                    itemized_breakdown: {
                        tuition: numericTuitionFee,
                        smartBoard: numericSmartBoardFee,
                        computer: numericComputerFee
                    }
                });

                current.setMonth(current.getMonth() + 1);
            }

            onSave(student.id, payments).then(() => {
                setShowSuccess(false);
                doClose();
                logActivity('fee', `Batch fee collection from ${student.name} (${selectedMonth} to ${endMonth})`);
                if (mountedRef.current) {
                    setIsSubmitting(false);
                }
            }).catch(err => {
                if (mountedRef.current) {
                    setShowSuccess(false);
                    setIsSubmitting(false);
                    setError(err.message || 'Failed to save fee. Please try again.');
                }
            });
        } else {
            onSave(student.id, {
                date: paymentDate,
                month: selectedMonth,
                amount: numericTuitionFee + numericSmartBoardFee + numericComputerFee,
                fine: Number(fine),
                remarks: remarks,
                itemized_breakdown: {
                    tuition: numericTuitionFee,
                    smartBoard: numericSmartBoardFee,
                    computer: numericComputerFee
                }
            }).then(() => {
                setShowSuccess(false);
                doClose();
                logActivity('fee', `Fee ₹${numericTuitionFee + numericSmartBoardFee + numericComputerFee} from ${student.name} (${selectedMonth})`);
                if (mountedRef.current) {
                    setIsSubmitting(false);
                }
            }).catch(err => {
                if (mountedRef.current) {
                    setShowSuccess(false);
                    setIsSubmitting(false);
                    setError(err.message || 'Failed to save fee. Please try again.');
                }
            });
        }

        // Keep success overlay visible while waiting for onSave promise
        // The onSave promise will trigger close once resolved
        setShowSuccess(true);
        setIsSubmitting(true);
    };

    return createPortal(
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="fee-payment-title"
            aria-describedby="fee-payment-desc"
            className={`fixed inset-0 z-50 overflow-y-auto flex items-start md:items-center p-3 md:p-6 modal-backdrop backdrop-blur-md ${isClosing ? 'closing' : ''}`}
            style={{ backgroundColor: 'rgba(2, 2, 3, 0.85)' }}
            onClick={(e) => {
                if (e.target === e.currentTarget) doClose();
            }}
        >
            <div 
                className={`
                    relative w-full max-w-2xl mx-auto my-4 md:my-auto flex flex-col overflow-hidden
                    bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl
                    ${isClosing ? 'scale-95 opacity-0' : 'scale-in'}
                    transition-all duration-300
                `}
            >
                {/* Success overlay */}
                {showSuccess && (
                    <div className="absolute inset-0 bg-emerald-500/10 z-50 flex items-center justify-center kinetic-scale rounded-xl">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} className="text-emerald-400" />
                            </div>
                            <p className="text-emerald-400 font-bold text-lg">Payment Recorded</p>
                            <p className="text-emerald-400/60 text-sm mt-1 font-mono">₹{totalPayable.toLocaleString()}</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="px-6 py-5 text-[var(--text-primary)] relative bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)]">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* Indigo icon badge */}
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-muted)] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/20 relative">
                                <div className="absolute inset-0 rounded-xl bg-[var(--accent-primary)] blur-lg opacity-30" />
                                <IndianRupee size={20} className="text-white relative z-10" />
                            </div>
                            <div>
                                <h3 id="fee-payment-title" className="text-lg font-bold tracking-tight flex items-center gap-2">
                                    Record Payment
                                    <Zap size={14} className="text-[var(--accent-primary)] fill-current" />
                                </h3>
                                <p id="fee-payment-desc" className="text-[var(--text-secondary)] text-xs mt-0.5 font-mono">
                                    {student.name} • {student.class}-{student.section}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={doClose}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Transferred warning */}
                {isTransferred && (
                    <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3">
                        <AlertCircle size={16} className="text-amber-400 shrink-0" />
                        <div className="flex-1">
                            <p className="text-amber-400 font-bold text-xs">Transferred Student</p>
                            <p className="text-amber-400/70 text-[10px] mt-0.5">Verify if payment is appropriate</p>
                        </div>
                    </div>
                )}

                {/* Two-column form */}
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Left column - Date & Month */}
                        <div className="space-y-4">
                            {/* Collection Date */}
                            <div>
                                <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                                    Collection Date
                                </label>
                                <CustomDatePicker
                                    value={paymentDate}
                                    onChange={setPaymentDate}
                                    required
                                />
                            </div>

                            {/* Duration */}
                            <div className="bg-[var(--bg-main)] p-4 rounded-lg border border-[var(--border-subtle)] space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-[var(--text-secondary)]">Duration</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsMultiMonth(!isMultiMonth)}
                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors border ${
                                            isMultiMonth 
                                                ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]/20' 
                                                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'
                                        }`}
                                    >
                                        {isMultiMonth ? 'Multi' : 'Single'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <CustomMonthPicker
                                            value={selectedMonth}
                                            onChange={setSelectedMonth}
                                            required
                                            compact={isMultiMonth}
                                        />
                                    </div>
                                    {isMultiMonth && (
                                        <>
                                            <span className="text-[var(--accent-primary)] font-bold">→</span>
                                            <div className="flex-1">
                                                <CustomMonthPicker
                                                    value={endMonth}
                                                    onChange={setEndMonth}
                                                    required
                                                    compact={true}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                {error && (
                                    <div className="flex items-center gap-2 text-rose-400 text-[10px] font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                                        <AlertCircle size={12} />
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                                    Payment Remarks
                                </label>
                                <input
                                    type="text"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="input-premium w-full py-2.5"
                                    placeholder="UPI / Cash / Card"
                                />
                            </div>
                        </div>

                        {/* Right column - Amount & Total */}
                        <div className="space-y-4">
                            {/* Fees Breakdown */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                                        Tuition Fee (₹)
                                    </label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                        <input
                                            ref={amountRef}
                                            type="number"
                                            value={tuitionFee}
                                            onChange={(e) => setTuitionFee(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-bold focus:border-[var(--accent-primary)] outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                                        Computer Fee (₹)
                                    </label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                        <input
                                            type="number"
                                            value={computerFee}
                                            onChange={(e) => setComputerFee(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-bold focus:border-[var(--accent-primary)] outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                                        Smartboard Fee (₹)
                                    </label>
                                    <div className="relative">
                                        <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                        <input
                                            type="number"
                                            value={smartBoardFee}
                                            onChange={(e) => setSmartBoardFee(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] font-bold focus:border-[var(--accent-primary)] outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>



                            {/* Fine */}
                            <div>
                                <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                                    Late Fine (₹)
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">₹</div>
                                    <input
                                        type="number"
                                        value={fine}
                                        readOnly
                                        className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)] font-bold pointer-events-none"
                                    />
                                </div>
                            </div>

                            {/* Total display */}
                            <div className="bg-gradient-to-br from-[var(--accent-subtle)] to-[var(--accent-light)] border border-[var(--accent-primary)]/20 rounded-lg p-4 text-center relative overflow-hidden">
                                {/* Subtle glow effect */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-[var(--accent-primary)] blur-3xl opacity-10" />
                                
                                <div className="relative">
                                    <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Collection</p>
                                    <span className="text-3xl font-bold text-[var(--accent-primary)] tracking-tight">
                                        ₹{totalPayable.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="px-5 py-4 bg-[var(--bg-sidebar)] border-t border-[var(--border-subtle)]">
                        <button
                            type="submit"
                            disabled={!!error || isSubmitting}
                            className={`
                                w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all
                                ${error || isSubmitting
                                    ? 'bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]' 
                                    : 'btn btn-primary cta-primary'
                                }
                            `}
                        >
                            {error || isSubmitting ? (
                                <>
                                    <AlertCircle size={18} />
                                    {error ? 'Fix errors to continue' : 'Processing...'}
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    <span className="hidden sm:inline">Complete Transaction</span>
                                    <span className="sm:hidden">Pay</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default FeePaymentModal;