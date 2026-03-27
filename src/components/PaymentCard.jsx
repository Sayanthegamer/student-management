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
    <div className="bg-[#0a0a0a] border-2 border-white/20 p-4 transition-all duration-200 slide-up group hover:border-[#CCFF00]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 bg-[#CCFF00] text-black border-2 border-[#CCFF00] flex items-center justify-center shrink-0">
            <User size={20} className="stroke-[3px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-black uppercase tracking-widest text-sm truncate leading-tight">{student.name}</p>
            <p className="text-white/50 font-mono text-[10px] uppercase tracking-wider truncate mt-0.5">Roll: {student.rollNo}</p>
          </div>
        </div>
        {student.admissionStatus === 'Transferred' && (
          <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-black border uppercase tracking-widest bg-rose-500 text-black border-rose-500 shrink-0">
            Exit
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="bg-[#050505] border border-white/10 p-2.5">
          <p className="text-[9px] uppercase tracking-widest text-white/40 font-black mb-1">Class</p>
          <p className="text-white font-black uppercase tracking-wider text-xs">{student.class} - {student.section}</p>
        </div>
        <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/30 p-2.5">
          <p className="text-[9px] uppercase tracking-widest text-[#CCFF00] font-black mb-1">Total Paid</p>
          <div className="flex items-center gap-1">
            <IndianRupee size={12} className="text-[#CCFF00] stroke-[3px]" />
            <p className="text-[#CCFF00] font-black text-sm tracking-wider">₹{getTotalPaid(student).toLocaleString()}</p>
          </div>
        </div>
        <div className="col-span-2 bg-[#050505] border border-white/10 p-2.5">
          <p className="text-[9px] uppercase tracking-widest text-white/40 font-black mb-1">Last Payment</p>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-white/40" />
            <p className="text-white font-mono text-xs">{getLastPaymentDate(student)}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => onViewHistory(student)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[#CCFF00] bg-transparent border-2 border-white/40 hover:border-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors font-black uppercase tracking-widest text-xs touch-manipulation min-h-[44px]"
        aria-label="View payment history"
      >
        <FileText size={16} className="stroke-[3px]" />
        <span className="hidden sm:inline">View History</span>
      </button>
    </div>
  );
});

export default PaymentCard;