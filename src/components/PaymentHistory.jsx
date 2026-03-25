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
            <div className="bg-[#0a0a0a] rounded-none shadow-none border border-white/20 overflow-hidden page-enter">
                <div className="p-4 md:p-8 border-b border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#CCFF00] text-black border border-[#CCFF00] rounded-none">
                            <IndianRupee size={28} className="stroke-[3px]" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white">Payment Audit</h2>
                            <p className="text-white/50 font-mono text-xs uppercase tracking-widest mt-2">Detailed financial records for all students</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 md:w-80">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 stroke-[3px]" />
                            <input
                                type="text"
                                placeholder="SEARCH BY NAME..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#050505] border border-white/20 rounded-none focus:border-[#CCFF00] transition-colors outline-none text-white font-black uppercase tracking-widest placeholder:text-white/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-[#0a0a0a] border-b border-white/20 grid grid-cols-2 md:flex flex-wrap gap-4">
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white font-black uppercase tracking-widest outline-none focus:border-[#CCFF00] appearance-none cursor-pointer"
                    >
                        <option value="">ALL CLASSES</option>
                        {classes.map(c => <option key={c} value={c}>CLASS {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white font-black uppercase tracking-widest outline-none focus:border-[#CCFF00] appearance-none cursor-pointer"
                    >
                        <option value="">ALL SECTIONS</option>
                        {sections.map(s => <option key={s} value={s}>SEC {s}</option>)}
                    </select>

                    <div className="h-10 w-px bg-white/20 mx-2 hidden md:block"></div>

                    <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex-1 bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white font-black uppercase tracking-widest outline-none focus:border-[#CCFF00] appearance-none cursor-pointer"
                        >
                            <option value="name">SORT BY: NAME</option>
                            <option value="rollNo">SORT BY: ROLL NO</option>
                            <option value="class">SORT BY: CLASS</option>
                        </select>

                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-3 bg-[#050505] border border-white/20 rounded-none text-white hover:border-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
                        >
                            {sortOrder === 'asc' ? <ChevronDown size={20} className="stroke-[3px]" /> : <ChevronUp size={20} className="stroke-[3px]" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden pt-4 pb-4 space-y-4">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <PaymentCard
                                key={student.id}
                                student={student}
                                onViewHistory={handleViewHistory}
                            />
                        ))
                    ) : (
                        <div className="py-16 text-center border border-white/20 bg-[#050505] mx-4">
                            <div className="p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                <Search size={48} className="text-white/30 stroke-[1px]" />
                            </div>
                            <p className="text-white font-black uppercase tracking-widest text-lg">No results found</p>
                            <p className="text-white/50 font-mono text-xs uppercase tracking-widest mt-2">Try adjusting your filters</p>
                        </div>
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#050505] border-b border-white/20">
                                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest border-b border-white/20">Beneficiary</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest border-b border-white/20">Academic Unit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest border-b border-white/20">Cumulative Paid</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest border-b border-white/20">Recent Activity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest border-b border-white/20 text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-none bg-[#CCFF00] text-black border border-[#CCFF00] flex items-center justify-center font-black text-xs shrink-0">
                                                <User size={18} className="stroke-[3px]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-white text-sm uppercase tracking-widest truncate flex items-center gap-3">
                                                    {student.name}
                                                    {student.admissionStatus === 'Transferred' && (
                                                        <span className="text-[9px] font-black bg-rose-500 text-black px-2 py-1 rounded-none border border-rose-500 uppercase tracking-tighter">Exit</span>
                                                    )}
                                                </p>
                                                <p className="text-white/50 font-mono text-[10px] truncate uppercase tracking-widest mt-1">Roll: {student.rollNo}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-white font-black uppercase tracking-widest">Class {student.class} — {student.section}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-base font-black text-[#CCFF00] tracking-widest">₹{getTotalPaid(student).toLocaleString()}</span>
                                            <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">Gross Total</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-white font-mono">{getLastPaymentDate(student)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleViewHistory(student)}
                                            className="px-6 py-3 rounded-none bg-transparent border border-[#CCFF00] text-[#CCFF00] text-xs font-black uppercase tracking-widest hover:bg-[#CCFF00] hover:text-black transition-colors flex items-center gap-2 ml-auto shadow-none"
                                        >
                                            <FileText size={16} className="stroke-[3px]" />
                                            History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredStudents.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-[#050505] border border-white/20 flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-white/20 stroke-[1px]" />
                        </div>
                        <p className="text-white/50 font-black uppercase tracking-widest text-sm">No records matching search</p>
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
