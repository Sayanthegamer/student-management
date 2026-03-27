import React from 'react';
import { UserX, Clock, CheckCircle, XCircle } from 'lucide-react';

const statusStyles = {
  Provisional: 'bg-amber-500 text-black border-amber-500',
  Confirmed: 'bg-[#CCFF00] text-black border-[#CCFF00]',
  Cancelled: 'bg-rose-500 text-black border-rose-500',
  Transferred: 'bg-[#c084fc] text-black border-[#c084fc]',
};

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
    <div className="bg-[#0a0a0a] border-2 border-white/20 p-4 transition-all duration-200 slide-up group hover:border-[#CCFF00]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 bg-[#CCFF00] text-black border-2 border-[#CCFF00] flex items-center justify-center font-black text-base shrink-0">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-black uppercase tracking-widest text-sm truncate leading-tight">{student.name}</p>
            <p className="text-white/50 font-mono text-[10px] uppercase tracking-wider truncate mt-0.5">Roll: {student.rollNo}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black border uppercase tracking-widest shrink-0 ${statusStyles[status] || statusStyles.Provisional}`}
        >
          <StatusIcon size={12} className="stroke-[3px]" />
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="bg-[#050505] border border-white/10 p-2.5">
          <p className="text-[9px] uppercase tracking-widest text-white/40 font-black mb-1">Class</p>
          <p className="text-white font-black uppercase tracking-wider text-xs">{student.class} - {student.section}</p>
        </div>
        <div className="bg-[#050505] border border-white/10 p-2.5">
          <p className="text-[9px] uppercase tracking-widest text-white/40 font-black mb-1">Student ID</p>
          <p className="text-white font-mono text-[10px]">{student.id.slice(0, 8)}</p>
        </div>
        {student.parentContact && (
          <div className="col-span-2 bg-[#050505] border border-white/10 p-2.5">
            <p className="text-[9px] uppercase tracking-widest text-white/40 font-black mb-1">Parent Contact</p>
            <p className="text-white font-mono text-xs">{student.parentContact}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {status === 'Provisional' && (
          <>
            <button
              onClick={() => onUpdateStatus(student, 'Confirmed')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[#CCFF00] bg-transparent border-2 border-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors font-black uppercase tracking-widest text-xs touch-manipulation min-h-[44px]"
              aria-label="Confirm admission"
            >
              <CheckCircle size={16} className="stroke-[3px]" />
              <span className="hidden sm:inline">Confirm</span>
            </button>
            <button
              onClick={() => onUpdateStatus(student, 'Cancelled')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-rose-500 bg-transparent border-2 border-rose-500 hover:bg-rose-500 hover:text-black transition-colors font-black uppercase tracking-widest text-xs touch-manipulation min-h-[44px]"
              aria-label="Cancel admission"
            >
              <XCircle size={16} className="stroke-[3px]" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </>
        )}

        {status === 'Confirmed' && (
          <button
            onClick={() => onUpdateStatus(student, 'Transferred')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[#c084fc] bg-transparent border-2 border-[#c084fc] hover:bg-[#c084fc] hover:text-black transition-colors font-black uppercase tracking-widest text-xs touch-manipulation min-h-[44px]"
            aria-label="Mark as transferred"
          >
            <UserX size={16} className="stroke-[3px]" />
            <span className="hidden sm:inline">Mark Transferred</span>
          </button>
        )}

        {(status === 'Cancelled' || status === 'Transferred') && (
          <button
            onClick={() => onUpdateStatus(student, 'Provisional')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-amber-400 bg-transparent border-2 border-amber-400 hover:bg-amber-400 hover:text-black transition-colors font-black uppercase tracking-widest text-xs touch-manipulation min-h-[44px]"
            aria-label="Reset status"
          >
            <Clock size={16} className="stroke-[3px]" />
            <span className="hidden sm:inline">Reset to Provisional</span>
          </button>
        )}
      </div>
    </div>
  );
});

export default AdmissionCard;