import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ArrowRight, UserCheck, CreditCard, ChevronRight } from 'lucide-react';
import { CLASS_ORDER, getNextClass, PROMOTION_FEES, CLASS_FEES } from '../utils/constants';
import { logActivity } from '../utils/storage';
import useDebounce from '../hooks/useDebounce';

/**
 * @typedef {Object} Student
 * @property {string} id - Unique identifier for the student.
 * @property {string} name - Full name of the student.
 * @property {string} rollNo - Roll number.
 * @property {string} class - Current class/grade.
 * @property {string} section - Section identifier.
 * @property {string} admissionStatus - Admission status (e.g., "Confirmed", "Applied").
 * @property {number} feesAmount - Current monthly fee amount.
 * @property {Object[]} feeHistory - Array of fee payment records.
 */

/**
 * @typedef {Object} User
 * @property {string} email - User's email address.
 * @property {string} id - Unique user identifier.
 */

/**
 * Component for managing student promotions to the next class, including promotion fees.
 *
 * @param {Object} props - The component props.
 * @param {Student[]} props.students - The array of student objects.
 * @param {(student: Student) => void} props.onUpdateStudent - Callback function to update a student's class and fee details.
 * @param {User} props.user - The current authenticated user.
 * @returns {JSX.Element} The rendered promotion board component.
 */
const PromotionBoard = ({ students, onUpdateStudent, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [promotionFee, setPromotionFee] = useState('');
    
    // Only show Confirmed students
    const eligibleStudents = useMemo(() => students.filter(s => s.admissionStatus === 'Confirmed'), [students]);

    // Get unique classes and sections for filters
    const classes = useMemo(() => [...new Set(eligibleStudents.map(s => s.class))].sort((a, b) => {
        const idxA = CLASS_ORDER.indexOf(a);
        const idxB = CLASS_ORDER.indexOf(b);
        return (idxA !== -1 && idxB !== -1) ? idxA - idxB : a.localeCompare(b);
    }), [eligibleStudents]);

    const sections = useMemo(() => [...new Set(eligibleStudents.map(s => s.section))].sort(), [eligibleStudents]);

    const filteredStudents = useMemo(() => {
        // Performance: Hoist toLowerCase() outside the loop to avoid redundant string operations
        const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
        return eligibleStudents.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(lowerSearchTerm) ||
                                  student.rollNo.includes(debouncedSearchTerm);
            const matchesClass = filterClass ? student.class === filterClass : true;
            const matchesSection = filterSection ? student.section === filterSection : true;
            return matchesSearch && matchesClass && matchesSection;
        });
    }, [eligibleStudents, debouncedSearchTerm, filterClass, filterSection]);

    const nextClass = filterClass ? getNextClass(filterClass) : null;
    const canPromote = selectedStudents.size > 0 && nextClass;

    // Default promotion fee when class changes
    useEffect(() => {
        const next = getNextClass(filterClass);
        if (next) {
            setPromotionFee(PROMOTION_FEES[next] || '');
        } else {
            setPromotionFee('');
        }
    }, [filterClass]);

    // Deselect all when class or section filter changes
    useEffect(() => {
        setSelectedStudents(new Set());
    }, [filterClass, filterSection]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
        } else {
            setSelectedStudents(new Set());
        }
    };

    const handleSelectStudent = (id) => {
        const newSet = new Set(selectedStudents);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedStudents(newSet);
    };

    const handlePromote = () => {
        if (!canPromote) return;
        
        const feeAmount = Math.max(0, Number(promotionFee) || 0);
        if (window.confirm(`Promote ${selectedStudents.size} student(s) to ${nextClass} with a promotion fee of ₹${feeAmount}?`)) {
            const dateStr = new Date().toISOString().split('T')[0];
            const studentById = new Map(students.map(s => [s.id, s]));

            selectedStudents.forEach(id => {
                const student = studentById.get(id);
                if (student) {
                    const newFeeHistory = [...(student.feeHistory || [])];
                    if (feeAmount > 0) {
                        newFeeHistory.push({
                            id: crypto.randomUUID(),
                            date: dateStr,
                            amount: feeAmount,
                            type: 'Promotion',
                            month: null,
                            fine: 0
                        });
                    }

                    onUpdateStudent({
                        ...student,
                        class: nextClass,
                        feesAmount: CLASS_FEES[nextClass] || student.feesAmount,
                        feeHistory: newFeeHistory,
                        lastStatusChangeDate: dateStr,
                        lastStatusChangedBy: user?.email || user?.id || 'system'
                    });
                }
            });

            logActivity('promotion', `Bulk promoted ${selectedStudents.size} students to ${nextClass}`);
            setSelectedStudents(new Set());
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:px-8 md:py-6 flex flex-col min-h-full">
            <div className="flex items-center justify-between mb-4 mt-2">
                <h2 className="text-[var(--text-primary)] text-2xl font-bold tracking-tight flex items-center gap-2">
                    <ArrowRight className="text-[var(--accent-primary)]" size={28} />
                    Promotion Board
                </h2>
            </div>

            <div className="flex flex-col gap-4 md:gap-6 mb-6">
                {/* Filters */}
                <div className="flex gap-3 flex-wrap items-center bg-[var(--bg-card)] p-4 rounded-[12px] border border-[var(--border-color)] shadow-sm">
                    <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] pl-9 text-sm placeholder:text-[var(--text-muted)]"
                        />
                    </div>

                    <div className="h-6 w-px bg-[var(--border-color)] mx-1 hidden md:block"></div>

                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] w-auto min-w-[140px] text-sm appearance-none cursor-pointer"
                    >
                        <option value="">Select Class to Promote...</option>
                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] w-auto min-w-[140px] text-sm appearance-none cursor-pointer"
                    >
                        <option value="">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Students List */}
                <div className="flex-1 bg-[var(--bg-card)] rounded-[16px] border border-[var(--border-color)] shadow-sm flex flex-col min-h-0 overflow-hidden">
                    {!filterClass ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] p-8">
                            <Filter size={48} className="mb-4 opacity-20" />
                            <p className="font-semibold text-lg">Select a Class</p>
                            <p className="text-sm">You must select a specific class to view eligible students for promotion.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto custom-scrollbar flex-1">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead className="bg-[var(--bg-main)] sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-5 py-4 border-b border-[var(--border-color)] w-12">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded-[4px] border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/30 cursor-pointer"
                                                    checked={filteredStudents.length > 0 && filteredStudents.every(student => selectedStudents.has(student.id))}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="px-5 py-4 text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">Roll No</th>
                                            <th className="px-5 py-4 text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">Name</th>
                                            <th className="px-5 py-4 text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)]">Section</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-color)]">
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-5 py-12 text-center text-[var(--text-muted)]">
                                                    <p className="font-semibold mb-1">No students found</p>
                                                    <p className="text-sm">Try adjusting your filters</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map(student => (
                                                <tr 
                                                    key={student.id} 
                                                    className={`hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer ${selectedStudents.has(student.id) ? 'bg-[var(--accent-primary)]/5' : ''}`}
                                                    onClick={() => handleSelectStudent(student.id)}
                                                >
                                                    <td className="px-5 py-4">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded-[4px] border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/30 cursor-pointer"
                                                            checked={selectedStudents.has(student.id)}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className="px-5 py-4 text-[var(--text-secondary)] font-mono text-sm">{student.rollNo}</td>
                                                    <td className="px-5 py-4 text-[var(--text-primary)] font-bold text-sm">{student.name}</td>
                                                    <td className="px-5 py-4 text-[var(--text-secondary)] text-sm">{student.section}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-[var(--bg-main)] border-t border-[var(--border-color)] text-sm text-[var(--text-secondary)] font-medium flex justify-between items-center">
                                <span>Total Students: {filteredStudents.length}</span>
                                <span className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-3 py-1 rounded-[8px] font-bold">
                                    {selectedStudents.size} Selected
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Promotion Action Panel */}
                <div className="w-full lg:w-80 flex flex-col gap-6">
                    <div className="bg-[var(--bg-card)] rounded-[16px] border border-[var(--border-color)] shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <ArrowRight className="text-amber-500" size={20} />
                            </div>
                            <div>
                                <h3 className="text-[var(--text-primary)] font-bold">Action Panel</h3>
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">Bulk Promotion</p>
                            </div>
                        </div>

                        {!filterClass ? (
                            <p className="text-sm text-[var(--text-muted)] text-center py-4">Select a class first to see promotion options.</p>
                        ) : !nextClass ? (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-[8px] p-4 text-center">
                                <p className="text-rose-400 font-bold text-sm mb-1">Highest Class</p>
                                <p className="text-rose-400/80 text-xs">Students in {filterClass} cannot be promoted further.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Destination Class</label>
                                    <div className="flex items-center gap-3 bg-[var(--bg-main)] border border-[var(--border-color)] p-3 rounded-[8px]">
                                        <span className="text-[var(--text-muted)] font-medium text-sm line-through decoration-[var(--text-muted)]">{filterClass}</span>
                                        <ChevronRight size={16} className="text-[var(--accent-primary)]" />
                                        <span className="text-[var(--text-primary)] font-bold text-sm bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded-[4px]">{nextClass}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Promotion Fee (₹)</label>
                                    <div className="relative">
                                        <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                        <input
                                            type="number"
                                            value={promotionFee}
                                            onChange={(e) => setPromotionFee(e.target.value)}
                                            className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] pl-9 text-sm font-medium placeholder:text-[var(--text-muted)]"
                                            placeholder="Enter fee amount..."
                                        />
                                    </div>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-2">Leave blank or 0 if free.</p>
                                </div>

                                <button
                                    onClick={handlePromote}
                                    disabled={!canPromote}
                                    className={`w-full py-3 rounded-[8px] font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                        canPromote
                                            ? 'bg-[var(--accent-primary)] text-white shadow-md hover:bg-[var(--accent-hover)] hover:shadow-lg'
                                            : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)] cursor-not-allowed'
                                    }`}
                                >
                                    <UserCheck size={18} />
                                    Promote {selectedStudents.size > 0 ? `${selectedStudents.size} ` : ''}{selectedStudents.size === 1 ? 'Student' : 'Students'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionBoard;
