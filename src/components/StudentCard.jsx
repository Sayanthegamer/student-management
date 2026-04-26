import React from 'react';
import { Edit2, IndianRupee, Trash2 } from 'lucide-react';


const StudentCard = React.memo(({ student, status, onEdit, onDelete, onPayFee }) => (
  <div className="card-base p-4 transition-all duration-200 slide-up group hover:border-[var(--text-secondary)]">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-11 h-11 rounded-custom-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-[var(--border-color)] flex items-center justify-center font-medium text-base shrink-0 uppercase">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-primary)] font-medium text-sm truncate leading-tight tracking-wide">{student.name}</p>
          <p className="text-[var(--text-secondary)] text-[10px] font-mono tracking-wider truncate mt-0.5">ID: {student.id.slice(0, 8)}</p>
        </div>
      </div>
      <span
        className={`inline-flex items-center px-2.5 py-1 text-[10px] font-medium border rounded-custom-md shrink-0 ${status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}
      >
        {status}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
      <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md p-2.5">
        <p className="text-[9px] text-[var(--text-muted)] font-medium mb-1 tracking-wider">Class</p>
        <p className="text-[var(--text-primary)] font-medium tracking-wider text-xs">{student.class} - {student.section}</p>
      </div>
      <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md p-2.5">
        <p className="text-[9px] text-[var(--text-muted)] font-medium mb-1 tracking-wider">Roll No</p>
        <p className="text-[var(--text-primary)] font-medium tracking-wider text-xs">{student.rollNo}</p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => onPayFee(student)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 rounded-custom-md transition-colors font-medium text-xs touch-manipulation min-h-[40px]"
        aria-label="Collect fee"
      >
        <IndianRupee size={16} />
        <span className="hidden sm:inline">Pay</span>
      </button>
      <button
        onClick={() => onEdit(student)}
        className="p-2 border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 rounded-custom-md transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
        aria-label="Edit student"
      >
        <Edit2 size={16} />
      </button>
      <button
        onClick={() => onDelete(student.id)}
        className="p-2 border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 rounded-custom-md transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
        aria-label="Delete student"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
));

export default StudentCard;
