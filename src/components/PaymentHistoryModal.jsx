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
            className={`fixed inset-0 bg-slate-900/80 z-50 flex items-start md:items-center p-3 md:p-4 backdrop-blur-sm modal-backdrop safe-area-inset-bottom ${isClosing ? 'closing' : ''}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div className={`bg-[#0a0a0a] rounded-none shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] w-full max-w-2xl max-h-[calc(100vh-3rem)] md:max-h-[90vh] mx-auto my-4 md:my-auto flex flex-col overflow-hidden border-2 border-[#CCFF00] ${isClosing ? 'scale-out' : 'scale-in'}`}>

                <div className="bg-[#CCFF00] px-6 py-6 md:py-8 text-black relative flex-shrink-0 border-b border-[#CCFF00]">
                    <div className="relative z-10">
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center gap-4">
                            <FileText className="text-black stroke-[3px]" size={28} />
                            Payment Ledger
                        </h3>
                        <p className="text-black/60 mt-2 text-[10px] font-mono uppercase tracking-widest">
                            Beneficiary: <span className="text-black font-black uppercase tracking-widest text-sm">{student.name}</span> — {student.class}-{student.section}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-3 min-h-[48px] min-w-[48px] bg-transparent border-2 border-black hover:bg-black hover:text-[#CCFF00] text-black rounded-none transition-colors z-20 flex items-center justify-center"
                    >
                        <X size={24} className="stroke-[3px]" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 md:p-8 flex-1 bg-[#0a0a0a]">
                    {sortedHistory.length === 0 ? (
                        <div className="text-center py-20 bg-[#050505] rounded-none border-2 border-white/40">
                            <Calendar size={48} className="mx-auto mb-4 text-white/20 stroke-[1px]" />
                            <p className="text-white/50 font-black uppercase tracking-widest text-sm">No transactions recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-none border-2 border-white/40 shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] bg-[#050505]">
                            <table className="hidden md:table w-full text-left border-collapse">
                                <thead className="bg-[#050505] text-white/50 text-[10px] uppercase tracking-widest font-black border-b border-white/40">
                                    <tr>
                                        <th className="px-5 py-4 border-b border-white/40">Date</th>
                                        <th className="px-5 py-4 border-b border-white/40">Period</th>
                                        <th className="px-5 py-4 border-b border-white/40 text-right">Base</th>
                                        <th className="px-5 py-4 border-b border-white/40 text-right">Fine</th>
                                        <th className="px-5 py-4 border-b border-white/40 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {sortedHistory.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-5 py-5 text-white font-mono text-sm">
                                                {new Date(payment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-5">
                                                <span className="bg-[#CCFF00] text-black px-2 py-1 rounded-none text-[9px] font-black uppercase tracking-widest border-2 border-[#CCFF00]">
                                                    {payment.month}
                                                </span>
                                            </td>
                                            <td className="px-5 py-5 text-white font-mono text-right text-sm">
                                                ₹{Number(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="px-5 py-5 text-rose-500 text-right font-mono font-bold text-sm">
                                                {payment.fine > 0 ? `₹${payment.fine}` : '—'}
                                            </td>
                                            <td className="px-5 py-5 text-[#CCFF00] font-black tracking-widest text-right text-sm">
                                                ₹{(Number(payment.amount) + Number(payment.fine || 0)).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-[#0a0a0a] text-white border-t border-white/40 font-black">
                                    <tr>
                                        <td colSpan="4" className="px-5 py-5 text-right text-[10px] uppercase tracking-widest text-white/50">Cumulative Settlement:</td>
                                        <td className="px-5 py-5 text-right text-lg font-black tracking-widest text-[#CCFF00]">
                                            ₹{sortedHistory.reduce((sum, p) => sum + Number(p.amount) + Number(p.fine || 0), 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="md:hidden flex flex-col divide-y divide-white/10">
                                {sortedHistory.map((payment) => (
                                    <div key={payment.id} className="p-5 bg-transparent">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-mono text-white">{new Date(payment.date).toLocaleDateString()}</p>
                                                <div className="mt-3">
                                                    <span className="inline-block bg-[#CCFF00] text-black px-2 py-1 rounded-none text-[9px] font-black uppercase tracking-widest border-2 border-[#CCFF00]">
                                                        {payment.month}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black tracking-widest text-[#CCFF00]">
                                                    ₹{(Number(payment.amount) + Number(payment.fine || 0)).toLocaleString()}
                                                </p>
                                                {payment.fine > 0 && (
                                                    <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest mt-1">
                                                        Incl. ₹{payment.fine} fine
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="bg-[#0a0a0a] p-5 text-white border-t border-white/40">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Grand Total Paid</span>
                                        <span className="text-xl font-black text-[#CCFF00] tracking-widest">₹{sortedHistory.reduce((sum, p) => sum + Number(p.amount) + Number(p.fine || 0), 0).toLocaleString()}</span>
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
