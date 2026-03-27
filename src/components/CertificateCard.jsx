import React from 'react';
import { FileText, Download, Calendar, School, Award } from 'lucide-react';

const CertificateCard = React.memo(({ student, onGenerateTC }) => {
  const hasTC = student.tcDetails && student.tcDetails.issueDate;
  const tcDate = hasTC ? new Date(student.tcDetails.issueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null;

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
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black border uppercase tracking-widest shrink-0 ${
            hasTC ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-transparent text-white/50 border-white/40'
          }`}
        >
          <Award size={12} className={hasTC ? "text-black" : "text-white/50"} />
          {hasTC ? 'Generated' : 'Pending'}
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

        {hasTC && (
          <div className="col-span-2 bg-[#CCFF00]/10 border border-[#CCFF00]/30 p-2.5">
            <p className="text-[9px] uppercase tracking-widest text-[#CCFF00] font-black mb-1">Generated On</p>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#CCFF00]" />
              <p className="text-white font-black uppercase tracking-wider text-xs">{tcDate}</p>
            </div>
          </div>
        )}

        {student.admissionStatus === 'Transferred' && !hasTC && (
          <div className="col-span-2 bg-rose-500/10 border border-rose-500/30 p-2.5">
            <p className="text-[9px] uppercase tracking-widest text-rose-500 font-black mb-1">Transfer Status</p>
            <p className="text-white font-black uppercase tracking-wider text-xs">Student transferred</p>
          </div>
        )}
      </div>

      {hasTC ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onGenerateTC(student.id, 'download')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-black bg-[#CCFF00] border-2 border-[#CCFF00] hover:bg-transparent hover:text-[#CCFF00] transition-colors font-black uppercase tracking-widest text-xs touch-manipulation min-h-[44px]"
            aria-label="Download certificate"
          >
            <Download size={16} className="stroke-[3px]" />
            <span className="hidden sm:inline">Download TC</span>
          </button>
          <button
            onClick={() => onGenerateTC(student.id, 'regenerate')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-white bg-transparent border-2 border-white/40 hover:border-white transition-colors font-black uppercase tracking-widest text-xs touch-manipulation min-h-[44px]"
            aria-label="Regenerate certificate"
          >
            <FileText size={16} className="stroke-[3px]" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      ) : student.admissionStatus === 'Transferred' ? (
        <button
          onClick={() => onGenerateTC(student.id, 'generate')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-black bg-white border-2 border-white hover:bg-transparent hover:text-white transition-colors font-black uppercase tracking-widest text-xs touch-manipulation min-h-[44px]"
          aria-label="Generate certificate"
        >
          <FileText size={16} className="stroke-[3px]" />
          <span>Generate TC</span>
        </button>
      ) : (
        <div className="flex items-center justify-center px-3 py-2.5 bg-[#050505] border-2 border-white/20 text-white/40 font-black uppercase tracking-widest text-[10px] min-h-[44px]">
          <School size={16} className="mr-2 opacity-50" />
          <span>TC available after transfer</span>
        </div>
      )}
    </div>
  );
});

export default CertificateCard;