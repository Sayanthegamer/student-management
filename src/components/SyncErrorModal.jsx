import React from 'react';
import { Download, AlertTriangle, X } from 'lucide-react';
import { convertToCSV } from '../utils/csvHelpers';
import { useToast } from '../context/ToastContext';

const SyncErrorModal = ({ error, students, onDismiss }) => {
  const { showToast } = useToast();

  if (!error) return null;

  const handleDownloadBackup = () => {
    try {
      const csv = convertToCSV(students);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `backup_students_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Backup downloaded successfully', 'success');
    } catch (err) {
      console.error("Failed to generate backup", err);
      showToast('Failed to generate backup file', 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="bg-[#0a0a0a] border-2 border-rose-500 w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-[8px_8px_0_0_rgba(244,63,94,0.3)]">

        {/* Header */}
        <div className="bg-rose-500 p-4 md:p-6 border-b-2 border-rose-500 flex items-center gap-4 relative pr-14 md:pr-16">
          <div className="p-2 md:p-3 bg-black">
            <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-rose-500 stroke-[3px]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">Sync Error Detected</h2>
            <p className="text-sm text-black/70 font-black uppercase tracking-wider">
              We encountered a problem syncing your data
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 md:top-4 md:right-4 text-black hover:bg-black hover:text-rose-500 p-3 min-h-[44px] min-w-[44px] border-2 border-black transition-colors z-20 flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} className="stroke-[3px]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-[#050505] border-2 border-rose-500/30 p-4">
              <h3 className="font-black text-rose-500 uppercase tracking-widest text-xs mb-3">Error Details</h3>
              <p className="font-mono text-sm text-white/80 break-words bg-black p-4 border border-white/10">
                {error.message || JSON.stringify(error)}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">Action Required</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">
                Your recent changes may not have been saved to the cloud. To prevent data loss, we strongly recommend downloading a backup of your current local data immediately.
              </p>

              <ul className="list-disc pl-5 text-sm md:text-base text-white/60 space-y-2">
                <li>Download the backup file below</li>
                <li>Check your internet connection</li>
                <li>Refresh the page to try reconnecting (Note: unsaved local changes will be lost if not backed up)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#050505] p-4 md:p-6 border-t-2 border-white/20 flex flex-col sm:flex-row justify-end items-center gap-4">
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto px-6 py-3 text-white/60 hover:text-white hover:bg-white/10 border-2 border-white/40 hover:border-white/60 font-black uppercase tracking-widest transition-colors"
          >
            Dismiss (Risky)
          </button>

          <button
            onClick={handleDownloadBackup}
            className="w-full sm:w-auto px-6 py-3 bg-[#CCFF00] hover:bg-white border-2 border-[#CCFF00] hover:border-white text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={20} className="stroke-[3px]" />
            Download Backup Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncErrorModal;
