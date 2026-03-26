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
    <div className="bg-[#050505] border-2 border-white/40 rounded-none p-4 md:p-5 transition-colors duration-200 slide-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-none bg-[#CCFF00] text-black border-2 border-[#CCFF00] flex items-center justify-center font-black text-xl shrink-0">
            <User size={24} className="stroke-[3px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-black uppercase tracking-widest text-lg truncate leading-tight">{student.name}</p>
            <p className="text-white/50 font-mono text-[10px] uppercase tracking-widest truncate mt-1">Roll: {student.rollNo}</p>
          </div>
        </div>
        {student.admissionStatus === 'Transferred' && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-none text-[10px] font-black border uppercase tracking-widest bg-rose-500 text-black border-rose-500">
            Exit
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="bg-[#0a0a0a] border-2 border-white/10 rounded-none p-3 md:p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-1">Class Details</p>
          <p className="text-white font-black uppercase tracking-widest text-sm">Class {student.class} - {student.section}</p>
        </div>
        
        <div className="bg-[#CCFF00]/10 border-2 border-[#CCFF00]/30 rounded-none p-3 md:p-4">
          <p className="text-[10px] uppercase tracking-widest text-[#CCFF00] font-black mb-1">Total Paid</p>
          <div className="flex items-center gap-2">
            <IndianRupee size={16} className="text-[#CCFF00] stroke-[3px]" />
            <p className="text-[#CCFF00] font-black text-lg tracking-widest">₹{getTotalPaid(student).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-[#0a0a0a] border-2 border-white/10 rounded-none p-3 md:p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-1">Last Payment</p>
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-white/50" />
            <p className="text-white font-mono text-sm">{getLastPaymentDate(student)}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => onViewHistory(student)}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 md:py-4 rounded-none text-[#CCFF00] bg-transparent border-2 border-white/40 hover:border-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors font-black uppercase tracking-widest text-sm touch-manipulation min-h-[48px]"
        aria-label="View payment history"
      >
        <FileText size={18} className="stroke-[3px]" />
        <span className="hidden md:inline">View History</span>
      </button>
    </div>
  );
});

export default PaymentCard;