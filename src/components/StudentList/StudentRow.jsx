import React from 'react';
import { Square, CheckSquare, Edit2, Trash2, IndianRupee } from 'lucide-react';

const StudentRow = ({ 
    student, idx, status, isSelected, 
    toggleStudentSelection, onEdit, onDelete, onPayFeeClick 
}) => {
    return (
        <tr
            className={`hover:bg-[var(--bg-card-hover)] group transition-colors ${isSelected ? 'bg-[var(--accent-primary)]/5' : ''}`}
            style={{ animation: `kinetic-enter 0.3s var(--kinetic-curve) both`, animationDelay: `${idx * 25}ms` }}
        >
            {/* Checkbox */}
            <td className="px-4 py-3 w-10">
                <button
                    onClick={() => toggleStudentSelection(student.id)}
                    className={`flex items-center justify-center transition-colors ${isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--border-strong)] hover:text-[var(--accent-primary)]'}`}
                    aria-label={isSelected ? `Deselect ${student.name}` : `Select ${student.name}`}
                >
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
            </td>

            {/* Student Info */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">
                        {student.name?.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">{student.name}</div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)]">Roll: {student.rollNo}</div>
                    </div>
                </div>
            </td>

            {/* Details */}
            <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Class {student.class} • Sec {student.section}</span>
                    <span className="text-[11px] text-[var(--text-muted)] line-clamp-1">{student.guardianName || 'No Guardian'}</span>
                </div>
            </td>

            {/* Status */}
            <td className="px-4 py-3 text-center">
                <span className={`status-pill ${
                    status === 'Paid' ? 'status-paid' : 
                    status === 'Overdue' ? 'status-overdue' : 'status-pending'
                }`}>
                    {status}
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onPayFeeClick(student)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-light)] rounded-md transition-all"
                        title="Quick Pay"
                    >
                        <IndianRupee size={14} />
                    </button>
                    <button
                        onClick={() => onEdit(student)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-light)] rounded-md transition-all"
                        title="Edit Record"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(student.id)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
                        title="Delete Record"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default StudentRow;
