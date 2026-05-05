
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CheckCircle, Clock, XCircle, FileText, Filter, Search, MoreVertical, SlidersHorizontal } from 'lucide-react';
import CustomMonthPicker from './CustomMonthPicker';
import AdmissionCard from './AdmissionCard';
import { statusHexColors } from '../utils/statusColors';
import { logActivity } from '../utils/storage';
import useDebounce from '../hooks/useDebounce';

/**
 * A sub-component to display the admission status card within the kanban board.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.student - The student object.
 * @param {string} props.color - The theme color for the specific status column.
 * @param {Function} props.onMove - Callback function to handle moving the student to a new status.
 * @returns {JSX.Element} The rendered status card component.
 */
const StatusCard = ({ student, color, onMove }) => {
    const [showActions, setShowActions] = useState(false);

    return (
        <div className="bg-[var(--bg-main)] border border-[var(--border-color)] shadow-sm rounded-[12px] p-5 hover:border-[var(--accent-primary)]/50 transition-colors group relative hover:shadow-md">
            <div className="flex justify-between items-start mb-3">
                <h4 className="m-0 text-[var(--text-primary)] font-bold text-sm group-hover:text-[var(--accent-primary)] transition-colors">{student.name}</h4>
                <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-1.5 rounded-[8px] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Toggle actions"
                    aria-expanded={showActions}
                    aria-haspopup="true"
                >
                    <MoreVertical size={16} />
                </button>
            </div>

            {showActions && (
                <div className="absolute right-4 top-10 bg-[var(--bg-card)] shadow-lg border border-[var(--border-color)] rounded-[12px] py-1 z-20 w-48 animate-in fade-in zoom-in-95 duration-100 overflow-hidden" role="menu" aria-hidden={!showActions}>
                    <div className="px-4 py-2.5 text-[10px] font-bold tracking-wider text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] bg-[var(--bg-main)]/50">Move To</div>
                    {student.admissionStatus !== 'Confirmed' && (
                        <button
                            onClick={() => { onMove(student, 'Confirmed'); setShowActions(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2.5 transition-colors"
                            role="menuitem"
                        >
                            <CheckCircle size={14} className="stroke-[2.5px]" /> Confirmed
                        </button>
                    )}
                    {student.admissionStatus !== 'Provisional' && (
                        <button
                            onClick={() => { onMove(student, 'Provisional'); setShowActions(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-amber-400 hover:bg-amber-500/10 flex items-center gap-2.5 transition-colors"
                            role="menuitem"
                        >
                            <Clock size={14} className="stroke-[2.5px]" /> Provisional
                        </button>
                    )}
                    {student.admissionStatus !== 'Cancelled' && (
                        <button
                            onClick={() => { onMove(student, 'Cancelled'); setShowActions(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                            role="menuitem"
                        >
                            <XCircle size={14} className="stroke-[2.5px]" /> Cancelled
                        </button>
                    )}
                </div>
            )}

            {showActions && (
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)}></div>
            )}

            <p className="m-0 text-xs text-[var(--text-secondary)] font-mono mb-3">
                Class: <span className="font-semibold text-[var(--text-primary)]">{student.class}-{student.section}</span> <span className="text-[var(--border-color)] mx-2">|</span> Roll: <span className="font-semibold text-[var(--text-primary)]">{student.rollNo}</span>
            </p>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1.5 font-semibold">
                    <Clock size={12} />
                    {student.admissionDate || 'N/A'}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[8px] border ${student.feesStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    {student.feesStatus || 'Pending'}
                </span>
            </div>
        </div>
    );
};

const StatusColumn = ({ title, count, total, color, icon: Icon, students, onMove }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="w-full md:w-auto md:flex-1 md:min-w-[320px] flex flex-col h-full bg-[var(--bg-main)] rounded-[16px] border border-[var(--border-color)] p-4 shadow-sm">
            <div
                className="flex flex-col mb-4 bg-[var(--bg-card)] p-5 rounded-[12px] border border-[var(--border-color)] shadow-sm sticky top-0 z-10"
                style={{ borderTop: `4px solid ${color}` }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Icon size={20} style={{ color: color }} className="stroke-[2.5px]" />
                        <h3 className="m-0 text-sm font-bold text-[var(--text-primary)]">{title}</h3>
                    </div>
                    <span className="bg-[var(--bg-main)] text-[var(--text-primary)] px-3 py-1 rounded-[8px] text-xs font-bold border border-[var(--border-color)] shadow-sm">
                        {count}
                    </span>
                </div>
                <div className="w-full bg-[var(--bg-main)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                    ></div>
                </div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--text-secondary)] mt-3 text-right uppercase">{percentage}% of total</p>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-1 pb-2 flex-1 custom-scrollbar">
                {students.map(student => (
                    <StatusCard key={student.id} student={student} color={color} onMove={onMove} />
                ))}
                {students.length === 0 && (
                    <div className="p-8 text-center text-[var(--text-muted)] border border-dashed border-[var(--border-color)] rounded-[12px] bg-[var(--bg-card)] font-semibold mt-4 text-sm">
                        No students
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Component that renders a Kanban-style board for managing student admission statuses.
 *
 * @param {Object} props - The component props.
 * @param {Object[]} props.students - The array of student objects.
 * @param {Function} props.onUpdateStudent - Callback function to update a student.
 * @param {Object} props.user - The current authenticated user.
 * @returns {JSX.Element} The rendered admission status board component.
 */
const AdmissionStatus = ({ students, onUpdateStudent, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterFeeStatus, setFilterFeeStatus] = useState('');
    const [filterMonth, setFilterMonth] = useState(''); // Empty = All Time
    const [showMonthFilter, setShowMonthFilter] = useState(false);
    const dialogRef = useRef(null);

    // Get unique classes and sections
    const classes = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
    const sections = useMemo(() => [...new Set(students.map(s => s.section))].sort(), [students]);

    const filteredStudents = useMemo(() => {
        // Performance: Hoist toLowerCase() outside the loop to avoid redundant string operations
        const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
        return students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(lowerSearchTerm) ||
                student.rollNo.includes(debouncedSearchTerm);
            const matchesClass = filterClass ? student.class === filterClass : true;
            const matchesSection = filterSection ? student.section === filterSection : true;
            const matchesFeeStatus = filterFeeStatus ? student.feesStatus === filterFeeStatus : true;

            let matchesMonth = true;
            if (showMonthFilter && filterMonth && student.admissionDate) {
                matchesMonth = student.admissionDate.startsWith(filterMonth);
            }

            return matchesSearch && matchesClass && matchesSection && matchesFeeStatus && matchesMonth;
        });
    }, [students, debouncedSearchTerm, filterClass, filterSection, filterFeeStatus, showMonthFilter, filterMonth]);

    const confirmed = useMemo(() => filteredStudents.filter(s => s.admissionStatus === 'Confirmed'), [filteredStudents]);
    const provisional = useMemo(() => filteredStudents.filter(s => s.admissionStatus === 'Provisional'), [filteredStudents]);
    const cancelled = useMemo(() => filteredStudents.filter(s => s.admissionStatus === 'Cancelled'), [filteredStudents]);
    const transferred = useMemo(() => filteredStudents.filter(s => s.admissionStatus === 'Transferred'), [filteredStudents]);

    const handleMoveStudent = (student, newStatus) => {
        setPendingAction({
            type: 'move',
            studentId: student.id,
            newStatus,
            label: `Move ${student.name} to ${newStatus}?`
        });
    };

    const confirmPendingAction = () => {
        if (!pendingAction || pendingAction.type !== 'move') return;
        const student = students.find(s => s.id === pendingAction.studentId);
        if (student) {
            logActivity('admission', `Changed admission status for ${student.name} to ${pendingAction.newStatus}`);
            
            const updatedStudent = {
                ...student,
                admissionStatus: pendingAction.newStatus,
                lastStatusChangeDate: new Date().toISOString().slice(0, 10),
                lastStatusChangedBy: user?.email || user?.id || 'system'
            };

            // Issue #9: TC reversal via AdmissionStatus leaves stale tcDetails
            if (student.admissionStatus === 'Transferred' && pendingAction.newStatus !== 'Transferred') {
                updatedStudent.tcDetails = null;
            }

            onUpdateStudent(updatedStudent);
        }
        setPendingAction(null);
    };

    // Focus trap for modal dialog
    useEffect(() => {
        if (!pendingAction || !dialogRef.current) return;

        const dialog = dialogRef.current;

        // Find all focusable elements within the dialog
        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = dialog.querySelectorAll(focusableSelector);
        const focusableArray = Array.from(focusableElements);

        if (focusableArray.length === 0) return;

        const firstElement = focusableArray[0];
        const lastElement = focusableArray[focusableArray.length - 1];

        // Set initial focus to the first button (Cancel button)
        firstElement.focus();

        // Handle Tab and Shift+Tab to trap focus
        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift+Tab: if on first element, wrap to last
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab: if on last element, wrap to first
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        dialog.addEventListener('keydown', handleKeyDown);

        // Cleanup on unmount or when pendingAction becomes null
        return () => {
            dialog.removeEventListener('keydown', handleKeyDown);
        };
    }, [pendingAction]);

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:px-8 md:py-6 flex flex-col min-h-full">
            <h2 className="text-[var(--text-primary)] text-2xl font-bold mb-4 mt-2 tracking-tight">Admission Board</h2>

            <div className="flex flex-col gap-4 md:gap-6 mb-6">
                {/* Filters */}
                <div className="flex flex-col gap-3 bg-[var(--bg-card)] p-4 rounded-[12px] border border-[var(--border-color)] shadow-sm">
                    <div className="flex gap-3 flex-wrap items-center">
                        <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                            <input
                                type="text"
                                placeholder="Search applicants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search applicants"
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] pl-9 text-sm font-medium placeholder:text-[var(--text-muted)]"
                            />
                        </div>

                        {/* Mobile Filter Toggle */}
                        <div className="md:hidden flex gap-2">
                             <button
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[8px] border text-sm font-semibold transition-colors ${showMobileFilters || filterClass || filterSection || filterFeeStatus || showMonthFilter ? 'bg-[var(--accent-light)] border-[var(--accent-primary)]/30 text-[var(--accent-primary)]' : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                aria-label="Toggle filters"
                                aria-expanded={showMobileFilters}
                                aria-controls="mobile-filters-panel"
                            >
                                <SlidersHorizontal size={16} />
                                {(filterClass || filterSection || filterFeeStatus || showMonthFilter) && <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"></span>}
                            </button>
                        </div>

                        {/* Desktop Filters Row */}
                        <div className="hidden md:flex items-center gap-3 flex-wrap flex-1">
                            <div className="h-6 w-px bg-[var(--border-color)] mx-1"></div>

                            <select
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                aria-label="Filter by class"
                                className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-[var(--text-primary)] font-medium outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] w-auto min-w-[140px] text-sm appearance-none cursor-pointer"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                            </select>

                            <select
                                value={filterSection}
                                onChange={(e) => setFilterSection(e.target.value)}
                                aria-label="Filter by section"
                                className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-[var(--text-primary)] font-medium outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] w-auto min-w-[140px] text-sm appearance-none cursor-pointer"
                            >
                                <option value="">All Sections</option>
                                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>

                            <select
                                value={filterFeeStatus}
                                onChange={(e) => setFilterFeeStatus(e.target.value)}
                                aria-label="Filter by fee status"
                                className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-[var(--text-primary)] font-medium outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] w-auto min-w-[140px] text-sm appearance-none cursor-pointer"
                            >
                                <option value="">All Fees</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                            </select>

                            <div className="h-10 w-px bg-[var(--border-color)] mx-2"></div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setShowMonthFilter(!showMonthFilter);
                                        if (!showMonthFilter && !filterMonth) {
                                            const now = new Date();
                                            const yyyy = now.getFullYear();
                                            const mm = String(now.getMonth() + 1).padStart(2, '0');
                                            setFilterMonth(`${yyyy}-${mm}`);
                                        }
                                    }}
                                    className={`p-2.5 rounded-[8px] border transition-colors ${showMonthFilter
                                        ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white'
                                        : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]'}`}
                                    title="Filter by Admission Month"
                                    aria-label="Filter by month"
                                >
                                    <Filter size={18} className="stroke-[2.5px]" />
                                </button>

                                {showMonthFilter && (
                                    <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                                        <CustomMonthPicker
                                            value={filterMonth}
                                            onChange={setFilterMonth}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filter Modal/Dropdown */}
                    {showMobileFilters && (
                        <div id="mobile-filters-panel" role="region" aria-label="Mobile Filters" className="md:hidden pt-3 border-t border-[var(--border-color)] grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                             <select
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                aria-label="Filter by class"
                                className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-sm text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] appearance-none cursor-pointer"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                            <select
                                value={filterSection}
                                onChange={(e) => setFilterSection(e.target.value)}
                                aria-label="Filter by section"
                                className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-sm text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] appearance-none cursor-pointer"
                            >
                                <option value="">All Sections</option>
                                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                            <select
                                value={filterFeeStatus}
                                onChange={(e) => setFilterFeeStatus(e.target.value)}
                                aria-label="Filter by fee status"
                                className="bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[8px] text-sm text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] appearance-none cursor-pointer"
                            >
                                <option value="">All Fees</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                            </select>

                            <div className="flex items-center gap-2">
                                 <button
                                    onClick={() => {
                                        setShowMonthFilter(!showMonthFilter);
                                        if (!showMonthFilter && !filterMonth) {
                                            const now = new Date();
                                            const yyyy = now.getFullYear();
                                            const mm = String(now.getMonth() + 1).padStart(2, '0');
                                            setFilterMonth(`${yyyy}-${mm}`);
                                        }
                                    }}
                                    className={`p-2.5 rounded-[8px] border transition-colors h-[42px] w-[42px] flex items-center justify-center shrink-0 ${showMonthFilter
                                        ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white'
                                        : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'}`}
                                    title="Filter by Admission Month"
                                    aria-label="Filter by month"
                                >
                                    <Filter size={18} className="stroke-[2.5px]" />
                                </button>
                                {showMonthFilter && (
                                    <div className="flex-1 overflow-hidden h-[42px] flex items-center">
                                        <CustomMonthPicker
                                            value={filterMonth}
                                            onChange={setFilterMonth}
                                            compact={true}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden pt-4 pb-4 space-y-4">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                        <AdmissionCard
                            key={student.id}
                            student={student}
                            onUpdateStatus={handleMoveStudent}
                        />
                    ))
                ) : (
                    <div className="py-20 text-center border border-[var(--border-color)] rounded-[16px] bg-[var(--bg-card)] mx-4 shadow-sm">
                        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-[var(--bg-main)] rounded-[16px] border border-[var(--border-color)]">
                            <Search size={32} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[var(--text-primary)] font-bold text-lg">No results found</p>
                        <p className="text-[var(--text-secondary)] font-medium text-sm mt-1">Try adjusting your filters</p>
                    </div>
                )}
            </div>

            <div className="hidden md:flex flex-col md:flex-row gap-6 md:overflow-x-auto pb-5 h-auto md:h-full items-start">
                <StatusColumn
                    title="Confirmed"
                    count={confirmed.length}
                    total={filteredStudents.length}
                    color={statusHexColors.Confirmed}
                    icon={CheckCircle}
                    students={confirmed}
                    onMove={handleMoveStudent}
                />
                <StatusColumn
                    title="Provisional"
                    count={provisional.length}
                    total={filteredStudents.length}
                    color={statusHexColors.Provisional}
                    icon={Clock}
                    students={provisional}
                    onMove={handleMoveStudent}
                />
                <StatusColumn
                    title="Cancelled"
                    count={cancelled.length}
                    total={filteredStudents.length}
                    color={statusHexColors.Cancelled}
                    icon={XCircle}
                    students={cancelled}
                    onMove={handleMoveStudent}
                />
                <StatusColumn
                    title="Transferred"
                    count={transferred.length}
                    total={filteredStudents.length}
                    color={statusHexColors.Transferred}
                    icon={FileText}
                    students={transferred}
                    onMove={handleMoveStudent}
                />
            </div>

            {pendingAction && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setPendingAction(null)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') setPendingAction(null);
                }}
              >
                <div
                  ref={dialogRef}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-sm w-full shadow-2xl"
                  onClick={e => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="confirm-title"
                >
                  <p id="confirm-title" className="text-[var(--text-primary)] font-semibold text-sm mb-5">{pendingAction.label}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPendingAction(null)}
                      className="flex-1 py-2.5 text-sm font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--border-highlight)] transition-colors"
                      aria-label="Cancel"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmPendingAction}
                      className="flex-1 py-2.5 text-sm font-semibold bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                      aria-label="Confirm"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
};

export default AdmissionStatus;
