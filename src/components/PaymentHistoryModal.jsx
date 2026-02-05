import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, IndianRupee, FileText } from 'lucide-react';

const PaymentHistoryModal = ({ student, onClose }) => {
    const history = student.feeHistory || [];
    const [isClosing, setIsClosing] = useState(false);

    // Sort history by date (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    return createPortal(
        <div className={`fixed inset-0 bg-black/50 z-50 flex items-start md:items-center p-3 md:p-4 backdrop-blur-sm modal-backdrop safe-area-inset-bottom ${isClosing ? 'closing' : ''}`}>
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[calc(100vh-3rem)] md:max-h-[90vh] mx-auto my-4 md:my-auto flex flex-col overflow-hidden ${isClosing ? 'scale-out' : 'scale-in'}`}>

                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                    <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="text-indigo-600" size={20} />
                            <span className="md:hidden">Payment History</span>
                            <span className="hidden md:inline">Payment History</span>
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                            {student.name} ({student.class}-{student.section})
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700 touch-manipulation"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-3 md:p-6 -webkit-overflow-scrolling-touch">
                    {sortedHistory.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <Calendar size={40} className="md:hidden mx-auto mb-3 opacity-50" />
                            <Calendar size={48} className="hidden md:block mx-auto mb-3 opacity-50" />
                            <p className="text-base md:text-lg font-medium">No payment records found</p>
                            <p className="text-sm">Fee payments will appear here once recorded.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                            {/* Desktop Table View */}
                            <table className="hidden md:table w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="p-4 border-b border-gray-200">Date</th>
                                        <th className="p-4 border-b border-gray-200">Month</th>
                                        <th className="p-4 border-b border-gray-200 text-right">Fee</th>
                                        <th className="p-4 border-b border-gray-200 text-right">Fine</th>
                                        <th className="p-4 border-b border-gray-200 text-right">Total</th>
                                        <th className="p-4 border-b border-gray-200">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sortedHistory.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4 text-gray-700 font-medium">
                                                {new Date(payment.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold border border-indigo-100">
                                                    {payment.month}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-800 text-right">
                                                ₹{Number(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-red-600 text-right font-medium">
                                                {payment.fine > 0 ? `+₹${payment.fine}` : '-'}
                                            </td>
                                            <td className="p-4 text-emerald-600 font-bold text-right">
                                                ₹{(Number(payment.amount) + Number(payment.fine || 0)).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm max-w-[200px] truncate" title={payment.remarks}>
                                                {payment.remarks || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-bold text-gray-800">
                                    <tr>
                                        <td colSpan="2" className="p-4 text-right border-t border-gray-200">Totals:</td>
                                        <td className="p-4 text-right border-t border-gray-200 text-indigo-600">
                                            ₹{sortedHistory.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right border-t border-gray-200 text-red-600">
                                            ₹{sortedHistory.reduce((sum, p) => sum + Number(p.fine || 0), 0).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right border-t border-gray-200 text-emerald-600 text-lg">
                                            ₹{sortedHistory.reduce((sum, p) => sum + Number(p.amount) + Number(p.fine || 0), 0).toLocaleString()}
                                        </td>
                                        <td className="border-t border-gray-200"></td>
                                    </tr>
                                </tfoot>
                            </table>

                            {/* Mobile Card View */}
                            <div className="md:hidden flex flex-col divide-y divide-gray-100">
                                {sortedHistory.map((payment) => (
                                    <div key={payment.id} className="p-3 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-gray-800">{new Date(payment.date).toLocaleDateString()}</p>
                                                <span className="inline-block mt-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold border border-indigo-100">
                                                    {payment.month}
                                                </span>
                                            </div>
                                            <div className="text-right ml-2">
                                                <p className="text-lg font-bold text-emerald-600">
                                                    ₹{(Number(payment.amount) + Number(payment.fine || 0)).toLocaleString()}
                                                </p>
                                                {payment.fine > 0 && (
                                                    <p className="text-xs text-red-500 font-medium">
                                                        +₹{payment.fine} fine
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                                            <span className="text-xs">Fee: ₹{Number(payment.amount).toLocaleString()}</span>
                                            {payment.remarks && (
                                                <span className="italic text-xs max-w-[140px] truncate" title={payment.remarks}>{payment.remarks}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="bg-gray-50 p-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium text-gray-600">Total Fees</span>
                                        <span className="font-bold text-indigo-600 text-sm">₹{sortedHistory.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-medium text-gray-600">Total Fines</span>
                                        <span className="font-bold text-red-600 text-sm">₹{sortedHistory.reduce((sum, p) => sum + Number(p.fine || 0), 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="font-bold text-gray-800 text-sm">Grand Total</span>
                                        <span className="text-lg font-bold text-emerald-600">₹{sortedHistory.reduce((sum, p) => sum + Number(p.amount) + Number(p.fine || 0), 0).toLocaleString()}</span>
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
