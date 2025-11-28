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

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImportStatus('loading');
        setMessage('Reading file...');

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
                setMessage(`Successfully imported ${json.length} student records.`);
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
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'white', marginBottom: '24px', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database size={28} />
                Data Management
            </h2>

            <div className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ color: '#1f2937', marginTop: 0 }}>Export Data</h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                        Download a backup of all student records, including fee history.
                        Keep this file safe to restore your data later.
                    </p>
                    <button onClick={handleExport} className="btn btn-primary">
                        <Download size={20} />
                        Export JSON
                    </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '32px' }}>
                    <h3 style={{ color: '#1f2937', marginTop: 0 }}>Import Data</h3>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                        Restore student records from a backup file.
                        <br />
                        <strong style={{ color: '#ef4444' }}>Warning: This will replace all current data!</strong>
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <label className="btn" style={{ background: '#e0e7ff', color: '#4338ca', cursor: 'pointer' }}>
                            <Upload size={20} />
                            Select Backup File
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    {importStatus && (
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            borderRadius: '8px',
                            background: importStatus === 'error' ? '#fee2e2' : '#d1fae5',
                            color: importStatus === 'error' ? '#991b1b' : '#065f46',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
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
