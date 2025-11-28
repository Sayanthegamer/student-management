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
        <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-white mb-6 text-2xl flex items-center gap-3 font-bold">
                <Database size={28} />
                Data Management
            </h2>

            <div className="bg-white/75 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-8">
                <div className="mb-8">
                    <h3 className="text-gray-800 mt-0 text-xl font-bold mb-2">Export Data</h3>
                    <p className="text-gray-500 mb-4">
                        Download a backup of all student records, including fee history.
                        Keep this file safe to restore your data later.
                    </p>
                    <button onClick={handleExport} className="btn btn-primary">
                        <Download size={20} />
                        Export JSON
                    </button>
                </div>

                <div className="border-t border-black/10 pt-8">
                    <h3 className="text-gray-800 mt-0 text-xl font-bold mb-2">Import Data</h3>
                    <p className="text-gray-500 mb-4">
                        Restore student records from a backup file.
                        <br />
                        <strong className="text-amber-600">Note: Your current data will be automatically backed up before import.</strong>
                        <br />
                        <strong className="text-red-500">Warning: This will replace all current data!</strong>
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                        <label className="btn bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200">
                            <Upload size={20} />
                            Select Backup File
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {importStatus && (
                        <div
                            className={`mt-5 p-4 rounded-lg flex items-center gap-3 ${importStatus === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}
                        >
                            {importStatus === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                            <span>{message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataManagement;
