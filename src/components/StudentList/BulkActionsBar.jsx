import React from 'react';
import { LogOut, Trash2, X } from 'lucide-react';

const BulkActionsBar = ({ selectedStudents, bulkPending, handleBulkExit, handleBulkDelete, setSelectedStudents }) => {
    if (selectedStudents.size === 0) return null;

    return (
        <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-[var(--accent-light)] border-b border-[var(--accent-primary)]/20">
            <span className="text-xs font-semibold text-[var(--accent-primary)]">{selectedStudents.size} selected</span>
            <button
                onClick={handleBulkExit}
                disabled={bulkPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500 hover:text-white transition-colors disabled:opacity-50"
                aria-label="Mark selected students as exited"
            >
                <LogOut size={12} />
                Mark as Exited
            </button>
            <button
                onClick={handleBulkDelete}
                disabled={bulkPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-white transition-colors disabled:opacity-50"
                aria-label="Delete selected students"
            >
                <Trash2 size={12} />
                Delete
            </button>
            <button
                onClick={() => setSelectedStudents(new Set())}
                className="ml-auto p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Clear selection"
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default BulkActionsBar;
