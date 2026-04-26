import React from 'react';
import { Edit2, IndianRupee, Trash2 } from 'lucide-react';

/**
 * A memoized functional component that displays individual student summary card.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.student - The student object to display.
 * @param {string} props.status - The calculated fee status for the student ('Paid', 'Pending', 'Overdue').
 * @param {Function} props.onEdit - Callback function when the edit button is clicked.
 * @param {Function} props.onDelete - Callback function when the delete button is clicked.
 * @param {Function} props.onPayFee - Callback function when the pay fee button is clicked.
 * @returns {JSX.Element} The rendered student card component.
 */
const StudentCard = React.memo(({ student, status, onEdit, onDelete, onPayFee }) => (
  <div className="card-base p-4 transition-all duration-300 group hover:border-[var(--border-highlight)] hover:-translate-y-0.5 glow-accent">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-11 h-11 rounded-[12px] bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center font-bold text-lg shrink-0 uppercase shadow-sm shadow-[var(--accent-primary)]/10 transition-shadow duration-300 group-hover:shadow-md group-hover:shadow-[var(--accent-primary)]/20">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-primary)] font-medium text-sm truncate leading-tight tracking-wide">{student.name}</p>
          <p className="text-[var(--text-muted)] text-[10px] font-mono tracking-wider truncate mt-0.5">ID: {student.id.slice(0, 8)}</p>
        </div>
      </div>
      <span
        className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold border rounded-[12px] shrink-0 ${status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}
      >
        {status}
      </span>
      {Number(student.concessionAmount) > 0 && (
        <span className="inline-flex items-center px-2 py-1 text-[9px] font-bold border rounded-[12px] shrink-0 bg-purple-500/10 border-purple-500/20 text-purple-400 uppercase tracking-wider" aria-label={`Concession of rupees ${Number(student.concessionAmount).toLocaleString()}`}>
          Concession • ₹{Number(student.concessionAmount).toLocaleString()}
        </span>
      )}
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
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400 rounded-[12px] transition-all duration-200 font-semibold text-xs touch-manipulation min-h-[40px] active:scale-[0.97]"
        aria-label="Collect fee"
      >
        <IndianRupee size={16} />
        <span className="hidden sm:inline">Pay</span>
      </button>
      <button
        onClick={() => onEdit(student)}
        className="p-2 border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-400 rounded-[12px] transition-all duration-200 touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-[0.95]"
        aria-label="Edit student"
      >
        <Edit2 size={16} />
      </button>
      <button
        onClick={() => onDelete(student.id)}
        className="p-2 border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 rounded-[12px] transition-all duration-200 touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-[0.95]"
        aria-label="Delete student"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
));

export default StudentCard;
