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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <div className="bg-[#050505] rounded-none shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] border-2 border-white/40 overflow-hidden page-enter">
                <div className="p-4 md:p-10 border-b border-white/40 bg-[#0a0a0a]">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-2">
                        <div className="p-3 md:p-4 bg-[#CCFF00] text-black border-2 border-[#CCFF00] rounded-none shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] shrink-0">
                            <Database size={24} className="stroke-[3px] md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-4xl font-black text-white tracking-widest uppercase">System Data Management</h2>
                            <p className="text-[#CCFF00]/70 font-mono text-xs md:text-sm uppercase tracking-widest mt-2">Backup, restore, and audit your institutional records.</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-10 grid md:grid-cols-2 gap-6">
                    <div className="group relative">
                        <div className="relative bg-[#0a0a0a] p-5 md:p-8 rounded-none border-2 border-white/40 shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] transition-colors hover:border-[#CCFF00] h-full flex flex-col group">
                            <div className="w-10 h-10 md:w-14 md:h-14 bg-transparent border-2 border-[#CCFF00] text-[#CCFF00] rounded-none flex items-center justify-center mb-6 group-hover:bg-[#CCFF00] group-hover:text-black transition-colors shrink-0">
                                <FileSpreadsheet size={20} className="stroke-[3px] md:w-7 md:h-7" />
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest mb-4">Export Records</h3>
                            <p className="text-white/70 mb-8 text-[10px] md:text-xs font-mono uppercase tracking-widest leading-relaxed">
                                Generate a comprehensive CSV export compatible with Microsoft Excel and Google Sheets. This includes full student profiles, fee histories, and status metadata.
                            </p>
                            <button onClick={handleExport} className="mt-auto w-full py-3 md:py-4 px-2 md:px-4 bg-[#CCFF00] text-black font-black rounded-none border-2 border-[#CCFF00] hover:bg-transparent hover:text-[#CCFF00] transition-colors shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] uppercase tracking-widest active:bg-[#CCFF00]/20 text-xs md:text-base text-center leading-tight">
                                Download Database (.csv)
                            </button>
                        </div>
                    </div>

                    <div className="group relative">
                        <div className="relative bg-[#0a0a0a] p-5 md:p-8 rounded-none border-2 border-white/40 shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] transition-colors hover:border-emerald-400 h-full flex flex-col group">
                            <div className="w-10 h-10 md:w-14 md:h-14 bg-transparent border-2 border-emerald-400 text-emerald-400 rounded-none flex items-center justify-center mb-6 group-hover:bg-emerald-400 group-hover:text-black transition-colors shrink-0">
                                <FileJson size={20} className="stroke-[3px] md:w-7 md:h-7" />
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest mb-4">Import Backup</h3>
                            <p className="text-white/70 mb-8 text-[10px] md:text-xs font-mono uppercase tracking-widest leading-relaxed">
                                Upload a previously exported .csv or .json file to restore your database. The system will automatically generate a safety backup of your current data before proceeding.
                            </p>
                            <label className="mt-auto w-full py-3 md:py-4 px-2 md:px-4 bg-emerald-400 text-black font-black rounded-none border-2 border-emerald-400 hover:bg-transparent hover:text-emerald-400 transition-colors shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] text-center cursor-pointer uppercase tracking-widest active:bg-emerald-400/20 block text-xs md:text-base leading-tight">
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

                <div className="px-4 pb-6 md:px-10 md:pb-12">
                    <div className="bg-[#0a0a0a] rounded-none p-5 md:p-8 border-2 border-white/40">
                        <h3 className="text-white font-black mb-4 flex items-center gap-3 uppercase tracking-widest">
                            <AlertTriangle size={24} className="text-amber-400 stroke-[3px]" />
                            Import Specification
                        </h3>
                        <p className="text-white/50 text-xs font-mono mb-6 uppercase tracking-widest">
                            For successful data mapping, ensure your column headers match the system requirements.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {['id', 'name', 'class', 'section', 'rollNo', 'guardianName', 'admissionDate', 'admissionStatus', 'feesAmount', 'feesStatus', 'feeHistory'].map(field => (
                                <code key={field} className="px-3 py-1.5 bg-[#050505] border-2 border-white/40 rounded-none text-[10px] font-black text-[#CCFF00] uppercase tracking-widest shadow-[4px_4px_0_0_rgba(255,255,255,0.2)]">
                                    {field}
                                </code>
                            ))}
                        </div>
                    </div>

                    {importStatus && (
                        <div
                            className={`mt-8 p-6 rounded-none flex items-start gap-4 border shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] animate-fadeIn ${importStatus === 'error'
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500'
                                : 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]'
                                }`}
                        >
                            <div className={`mt-0.5 p-2 rounded-none bg-transparent border ${importStatus === 'error' ? 'border-rose-500' : 'border-[#CCFF00]'}`}>
                                {importStatus === 'error' ? <AlertTriangle size={20} className="stroke-[3px] text-rose-500" /> : <CheckCircle size={20} className="stroke-[3px] text-[#CCFF00]" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-sm uppercase tracking-widest">{importStatus === 'error' ? 'Import Failed' : 'Operation Successful'}</span>
                                <span className="text-[10px] font-mono mt-1 opacity-90 uppercase tracking-widest">{message}</span>
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
                    className="group flex items-center gap-3 text-white/50 hover:text-[#CCFF00] transition-colors text-xs font-black uppercase tracking-widest"
                >
                    <Github size={20} className="transition-transform group-hover:rotate-12" />
                    Source Documentation
                </a>
            </div>
        </div>
    );
};

export default DataManagement;
