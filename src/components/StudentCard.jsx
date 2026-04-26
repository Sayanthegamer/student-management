import React from 'react';
import { Edit2, IndianRupee, Trash2 } from 'lucide-react';

const statusStyles = {
  Paid: 'bg-emerald-400 text-black border-emerald-400',
  Pending: 'bg-amber-400 text-black border-amber-400',
  Overdue: 'bg-rose-500 text-black border-rose-500',
};

const StudentCard = React.memo(({ student, status, onEdit, onDelete, onPayFee }) => (
  <div className="bg-[var(--bg-card)] border border-white/20 p-4 transition-all duration-200 slide-up group hover:border-[#CCFF00]">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-11 h-11 bg-[#CCFF00] border border-[#CCFF00] text-black flex items-center justify-center font-medium text-base shrink-0 uppercase">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-medium text-sm  truncate leading-tight">{student.name}</p>
          <p className="text-[var(--text-secondary)] text-[10px] font-mono tracking-wide uppercase truncate mt-0.5">ID: {student.id.slice(0, 8)}</p>
        </div>
      </div>
      <span
        className={`inline-flex items-center px-2.5 py-1 text-[10px] font-medium border  shrink-0 ${statusStyles[status] || statusStyles.Pending}`}
      >
        {status}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
      <div className="bg-[var(--bg-main)] border border-white/10 p-2.5">
        <p className="text-[9px]  text-[var(--text-muted)] font-medium mb-1">Class</p>
        <p className="text-white font-medium uppercase tracking-wider text-xs">{student.class} - {student.section}</p>
      </div>
      <div className="bg-[var(--bg-main)] border border-white/10 p-2.5">
        <p className="text-[9px]  text-[var(--text-muted)] font-medium mb-1">Roll No</p>
        <p className="text-white font-medium uppercase tracking-wider text-xs">{student.rollNo}</p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => onPayFee(student)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black transition-colors font-medium  text-xs touch-manipulation min-h-[44px]"
        aria-label="Collect fee"
      >
        <IndianRupee size={16} className="stroke-[3px]" />
        <span className="hidden sm:inline">Pay</span>
      </button>
      <button
        onClick={() => onEdit(student)}
        className="p-2.5 border border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Edit student"
      >
        <Edit2 size={16} className="stroke-[3px]" />
      </button>
      <button
        onClick={() => onDelete(student.id)}
        className="p-2.5 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-black transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Delete student"
      >
        <Trash2 size={16} className="stroke-[3px]" />
      </button>
    </div>
  </div>
));

export default StudentCard;
