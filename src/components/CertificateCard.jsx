import React from 'react';
import { FileText, Download, User, Calendar, School, Award } from 'lucide-react';

const CertificateCard = React.memo(({ student, onGenerateTC }) => {
  const hasTC = student.tcDetails && student.tcDetails.issueDate;
  const tcDate = hasTC ? new Date(student.tcDetails.issueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <div className="bg-[#0a0a0a] border-2 border-white/40 rounded-none p-4 md:p-5 transition-colors duration-200 slide-up">
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
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[10px] font-black border uppercase tracking-widest ${
            hasTC ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-transparent text-white/50 border-white/40'
          }`}
        >
          <Award size={12} className={hasTC ? "text-black" : "text-white/50"} />
          {hasTC ? 'Generated' : 'Pending'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="bg-[#050505] border-2 border-white/10 rounded-none p-3 md:p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-1">Class Details</p>
          <p className="text-white font-black uppercase tracking-widest text-sm">Class {student.class} - {student.section}</p>
        </div>
        
        <div className="bg-[#050505] border-2 border-white/10 rounded-none p-3 md:p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-black mb-1">Student ID</p>
          <p className="text-white font-mono text-xs">{student.id.slice(0, 8)}...</p>
        </div>

        {hasTC && (
          <div className="bg-[#CCFF00]/10 border-2 border-[#CCFF00]/30 rounded-none p-3 md:p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#CCFF00] font-black mb-1">Generated On</p>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#CCFF00]" />
              <p className="text-white font-black uppercase tracking-widest text-sm">{tcDate}</p>
            </div>
          </div>
        )}

        {student.admissionStatus === 'Transferred' && (
          <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-none p-3 md:p-4">
            <p className="text-[10px] uppercase tracking-widest text-rose-500 font-black mb-1">Transfer Status</p>
            <p className="text-white font-black uppercase tracking-widest text-sm">Student has been transferred</p>
          </div>
        )}
      </div>

      {hasTC ? (
        <div className="flex md:flex-col gap-3">
          <button
            onClick={() => onGenerateTC(student.id, 'download')}
            className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 md:py-4 rounded-none text-black bg-[#CCFF00] border-2 border-[#CCFF00] hover:bg-transparent hover:text-[#CCFF00] transition-colors font-black uppercase tracking-widest text-sm touch-manipulation min-h-[48px]"
            aria-label="Download certificate"
          >
            <Download size={18} className="stroke-[3px]" />
            <span className="hidden md:inline">Download TC</span>
          </button>
          <button
            onClick={() => onGenerateTC(student.id, 'regenerate')}
            className="flex-1 flex items-center justify-center gap-3 px-4 py-2.5 md:py-4 rounded-none text-white bg-transparent border-2 border-white/40 hover:border-white transition-colors font-black uppercase tracking-widest text-sm touch-manipulation min-h-[48px]"
            aria-label="Regenerate certificate"
          >
            <FileText size={18} />
            <span className="hidden md:inline">Regenerate</span>
          </button>
        </div>
      ) : student.admissionStatus === 'Transferred' ? (
        <button
          onClick={() => onGenerateTC(student.id, 'generate')}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 md:py-4 rounded-none text-black bg-white border-2 border-white hover:bg-transparent hover:text-white transition-colors font-black uppercase tracking-widest text-sm touch-manipulation min-h-[48px]"
          aria-label="Generate certificate"
        >
          <FileText size={18} className="stroke-[3px]" />
          <span>Generate TC</span>
        </button>
      ) : (
        <div className="flex items-center justify-center px-4 py-3 md:py-4 rounded-none bg-[#050505] border-2 border-white/40 text-white/50 font-black uppercase tracking-widest text-[10px] md:text-xs">
          <School size={18} className="mr-2 opacity-50" />
          <span>TC available after transfer</span>
        </div>
      )}
    </div>
  );
});

export default CertificateCard;