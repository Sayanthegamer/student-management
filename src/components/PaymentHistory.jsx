import React, { useState } from 'react';
import { Search, FileText, Filter, IndianRupee } from 'lucide-react';
import PaymentHistoryModal from './PaymentHistoryModal';

const PaymentHistory = ({ students }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name, rollNo
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Get unique classes and sections for filters
    const classes = [...new Set(students.map(s => s.class))].sort();
    const sections = [...new Set(students.map(s => s.section))].sort();

    const filteredStudents = students
        .filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNo.includes(searchTerm) ||
                student.class.includes(searchTerm);
            const matchesClass = filterClass ? student.class === filterClass : true;
            const matchesSection = filterSection ? student.section === filterSection : true;

            // Only show active students or maybe all? Let's show all but maybe mark transferred
            // For history, we might want to see transferred students too.
            // Let's show all for now.

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

    const handleViewHistory = (student) => {
        setSelectedStudent(student);
        setShowHistoryModal(true);
    };

    const getTotalPaid = (student) => {
        if (!student.feeHistory) return 0;
        return student.feeHistory.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    };

    const getLastPaymentDate = (student) => {
        if (!student.feeHistory || student.feeHistory.length === 0) return 'N/A';
        // Sort by date desc
        const sorted = [...student.feeHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        return new Date(sorted[0].date).toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-6xl mx-auto">
            <h2 className="text-slate-800 mb-6 text-2xl flex items-center gap-3 font-bold tracking-tight">
                <IndianRupee size={28} className="text-indigo-600" />
                Payment Records
            </h2>

            <div className="flex gap-3 mb-6 flex-wrap items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 pl-10"
                    />
                </div>

                <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto min-w-[120px]"
                >
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>

                <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto min-w-[120px]"
                >
                    <option value="">All Sections</option>
                    {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto"
                >
                    <option value="name">Sort: Name</option>
                    <option value="rollNo">Sort: Roll No</option>
                    <option value="class">Sort: Class</option>
                </select>

                <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="btn bg-slate-50 border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                    {sortOrder === 'asc' ? '↓' : '↑'}
                </button>
            </div>

            {/* Table View */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Name</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Class/Sec</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Roll No</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Total Paid</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Last Payment</th>
                            <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-4 font-medium text-slate-700">
                                    {student.name}
                                    {student.status === 'Transferred' && <span className="ml-2 text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 font-bold">Transferred</span>}
                                </td>
                                <td className="p-4 text-slate-500">{student.class} - {student.section}</td>
                                <td className="p-4 text-slate-500">{student.rollNo}</td>
                                <td className="p-4 font-bold text-emerald-600">
                                    ₹{getTotalPaid(student).toLocaleString()}
                                </td>
                                <td className="p-4 text-slate-500">
                                    {getLastPaymentDate(student)}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleViewHistory(student)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-100"
                                    >
                                        <FileText size={16} />
                                        View History
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search size={32} className="opacity-20" />
                                        <p>No students found matching your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
