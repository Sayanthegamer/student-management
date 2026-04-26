import React, { useState, useRef } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle, Database, Github, FileJson, FileSpreadsheet } from 'lucide-react';
import { saveStudents } from '../utils/storage';
import { convertToCSV, parseCSV } from '../utils/csvHelpers';

const DataManagement = ({ students, onImportSuccess }) => {
    const [importStatus, setImportStatus] = useState(null); // 'success', 'error', 'loading'
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleExport = () => {
        try {
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

            setMessage('Database exported successfully to CSV format.');
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
            if (students && students.length > 0) {
                const csvData = convertToCSV(students);
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `safety_backup_pre_import_${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Auto-backup failed:', err);
        }
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        autoBackupBeforeImport();

        setImportStatus('loading');
        setMessage('Executing safety backup and validating import data...');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let parsedData;

                if (file.name.endsWith('.json')) {
                    parsedData = JSON.parse(content);
                } else {
                    parsedData = parseCSV(content);
                }

                if (!Array.isArray(parsedData)) {
                    throw new Error('Invalid file format: Data must be an array of students.');
                }

                if (parsedData.length > 0 && (!parsedData[0].id || !parsedData[0].name)) {
                    throw new Error('Invalid data structure: Missing required student fields.');
                }

                saveStudents(parsedData);
                onImportSuccess(parsedData);

                setImportStatus('success');
                setMessage(`Import Complete: ${parsedData.length} student records processed. Safety backup downloaded.`);
            } catch (err) {
                console.error(err);
                setImportStatus('error');
                if (err.name === 'QuotaExceededError' || err.message.includes('quota')) {
                    setMessage('Storage Limit Exceeded: The file is too large for the current environment.');
                } else if (err instanceof SyntaxError) {
                    setMessage('Invalid file format. Please check the file content structure.');
                } else {
                    setMessage(err.message || 'Failed to import data.');
                }
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-5xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8">
            <div className="bg-[var(--bg-card)] rounded-[24px] shadow-sm border border-[var(--border-color)] overflow-hidden page-enter">
                <div className="p-6 md:p-10 border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-2">
                        <div className="p-3 md:p-4 bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 rounded-[16px] shrink-0">
                            <Database size={32} className="stroke-[2.5px]" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">System Data Management</h2>
                            <p className="text-[var(--text-secondary)] text-sm mt-2">Backup, restore, and audit your institutional records.</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-10 grid md:grid-cols-2 gap-4 md:gap-6 bg-[var(--bg-card)]">
                    <div className="group relative">
                        <div className="relative bg-[var(--bg-main)] p-6 md:p-8 rounded-[20px] border border-[var(--border-color)] shadow-sm transition-all duration-300 hover:shadow-md hover:border-[var(--accent-primary)]/50 h-full flex flex-col group">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-[var(--accent-light)] border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-[14px] flex items-center justify-center mb-6 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-colors shrink-0">
                                <FileSpreadsheet size={24} className="stroke-[2.5px]" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-4">Export Records</h3>
                            <p className="text-[var(--text-secondary)] mb-8 text-xs md:text-sm leading-relaxed">
                                Generate a comprehensive CSV export compatible with Microsoft Excel and Google Sheets. This includes full student profiles, fee histories, and status metadata.
                            </p>
                            <button onClick={handleExport} className="mt-auto w-full py-3.5 md:py-4 px-4 bg-[var(--accent-primary)] text-white font-bold rounded-[12px] hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.98] text-sm md:text-base text-center leading-tight flex items-center justify-center gap-2 min-h-[48px]">
                                <Download size={20} className="stroke-[2.5px]" />
                                <span>Download Database (.csv)</span>
                            </button>
                        </div>
                    </div>

                    <div className="group relative">
                        <div className="relative bg-[var(--bg-main)] p-6 md:p-8 rounded-[20px] border border-[var(--border-color)] shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-500/50 h-full flex flex-col group">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-[14px] flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                                <FileJson size={24} className="stroke-[2.5px]" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-4">Import Backup</h3>
                            <p className="text-[var(--text-secondary)] mb-8 text-xs md:text-sm leading-relaxed">
                                Upload a previously exported .csv or .json file to restore your database. The system will automatically generate a safety backup of your current data before proceeding.
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-auto w-full py-3.5 md:py-4 px-4 bg-emerald-600 text-white font-bold rounded-[12px] hover:bg-emerald-500 transition-colors active:scale-[0.98] text-center cursor-pointer flex items-center justify-center gap-2 text-sm md:text-base leading-tight min-h-[48px]"
                            >
                                <Upload size={20} className="stroke-[2.5px]" />
                                <span>Select File to Restore</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.json"
                                onChange={handleImport}
                                className="sr-only"
                                aria-label="Upload backup file"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-6 md:px-10 md:pb-10 bg-[var(--bg-card)]">
                    <div className="bg-[var(--bg-main)] rounded-[16px] p-6 md:p-8 border border-[var(--border-color)]">
                        <h3 className="text-[var(--text-primary)] font-bold mb-4 flex items-center gap-3 text-lg">
                            <AlertTriangle size={24} className="text-amber-500 stroke-[2.5px]" />
                            Import Specification
                        </h3>
                        <p className="text-[var(--text-secondary)] text-sm mb-6">
                            For successful data mapping, ensure your column headers match the system requirements.
                        </p>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {['id', 'name', 'class', 'section', 'rollNo', 'guardianName', 'admissionDate', 'admissionStatus', 'feesAmount', 'feesStatus', 'feeHistory'].map(field => (
                                <code key={field} className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[8px] text-xs font-mono font-medium text-[var(--accent-primary)]">
                                    {field}
                                </code>
                            ))}
                        </div>
                    </div>

                    {importStatus && (
                        <div
                            className={`mt-6 p-4 md:p-6 rounded-[16px] flex items-start gap-4 border animate-fadeIn ${importStatus === 'error'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}
                        >
                            <div className={`mt-0.5 p-2 rounded-[12px] bg-[var(--bg-card)] border ${importStatus === 'error' ? 'border-rose-500/20 text-rose-400' : 'border-emerald-500/20 text-emerald-400'}`}>
                                {importStatus === 'error' ? <AlertTriangle size={20} className="stroke-[2.5px]" /> : <CheckCircle size={20} className="stroke-[2.5px]" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm md:text-base">{importStatus === 'error' ? 'Import Failed' : 'Operation Successful'}</span>
                                <span className="text-xs md:text-sm mt-1 opacity-90">{message}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-center pb-8">
                <a
                    href="https://github.com/Sayanthegamer/student-management"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors text-sm font-bold"
                >
                    <Github size={20} className="transition-transform group-hover:rotate-12" />
                    Source Documentation
                </a>
            </div>
        </div>
    );
};

export default DataManagement;
