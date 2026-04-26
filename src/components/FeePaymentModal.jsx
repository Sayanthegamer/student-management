import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Calendar, IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import CustomMonthPicker from './CustomMonthPicker';
import { logActivity } from '../utils/storage';
import { calculateFine } from '../utils/constants';

const FeePaymentModal = ({ student, onClose, onSave }) => {
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [isMultiMonth, setIsMultiMonth] = useState(false);
    const [endMonth, setEndMonth] = useState(new Date().toISOString().slice(0, 7));
    const [amount, setAmount] = useState(student.feesAmount || '');
    const [fine, setFine] = useState(0);
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');
    const [totalPayable, setTotalPayable] = useState(0);

    const isTransferred = student.admissionStatus === 'Transferred';

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
                const monthStr = current.toISOString().slice(0, 7);
                calculatedFine += calculateFine(monthStr, paymentDate);
                current.setMonth(current.getMonth() + 1);
                monthsCount++;
            }
        } else {
            calculatedFine = calculateFine(selectedMonth, paymentDate);
        }

        setError('');
        setFine(calculatedFine);

        const baseAmount = Number(amount) || 0;
        const total = (baseAmount * monthsCount) + calculatedFine;
        setTotalPayable(total);

    }, [paymentDate, selectedMonth, endMonth, isMultiMonth, student.admissionDate, amount]);

    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (error) return;

        if (isMultiMonth && endMonth) {
            // Batch all month payments into a single array
            const payments = [];
            let current = new Date(selectedMonth + '-01');
            const end = new Date(endMonth + '-01');

            while (current <= end) {
                const monthStr = current.toISOString().slice(0, 7);
                const monthFine = calculateFine(monthStr, paymentDate);

                payments.push({
                    date: paymentDate,
                    month: monthStr,
                    amount: Number(amount),
                    fine: monthFine,
                    remarks: remarks
                });

                current.setMonth(current.getMonth() + 1);
            }

            // Single batched call instead of loop
            onSave(student.id, payments);
            logActivity('fee', `Collected fees from ${student.name} (${selectedMonth} to ${endMonth})`);
        } else {
            onSave(student.id, {
                date: paymentDate,
                month: selectedMonth,
                amount: Number(amount),
                fine: Number(fine),
                remarks: remarks
            });
            logActivity('fee', `Collected fee ₹${amount} from ${student.name} (${selectedMonth})`);
        }

        handleClose();
    };

    return createPortal(
        <div 
            className={`fixed inset-0 bg-slate-900/80 z-50 overflow-y-auto flex items-start md:items-center p-3 md:p-4 modal-backdrop backdrop-blur-sm ${isClosing ? 'closing' : ''}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className={`bg-[var(--bg-main)] rounded-[16px] shadow-lg w-full max-w-lg mx-auto relative my-4 md:my-auto flex flex-col overflow-hidden border border-[var(--border-color)] ${isClosing ? 'scale-out' : 'scale-in'}`}>

                <div className="bg-[var(--bg-card)] px-6 py-4 md:py-6 text-[var(--text-primary)] relative border-b border-[var(--border-color)]">
                    <div className="relative z-10">
                        <h3 className="m-0 text-xl md:text-2xl font-bold tracking-tight flex items-center gap-3">
                            <IndianRupee size={28} className="text-[var(--accent-primary)] stroke-[2.5px]" />
                            Record Fee Payment
                        </h3>
                        <p className="text-[var(--text-secondary)] mt-2 text-sm">
                            Academic Fee Collection: <span className="text-[var(--text-primary)] font-bold">{student.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 md:top-6 md:right-6 text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] p-2 rounded-[12px] transition-colors z-20 flex items-center justify-center"
                    >
                        <X size={20} className="stroke-[2.5px]" />
                    </button>
                </div>

                {isTransferred && (
                    <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-[12px] flex items-start gap-3">
                        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5 stroke-[2.5px]" />
                        <div className="flex-1 min-w-0">
                            <p className="text-amber-700 font-bold text-sm">Transferred Student</p>
                            <p className="text-amber-600 text-xs mt-1">
                                This student has been issued a Transfer Certificate. Please verify if this payment is appropriate.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-4 md:p-8 flex flex-col gap-6 md:gap-8">
                        <CustomDatePicker
                            label="Collection Date"
                            value={paymentDate}
                            onChange={setPaymentDate}
                            required
                        />

                        <div className="space-y-4 bg-[var(--bg-card)] p-5 rounded-[12px] border border-[var(--border-color)]">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-[var(--text-secondary)] px-1">Duration</label>
                                <button
                                    type="button"
                                    onClick={() => setIsMultiMonth(!isMultiMonth)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-[8px] transition-colors border ${isMultiMonth ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]/20' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] bg-transparent'}`}
                                >
                                    {isMultiMonth ? 'Multi-Month Mode' : 'Switch to Multi-Month'}
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <CustomMonthPicker
                                    value={selectedMonth}
                                    onChange={setSelectedMonth}
                                    required
                                    compact={isMultiMonth}
                                    className="flex-1"
                                />
                                {isMultiMonth && (
                                    <>
                                        <span className="text-[var(--accent-primary)] font-bold">→</span>
                                        <CustomMonthPicker
                                            value={endMonth}
                                            onChange={setEndMonth}
                                            required
                                            compact={true}
                                            className="flex-1"
                                        />
                                    </>
                                )}
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 mt-2 text-rose-600 text-xs font-medium bg-rose-50 p-3 rounded-[8px] border border-rose-100">
                                    <AlertCircle size={14} className="stroke-[2.5px]" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-[var(--text-secondary)] px-1">Base Amount (₹)</label>
                                <div className="relative">
                                    <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] stroke-[2.5px]" />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] text-[var(--text-primary)] font-bold focus:border-[var(--accent-primary)] outline-none transition-colors text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-[var(--text-secondary)] px-1">Late Fine (₹)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">₹</div>
                                    <input
                                        type="number"
                                        value={fine}
                                        readOnly
                                        className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] text-[var(--text-muted)] font-bold outline-none text-sm pointer-events-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[var(--text-secondary)] px-1">Payment Remarks</label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] text-[var(--text-primary)] font-semibold focus:border-[var(--accent-primary)] outline-none transition-colors text-sm placeholder:text-[var(--text-muted)]"
                                placeholder="E.g. UPI ID or Cash"
                            />
                        </div>

                        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] p-5 text-[var(--text-primary)] flex justify-between items-center mt-2">
                            <div>
                                <p className="text-sm font-bold text-[var(--text-secondary)]">Total Collection</p>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">Automated settlement</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-emerald-600 tracking-tight">
                                    ₹{totalPayable.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-6 bg-transparent border-t border-[var(--border-color)]">
                        <button
                            type="submit"
                            disabled={!!error}
                            className={`w-full bg-[var(--accent-primary)] border border-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 md:py-4 rounded-[12px] transition-all flex items-center justify-center gap-2 min-h-[48px] shadow-sm ${error ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                        >
                            <CheckCircle2 size={20} className="stroke-[2.5px]" />
                            <span className="md:hidden">Pay</span>
                            <span className="hidden md:inline">Complete Transaction</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>,
        document.body
    );
};

export default FeePaymentModal;
