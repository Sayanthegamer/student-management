import React from 'react';
import { IndianRupee, FileText, Calendar, User } from 'lucide-react';

const PaymentCard = React.memo(({ student, onViewHistory }) => {
  const getTotalPaid = (student) => {
    if (!student.feeHistory) return 0;
    return student.feeHistory.reduce((sum, p) => sum + (Number(p.amount) || 0) + (Number(p.fine) || 0), 0);
  };

  const getLastPaymentDate = (student) => {
    if (!student.feeHistory || student.feeHistory.length === 0) return 'N/A';
    const sorted = [...student.feeHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    return new Date(sorted[0].date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 slide-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
            <User size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-800 font-bold text-base truncate leading-tight">{student.name}</p>
            <p className="text-slate-400 text-xs truncate mt-0.5">Roll: {student.rollNo}</p>
          </div>
        </div>
        {student.admissionStatus === 'Transferred' && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm bg-rose-50 text-rose-700 border-rose-100">
            Exit
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Class Details</p>
          <p className="text-slate-800 font-bold text-sm">Class {student.class} - {student.section}</p>
        </div>
        
        <div className="bg-emerald-50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">Total Paid</p>
          <div className="flex items-center gap-2">
            <IndianRupee size={16} className="text-emerald-600" />
            <p className="text-emerald-800 font-black text-lg">₹{getTotalPaid(student).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Last Payment</p>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <p className="text-slate-700 font-semibold text-sm">{getLastPaymentDate(student)}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => onViewHistory(student)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 transition-colors font-bold text-sm touch-manipulation"
        aria-label="View payment history"
      >
        <FileText size={18} />
        <span>View History</span>
      </button>
    </div>
  );
});

export default PaymentCard;