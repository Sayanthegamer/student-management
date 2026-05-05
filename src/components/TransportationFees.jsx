import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Bus, CheckCircle2, Circle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import { CLASS_ORDER } from '../utils/constants';

const TransportationFees = ({ students, onBulkUpdateStudents }) => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');

    const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [remarks, setRemarks] = useState('Transportation Fee');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Only show active, non-exited students
    const activeStudents = useMemo(() => {
        return students.filter(s => s.admissionStatus !== 'Exited' && s.admissionStatus !== 'Cancelled');
    }, [students]);

    // Derived states
    const availableClasses = useMemo(() => {
        const classes = new Set(activeStudents.map(s => s.class).filter(Boolean));
        return Array.from(classes).sort((a, b) => {
            const indexA = CLASS_ORDER.indexOf(a);
            const indexB = CLASS_ORDER.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [activeStudents]);

    const availableSections = useMemo(() => {
        if (!filterClass) return [];
        const sections = new Set(activeStudents.filter(s => s.class === filterClass).map(s => s.section).filter(Boolean));
        return Array.from(sections).sort();
    }, [activeStudents, filterClass]);

    // Filtering
    const filteredStudents = useMemo(() => {
        return activeStudents.filter(student => {
            const matchesSearch = !debouncedSearchTerm ||
                student.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                String(student.rollNo || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const matchesClass = !filterClass || student.class === filterClass;
            const matchesSection = !filterSection || student.section === filterSection;

            return matchesSearch && matchesClass && matchesSection;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [activeStudents, debouncedSearchTerm, filterClass, filterSection]);

    // Select/Deselect handlers
    const toggleStudentSelection = (id) => {
        const newSelected = new Set(selectedStudentIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStudentIds(newSelected);
    };

            const handleSelectAll = () => {
        const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.has(s.id));
        const newSelected = new Set(selectedStudentIds);

        if (isAllSelected) {
            filteredStudents.forEach(s => newSelected.delete(s.id));
        } else {
            filteredStudents.forEach(s => newSelected.add(s.id));
        }
        setSelectedStudentIds(newSelected);
    };

    // Auto-reset section filter if class changes and section is no longer valid
    useEffect(() => {
        if (filterClass && filterSection && !availableSections.includes(filterSection)) {
            setFilterSection('');
        }
    }, [filterClass, filterSection, availableSections]);

    // Handle Submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (selectedStudentIds.size === 0) {
            showToast('Please select at least one student.', 'error');
            return;
        }

        const numAmount = Number(amount);
        if (!amount || isNaN(numAmount) || numAmount <= 0) {
            showToast('Please enter a valid amount.', 'error');
            return;
        }

        if (!date) {
            showToast('Please select a date.', 'error');
            return;
        }

        const confirmMessage = `Are you sure you want to add a Transportation Fee of ₹${numAmount} for ${selectedStudentIds.size} student(s)?`;
        if (!window.confirm(confirmMessage)) return;

        try {
            setIsSubmitting(true);
            const updates = Array.from(selectedStudentIds).map(id => {
                const student = students.find(s => s.id === id);
                if (!student) return null;

                                const newFeeRecord = {
                    id: crypto.randomUUID(),
                    date: date,
                    month: date.substring(0, 7),
                    type: 'Fee',
                    amount: numAmount,
                    fine: 0,
                    remarks: remarks || 'Transportation Fee',
                    itemized_breakdown: { transport: numAmount }
                };

                return {
                    ...student,
                    feeHistory: [...(student.feeHistory || []), newFeeRecord],
                    replaceFeeHistory: true
                };
            }).filter(Boolean);

            await onBulkUpdateStudents(updates);

            showToast(`Successfully added transportation fees for ${selectedStudentIds.size} student(s)!`, 'success');

            // Reset form
            setSelectedStudentIds(new Set());
            setAmount('');
            setRemarks('Transportation Fee');
        } catch (error) {
            console.error('Error applying transportation fees:', error);
            showToast('Failed to apply transportation fees. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[var(--bg-main)] animate-fade-in">
            {/* Header section */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border-subtle)] relative z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-3xl" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20 shadow-inner">
                                <Bus size={24} className="text-[var(--accent-primary)]" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Transport Fees</h1>
                                <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                                    Bulk apply transportation fees to multiple students at once.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                    {/* Two-column layout for large screens */}
                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* LEFT COLUMN: Filters and Student List */}
                        <div className="flex-1 flex flex-col min-h-[500px]">
                            {/* Search & Filters */}
                            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4 shadow-sm mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or roll no..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                        <select
                                            value={filterClass}
                                            onChange={(e) => {
                                                setFilterClass(e.target.value);
                                            }}
                                            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] appearance-none"
                                        >
                                            <option value="">All Classes</option>
                                            {availableClasses.map(cls => (
                                                <option key={cls} value={cls}>{cls}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={filterSection}
                                            onChange={(e) => setFilterSection(e.target.value)}
                                            disabled={!filterClass || availableSections.length === 0}
                                            className="w-full px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] appearance-none disabled:opacity-50"
                                        >
                                            <option value="">All Sections</option>
                                            {availableSections.map(sec => (
                                                <option key={sec} value={sec}>Section {sec}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Student List */}
                            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                                <div className="px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-between items-center">
                                                                                                            <div className="flex items-center gap-3">
                                        {(() => {
                                            const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.has(s.id));
                                            return (
                                                <button
                                                    onClick={handleSelectAll}
                                                    className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                                                    aria-label={isAllSelected ? "Deselect all students" : "Select all students"}
                                                    aria-checked={isAllSelected}
                                                    role="checkbox"
                                                >
                                                    {isAllSelected ? (
                                                        <CheckCircle2 size={20} className="text-[var(--accent-primary)]" aria-hidden="true" />
                                                    ) : (
                                                        <Circle size={20} aria-hidden="true" />
                                                    )}
                                                </button>
                                            );
                                        })()}
                                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                                            {filteredStudents.length} Students Found
                                        </span>
                                    </div>
                                    <span className="text-xs bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2.5 py-1 rounded-md font-medium">
                                        {selectedStudentIds.size} Selected
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => {
                                            const isSelected = selectedStudentIds.has(student.id);
                                            return (
                                                                                                <div
                                                    key={student.id}
                                                    onClick={() => toggleStudentSelection(student.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            toggleStudentSelection(student.id);
                                                        }
                                                    }}
                                                    role="checkbox"
                                                    aria-checked={isSelected}
                                                    tabIndex={0}
                                                    className={`
                                                        flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]
                                                        ${isSelected ? 'bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/30' : 'bg-[var(--bg-main)] border border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]'}
                                                    `}
                                                >
                                                    <div className={`
                                                        w-5 h-5 rounded flex items-center justify-center border transition-colors
                                                        ${isSelected ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' : 'border-[var(--border-strong)] bg-transparent'}
                                                    `} aria-hidden="true">
                                                        {isSelected && <CheckCircle2 size={14} />}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{student.name}</span>
                                                            <span className="text-xs text-[var(--text-muted)] tabular-nums">Roll: {student.rollNo || 'N/A'}</span>
                                                        </div>
                                                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                                                            Class {student.class} {student.section ? `- Sec ${student.section}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] space-y-3 py-12">
                                            <Bus size={32} className="opacity-20" />
                                            <p className="text-sm">No students match your search.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Action Form */}
                        <div className="lg:w-80 flex-shrink-0">
                            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm sticky top-6">
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                    <Bus size={18} className="text-[var(--accent-primary)]" />
                                    Apply Fees
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                                                        <div>
                                        <label htmlFor="transport-amount" className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                                            Amount (₹) *
                                        </label>
                                        <input
                                            id="transport-amount"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="e.g. 1500"
                                            className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] font-mono"
                                            required
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="transport-date" className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                                            Date *
                                        </label>
                                        <input
                                            id="transport-date"
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="transport-remarks" className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                                            Remarks
                                        </label>
                                        <textarea
                                            id="transport-remarks"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Optional remarks"
                                            className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] resize-none h-20"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-[var(--border-subtle)]">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm text-[var(--text-secondary)]">Total to Apply</span>
                                            <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
                                                ₹{(Number(amount) || 0) * selectedStudentIds.size}
                                            </span>
                                        </div>
                                                                                <button
                                            type="submit"
                                            disabled={selectedStudentIds.size === 0 || !amount || isSubmitting}
                                            className="w-full py-2.5 px-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-muted)] disabled:border disabled:border-[var(--border-color)] text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Bus size={16} />
                                            {isSubmitting ? 'Applying...' : `Apply to ${selectedStudentIds.size} Student${selectedStudentIds.size !== 1 ? 's' : ''}`}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportationFees;
