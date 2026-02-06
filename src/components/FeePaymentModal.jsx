import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Calendar, IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';
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

    const isTransferred = student.admissionStatus === 'Transferred';

    const calculateFineForMonth = (monthStr, payDateStr) => {
        const payDate = new Date(payDateStr);
        const [year, month] = monthStr.split('-').map(Number);
        const deadline = new Date(year, month - 1, 20);

        if (payDate <= deadline) return 0;

        if (payDate.getFullYear() === year && payDate.getMonth() === month - 1) {
            return 30;
        }

        const paymentMonth = new Date(payDate.getFullYear(), payDate.getMonth(), 1);
        const dueMonth = new Date(year, month - 1, 1);

        const monthsDiff = (paymentMonth.getFullYear() - dueMonth.getFullYear()) * 12
            + (paymentMonth.getMonth() - dueMonth.getMonth());

        return Math.max(0, 50 * monthsDiff);
    };

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
                calculatedFine += calculateFineForMonth(monthStr, paymentDate);
                current.setMonth(current.getMonth() + 1);
                monthsCount++;
            }
        } else {
            calculatedFine = calculateFineForMonth(selectedMonth, paymentDate);
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
            let current = new Date(selectedMonth + '-01');
            const end = new Date(endMonth + '-01');

            while (current <= end) {
                const monthStr = current.toISOString().slice(0, 7);
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
        <div className={`fixed inset-0 bg-slate-900/60 z-50 overflow-y-auto flex items-start md:items-center p-3 md:p-4 modal-backdrop backdrop-blur-sm ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
            <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-auto relative my-4 md:my-auto flex flex-col overflow-hidden border border-slate-100 ${isClosing ? 'scale-out' : 'scale-in'}`} onClick={(e) => e.stopPropagation()}>

                <div className="bg-slate-900 px-6 py-5 md:py-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="m-0 text-xl md:text-2xl font-bold tracking-tight flex items-center gap-3">
                            <IndianRupee size={24} className="text-emerald-400" />
                            Record Fee Payment
                        </h3>
                        <p className="text-slate-400 mt-2 text-sm font-medium">
                            Academic Fee Collection: <span className="text-white font-bold">{student.name}</span>
                        </p>
                    </div>
                    <button onClick={handleClose} className="absolute top-6 right-6 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {isTransferred && (
                    <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-amber-800 font-bold text-sm">Transferred Student</p>
                            <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                                This student has been issued a Transfer Certificate. Please verify if this payment is appropriate.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-4 md:p-8 flex flex-col gap-5 md:gap-6">
                        <CustomDatePicker
                            label="Collection Date"
                            value={paymentDate}
                            onChange={setPaymentDate}
                            required
                        />

                        <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Duration</label>
                                <button
                                    type="button"
                                    onClick={() => setIsMultiMonth(!isMultiMonth)}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all uppercase tracking-wider ${isMultiMonth ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
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
                                        <span className="text-slate-300 font-bold">→</span>
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
                                <div className="flex items-center gap-2 mt-2 text-rose-600 text-[10px] font-bold bg-rose-50 p-2 rounded-lg border border-rose-100 uppercase tracking-wider">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Base Amount (₹)</label>
                                <div className="relative">
                                    <IndianRupee size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Late Fine (₹)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</div>
                                    <input
                                        type="number"
                                        value={fine}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Payment Remarks</label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm"
                                placeholder="e.g. UPI Transaction ID or Cash"
                            />
                        </div>

                        <div className="bg-indigo-600 rounded-2xl p-5 text-white flex justify-between items-center shadow-lg shadow-indigo-600/30">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Collection</p>
                                <p className="text-xs font-medium opacity-90 mt-0.5">Automated settlement</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black tracking-tight">
                                    ₹{totalPayable.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={!!error}
                            className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group ${error ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                        >
                            <CheckCircle2 size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                            Complete Transaction
                        </button>
                    </div>

                </form>
            </div>
        </div>,
        document.body
    );
};

export default FeePaymentModal;
