import React, { useState } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { saveStudents } from '../utils/storage';

const DataManagement = ({ students, onImportSuccess }) => {
    const [importStatus, setImportStatus] = useState(null); // 'success', 'error', 'loading'
    const [message, setMessage] = useState('');

    const handleExport = () => {
        try {
            const dataStr = JSON.stringify(students, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `student_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setMessage('Data exported successfully!');
            setImportStatus('success');
            setTimeout(() => {
                setImportStatus(null);
                setMessage('');
            }, 3000);
        } catch (err) {
            console.error(err);
            setImportStatus('error');
            setMessage('Failed to export data.');
        }
    };

    const autoBackupBeforeImport = () => {
        try {
            // Only create backup if there's existing data
            if (students && students.length > 0) {
                const dataStr = JSON.stringify(students, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `auto_backup_before_import_${new Date().toISOString().slice(0, 10)}_${Date.now()}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Auto-backup failed:', err);
            // Don't block import if backup fails, just log it
        }
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Automatically backup current data before importing
        autoBackupBeforeImport();

        setImportStatus('loading');
        setMessage('Creating backup and reading file...');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);

                // Basic Validation
                if (!Array.isArray(json)) {
                    throw new Error('Invalid file format: Data must be an array of students.');
                }

                // Check first item for required fields (loose check)
                if (json.length > 0 && (!json[0].id || !json[0].name)) {
                    throw new Error('Invalid data structure: Missing required student fields.');
                }

                // Attempt to save to localStorage
                saveStudents(json);
                onImportSuccess(json); // Update App state

                setImportStatus('success');
                setMessage(`✓ Auto-backup created. Successfully imported ${json.length} student records.`);
            } catch (err) {
                console.error(err);
                setImportStatus('error');
                if (err.name === 'QuotaExceededError' || err.message.includes('quota')) {
                    setMessage('Storage Limit Exceeded: The file is too large for the browser\'s local storage.');
                } else if (err instanceof SyntaxError) {
                    setMessage('Invalid JSON file. Please check the file content.');
                } else {
                    setMessage(err.message || 'Failed to import data.');
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto">
            <h2 className="text-slate-800 mb-8 text-2xl flex items-center gap-3 font-bold tracking-tight">
                <Database size={28} className="text-indigo-600" />
                Data Management
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="text-slate-800 mt-0 text-lg font-bold mb-3 flex items-center gap-2">
                        <Download size={20} className="text-indigo-600" />
                        Export Data
                    </h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Download a backup of all student records, including fee history.
                        Keep this file safe to restore your data later.
                    </p>
                    <button onClick={handleExport} className="btn btn-primary w-full justify-center shadow-indigo-200">
                        Download JSON Backup
                    </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="text-slate-800 mt-0 text-lg font-bold mb-3 flex items-center gap-2">
                        <Upload size={20} className="text-emerald-600" />
                        Import Data
                    </h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Restore student records from a backup file.
                        <span className="block mt-2 text-amber-600 font-medium text-xs bg-amber-50 p-2 rounded border border-amber-100">
                            Note: Auto-backup created before import.
                        </span>
                    </p>

                    <label className="btn bg-white text-slate-700 border border-slate-200 cursor-pointer hover:bg-slate-50 hover:border-slate-300 w-full justify-center shadow-sm transition-all">
                        <Upload size={18} />
                        Select Backup File
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {importStatus && (
                <div
                    className={`mt-8 p-4 rounded-xl flex items-start gap-3 border ${importStatus === 'error'
                        ? 'bg-rose-50 text-rose-800 border-rose-100'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        }`}
                >
                    <div className="mt-0.5">
                        {importStatus === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <span className="font-medium text-sm">{message}</span>
                </div>
            )}
        </div>
    );
};

export default DataManagement;
