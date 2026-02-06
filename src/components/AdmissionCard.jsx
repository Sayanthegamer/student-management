import React from 'react';
import { UserCheck, UserX, Clock, Edit2, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-100',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-100',
  Transferred: 'bg-slate-50 text-slate-700 border-slate-100',
};

const statusIcons = {
  Pending: Clock,
  Approved: CheckCircle,
  Rejected: XCircle,
  'Under Review': AlertCircle,
  Transferred: UserX,
};

const AdmissionCard = React.memo(({ student, onUpdateStatus }) => {
  const status = student.admissionStatus || 'Pending';
  const StatusIcon = statusIcons[status] || Clock;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 slide-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-800 font-bold text-base truncate leading-tight">{student.name}</p>
            <p className="text-slate-400 text-xs truncate mt-0.5">Roll: {student.rollNo}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm ${statusStyles[status] || statusStyles.Pending}`}
        >
          <StatusIcon size={12} />
          {status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Class Details</p>
          <p className="text-slate-800 font-bold text-sm">Class {student.class} - {student.section}</p>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Student ID</p>
          <p className="text-slate-600 font-mono text-xs">{student.id.slice(0, 8)}...</p>
        </div>

        {student.parentContact && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Parent Contact</p>
            <p className="text-slate-700 font-semibold text-sm">{student.parentContact}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {status === 'Pending' && (
          <>
            <button
              onClick={() => onUpdateStatus(student.id, 'Approved')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 transition-colors font-bold text-sm touch-manipulation"
              aria-label="Approve admission"
            >
              <CheckCircle size={16} />
              <span>Approve</span>
            </button>
            <button
              onClick={() => onUpdateStatus(student.id, 'Rejected')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 transition-colors font-bold text-sm touch-manipulation"
              aria-label="Reject admission"
            >
              <XCircle size={16} />
              <span>Reject</span>
            </button>
          </>
        )}
        
        {status === 'Approved' && (
          <button
            onClick={() => onUpdateStatus(student.id, 'Transferred')}
            className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-slate-600 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold text-sm touch-manipulation"
            aria-label="Mark as transferred"
          >
            <UserX size={16} />
            <span>Mark Transferred</span>
          </button>
        )}

        {(status === 'Rejected' || status === 'Transferred') && (
          <button
            onClick={() => onUpdateStatus(student.id, 'Pending')}
            className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 transition-colors font-bold text-sm touch-manipulation"
            aria-label="Reset status"
          >
            <Clock size={16} />
            <span>Reset to Pending</span>
          </button>
        )}
      </div>
    </div>
  );
});

export default AdmissionCard;