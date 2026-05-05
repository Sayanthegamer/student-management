import React from 'react';
import { Edit2, IndianRupee, Trash2, Zap } from 'lucide-react';

/**
 * Kinetic Student Card - Mobile-optimized with spotlight effect
 * Refined for high-density display and instant action feedback
 */
const StudentCard = React.memo(({ student, status, onEdit, onDelete, onPayFee, isSelected, onSelect }) => (
  <div className={`card-base p-3 transition-all duration-200 group hover:bg-[var(--bg-card-hover)] spotlight-card relative overflow-hidden ${isSelected ? 'ring-2 ring-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : ''}`}>
    {/* Subtle gradient accent on hover */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[var(--accent-primary)]/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={`mt-1 shrink-0 ${isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--border-strong)]'}`}
        aria-label={isSelected ? "Deselect student" : "Select student"}
        aria-pressed={isSelected}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isSelected ? (
             <path d="M9 11l3 3L22 4" />
          ) : (
             <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          )}
          {isSelected && <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />}
        </svg>
      </button>
      {/* Student avatar with kinetic glow */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div 
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center font-bold text-base shrink-0 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-[var(--accent-primary)]/15"
        >
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-primary)] font-semibold text-sm truncate leading-tight tracking-tight">{student.name}</p>
          <p className="text-[var(--text-muted)] text-[9px] font-mono tracking-wider truncate mt-0.5 opacity-50">#{student.id.slice(0, 6)}</p>
        </div>
      </div>
      
      {/* Status badge */}
      <span
        className={`inline-flex items-center px-2 py-1 text-[9px] font-bold rounded-lg shrink-0 ${
          status === 'Paid' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 
          status === 'Overdue' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 
          'bg-amber-500/10 border border-amber-500/20 text-amber-400'
        }`}
      >
        <Zap size={8} className="mr-1 fill-current" />
        {status}
      </span>
      
      {/* Concession indicator */}
      {Number(student.concessionAmount) > 0 && (
        <span 
            className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono shrink-0" 
            aria-label={`Concession: ₹${Number(student.concessionAmount)}`}
        >
            -{Number(student.concessionAmount)}
        </span>
      )}
    </div>

    {/* Details grid - compact */}
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-md px-2.5 py-2">
        <p className="text-[8px] text-[var(--text-muted)] font-medium mb-0.5 uppercase tracking-wider">Class</p>
        <p className="text-[var(--text-primary)] font-semibold tracking-tight text-xs">{student.class}-{student.section}</p>
      </div>
      <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-md px-2.5 py-2">
        <p className="text-[8px] text-[var(--text-muted)] font-medium mb-0.5 uppercase tracking-wider">Roll</p>
        <p className="text-[var(--text-primary)] font-semibold tracking-tight text-xs font-mono">#{student.rollNo}</p>
      </div>
    </div>

    {/* Quick action buttons */}
    <div className="flex items-center gap-2 relative z-10">
      <button
        onClick={() => onPayFee(student)}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400 rounded-lg transition-all duration-150 font-semibold text-xs touch-target active:scale-[0.98]"
        aria-label={`Collect fee for ${student.name}`}
      >
        <IndianRupee size={13} />
        <span>Pay Fee</span>
      </button>
      <button
        onClick={() => onEdit(student)}
        className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-400 rounded-lg transition-all duration-150 touch-target active:scale-95"
        aria-label={`Edit ${student.name}`}
      >
        <Edit2 size={13} />
      </button>
      <button
        onClick={() => onDelete(student.id)}
        className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 rounded-lg transition-all duration-150 touch-target active:scale-95"
        aria-label={`Delete ${student.name}`}
      >
        <Trash2 size={13} />
      </button>
    </div>
  </div>
));

export default StudentCard;