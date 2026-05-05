import React, { useState, useMemo } from 'react';
import { Search, FileText, Filter, IndianRupee, ChevronDown, ChevronUp, User, SlidersHorizontal, ArrowDownAZ } from 'lucide-react';
import PaymentHistoryModal from './PaymentHistoryModal';
import PaymentCard from './PaymentCard';
import useDebounce from '../hooks/useDebounce';
import Pagination from './Pagination';

/**
 * Component that displays the payment history for all students with filtering and sorting.
 *
 * @param {Object} props - The component props.
 * @param {Object[]} props.students - The array of student objects with fee history.
 * @returns {JSX.Element} The rendered payment history component.
 */

const FilterSelects = ({ classes, sections, filterClass, setFilterClass, filterSection, setFilterSection, isMobile }) => {
    const baseClass = isMobile
        ? "bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-2.5 rounded-[12px] text-sm text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] appearance-none cursor-pointer w-full"
        : "bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3 rounded-[12px] text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] appearance-none cursor-pointer flex-1 min-w-[160px]";

    return (
        <>
            <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                aria-label="Filter by class"
                className={baseClass}
            >
                <option value="">All Classes</option>
                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>

            <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                aria-label="Filter by section"
                className={baseClass}
            >
                <option value="">All Sections</option>
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
        </>
    );
};

const PaymentHistory = ({ students, onEditFee }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showMobileSort, setShowMobileSort] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);

    const classes = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
    const sections = useMemo(() => [...new Set(students.map(s => s.section))].sort(), [students]);

    const filteredStudents = useMemo(() => {
        // Performance: Hoist toLowerCase() outside the loop to avoid redundant string operations
        const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
        return students
        .filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(lowerSearchTerm) ||
                student.rollNo.includes(debouncedSearchTerm) ||
                student.class.includes(debouncedSearchTerm);
            const matchesClass = filterClass ? student.class === filterClass : true;
            const matchesSection = filterSection ? student.section === filterSection : true;

            return matchesSearch && matchesClass && matchesSection;
        })
        .sort((a, b) => {
            let valA = a[sortBy]?.toString().toLowerCase() || '';
            let valB = b[sortBy]?.toString().toLowerCase() || '';

            if (sortBy === 'rollNo') {
                const numA = parseInt(valA);
                const numB = parseInt(valB);
                if (!isNaN(numA) && !isNaN(numB)) {
                    valA = numA;
                    valB = numB;
                }
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [students, debouncedSearchTerm, filterClass, filterSection, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const safeCurrentPage = Math.max(1, Math.min(currentPage, Math.max(1, totalPages)));

    const currentStudents = filteredStudents.slice(
        (safeCurrentPage - 1) * itemsPerPage,
        safeCurrentPage * itemsPerPage
    );

    const handleViewHistory = (student) => {
        setSelectedStudentId(student.id);
        setShowHistoryModal(true);
    };

    const getTotalPaid = (student) => {
        if (!student.feeHistory) return 0;
        return student.feeHistory.reduce((sum, p) => sum + (Number(p.amount) || 0) + (Number(p.fine) || 0), 0);
    };

    const getLastPaymentDate = (student) => {
        if (!student.feeHistory || student.feeHistory.length === 0) return 'N/A';

        // Filter to only valid date entries
        const validEntries = student.feeHistory.filter(p =>
            typeof p.date === 'string' && !isNaN(Date.parse(p.date))
        );

        if (validEntries.length === 0) return 'N/A';

        // Optimize: Find max date in O(n) instead of sorting O(n log n)
        const maxDate = validEntries.reduce((max, p) => p.date > max ? p.date : max, validEntries[0].date);

        // Safely parse and format the date
        const parsedDate = new Date(maxDate);
        if (isNaN(parsedDate.getTime())) return 'N/A';

        return parsedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="max-w-7xl mx-auto p-3 md:p-6 lg:p-8">
            <div className="bg-[var(--bg-card)] rounded-[16px] shadow-sm border border-[var(--border-color)] overflow-hidden page-enter">
                <div className="p-4 md:p-8 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 rounded-[16px]">
                            <IndianRupee size={28} className="stroke-[2.5px]" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Payment Audit</h2>
                            <p className="text-[var(--text-secondary)] text-sm mt-1">Detailed financial records for all students</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 md:w-80">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] stroke-[3px]" aria-hidden="true" />
                            <input
                                type="text"
                                placeholder="Search by name, roll number, or class"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search by name, roll number, or class"
                                className="w-full pl-12 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] focus:border-[var(--accent-primary)] transition-colors outline-none text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)]"
                            />
                        </div>
                    </div>
                </div>


                {/* Desktop Filters */}
                <div className="hidden md:flex p-4 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex-wrap gap-4">
                    <FilterSelects
                        classes={classes}
                        sections={sections}
                        filterClass={filterClass}
                        setFilterClass={setFilterClass}
                        filterSection={filterSection}
                        setFilterSection={setFilterSection}
                        isMobile={false}
                    />

                    <div className="h-10 w-px bg-[var(--border-color)] mx-2"></div>

                    <div className="flex items-center gap-2 flex-1">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort by"
                            className="bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3 rounded-[12px] text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] appearance-none cursor-pointer flex-1"
                        >
                            <option value="name">Sort by: Name</option>
                            <option value="rollNo">Sort by: Roll No</option>
                            <option value="class">Sort by: Class</option>
                        </select>

                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
                            aria-label={`Set sort order to ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                        >
                            {sortOrder === 'asc' ? <ChevronDown size={20} className="stroke-[2.5px]" /> : <ChevronUp size={20} className="stroke-[2.5px]" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Filter & Sort Bar */}
                <div className="md:hidden flex p-3 bg-[var(--bg-card)] border-b border-[var(--border-color)] gap-2">
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-[12px] border text-sm font-semibold transition-colors ${showMobileFilters || filterClass || filterSection ? 'bg-[var(--accent-light)] border-[var(--accent-primary)]/30 text-[var(--accent-primary)]' : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        aria-label="Toggle filters"
                        aria-expanded={showMobileFilters}
                        aria-controls="mobile-filters-panel"
                    >
                        <SlidersHorizontal size={16} />
                        Filters {(filterClass || filterSection) && <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"></span>}
                    </button>
                    <button
                        onClick={() => setShowMobileSort(!showMobileSort)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-[12px] border text-sm font-semibold transition-colors ${showMobileSort ? 'bg-[var(--accent-light)] border-[var(--accent-primary)]/30 text-[var(--accent-primary)]' : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        aria-label="Toggle sort"
                        aria-expanded={showMobileSort}
                        aria-controls="mobile-sort-panel"
                    >
                        <ArrowDownAZ size={16} />
                        Sort
                    </button>
                </div>

                {/* Mobile Filter Modal/Dropdown */}
                {showMobileFilters && (
                    <div id="mobile-filters-panel" role="region" aria-label="Mobile Filters" className="md:hidden p-4 bg-[var(--bg-main)] border-b border-[var(--border-color)] grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                        <FilterSelects
                            classes={classes}
                            sections={sections}
                            filterClass={filterClass}
                            setFilterClass={setFilterClass}
                            filterSection={filterSection}
                            setFilterSection={setFilterSection}
                            isMobile={true}
                        />
                    </div>
                )}

                {/* Mobile Sort Modal/Dropdown */}
                {showMobileSort && (
                    <div id="mobile-sort-panel" role="region" aria-label="Mobile Sort" className="md:hidden p-4 bg-[var(--bg-main)] border-b border-[var(--border-color)] flex gap-3 animate-in slide-in-from-top-2">
                         <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort by"
                            className="bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-2.5 rounded-[12px] text-sm text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] appearance-none cursor-pointer flex-1"
                        >
                            <option value="name">Name</option>
                            <option value="rollNo">Roll No</option>
                            <option value="class">Class</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center cursor-pointer shrink-0"
                            aria-label={`Set sort order to ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                        >
                            {sortOrder === 'asc' ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                        </button>
                    </div>
                )}

                {/* Mobile Card View */}
                <div className="md:hidden pt-4 pb-4 space-y-4">
                    {currentStudents.length > 0 ? (
                        currentStudents.map((student) => (
                            <PaymentCard
                                key={student.id}
                                student={student}
                                onViewHistory={handleViewHistory}
                            />
                        ))
                    ) : (
                        <div className="py-16 text-center border border-[var(--border-color)] bg-[var(--bg-main)] mx-4 rounded-[12px]">
                            <div className="p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full">
                                <Search size={32} className="text-[var(--text-muted)]" />
                            </div>
                            <p className="text-[var(--text-primary)] font-bold text-lg">No results found</p>
                            <p className="text-[var(--text-secondary)] font-mono text-xs mt-2">Try adjusting your filters</p>
                        </div>
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                                <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)]  border-b border-[var(--border-color)]">Beneficiary</th>
                                <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)]  border-b border-[var(--border-color)]">Academic Unit</th>
                                <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)]  border-b border-[var(--border-color)]">Cumulative Paid</th>
                                <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)]  border-b border-[var(--border-color)]">Recent Activity</th>
                                <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)]  border-b border-[var(--border-color)] text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {currentStudents.map(student => (
                                <tr key={student.id} className="hover:bg-[var(--bg-card-hover)] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 flex items-center justify-center font-bold text-sm shrink-0">
                                                <User size={18} className="stroke-[2px]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-[var(--text-primary)] text-sm truncate flex items-center gap-3">
                                                    {student.name}
                                                    {student.admissionStatus === 'Transferred' && (
                                                        <span className="text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2 py-1 rounded-[12px] border border-rose-500/20 uppercase tracking-wide">Exit</span>
                                                    )}
                                                </p>
                                                <p className="text-[var(--text-secondary)] font-mono text-[10px] truncate mt-1">Roll: {student.rollNo}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-[var(--text-primary)] font-semibold">Class {student.class} — {student.section}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-base font-bold text-emerald-400 tracking-wider">₹{getTotalPaid(student).toLocaleString()}</span>
                                            <span className="text-[10px] text-[var(--text-secondary)] font-medium tracking-wide">Gross Total</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-[var(--text-primary)] font-mono font-semibold">{getLastPaymentDate(student)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleViewHistory(student)}
                                            className="px-5 py-2.5 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 transition-colors flex items-center gap-2 ml-auto shadow-sm text-xs"
                                            aria-label={`View payment history for ${student.name}`}
                                        >
                                            <FileText size={16} className="stroke-[2px]" />
                                            History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {currentStudents.length === 0 && (
                    <div className="py-24 text-center hidden md:block">
                        <div className="w-20 h-20 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-xl flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[var(--text-secondary)] font-medium text-sm">No records matching search</p>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
                        <Pagination
                            currentPage={safeCurrentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredStudents.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}
            </div>

            {showHistoryModal && selectedStudentId && (
                <PaymentHistoryModal
                    student={students.find(s => s.id === selectedStudentId)}
                    allStudents={students}
                    onEditFee={onEditFee}
                    onClose={() => setShowHistoryModal(false)}
                />
            )}
        </div>
    );
};

export default PaymentHistory;
