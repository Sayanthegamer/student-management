import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, IndianRupee, FileText } from 'lucide-react';

const PaymentHistoryModal = ({ student, onClose }) => {
    const history = student.feeHistory || [];

    // Sort history by date (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="text-indigo-600" size={24} />
                            Payment History
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {student.name} ({student.class}-{student.section})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6">
                    {sortedHistory.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">No payment records found</p>
                            <p className="text-sm">Fee payments will appear here once recorded.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="p-4 border-b border-gray-200">Date</th>
                                        <th className="p-4 border-b border-gray-200">Month</th>
                                        <th className="p-4 border-b border-gray-200 text-right">Amount</th>
                                        <th className="p-4 border-b border-gray-200 text-right">Fine</th>
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
                                            <td className="p-4 text-gray-800 font-bold text-right">
                                                ₹{Number(payment.amount).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-red-600 text-right font-medium">
                                                {payment.fine > 0 ? `+₹${payment.fine}` : '-'}
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm max-w-[200px] truncate" title={payment.remarks}>
                                                {payment.remarks || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-bold text-gray-800">
                                    <tr>
                                        <td colSpan="2" className="p-4 text-right border-t border-gray-200">Total Paid:</td>
                                        <td className="p-4 text-right border-t border-gray-200 text-indigo-600">
                                            ₹{sortedHistory.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right border-t border-gray-200 text-red-600">
                                            ₹{sortedHistory.reduce((sum, p) => sum + Number(p.fine || 0), 0).toLocaleString()}
                                        </td>
                                        <td className="border-t border-gray-200"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PaymentHistoryModal;
