import React, { useState, useMemo, useEffect } from 'react';
import { Search, FileText, Filter, IndianRupee, ChevronDown, ChevronUp, User } from 'lucide-react';
import PaymentHistoryModal from './PaymentHistoryModal';
import PaymentCard from './PaymentCard';

const PaymentHistory = ({ students }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const classes = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
    const sections = useMemo(() => [...new Set(students.map(s => s.section))].sort(), [students]);

    const filteredStudents = useMemo(() => students
        .filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
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
        }), [students, debouncedSearchTerm, filterClass, filterSection, sortBy, sortOrder]);

    const handleViewHistory = (student) => {
        setSelectedStudent(student);
        setShowHistoryModal(true);
    };

    const getTotalPaid = (student) => {
        if (!student.feeHistory) return 0;
        return student.feeHistory.reduce((sum, p) => sum + (Number(p.amount) || 0) + (Number(p.fine) || 0), 0);
    };

    const getLastPaymentDate = (student) => {
        if (!student.feeHistory || student.feeHistory.length === 0) return 'N/A';
        const sorted = [...student.feeHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        return new Date(sorted[0].date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="max-w-7xl mx-auto p-3 md:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden page-enter">
                <div className="p-3 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <IndianRupee size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Payment Audit</h2>
                            <p className="text-slate-500 text-sm mt-1 font-medium">Detailed financial records for all students</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 md:w-64">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-slate-50/50 border-b border-slate-100 grid grid-cols-2 md:flex flex-wrap gap-2 md:gap-3">
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-700"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-700"
                    >
                        <option value="">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                    </select>

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

                    <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-700"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="rollNo">Sort by Roll No</option>
                            <option value="class">Sort by Class</option>
                        </select>

                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all min-h-[38px] min-w-[38px] flex items-center justify-center"
                        >
                            {sortOrder === 'asc' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden px-4 pt-4 pb-4 space-y-3">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <PaymentCard
                                key={student.id}
                                student={student}
                                onViewHistory={handleViewHistory}
                            />
                        ))
                    ) : (
                        <div className="py-16 text-center">
                            <div className="p-5 bg-slate-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                <Search size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-600 font-bold text-base">No results found</p>
                            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search term</p>
                        </div>
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Beneficiary</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Academic Unit</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Cumulative Paid</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Recent Activity</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                                                <User size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate flex items-center gap-2">
                                                    {student.name}
                                                    {student.admissionStatus === 'Transferred' && (
                                                        <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-tighter">Exit</span>
                                                    )}
                                                </p>
                                                <p className="text-slate-400 text-xs truncate uppercase tracking-tighter font-medium">Roll: {student.rollNo}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600 font-semibold">Class {student.class} — {student.section}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-base font-black text-emerald-600 tracking-tight">₹{getTotalPaid(student).toLocaleString()}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gross Total</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-500 font-medium">{getLastPaymentDate(student)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleViewHistory(student)}
                                            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-indigo-600 text-xs font-bold uppercase tracking-wider hover:bg-indigo-50 hover:border-indigo-100 transition-all active:scale-95 flex items-center gap-2 ml-auto shadow-sm"
                                        >
                                            <FileText size={14} />
                                            History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredStudents.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records matching search</p>
                    </div>
                )}
            </div>

            {showHistoryModal && selectedStudent && (
                <PaymentHistoryModal
                    student={selectedStudent}
                    onClose={() => setShowHistoryModal(false)}
                />
            )}
        </div>
    );
};

export default PaymentHistory;
