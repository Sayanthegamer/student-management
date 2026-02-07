import React from 'react';
import { Download, AlertTriangle, XCircle } from 'lucide-react';
import { convertToCSV } from '../utils/csvHelpers';

const SyncErrorModal = ({ error, students, onDismiss }) => {
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
    } catch (err) {
      console.error("Failed to generate backup", err);
      alert("Failed to generate backup file.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-red-200">

        {/* Header */}
        <div className="bg-red-50 p-4 md:p-6 border-b border-red-100 flex items-center gap-4">
          <div className="p-2 md:p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-red-800">Sync Error Detected</h2>
            <p className="text-sm text-red-600">
              We encountered a problem syncing your data.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Error Details:</h3>
              <p className="font-mono text-sm text-red-700 break-words">
                {error.message || JSON.stringify(error)}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-semibold text-slate-800">Action Required</h3>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                Your recent changes may not have been saved to the cloud. To prevent data loss, we strongly recommend downloading a backup of your current local data immediately.
              </p>

              <ul className="list-disc pl-5 text-sm md:text-base text-slate-600 space-y-2">
                <li>Download the backup file below.</li>
                <li>Check your internet connection.</li>
                <li>Refresh the page to try reconnecting (Note: unsaved local changes will be lost if not backed up).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 md:p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end items-center gap-4">
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto px-6 py-3 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            Dismiss (Risky)
          </button>

          <button
            onClick={handleDownloadBackup}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <Download size={20} />
            Download Backup Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncErrorModal;
