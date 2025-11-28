import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import CustomMonthPicker from './CustomMonthPicker';

const FeePaymentModal = ({ student, onClose, onSave }) => {
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [isMultiMonth, setIsMultiMonth] = useState(false);
    const [endMonth, setEndMonth] = useState(new Date().toISOString().slice(0, 7));
    const [amount, setAmount] = useState(student.feesAmount || '');
    const [fine, setFine] = useState(0);
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');

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

    // Auto-calculate fine when date or month changes
    useEffect(() => {
        if (!paymentDate || !selectedMonth) return;

        // Validation: Check admission date
        if (student.admissionDate) {
            const admMonthStr = student.admissionDate.slice(0, 7);
            if (selectedMonth < admMonthStr) {
                // setError('Payment month cannot be before admission month'); // Uncomment if needed
            } else {
                setError('');
            }
        }

        if (isMultiMonth && endMonth) {
            if (endMonth < selectedMonth) {
                setError('End month cannot be before start month');
                setFine(0);
                return;
            }

            let totalFine = 0;
            let current = new Date(selectedMonth + '-01');
            const end = new Date(endMonth + '-01');

            while (current <= end) {
                const monthStr = current.toISOString().slice(0, 7);
                totalFine += calculateFineForMonth(monthStr, paymentDate);
                current.setMonth(current.getMonth() + 1);
            }
            setFine(totalFine);
        } else {
            setFine(calculateFineForMonth(selectedMonth, paymentDate));
        }

    }, [paymentDate, selectedMonth, endMonth, isMultiMonth, student.admissionDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (error) return;

        if (isMultiMonth && endMonth) {
            const payments = [];
            let current = new Date(selectedMonth + '-01');
            const end = new Date(endMonth + '-01');

            while (current <= end) {
                const monthStr = current.toISOString().slice(0, 7);
                const monthFine = calculateFineForMonth(monthStr, paymentDate);

                // Check if it's an advance payment (paid before start of the month)
                const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
                const payDateObj = new Date(paymentDate);
                const isAdvance = payDateObj < monthStart;

                const finalRemarks = remarks + (isAdvance ? ' (Advance)' : '') + ' (Multi-month payment)';

                payments.push({
                    date: paymentDate,
                    month: monthStr,
                    amount: Number(amount),
                    fine: monthFine,
                    remarks: finalRemarks
                });
                current.setMonth(current.getMonth() + 1);
            }
            onSave(student.id, payments);
        } else {
            // Check if it's an advance payment
            const [year, month] = selectedMonth.split('-').map(Number);
            const monthStart = new Date(year, month - 1, 1);
            const payDateObj = new Date(paymentDate);
            const isAdvance = payDateObj < monthStart;

            const finalRemarks = remarks + (isAdvance ? ' (Advance)' : '');

            onSave(student.id, {
                date: paymentDate,
                month: selectedMonth,
                amount: Number(amount),
                fine: Number(fine),
                remarks: finalRemarks
            });
        }
    };

    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    return createPortal(
        <div className={`fixed inset-0 bg-black/50 z-50 overflow-y-auto flex flex-col p-5 modal-backdrop ${isClosing ? 'closing' : ''}`}>
            <div className={`bg-white/95 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl w-full max-w-lg p-6 mx-auto relative my-auto ${isClosing ? 'scale-out' : 'scale-in'}`}>
                <div className="flex justify-between items-center mb-5">
                    <h3 className="m-0 text-gray-800 text-lg font-bold">Record Fee Payment</h3>
                    <button onClick={handleClose} className="btn bg-transparent p-2 hover:bg-black/5">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-5 p-3 bg-gray-100 rounded-lg">
                    <p className="m-0 mb-1 font-bold text-gray-800">{student.name}</p>
                    <p className="m-0 text-sm text-gray-500">Class: {student.class}-{student.section}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <div>
                        <CustomDatePicker
                            label="Payment Date"
                            value={paymentDate}
                            onChange={setPaymentDate}
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-slate-600 text-sm font-medium">For Month</label>
                            <label className="text-xs flex items-center gap-1 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={isMultiMonth}
                                    onChange={(e) => setIsMultiMonth(e.target.checked)}
                                />
                                Pay Multiple Months
                            </label>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="flex-1">
                                <CustomMonthPicker
                                    value={selectedMonth}
                                    onChange={setSelectedMonth}
                                    required
                                />
                            </div>
                            {isMultiMonth && (
                                <>
                                    <span className="self-center text-gray-500 pt-8">to</span>
                                    <div className="flex-1">
                                        <CustomMonthPicker
                                            value={endMonth}
                                            onChange={setEndMonth}
                                            required
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label>Amount (₹) {isMultiMonth ? '/ Month' : ''}</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label>Fine (₹)</label>
                            <input
                                type="number"
                                value={fine}
                                onChange={(e) => setFine(e.target.value)}
                                className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                readOnly
                            />
                        </div>
                    </div>

                    <div>
                        <label>Remarks (Optional)</label>
                        <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Cash / UPI"
                        />
                    </div>

                    <div className="mt-3">
                        <button
                            type="submit"
                            className={`btn btn-primary w-full ${error ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!!error}
                        >
                            <Save size={18} />
                            Save Payment
                        </button>
                    </div>

                </form>
            </div>
        </div>,
        document.body
    );
};

export default FeePaymentModal;
