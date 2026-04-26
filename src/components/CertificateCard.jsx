import React from 'react';
import { FileText, Download, Calendar, School, Award } from 'lucide-react';

const CertificateCard = React.memo(({ student, onGenerateTC }) => {
  const hasTC = student.tcDetails && student.tcDetails.issueDate;
  const tcDate = hasTC ? new Date(student.tcDetails.issueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null;

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
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border rounded-[12px] shrink-0 ${
            hasTC ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)]'
          }`}
        >
          <Award size={12} className={hasTC ? "text-emerald-400" : "text-[var(--text-secondary)] stroke-[2.5px]"} strokeWidth={hasTC ? 3 : 2} />
          {hasTC ? 'Generated' : 'Pending'}
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

        {hasTC && (
          <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-[12px] p-2.5">
            <p className="text-[10px] text-emerald-400 font-bold mb-1">Generated On</p>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-emerald-400 stroke-[2.5px]" />
              <p className="text-emerald-400 font-bold tracking-wider text-xs">{tcDate}</p>
            </div>
          </div>
        )}

        {student.admissionStatus === 'Transferred' && !hasTC && (
          <div className="col-span-2 bg-rose-500/10 border border-rose-500/20 rounded-[12px] p-2.5">
            <p className="text-[10px] text-rose-400 font-bold mb-1">Transfer Status</p>
            <p className="text-rose-400 font-bold tracking-wider text-xs">Student transferred</p>
          </div>
        )}
      </div>

      {hasTC ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onGenerateTC(student.id, 'download')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-white bg-[var(--accent-primary)] border border-[var(--accent-primary)] rounded-[12px] hover:bg-[var(--accent-hover)] transition-colors font-bold text-xs touch-manipulation min-h-[44px]"
            aria-label="Download certificate"
          >
            <Download size={16} className="stroke-[2.5px]" />
            <span className="hidden sm:inline">Download TC</span>
          </button>
          <button
            onClick={() => onGenerateTC(student.id, 'regenerate')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[var(--text-primary)] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] hover:border-[var(--accent-primary)] transition-colors font-bold text-xs touch-manipulation min-h-[44px]"
            aria-label="Regenerate certificate"
          >
            <FileText size={16} className="stroke-[2.5px]" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      ) : student.admissionStatus === 'Transferred' ? (
        <button
          onClick={() => onGenerateTC(student.id, 'generate')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-white bg-[var(--accent-primary)] border border-[var(--accent-primary)] rounded-[12px] hover:bg-[var(--accent-hover)] transition-colors font-bold text-xs touch-manipulation min-h-[44px]"
          aria-label="Generate certificate"
        >
          <FileText size={16} className="stroke-[2.5px]" />
          <span>Generate TC</span>
        </button>
      ) : (
        <div className="flex items-center justify-center px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] text-[var(--text-muted)] font-bold text-[10px] min-h-[44px]">
          <School size={16} className="mr-2" />
          <span>TC available after transfer</span>
        </div>
      )}
    </div>
  );
});

export default CertificateCard;