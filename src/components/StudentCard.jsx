import React from 'react';
import { Edit2, IndianRupee, Trash2 } from 'lucide-react';

const statusStyles = {
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Pending: 'bg-amber-50 text-amber-700 border-amber-100',
  Overdue: 'bg-rose-50 text-rose-700 border-rose-100',
};

const StudentCard = React.memo(({ student, status, onEdit, onDelete, onPayFee }) => (
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
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm ${statusStyles[status] || statusStyles.Pending}`}
      >
        {status}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
      <div className="bg-slate-50 rounded-lg p-2.5">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Class</p>
        <p className="text-slate-800 font-bold text-sm">{student.class} - {student.section}</p>
      </div>
      <div className="bg-slate-50 rounded-lg p-2.5">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Roll No</p>
        <p className="text-slate-800 font-bold text-sm">{student.rollNo}</p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => onPayFee(student)}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 transition-colors font-bold text-sm touch-manipulation"
        aria-label="Collect fee"
      >
        <IndianRupee size={18} />
        <span>Pay</span>
      </button>
      <button
        onClick={() => onEdit(student)}
        className="p-3 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Edit student"
      >
        <Edit2 size={18} />
      </button>
      <button
        onClick={() => onDelete(student.id)}
        className="p-3 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Delete student"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
));

export default StudentCard;
