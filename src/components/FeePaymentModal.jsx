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
            <div className={`bg-[#0a0a0a] rounded-none shadow-none w-full max-w-lg mx-auto relative my-4 md:my-auto flex flex-col overflow-hidden border border-[#CCFF00] ${isClosing ? 'scale-out' : 'scale-in'}`}>

                <div className="bg-[#CCFF00] px-6 py-5 md:py-8 text-black relative overflow-visible">
                    <div className="relative z-10">
                        <h3 className="m-0 text-xl md:text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                            <IndianRupee size={28} className="text-black stroke-[3px]" />
                            Record Fee Payment
                        </h3>
                        <p className="text-black/70 mt-2 text-sm font-mono tracking-wide uppercase">
                            Academic Fee Collection: <span className="text-black font-black">{student.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 md:top-6 md:right-6 text-black border border-black hover:bg-black hover:text-[#CCFF00] p-3 min-h-[48px] min-w-[48px] rounded-none transition-colors z-20 flex items-center justify-center"
                    >
                        <X size={20} className="stroke-[3px]" />
                    </button>
                </div>

                {isTransferred && (
                    <div className="mx-6 mt-6 p-4 bg-[#050505] border border-amber-500 rounded-none flex items-start gap-3">
                        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5 stroke-[3px]" />
                        <div className="flex-1 min-w-0">
                            <p className="text-amber-500 uppercase tracking-widest font-black text-sm">Transferred Student</p>
                            <p className="text-amber-500/70 text-xs mt-1 font-mono tracking-wide">
                                This student has been issued a Transfer Certificate. Please verify if this payment is appropriate.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-5 md:p-8 flex flex-col gap-6 md:gap-8">
                        <CustomDatePicker
                            label="Collection Date"
                            value={paymentDate}
                            onChange={setPaymentDate}
                            required
                        />

                        <div className="space-y-4 bg-[#050505] p-5 rounded-none border border-white/20">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest px-1">Duration</label>
                                <button
                                    type="button"
                                    onClick={() => setIsMultiMonth(!isMultiMonth)}
                                    className={`text-[10px] font-black px-3 py-1.5 rounded-none transition-colors uppercase tracking-widest border ${isMultiMonth ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'border-white/50 text-white/50 hover:border-white hover:text-white bg-transparent'}`}
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
                                        <span className="text-[#CCFF00] font-black">→</span>
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
                                <div className="flex items-center gap-2 mt-2 text-rose-500 text-[10px] font-black bg-rose-500/10 p-2 border border-rose-500/30 uppercase tracking-widest">
                                    <AlertCircle size={14} className="stroke-[3px]" />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest px-1">Base Amount (₹)</label>
                                <div className="relative">
                                    <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 stroke-[3px]" />
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-[#050505] border border-white/20 rounded-none text-white font-black uppercase tracking-widest focus:border-[#CCFF00] outline-none transition-colors text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest px-1">Late Fine (₹)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-black">₹</div>
                                    <input
                                        type="number"
                                        value={fine}
                                        readOnly
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-none text-white/50 font-black uppercase tracking-widest outline-none text-sm pointer-events-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest px-1">Payment Remarks</label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full px-4 py-4 bg-[#050505] border border-white/20 rounded-none text-white font-black uppercase tracking-widest focus:border-[#CCFF00] outline-none transition-colors text-sm placeholder:text-white/20"
                                placeholder="E.G. UPI ID OR CASH"
                            />
                        </div>

                        <div className="bg-transparent border-t border-b border-white/20 py-6 text-white flex justify-between items-center mt-2">
                            <div>
                                <p className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest">Total Collection</p>
                                <p className="text-xs font-mono tracking-wide text-white/70 mt-0.5 uppercase">Automated settlement</p>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-black uppercase tracking-widest text-[#CCFF00]">
                                    ₹{totalPayable.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-6 bg-transparent">
                        <button
                            type="submit"
                            disabled={!!error}
                            className={`w-full bg-[#CCFF00] border border-[#CCFF00] hover:bg-white hover:border-white text-black font-black uppercase tracking-widest py-5 rounded-none transition-colors flex items-center justify-center gap-3 group ${error ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                        >
                            <CheckCircle2 size={24} className="stroke-[3px] group-hover:scale-110 transition-transform" />
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
