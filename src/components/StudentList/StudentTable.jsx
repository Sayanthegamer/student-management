import React from 'react';
import { Square, CheckSquare, MinusSquare } from 'lucide-react';
import StudentRow from './StudentRow';

const StudentTable = ({ 
    currentStudents, selectedStudents, handleSelectAll, 
    toggleStudentSelection, getFeeStatusForMonth, 
    filterMonth, currentMonth, onEdit, onDelete, onPayFeeClick 
}) => {
    const visibleIds = currentStudents.map(s => s.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedStudents.has(id));
    const someSelected = visibleIds.some(id => selectedStudents.has(id));

    return (
        <div className="hidden md:block flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[var(--bg-main)] border-b border-[var(--border-subtle)]">
                        <th className="px-4 py-3 w-10">
                            <button
                                onClick={() => handleSelectAll(allVisibleSelected)}
                                className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors flex items-center justify-center"
                                aria-label={allVisibleSelected ? "Deselect all" : "Select all"}
                                aria-checked={allVisibleSelected ? "true" : someSelected ? "mixed" : "false"}
                                role="checkbox"
                            >
                                {allVisibleSelected ? (
                                    <CheckSquare size={16} className="text-[var(--accent-primary)]" />
                                ) : someSelected ? (
                                    <MinusSquare size={16} className="text-[var(--accent-primary)]" />
                                ) : (
                                    <Square size={16} />
                                )}
                            </button>
                        </th>
                        <th className="px-4 py-3 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Student</th>
                        <th className="px-4 py-3 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Details</th>
                        <th className="px-4 py-3 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider text-center">Status</th>
                        <th className="px-4 py-3 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-card)]">
                    {currentStudents.map((student, idx) => (
                        <StudentRow 
                            key={student.id}
                            student={student}
                            idx={idx}
                            status={getFeeStatusForMonth(student, filterMonth, currentMonth)}
                            isSelected={selectedStudents.has(student.id)}
                            toggleStudentSelection={toggleStudentSelection}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onPayFeeClick={onPayFeeClick}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentTable;
