import React from 'react';
import { UserX, Clock, CheckCircle, XCircle } from 'lucide-react';
import { statusStyles } from '../utils/statusColors';

const statusIcons = {
  Provisional: Clock,
  Confirmed: CheckCircle,
  Cancelled: XCircle,
  Transferred: UserX,
};

const AdmissionCard = React.memo(({ student, onUpdateStatus }) => {
  const status = student.admissionStatus || 'Provisional';
  const StatusIcon = statusIcons[status] || Clock;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-4 transition-all duration-200 slide-up group hover:shadow-md hover:border-[var(--accent-primary)]/30">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 rounded-[12px] flex items-center justify-center font-bold text-base shrink-0">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[var(--text-primary)] font-bold text-sm truncate leading-tight">{student.name}</p>
            <p className="text-[var(--text-secondary)] font-mono text-[10px] tracking-wider truncate mt-0.5">Roll: {student.rollNo}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border rounded-[12px] shrink-0 ${statusStyles[status] || statusStyles.Provisional}`}
        >
          <StatusIcon size={12} className="stroke-[2.5px]" />
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] p-2.5">
          <p className="text-[10px] text-[var(--text-muted)] font-medium mb-1">Class</p>
          <p className="text-[var(--text-primary)] font-bold tracking-wider text-xs">{student.class} - {student.section}</p>
        </div>
        <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] p-2.5">
          <p className="text-[10px] text-[var(--text-muted)] font-medium mb-1">Student ID</p>
          <p className="text-[var(--text-primary)] font-mono font-semibold text-[10px]">{student.id.slice(0, 8)}</p>
        </div>
        {student.parentContact && (
          <div className="col-span-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] p-2.5">
            <p className="text-[10px] text-[var(--text-muted)] font-medium mb-1">Parent Contact</p>
            <p className="text-[var(--text-primary)] font-mono font-semibold text-xs">{student.parentContact}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {status === 'Provisional' && (
          <>
            <button
              onClick={() => onUpdateStatus(student, 'Confirmed')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-[12px] hover:bg-emerald-600 hover:text-white transition-colors font-bold text-xs touch-manipulation min-h-[44px]"
              aria-label="Confirm admission"
            >
              <CheckCircle size={16} className="stroke-[2.5px]" />
              <span className="hidden sm:inline">Confirm</span>
            </button>
            <button
              onClick={() => onUpdateStatus(student, 'Cancelled')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-rose-600 bg-rose-50 border border-rose-200 rounded-[12px] hover:bg-rose-600 hover:text-white transition-colors font-bold text-xs touch-manipulation min-h-[44px]"
              aria-label="Cancel admission"
            >
              <XCircle size={16} className="stroke-[2.5px]" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </>
        )}

        {status === 'Confirmed' && (
          <button
            onClick={() => onUpdateStatus(student, 'Transferred')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-purple-600 bg-purple-50 border border-purple-200 rounded-[12px] hover:bg-purple-600 hover:text-white transition-colors font-bold text-xs touch-manipulation min-h-[44px]"
            aria-label="Mark as transferred"
          >
            <UserX size={16} className="stroke-[2.5px]" />
            <span className="hidden sm:inline">Mark Transferred</span>
          </button>
        )}

        {(status === 'Cancelled' || status === 'Transferred') && (
          <button
            onClick={() => onUpdateStatus(student, 'Provisional')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-[12px] hover:bg-amber-600 hover:text-white transition-colors font-bold text-xs touch-manipulation min-h-[44px]"
            aria-label="Reset status"
          >
            <Clock size={16} className="stroke-[2.5px]" />
            <span className="hidden sm:inline">Reset to Provisional</span>
          </button>
        )}
      </div>
    </div>
  );
});

export default AdmissionCard;