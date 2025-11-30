import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, Filter, Search, MoreVertical } from 'lucide-react';
import CustomMonthPicker from './CustomMonthPicker';
import { logActivity } from '../utils/storage';

const StatusCard = ({ student, color, onMove }) => {
    const [showActions, setShowActions] = useState(false);

    return (
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-2">
                <h4 className="m-0 text-slate-800 font-bold text-base group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <MoreVertical size={16} />
                </button>
            </div>

            {showActions && (
                <div className="absolute right-4 top-10 bg-white shadow-xl border border-slate-100 rounded-lg py-1 z-20 w-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50">Move To</div>
                    {student.admissionStatus !== 'Confirmed' && (
                        <button
                            onClick={() => { onMove(student, 'Confirmed'); setShowActions(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                        >
                            <CheckCircle size={14} /> Confirmed
                        </button>
                    )}
                    {student.admissionStatus !== 'Provisional' && (
                        <button
                            onClick={() => { onMove(student, 'Provisional'); setShowActions(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                        >
                            <Clock size={14} /> Provisional
                        </button>
                    )}
                    {student.admissionStatus !== 'Cancelled' && (
                        <button
                            onClick={() => { onMove(student, 'Cancelled'); setShowActions(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                            <XCircle size={14} /> Cancelled
                        </button>
                    )}
                </div>
            )}

            {showActions && (
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)}></div>
            )}

            <p className="m-0 text-sm text-slate-500 font-medium mb-2">
                Class: {student.class}-{student.section} <span className="text-slate-300 mx-1">|</span> Roll: {student.rollNo}
            </p>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {student.admissionDate || 'N/A'}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${student.feesStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {student.feesStatus || 'Pending'}
                </span>
            </div>
        </div>
    );
};

const StatusColumn = ({ title, count, total, color, icon: Icon, students, onMove }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="flex-1 min-w-[320px] flex flex-col h-full bg-slate-50/50 rounded-2xl p-2">
            <div
                className="flex flex-col mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10"
                style={{ borderTop: `4px solid ${color}` }}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Icon size={18} color={color} />
                        <h3 className="m-0 text-base font-bold text-slate-800">{title}</h3>
                    </div>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">
                        {count}
                    </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                    ></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">{percentage}% of total</p>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-2 flex-1 custom-scrollbar">
                {students.map(student => (
                    <StatusCard key={student.id} student={student} color={color} onMove={onMove} />
                ))}
                {students.length === 0 && (
                    <div className="p-6 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                        No students
                    </div>
                )}
            </div>
        </div>
    );
};

const AdmissionStatus = ({ students, onUpdateStudent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterFeeStatus, setFilterFeeStatus] = useState('');
    const [filterMonth, setFilterMonth] = useState(''); // Empty = All Time
    const [showMonthFilter, setShowMonthFilter] = useState(false);

    // Get unique classes and sections
    const classes = [...new Set(students.map(s => s.class))].sort();
    const sections = [...new Set(students.map(s => s.section))].sort();

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNo.includes(searchTerm);
        const matchesClass = filterClass ? student.class === filterClass : true;
        const matchesSection = filterSection ? student.section === filterSection : true;
        const matchesFeeStatus = filterFeeStatus ? student.feesStatus === filterFeeStatus : true;

        let matchesMonth = true;
        if (showMonthFilter && filterMonth && student.admissionDate) {
            matchesMonth = student.admissionDate.startsWith(filterMonth);
        }

        return matchesSearch && matchesClass && matchesSection && matchesFeeStatus && matchesMonth;
    });

    const confirmed = filteredStudents.filter(s => s.admissionStatus === 'Confirmed');
    const provisional = filteredStudents.filter(s => s.admissionStatus === 'Provisional');
    const cancelled = filteredStudents.filter(s => s.admissionStatus === 'Cancelled');

    const handleMoveStudent = (student, newStatus) => {
        if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            logActivity('admission', `Changed admission status for ${student.name} to ${newStatus}`);
            onUpdateStudent({ ...student, admissionStatus: newStatus });
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col">
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-white m-0 text-2xl font-bold tracking-tight">Admission Status Board</h2>
                        <p className="text-slate-200 mt-1">Manage and track student admission pipeline</p>
                    </div>

                    {/* Stats Summary */}
                    <div className="flex gap-4">
                        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm flex flex-col items-center min-w-[100px]">
                            <span className="text-2xl font-bold text-slate-800">{filteredStudents.length}</span>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Name or Roll No..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 pl-10"
                        />
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-1"></div>

                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto min-w-[140px]"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto min-w-[140px]"
                    >
                        <option value="">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                    </select>

                    <select
                        value={filterFeeStatus}
                        onChange={(e) => setFilterFeeStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto min-w-[140px]"
                    >
                        <option value="">All Fees</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                    </select>

                    <div className="h-8 w-px bg-slate-200 mx-1"></div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setShowMonthFilter(!showMonthFilter);
                                if (!showMonthFilter && !filterMonth) {
                                    setFilterMonth(new Date().toISOString().slice(0, 7));
                                }
                            }}
                            className={`p-2.5 rounded-xl border transition-all ${showMonthFilter
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                            title="Filter by Admission Month"
                        >
                            <Filter size={20} />
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

            <div className="flex gap-6 overflow-x-auto pb-5 h-full items-start">
                <StatusColumn
                    title="Confirmed"
                    count={confirmed.length}
                    total={filteredStudents.length}
                    color="#10b981"
                    icon={CheckCircle}
                    students={confirmed}
                    onMove={handleMoveStudent}
                />
                <StatusColumn
                    title="Provisional"
                    count={provisional.length}
                    total={filteredStudents.length}
                    color="#f59e0b"
                    icon={Clock}
                    students={provisional}
                    onMove={handleMoveStudent}
                />
                <StatusColumn
                    title="Cancelled"
                    count={cancelled.length}
                    total={filteredStudents.length}
                    color="#ef4444"
                    icon={XCircle}
                    students={cancelled}
                    onMove={handleMoveStudent}
                />
            </div>
        </div>
    );
};

export default AdmissionStatus;
