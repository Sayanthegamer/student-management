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
        <div className="p-6 max-w-5xl mx-auto">
            <h2 className="text-white mb-6 text-2xl flex items-center gap-3 font-bold">
                <IndianRupee size={28} />
                Payment Records
            </h2>

            <div className="bg-white/75 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-5">

                {/* Filters & Controls */}
                <div className="flex gap-2 mb-5 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search Student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 pl-10"
                        />
                    </div>

                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 w-auto min-w-[100px]"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 w-auto min-w-[100px]"
                    >
                        <option value="">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 w-auto"
                    >
                        <option value="name">Sort: Name</option>
                        <option value="rollNo">Sort: Roll No</option>
                        <option value="class">Sort: Class</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="btn bg-white/50 p-2.5"
                        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    >
                        {sortOrder === 'asc' ? '↓' : '↑'}
                    </button>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200 text-left">
                                <th className="p-3 font-semibold text-gray-700">Name</th>
                                <th className="p-3 font-semibold text-gray-700">Class/Sec</th>
                                <th className="p-3 font-semibold text-gray-700">Roll No</th>
                                <th className="p-3 font-semibold text-gray-700">Total Paid</th>
                                <th className="p-3 font-semibold text-gray-700">Last Payment</th>
                                <th className="p-3 font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="border-b border-gray-100 hover:bg-white/30 transition-colors">
                                    <td className="p-3 font-medium text-gray-800">
                                        {student.name}
                                        {student.status === 'Transferred' && <span className="ml-2 text-xs text-red-500 bg-red-100 px-1.5 py-0.5 rounded-md">Transferred</span>}
                                    </td>
                                    <td className="p-3 text-gray-600">{student.class} - {student.section}</td>
                                    <td className="p-3 text-gray-600">{student.rollNo}</td>
                                    <td className="p-3 font-semibold text-indigo-600">
                                        ₹{getTotalPaid(student).toLocaleString()}
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        {getLastPaymentDate(student)}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleViewHistory(student)}
                                            className="btn px-3 py-1.5 bg-indigo-100 text-indigo-800 text-sm hover:bg-indigo-200 flex items-center gap-2"
                                        >
                                            <FileText size={16} />
                                            View History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-500">
                                        No students found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
