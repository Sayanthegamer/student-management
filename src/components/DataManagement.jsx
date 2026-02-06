import React, { useState } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle, Database, Github, FileJson, FileSpreadsheet } from 'lucide-react';
import { saveStudents } from '../utils/storage';
import { convertToCSV, parseCSV } from '../utils/csvHelpers';

const DataManagement = ({ students, onImportSuccess }) => {
    const [importStatus, setImportStatus] = useState(null); // 'success', 'error', 'loading'
    const [message, setMessage] = useState('');

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
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden page-enter">
                <div className="p-5 md:p-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                            <Database size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">System Data Management</h2>
                            <p className="text-slate-500 font-medium">Backup, restore, and audit your institutional records.</p>
                        </div>
                    </div>
                </div>

                <div className="p-5 md:p-8 grid md:grid-cols-2 gap-10">
                    <div className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                        <div className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition-all group-hover:shadow-md h-full flex flex-col">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                                <FileSpreadsheet size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Export Records</h3>
                            <p className="text-slate-500 mb-8 text-sm leading-relaxed font-medium">
                                Generate a comprehensive CSV export compatible with Microsoft Excel and Google Sheets. This includes full student profiles, fee histories, and status metadata.
                            </p>
                            <button onClick={handleExport} className="mt-auto w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
                                Download Database (.csv)
                            </button>
                        </div>
                    </div>

                    <div className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                        <div className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition-all group-hover:shadow-md h-full flex flex-col">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <FileJson size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Import Backup</h3>
                            <p className="text-slate-500 mb-8 text-sm leading-relaxed font-medium">
                                Upload a previously exported .csv or .json file to restore your database. The system will automatically generate a safety backup of your current data before proceeding.
                            </p>
                            <label className="mt-auto w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg text-center cursor-pointer active:scale-[0.98]">
                                Select File to Restore
                                <input
                                    type="file"
                                    accept=".csv,.json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-8 md:px-8">
                    <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100">
                        <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-amber-500" />
                            Import Specification
                        </h3>
                        <p className="text-slate-500 text-sm mb-6 font-medium leading-relaxed">
                            For successful data mapping, ensure your column headers match the system requirements.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['id', 'name', 'class', 'section', 'rollNo', 'guardianName', 'admissionDate', 'admissionStatus', 'feesAmount', 'feesStatus', 'feeHistory'].map(field => (
                                <code key={field} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-wider shadow-sm">
                                    {field}
                                </code>
                            ))}
                        </div>
                    </div>

                    {importStatus && (
                        <div
                            className={`mt-8 p-6 rounded-2xl flex items-start gap-4 border shadow-sm animate-fadeIn ${importStatus === 'error'
                                ? 'bg-rose-50 text-rose-800 border-rose-100'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                }`}
                        >
                            <div className="mt-0.5 p-1.5 rounded-full bg-white/50">
                                {importStatus === 'error' ? <AlertTriangle size={20} className="text-rose-600" /> : <CheckCircle size={20} className="text-emerald-600" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm uppercase tracking-wide">{importStatus === 'error' ? 'Import Failed' : 'Operation Successful'}</span>
                                <span className="text-sm font-medium mt-1 opacity-90">{message}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 flex justify-center pb-8">
                <a
                    href="https://github.com/Sayanthegamer/student-management"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all text-xs font-black uppercase tracking-widest"
                >
                    <Github size={20} className="transition-transform group-hover:rotate-12" />
                    Source Documentation
                </a>
            </div>
        </div>
    );
};

export default DataManagement;
