import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Calendar, IndianRupee, AlertCircle } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import CustomMonthPicker from './CustomMonthPicker';
import { logActivity } from '../utils/storage';

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

    // Check if student is transferred
    const isTransferred = student.admissionStatus === 'Transferred';

    // Helper to calculate fine for a specific month
    const calculateFineForMonth = (monthStr, payDateStr) => {
        const payDate = new Date(payDateStr);
        const [year, month] = monthStr.split('-').map(Number);
        const deadline = new Date(year, month - 1, 20); // Deadline is 20th of the month

        // If paid on or before deadline, no fine
        if (payDate <= deadline) {
            return 0;
        }

        // Check if paid in the same month after deadline (21st to end of month)
        if (payDate.getFullYear() === year && payDate.getMonth() === month - 1) {
            return 30; // Same month after deadline: 30 rupees
        }

        // Calculate how many months late
        const paymentMonth = new Date(payDate.getFullYear(), payDate.getMonth(), 1);
        const dueMonth = new Date(year, month - 1, 1);

        const monthsDiff = (paymentMonth.getFullYear() - dueMonth.getFullYear()) * 12
            + (paymentMonth.getMonth() - dueMonth.getMonth());

        // Simple fine structure: 50 * number of months late
        return Math.max(0, 50 * monthsDiff);
    };

    // Auto-calculate fine and total when dependencies change
    useEffect(() => {
        if (!paymentDate || !selectedMonth) return;

        // Validation: Check admission date
        if (student.admissionDate) {
            const admMonthStr = student.admissionDate.slice(0, 7);
            if (selectedMonth < admMonthStr) {
                // setError('Payment month cannot be before admission month'); // Uncomment if needed
            } else if (error) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setError('');
            }
        }

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
                calculatedFine += calculateFineForMonth(monthStr, paymentDate);
                current.setMonth(current.getMonth() + 1);
                monthsCount++;
            }
        } else {
            calculatedFine = calculateFineForMonth(selectedMonth, paymentDate);
        }

        setFine(calculatedFine);

        // Calculate Total Payable
        const baseAmount = Number(amount) || 0;
        const total = (baseAmount * monthsCount) + calculatedFine;
        setTotalPayable(total);

    }, [paymentDate, selectedMonth, endMonth, isMultiMonth, student.admissionDate, amount, error]);

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
            let current = new Date(selectedMonth + '-01');
            const end = new Date(endMonth + '-01');

            while (current <= end) {
                const monthStr = current.toISOString().slice(0, 7);
                // Calculate fine for this specific month
                const monthFine = calculateFineForMonth(monthStr, paymentDate);

                onSave(student.id, {
                    date: paymentDate,
                    month: monthStr,
                    amount: Number(amount),
                    fine: monthFine,
                    remarks: remarks
                });

                current.setMonth(current.getMonth() + 1);
            }

            // Log activity for multi-month
            logActivity('fee', `Collected fees from ${student.name} (${selectedMonth} to ${endMonth})`);
        } else {
            // Single month payment
            onSave(student.id, {
                date: paymentDate,
                month: selectedMonth,
                amount: Number(amount),
                fine: Number(fine),
                remarks: remarks
            });

            // Log activity for single month
            logActivity('fee', `Collected fee ₹${amount} from ${student.name} (${selectedMonth})`);
        }

        handleClose();
    };

    return createPortal(
        <div className={`fixed inset-0 bg-slate-900/60 z-50 overflow-y-auto flex items-start md:items-center p-3 md:p-4 modal-backdrop safe-area-inset-bottom ${isClosing ? 'closing' : ''}`}>
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto relative my-4 md:my-auto flex flex-col max-h-[calc(100vh-3rem)] md:max-h-[90vh] ${isClosing ? 'scale-out' : 'scale-in'}`}>

                {/* Header */}
                <div className="bg-slate-50 px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                    <div className="min-w-0">
                        <h3 className="m-0 text-slate-800 text-lg md:text-xl font-bold flex items-center gap-2">
                            <IndianRupee size={20} className="md:hidden text-indigo-600" />
                            <IndianRupee size={22} className="hidden md:block text-indigo-600" />
                            Record Fee Payment
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                            Recording for <span className="font-semibold text-indigo-600">{student.name}</span> ({student.class}-{student.section})
                        </p>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors touch-manipulation">
                        <X size={20} />
                    </button>
                </div>

                {/* Transferred Student Warning */}
                {isTransferred && (
                    <div className="mx-4 md:mx-6 mt-4 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                        <AlertCircle size={18} className="md:hidden text-amber-600 shrink-0 mt-0.5" />
                        <AlertCircle size={20} className="hidden md:block text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-amber-800 font-semibold text-sm">Student Has Transferred</p>
                            <p className="text-amber-700 text-xs mt-1">
                                This student has already been transferred and issued a Transfer Certificate. Recording fee payments may not be appropriate.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

                    {/* Scrollable Content */}
                    <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-y-auto -webkit-overflow-scrolling-touch">
                        {/* Payment Date */}
                        <div>
                            <CustomDatePicker
                                label="Payment Date"
                                value={paymentDate}
                                onChange={setPaymentDate}
                                required
                            />
                        </div>

                        {/* Month Selection */}
                        <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 transition-all">
                            <div className="flex justify-between items-center mb-2 md:mb-3">
                                <label className="text-slate-700 text-sm font-bold flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    {isMultiMonth ? 'Select Duration' : 'Select Month'}
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer select-none group touch-manipulation">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isMultiMonth ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                        {isMultiMonth && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isMultiMonth}
                                        onChange={(e) => setIsMultiMonth(e.target.checked)}
                                        className="hidden"
                                    />
                                    <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">Pay Multiple Months</span>
                                </label>
                            </div>

                            <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:items-center">
                                <div className="w-full md:flex-1">
                                    <CustomMonthPicker
                                        value={selectedMonth}
                                        onChange={setSelectedMonth}
                                        required
                                    />
                                </div>
                                {isMultiMonth && (
                                    <>
                                        <span className="text-slate-400 font-medium text-center hidden md:block">to</span>
                                        <span className="text-slate-400 font-medium text-center md:hidden text-xs uppercase tracking-wider">to</span>
                                        <div className="w-full md:flex-1">
                                            <CustomMonthPicker
                                                value={endMonth}
                                                onChange={setEndMonth}
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 mt-2 text-rose-600 text-xs font-medium bg-rose-50 p-2 rounded">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Financials */}
                        <div className="grid grid-cols-2 gap-3 md:gap-5">
                            <div>
                                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1 md:mb-1.5">Monthly Fee</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-white border border-slate-200 pl-7 pr-4 py-2.5 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-base"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1 md:mb-1.5">Late Fine</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                    <input
                                        type="number"
                                        value={fine}
                                        onChange={(e) => setFine(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 pl-7 pr-4 py-2.5 rounded-lg text-slate-600 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-base"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-1.5">Remarks</label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-base"
                                placeholder="e.g. Cash, UPI, Cheque No..."
                            />
                        </div>

                        {/* Total Amount Display */}
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex justify-between items-center">
                            <div>
                                <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-0.5">Total Payable</p>
                                <p className="text-indigo-900 text-xs opacity-70">Includes fees & fines</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-indigo-700 tracking-tight">
                                    ₹ {totalPayable.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer with Action Button */}
                    <div className="p-3 md:p-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                        <button
                            type="submit"
                            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 md:py-3.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] touch-manipulation min-h-[48px] ${error ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!!error}
                        >
                            <Save size={20} />
                            Confirm Payment
                        </button>
                    </div>

                </form>
            </div>
        </div>,
        document.body
    );
};

export default FeePaymentModal;
