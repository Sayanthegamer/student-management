import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';

const FeePaymentModal = ({ student, onClose, onSave }) => {
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [isMultiMonth, setIsMultiMonth] = useState(false);
    const [endMonth, setEndMonth] = useState(new Date().toISOString().slice(0, 7));
    const [amount, setAmount] = useState(student.feesAmount || '');
    const [fine, setFine] = useState(0);
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');

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

        const calculateFineForMonth = (monthStr) => {
            const payDate = new Date(paymentDate);
            const [year, month] = monthStr.split('-').map(Number);
            const deadline = new Date(year, month - 1, 10);

            if (payDate > deadline) {
                const diffTime = Math.abs(payDate - deadline);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays * 10;
            }
            return 0;
        };

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
                totalFine += calculateFineForMonth(monthStr);
                current.setMonth(current.getMonth() + 1);
            }
            setFine(totalFine);
        } else {
            setFine(calculateFineForMonth(selectedMonth));
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

                // Calculate fine for this specific month
                const [year, month] = monthStr.split('-').map(Number);
                const deadline = new Date(year, month - 1, 10);
                const payDate = new Date(paymentDate);
                let monthFine = 0;
                if (payDate > deadline) {
                    const diffTime = Math.abs(payDate - deadline);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    monthFine = diffDays * 10;
                }

                payments.push({
                    date: paymentDate,
                    month: monthStr,
                    amount: Number(amount),
                    fine: monthFine,
                    remarks: remarks + ` (Multi-month payment)`
                });
                current.setMonth(current.getMonth() + 1);
            }
            onSave(student.id, payments);
        } else {
            onSave(student.id, {
                date: paymentDate,
                month: selectedMonth,
                amount: Number(amount),
                fine: Number(fine),
                remarks
            });
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto flex flex-col p-5 modal-backdrop">
            <div className="bg-white/95 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl w-full max-w-lg p-6 mx-auto relative my-auto scale-in">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="m-0 text-gray-800 text-lg font-bold">Record Fee Payment</h3>
                    <button onClick={onClose} className="btn bg-transparent p-2 hover:bg-black/5">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-5 p-3 bg-gray-100 rounded-lg">
                    <p className="m-0 mb-1 font-bold text-gray-800">{student.name}</p>
                    <p className="m-0 text-sm text-gray-500">Class: {student.class}-{student.section}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <div>
                        <label>Payment Date</label>
                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label>For Month</label>
                            <label className="text-xs flex items-center gap-1 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={isMultiMonth}
                                    onChange={(e) => setIsMultiMonth(e.target.checked)}
                                />
                                Pay Multiple Months
                            </label>
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            {isMultiMonth && (
                                <>
                                    <span className="self-center text-gray-500">to</span>
                                    <input
                                        type="month"
                                        value={endMonth}
                                        onChange={(e) => setEndMonth(e.target.value)}
                                        className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
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
