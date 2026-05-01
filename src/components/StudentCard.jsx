import React from 'react';
import { Edit2, IndianRupee, Trash2 } from 'lucide-react';

/**
 * A memoized functional component that displays individual student summary card.
 * Refined with spotlight effects and premium styling.
 */
const StudentCard = React.memo(({ student, status, onEdit, onDelete, onPayFee }) => (
  <div className="card-base p-4 transition-all duration-300 group hover:bg-[var(--bg-card-hover)] spotlight-card relative overflow-hidden">
    {/* Subtle highlight on hover */}
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.02] to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-[var(--accent-primary)]/10 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[var(--accent-primary)]/20">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-primary)] font-semibold text-sm truncate leading-tight tracking-tight">{student.name}</p>
          <p className="text-[var(--text-muted)] text-[10px] font-mono tracking-wider truncate mt-0.5 opacity-60">ID: {student.id.slice(0, 8)}</p>
        </div>
      </div>
      <span
        className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-lg shrink-0 ${
          status === 'Paid' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 
          status === 'Overdue' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 
          'bg-amber-500/10 border border-amber-500/20 text-amber-400'
        }`}
      >
        {status}
      </span>
      {Number(student.concessionAmount) > 0 && (
        <span className="inline-flex items-center px-2 py-1 text-[9px] font-bold rounded-lg shrink-0 bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase tracking-wider font-mono" aria-label={`Concession of rupees ${Number(student.concessionAmount).toLocaleString()}`}>
          -{Number(student.concessionAmount)}
        </span>
      )}
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
      <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-2.5">
        <p className="text-[9px] text-[var(--text-muted)] font-medium mb-1 tracking-wider uppercase">Class</p>
        <p className="text-[var(--text-primary)] font-semibold tracking-tight text-xs">{student.class} - {student.section}</p>
      </div>
      <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-2.5">
        <p className="text-[9px] text-[var(--text-muted)] font-medium mb-1 tracking-wider uppercase">Roll No</p>
        <p className="text-[var(--text-primary)] font-semibold tracking-tight text-xs font-mono">{student.rollNo}</p>
      </div>
    </div>

    <div className="flex items-center gap-2 relative z-10">
      <button
        onClick={() => onPayFee(student)}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400 rounded-xl transition-all duration-200 font-semibold text-xs touch-manipulation min-h-[40px] active:scale-[0.97]"
        aria-label={`Collect fee for ${student.name}`}
      >
        <IndianRupee size={14} />
        <span className="hidden sm:inline">Pay</span>
      </button>
      <button
        onClick={() => onEdit(student)}
        className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-400 rounded-xl transition-all duration-200 touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95"
        aria-label={`Edit record for ${student.name}`}
      >
        <Edit2 size={14} />
      </button>
      <button
        onClick={() => onDelete(student.id)}
        className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 rounded-xl transition-all duration-200 touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95"
        aria-label={`Delete record for ${student.name}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
));

export default StudentCard;