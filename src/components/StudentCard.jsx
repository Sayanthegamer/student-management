import React from 'react';
import { Edit2, IndianRupee, Trash2 } from 'lucide-react';

const statusStyles = {
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Pending: 'bg-amber-50 text-amber-700 border-amber-100',
  Overdue: 'bg-rose-50 text-rose-700 border-rose-100',
};

const StudentCard = React.memo(({ student, status, onEdit, onDelete, onPayFee }) => (
  <div className="bg-white/95 border border-slate-200 rounded-2xl p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
          {student.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-slate-800 font-semibold text-sm truncate">{student.name}</p>
          <p className="text-slate-400 text-xs truncate">ID: {student.id.slice(0, 8)}</p>
        </div>
      </div>
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${statusStyles[status] || statusStyles.Pending}`}
      >
        {status}
      </span>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Class</p>
        <p className="text-slate-700 font-semibold">{student.class} - {student.section}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Roll No</p>
        <p className="text-slate-700 font-semibold">{student.rollNo}</p>
      </div>
    </div>

    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
      <button
        onClick={() => onPayFee(student)}
        className="p-2.5 rounded-xl text-emerald-600 bg-emerald-50/60 hover:bg-emerald-50 transition-colors"
        aria-label="Collect fee"
      >
        <IndianRupee size={18} />
      </button>
      <button
        onClick={() => onEdit(student)}
        className="p-2.5 rounded-xl text-indigo-600 bg-indigo-50/60 hover:bg-indigo-50 transition-colors"
        aria-label="Edit student"
      >
        <Edit2 size={18} />
      </button>
      <button
        onClick={() => onDelete(student.id)}
        className="p-2.5 rounded-xl text-rose-600 bg-rose-50/60 hover:bg-rose-50 transition-colors"
        aria-label="Delete student"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
));

export default StudentCard;
