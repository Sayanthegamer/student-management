import React from 'react';
import { Calendar } from 'lucide-react';

const PaymentHistoryTable = ({ initialData }) => {
    if (!initialData || !Array.isArray(initialData.feeHistory) || initialData.feeHistory.length === 0) return null;

    return (
        <div className="bg-[var(--bg-card)] p-6 md:p-8 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-6">
                <Calendar size={18} className="text-[var(--accent-primary)]" />
                <h3 className="font-medium text-[var(--text-primary)] text-base">Recent Payment History</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-[var(--border-color)]">
                    <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Type</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Date</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Month</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Amount</th>
                            <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Fine</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
                        {initialData.feeHistory.slice(-5).reverse().map((payment) => {
                            const displayType = payment.type === 'Admission' ? 'Admission' : payment.type === 'Promotion' ? 'Promotion' : 'Monthly';
                            return (
                            <tr key={payment.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                                <td className="px-6 py-4 text-sm">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] border uppercase tracking-wider ${
                                        displayType === 'Admission' 
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                            : displayType === 'Promotion'
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {displayType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[var(--text-primary)] font-medium text-sm">{payment.date}</td>
                                <td className="px-6 py-4 text-[var(--text-primary)] font-medium text-sm">{payment.month || '—'}</td>
                                <td className="px-6 py-4 text-[var(--color-positive)] font-bold text-sm">₹{payment.amount}</td>
                                <td className={`px-6 py-4 text-sm ${payment.fine > 0 ? 'text-[var(--color-negative)] font-bold' : 'text-[var(--text-muted)] font-normal'}`}>{payment.fine > 0 ? `₹${payment.fine}` : '—'}</td>
                            </tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentHistoryTable;
