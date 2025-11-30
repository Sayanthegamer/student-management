import React, { useState } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle, Database, Github } from 'lucide-react';
import { saveStudents } from '../utils/storage';
import { convertToCSV, parseCSV } from '../utils/csvHelpers';

const DataManagement = ({ students, onImportSuccess }) => {
    const [importStatus, setImportStatus] = useState(null); // 'success', 'error', 'loading'
    const [message, setMessage] = useState('');

    const handleExport = () => {
        try {
            // Convert to CSV
            const csvData = convertToCSV(students);
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `student_backup_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setMessage('Data exported successfully as CSV!');
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
                const csvData = convertToCSV(students);
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `auto_backup_before_import_${new Date().toISOString().slice(0, 10)}_${Date.now()}.csv`;
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
                const content = e.target.result;
                let parsedData;

                // Determine file type based on extension or content
                if (file.name.endsWith('.json')) {
                    parsedData = JSON.parse(content);
                } else {
                    // Assume CSV for .csv or other extensions
                    parsedData = parseCSV(content);
                }

                // Basic Validation
                if (!Array.isArray(parsedData)) {
                    throw new Error('Invalid file format: Data must be an array of students.');
                }

                // Check first item for required fields (loose check)
                if (parsedData.length > 0 && (!parsedData[0].id || !parsedData[0].name)) {
                    throw new Error('Invalid data structure: Missing required student fields.');
                }

                // Attempt to save to localStorage
                saveStudents(parsedData);
                onImportSuccess(parsedData); // Update App state

                setImportStatus('success');
                setMessage(`✓ Auto-backup created. Successfully imported ${parsedData.length} student records.`);
            } catch (err) {
                console.error(err);
                setImportStatus('error');
                if (err.name === 'QuotaExceededError' || err.message.includes('quota')) {
                    setMessage('Storage Limit Exceeded: The file is too large for the browser\'s local storage.');
                } else if (err instanceof SyntaxError) {
                    setMessage('Invalid file format. Please check the file content.');
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
                        Download a backup of all student records in <strong>CSV (Excel)</strong> format.
                        <br />
                        Includes fee history and other details.
                    </p>
                    <button onClick={handleExport} className="btn btn-primary w-full justify-center shadow-indigo-200">
                        Download CSV Backup
                    </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="text-slate-800 mt-0 text-lg font-bold mb-3 flex items-center gap-2">
                        <Upload size={20} className="text-emerald-600" />
                        Import Data
                    </h3>
                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                        Restore student records from a backup file (.csv or .json).
                        <span className="block mt-2 text-amber-600 font-medium text-xs bg-amber-50 p-2 rounded border border-amber-100">
                            Note: Auto-backup created before import.
                        </span>
                    </p>

                    <label className="btn bg-white text-slate-700 border border-slate-200 cursor-pointer hover:bg-slate-50 hover:border-slate-300 w-full justify-center shadow-sm transition-all">
                        <Upload size={18} />
                        Select Backup File
                        <input
                            type="file"
                            accept=".csv,.json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-slate-800 mt-0 text-base font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    CSV Format Guide
                </h3>
                <p className="text-slate-500 text-sm mb-3">
                    Ensure your CSV file includes these headers (case-sensitive):
                </p>
                <div className="flex flex-wrap gap-2">
                    {['id', 'name', 'class', 'section', 'rollNo', 'feesAmount', 'feesStatus', 'fine', 'admissionDate', 'admissionStatus'].map(field => (
                        <span key={field} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600">
                            {field}
                        </span>
                    ))}
                </div>
                <p className="text-slate-400 text-xs mt-3 italic">
                    * Complex fields like 'feeHistory' should be valid JSON strings if included.
                </p>
            </div>

            <div className="mt-8 flex justify-center">
                <a
                    href="https://github.com/Sayanthegamer/student-management" // Placeholder, user to update
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
                >
                    <Github size={20} />
                    Visit Project Repository
                </a>
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
