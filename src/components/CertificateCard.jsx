import React from 'react';
import { FileText, Download, User, Calendar, School, Award } from 'lucide-react';

const CertificateCard = React.memo(({ student, onGenerateTC }) => {
  const hasTC = student.tcDetails && student.tcDetails.issueDate;
  const tcDate = hasTC ? new Date(student.tcDetails.issueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 slide-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-800 font-bold text-base truncate leading-tight">{student.name}</p>
            <p className="text-slate-400 text-xs truncate mt-0.5">Roll: {student.rollNo}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm ${
            hasTC ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-700 border-slate-100'
          }`}
        >
          <Award size={12} />
          {hasTC ? 'Generated' : 'Pending'}
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

        {hasTC && (
          <div className="bg-emerald-50 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">Generated On</p>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-emerald-600" />
              <p className="text-emerald-800 font-semibold text-sm">{tcDate}</p>
            </div>
          </div>
        )}

        {student.admissionStatus === 'Transferred' && (
          <div className="bg-rose-50 rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider text-rose-600 font-bold mb-1">Transfer Status</p>
            <p className="text-rose-800 font-semibold text-sm">Student has been transferred</p>
          </div>
        )}
      </div>

      {hasTC ? (
        <div className="space-y-2">
          <button
            onClick={() => onGenerateTC(student.id, 'download')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 transition-colors font-bold text-sm touch-manipulation"
            aria-label="Download certificate"
          >
            <Download size={18} />
            <span>Download TC</span>
          </button>
          <button
            onClick={() => onGenerateTC(student.id, 'regenerate')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 transition-colors font-bold text-sm touch-manipulation"
            aria-label="Regenerate certificate"
          >
            <FileText size={18} />
            <span>Regenerate</span>
          </button>
        </div>
      ) : student.admissionStatus === 'Transferred' ? (
        <button
          onClick={() => onGenerateTC(student.id, 'generate')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-purple-600 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 transition-colors font-bold text-sm touch-manipulation"
          aria-label="Generate certificate"
        >
          <FileText size={18} />
          <span>Generate TC</span>
        </button>
      ) : (
        <div className="flex items-center justify-center px-4 py-3 rounded-xl bg-slate-50 text-slate-500 font-bold text-sm">
          <School size={18} className="mr-2" />
          <span>TC available after transfer</span>
        </div>
      )}
    </div>
  );
});

export default CertificateCard;