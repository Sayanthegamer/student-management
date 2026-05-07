import React, { useState } from 'react';
import { IndianRupee, FileText, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * A memoized functional component that displays a summary card of a student's payment history.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.student - The student object.
 * @param {Function} props.onViewHistory - Callback function when the view history button is clicked.
 * @returns {JSX.Element} The rendered payment card component.
 */
const PaymentCard = React.memo(({ student, onViewHistory }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTotalPaid = (student) => {
    if (!student.feeHistory) return 0;
    return student.feeHistory.reduce((sum, p) => sum + (Number(p.amount) || 0) + (Number(p.fine) || 0), 0);
  };

  const getLastPayment = (student) => {
    if (!student.feeHistory || student.feeHistory.length === 0) return null;
    return student.feeHistory.reduce((latest, p) => p.date > latest.date ? p : latest, student.feeHistory[0]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-4 transition-all duration-200 slide-up group hover:shadow-md hover:border-[var(--accent-primary)]/30">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-[12px] bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center shrink-0">
            <User size={20} className="stroke-[2.5px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[var(--text-primary)] font-bold text-sm truncate leading-tight">{student.name}</p>
            <p className="text-[var(--text-secondary)] font-mono text-[10px] tracking-wider truncate mt-0.5">Roll: {student.rollNo}</p>
          </div>
        </div>
        {student.admissionStatus === 'Exited' && (
          <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold border rounded-[12px] bg-rose-500/10 border-rose-500/20 text-rose-400 shrink-0">
            Exit
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] p-2.5">
          <p className="text-[10px] text-[var(--text-muted)] font-medium mb-1 tracking-wide">Class</p>
          <p className="text-[var(--text-primary)] font-bold tracking-wider text-xs">{student.class} - {student.section}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[12px] p-2.5">
          <p className="text-[10px] text-emerald-400 font-medium mb-1 tracking-wide">Total Paid</p>
          <div className="flex items-center gap-1">
            <IndianRupee size={12} className="text-emerald-400 stroke-[2.5px]" />
            <p className="text-emerald-400 font-bold text-sm tracking-wider">₹{getTotalPaid(student).toLocaleString()}</p>
          </div>
        </div>

        {isExpanded && (() => {
          const lastPayment = getLastPayment(student);
          if (!lastPayment) {
             return (
                 <div className="col-span-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] p-2.5">
                   <p className="text-[10px] text-[var(--text-muted)] font-medium mb-1 tracking-wide">Last Payment</p>
                   <p className="text-[var(--text-secondary)] font-mono text-xs font-semibold">N/A</p>
                 </div>
             );
          }
          return (
             <div className="col-span-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] p-3 flex flex-col justify-center">
                 <div className="flex items-center justify-between mb-1.5">
                     <p className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide">Last Payment</p>
                     <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                         <Calendar size={12} />
                         <span className="font-mono text-[10px]">{formatDate(lastPayment.date)}</span>
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <p className="text-[var(--text-primary)] font-bold text-sm tracking-wider flex items-center"><IndianRupee size={12} className="stroke-[2.5px] mr-0.5" />{Number(lastPayment.amount || 0).toLocaleString()}</p>
                     {Number(lastPayment.fine) > 0 && (
                         <span className="text-[10px] text-rose-400 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded-[4px] border border-rose-500/20">
                             + ₹{Number(lastPayment.fine).toLocaleString()} fine
                         </span>
                     )}
                 </div>
             </div>
          );
        })()}
      </div>

      <div className="flex items-center gap-2">
          <button
            onClick={() => onViewHistory(student)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[var(--accent-primary)] bg-[var(--accent-light)] border border-[var(--accent-primary)]/20 rounded-[12px] hover:bg-[var(--accent-hover)] hover:text-white transition-colors font-semibold text-xs touch-manipulation min-h-[44px]"
            aria-label="View payment history"
          >
            <FileText size={16} className="stroke-[2.5px]" />
            <span className="hidden sm:inline">View History</span>
          </button>

          <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2.5 text-[var(--text-secondary)] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] hover:bg-[var(--bg-card-hover)] transition-colors min-h-[44px] flex items-center justify-center"
              aria-expanded={isExpanded}
              aria-label="Toggle details"
          >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
      </div>
    </div>
  );
});

export default PaymentCard;
