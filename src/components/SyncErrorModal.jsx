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
      <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] shadow-xl w-full max-w-2xl flex flex-col overflow-hidden transform transition-all">

        {/* Header */}
        <div className="bg-rose-500/10 border-b border-rose-500/20 p-6 flex items-start gap-4 relative">
          <div className="p-3 bg-[var(--bg-card)] border border-rose-500/20 rounded-[16px] shrink-0">
            <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-rose-400 stroke-[2.5px]" />
          </div>
          <div className="flex-1 pr-8">
            <h2 className="text-xl md:text-2xl font-bold text-rose-400 tracking-tight">Sync Error Detected</h2>
            <p className="text-sm text-rose-400/80 mt-1">
              We encountered a problem syncing your data to the cloud.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="absolute top-6 right-6 text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 p-2 rounded-full transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} className="stroke-[2.5px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[16px] p-5">
              <h3 className="font-bold text-[var(--text-primary)] text-sm mb-3">Error Details</h3>
              <p className="font-mono text-sm text-[var(--text-secondary)] break-words bg-[var(--bg-card)] p-4 rounded-[8px] border border-[var(--border-color)]">
                {error.message || JSON.stringify(error)}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Action Required</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Your recent changes may not have been saved to the cloud. To prevent data loss, we strongly recommend downloading a backup of your current local data immediately.
              </p>

              <ul className="list-disc pl-5 text-sm text-[var(--text-secondary)] space-y-2">
                <li>Download the backup file below</li>
                <li>Check your internet connection</li>
                <li>Refresh the page to try reconnecting (Note: unsaved local changes will be lost if not backed up)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--bg-main)] p-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row justify-end items-center gap-3">
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto px-5 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--text-primary)] rounded-[10px] font-bold transition-colors"
          >
            Dismiss (Risky)
          </button>

          <button
            onClick={handleDownloadBackup}
            className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-[10px] flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Download size={18} className="stroke-[2.5px]" />
            Download Backup Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncErrorModal;
