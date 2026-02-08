import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, IndianRupee, FileText } from 'lucide-react';

const PaymentHistoryModal = ({ student, onClose }) => {
    const history = student.feeHistory || [];
    const [isClosing, setIsClosing] = useState(false);

    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    return createPortal(
        <div 
            className={`fixed inset-0 bg-slate-900/60 z-50 flex items-start md:items-center p-3 md:p-4 backdrop-blur-sm modal-backdrop safe-area-inset-bottom ${isClosing ? 'closing' : ''}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-3rem)] md:max-h-[90vh] mx-auto my-4 md:my-auto flex flex-col overflow-hidden border border-slate-100 ${isClosing ? 'scale-out' : 'scale-in'}`}>

                <div className="bg-slate-900 px-6 py-5 md:py-8 text-white relative overflow-visible flex-shrink-0">
                    <div className="relative z-10">
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-3">
                            <FileText className="text-indigo-400" size={24} />
                            Payment Ledger
                        </h3>
                        <p className="text-slate-400 mt-2 text-sm font-medium">
                            Beneficiary: <span className="text-white font-bold">{student.name}</span> — {student.class}-{student.section}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-3 min-h-[44px] min-w-[44px] bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-xl transition-all z-20 flex items-center justify-center"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-5 md:p-8 flex-1">
                    {sortedHistory.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Calendar size={48} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No transactions recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
                            <table className="hidden md:table w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-slate-100">Date</th>
                                        <th className="px-4 py-3 border-b border-slate-100">Period</th>
                                        <th className="px-4 py-3 border-b border-slate-100 text-right">Base</th>
                                        <th className="px-4 py-3 border-b border-slate-100 text-right">Fine</th>
                                        <th className="px-4 py-3 border-b border-slate-100 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {sortedHistory.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4 text-slate-600 font-bold text-sm">
                                                {new Date(payment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                                                    {payment.month}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-slate-800 font-medium text-right text-sm">
                                                ₹{Number(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-rose-500 text-right font-bold text-sm">
                                                {payment.fine > 0 ? `₹${payment.fine}` : '—'}
                                            </td>
                                            <td className="px-4 py-4 text-emerald-600 font-black text-right text-sm">
                                                ₹{(Number(payment.amount) + Number(payment.fine || 0)).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-900 text-white font-bold">
                                    <tr>
                                        <td colSpan="4" className="px-4 py-4 text-right text-xs uppercase tracking-widest opacity-70">Cumulative Settlement:</td>
                                        <td className="px-4 py-4 text-right text-lg font-black tracking-tight text-emerald-400">
                                            ₹{sortedHistory.reduce((sum, p) => sum + Number(p.amount) + Number(p.fine || 0), 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="md:hidden flex flex-col divide-y divide-slate-50">
                                {sortedHistory.map((payment) => (
                                    <div key={payment.id} className="p-4 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{new Date(payment.date).toLocaleDateString()}</p>
                                                <span className="inline-block mt-2 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                                                    {payment.month}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black text-emerald-600">
                                                    ₹{(Number(payment.amount) + Number(payment.fine || 0)).toLocaleString()}
                                                </p>
                                                {payment.fine > 0 && (
                                                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mt-1">
                                                        Incl. ₹{payment.fine} fine
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="bg-slate-900 p-4 text-white">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Grand Total Paid</span>
                                        <span className="text-xl font-black text-emerald-400 tracking-tight">₹{sortedHistory.reduce((sum, p) => sum + Number(p.amount) + Number(p.fine || 0), 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PaymentHistoryModal;
