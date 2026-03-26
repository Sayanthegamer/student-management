import React from 'react';
import { UserCheck, UserX, Clock, Edit2, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
    <div className="bg-[#050505] border-2 border-white/40 rounded-none p-4 md:p-5 transition-colors duration-200 slide-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-none bg-[#CCFF00] text-black border-2 border-[#CCFF00] flex items-center justify-center font-black text-xl shrink-0">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-black uppercase tracking-widest text-lg truncate leading-tight">{student.name}</p>
            <p className="text-white/50 font-mono text-[10px] uppercase tracking-widest truncate mt-1">Roll: {student.rollNo}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-[10px] font-black border uppercase tracking-widest shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] ${statusStyles[status] || statusStyles.Provisional}`}
        >
          <StatusIcon size={14} className="stroke-[3px]" />
          {status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="bg-[#0a0a0a] border-2 border-white/10 rounded-none p-3 md:p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-1">Class Details</p>
          <p className="text-white font-black uppercase tracking-widest text-sm">Class {student.class} - {student.section}</p>
        </div>
        
        <div className="bg-[#0a0a0a] border-2 border-white/10 rounded-none p-3 md:p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-1">Student ID</p>
          <p className="text-white font-mono text-xs">{student.id.slice(0, 8)}...</p>
        </div>

        {student.parentContact && (
          <div className="bg-[#0a0a0a] border-2 border-white/10 rounded-none p-3 md:p-4">
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-1">Parent Contact</p>
            <p className="text-white font-mono text-sm">{student.parentContact}</p>
          </div>
        )}
      </div>

      <div className="flex md:grid md:grid-cols-2 gap-3">
        {status === 'Provisional' && (
          <>
            <button
              onClick={() => onUpdateStatus(student, 'Confirmed')}
              className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 md:py-4 rounded-none text-[#CCFF00] bg-transparent border-2 border-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors font-black uppercase tracking-widest text-sm touch-manipulation min-h-[48px]"
              aria-label="Confirm admission"
            >
              <CheckCircle size={18} className="stroke-[3px]" />
              <span className="hidden md:inline">Confirm</span>
            </button>
            <button
              onClick={() => onUpdateStatus(student, 'Cancelled')}
              className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 md:py-4 rounded-none text-rose-500 bg-transparent border-2 border-rose-500 hover:bg-rose-500 hover:text-black transition-colors font-black uppercase tracking-widest text-sm touch-manipulation min-h-[48px]"
              aria-label="Cancel admission"
            >
              <XCircle size={18} className="stroke-[3px]" />
              <span className="hidden md:inline">Cancel</span>
            </button>
          </>
        )}
        
        {status === 'Confirmed' && (
          <button
            onClick={() => onUpdateStatus(student, 'Transferred')}
            className="flex-1 md:col-span-2 flex items-center justify-center gap-3 px-4 py-2.5 md:py-4 rounded-none text-[#c084fc] bg-transparent border-2 border-[#c084fc] hover:bg-[#c084fc] hover:text-black transition-colors font-black uppercase tracking-widest text-sm touch-manipulation min-h-[48px]"
            aria-label="Mark as transferred"
          >
            <UserX size={18} className="stroke-[3px]" />
            <span className="hidden md:inline">Mark Transferred</span>
          </button>
        )}

        {(status === 'Cancelled' || status === 'Transferred') && (
          <button
            onClick={() => onUpdateStatus(student, 'Provisional')}
            className="flex-1 md:col-span-2 flex items-center justify-center gap-3 px-4 py-2.5 md:py-4 rounded-none text-amber-400 bg-transparent border-2 border-amber-400 hover:bg-amber-400 hover:text-black transition-colors font-black uppercase tracking-widest text-sm touch-manipulation min-h-[48px]"
            aria-label="Reset status"
          >
            <Clock size={18} className="stroke-[3px]" />
            <span className="hidden md:inline">Reset to Provisional</span>
          </button>
        )}
      </div>
    </div>
  );
});

export default AdmissionCard;