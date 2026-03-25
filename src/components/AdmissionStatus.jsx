/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, FileText, Filter, Search, MoreVertical } from 'lucide-react';
import CustomMonthPicker from './CustomMonthPicker';
import AdmissionCard from './AdmissionCard';
import { logActivity } from '../utils/storage';

const StatusCard = ({ student, color, onMove }) => {
    const [showActions, setShowActions] = useState(false);

    return (
        <div className="bg-[#050505] border border-white/20 shadow-none rounded-none p-5 hover:border-[#CCFF00] transition-colors group relative">
            <div className="flex justify-between items-start mb-3">
                <h4 className="m-0 text-white font-black text-base uppercase tracking-widest group-hover:text-[#CCFF00] transition-colors">{student.name}</h4>
                <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 rounded-none hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                    <MoreVertical size={20} />
                </button>
            </div>

            {showActions && (
                <div className="absolute right-4 top-12 bg-[#0a0a0a] shadow-none border border-white/20 rounded-none py-1 z-20 w-48 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 text-[10px] font-black text-white/50 uppercase tracking-widest border-b border-white/20">Move To</div>
                    {student.admissionStatus !== 'Confirmed' && (
                        <button
                            onClick={() => { onMove(student, 'Confirmed'); setShowActions(false); }}
                            className="w-full text-left px-4 py-3 text-sm font-bold text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black flex items-center gap-3 uppercase tracking-widest transition-colors"
                        >
                            <CheckCircle size={16} className="stroke-[3px]" /> Confirmed
                        </button>
                    )}
                    {student.admissionStatus !== 'Provisional' && (
                        <button
                            onClick={() => { onMove(student, 'Provisional'); setShowActions(false); }}
                            className="w-full text-left px-4 py-3 text-sm font-bold text-amber-400 hover:bg-amber-400 hover:text-black flex items-center gap-3 uppercase tracking-widest transition-colors"
                        >
                            <Clock size={16} className="stroke-[3px]" /> Provisional
                        </button>
                    )}
                    {student.admissionStatus !== 'Cancelled' && (
                        <button
                            onClick={() => { onMove(student, 'Cancelled'); setShowActions(false); }}
                            className="w-full text-left px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500 hover:text-black flex items-center gap-3 uppercase tracking-widest transition-colors"
                        >
                            <XCircle size={16} className="stroke-[3px]" /> Cancelled
                        </button>
                    )}
                </div>
            )}

            {showActions && (
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)}></div>
            )}

            <p className="m-0 text-xs text-white/70 font-mono mb-3 uppercase tracking-widest">
                Class: {student.class}-{student.section} <span className="text-white/20 mx-2">|</span> Roll: {student.rollNo}
            </p>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-[10px] text-white/50 font-mono flex items-center gap-2">
                    <Clock size={14} />
                    {student.admissionDate || 'N/A'}
                </span>
                <span className={`text-[9px] font-black px-2 py-1 rounded-none border uppercase tracking-widest ${student.feesStatus === 'Paid' ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-amber-500 text-black border-amber-500'}`}>
                    {student.feesStatus || 'Pending'}
                </span>
            </div>
        </div>
    );
};

const StatusColumn = ({ title, count, total, color, icon: Icon, students, onMove }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="w-full md:w-auto md:flex-1 md:min-w-[320px] flex flex-col h-full bg-[#0a0a0a] rounded-none border border-white/10 p-4">
            <div
                className="flex flex-col mb-4 bg-[#050505] p-5 rounded-none border border-white/20 shadow-none sticky top-0 z-10"
                style={{ borderTop: `4px solid ${color}` }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Icon size={20} color={color} className="stroke-[3px]" />
                        <h3 className="m-0 text-sm font-black text-white uppercase tracking-widest">{title}</h3>
                    </div>
                    <span className="bg-white/10 text-white px-3 py-1 rounded-none text-xs font-black border border-white/20">
                        {count}
                    </span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-none overflow-hidden">
                    <div
                        className="h-full rounded-none transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                    ></div>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/50 mt-3 text-right font-mono">{percentage}% of total</p>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-1 pb-2 flex-1 custom-scrollbar">
                {students.map(student => (
                    <StatusCard key={student.id} student={student} color={color} onMove={onMove} />
                ))}
                {students.length === 0 && (
                    <div className="p-8 text-center text-white/30 border border-white/10 rounded-none bg-transparent font-black uppercase tracking-widest mt-4">
                        No students
                    </div>
                )}
            </div>
        </div>
    );
};

const AdmissionStatus = ({ students, onUpdateStudent, user }) => {
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
    const transferred = filteredStudents.filter(s => s.admissionStatus === 'Transferred');

    const handleMoveStudent = (student, newStatus) => {
        if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            logActivity('admission', `Changed admission status for ${student.name} to ${newStatus}`);
            onUpdateStudent({
                ...student,
                admissionStatus: newStatus,
                // Add status change metadata (Issue 4 fix)
                lastStatusChangeDate: new Date().toISOString().slice(0, 10),
                lastStatusChangedBy: user?.email || user?.id || 'system'
            });
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-full flex flex-col">
            <div className="flex flex-col gap-6 md:gap-8 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-white m-0 text-2xl md:text-3xl font-black tracking-widest uppercase">Admission Status Board</h2>
                        <p className="text-white/50 mt-2 font-mono text-xs uppercase tracking-widest">Manage and track student admission pipeline</p>
                    </div>

                    {/* Stats Summary */}
                    <div className="flex gap-4">
                        <div className="bg-[#050505] border border-[#CCFF00] rounded-none px-6 py-4 shadow-none flex flex-col items-center min-w-[120px]">
                            <span className="text-3xl font-black text-[#CCFF00]">{filteredStudents.length}</span>
                            <span className="text-[10px] font-black text-[#CCFF00]/70 uppercase tracking-widest mt-1">Total</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 flex-wrap items-center bg-[#0a0a0a] p-4 rounded-none border border-white/20 shadow-none">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 stroke-[3px]" />
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME OR ROLL NO..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white outline-none transition-colors focus:border-[#CCFF00] pl-12 font-black uppercase tracking-widest placeholder:text-white/20"
                        />
                    </div>

                    <div className="h-10 w-px bg-white/20 mx-2 hidden md:block"></div>

                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white outline-none transition-colors focus:border-[#CCFF00] w-auto min-w-[160px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                    >
                        <option value="">ALL CLASSES</option>
                        {classes.map(c => <option key={c} value={c}>CLASS {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white outline-none transition-colors focus:border-[#CCFF00] w-auto min-w-[160px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                    >
                        <option value="">ALL SECTIONS</option>
                        {sections.map(s => <option key={s} value={s}>SEC {s}</option>)}
                    </select>

                    <select
                        value={filterFeeStatus}
                        onChange={(e) => setFilterFeeStatus(e.target.value)}
                        className="bg-[#050505] border border-white/20 px-4 py-3 rounded-none text-white outline-none transition-colors focus:border-[#CCFF00] w-auto min-w-[160px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                    >
                        <option value="">ALL FEES</option>
                        <option value="Paid">PAID</option>
                        <option value="Pending">PENDING</option>
                    </select>

                    <div className="h-10 w-px bg-white/20 mx-2 hidden md:block"></div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setShowMonthFilter(!showMonthFilter);
                                if (!showMonthFilter && !filterMonth) {
                                    setFilterMonth(new Date().toISOString().slice(0, 7));
                                }
                            }}
                            className={`p-3 rounded-none border transition-colors ${showMonthFilter
                                ? 'bg-[#CCFF00] border-[#CCFF00] text-black'
                                : 'bg-[#050505] border-white/20 text-white hover:border-[#CCFF00] hover:text-[#CCFF00]'}`}
                            title="Filter by Admission Month"
                        >
                            <Filter size={20} className="stroke-[3px]" />
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
                    <div className="py-20 text-center border border-white/20 bg-[#050505] mx-4">
                        <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4">
                            <Search size={48} className="text-white/20 stroke-[1px]" />
                        </div>
                        <p className="text-white font-black uppercase tracking-widest text-lg">No results found</p>
                        <p className="text-white/50 font-mono text-xs uppercase tracking-widest mt-2">Try adjusting your filters</p>
                    </div>
                )}
            </div>

            {/* Desktop Kanban Board */}
            <div className="hidden md:flex flex-col md:flex-row gap-6 md:overflow-x-auto pb-5 h-auto md:h-full items-start">
                <StatusColumn
                    title="Confirmed"
                    count={confirmed.length}
                    total={filteredStudents.length}
                    color="#CCFF00"
                    icon={CheckCircle}
                    students={confirmed}
                    onMove={handleMoveStudent}
                />
                <StatusColumn
                    title="Provisional"
                    count={provisional.length}
                    total={filteredStudents.length}
                    color="#fbbf24"
                    icon={Clock}
                    students={provisional}
                    onMove={handleMoveStudent}
                />
                <StatusColumn
                    title="Cancelled"
                    count={cancelled.length}
                    total={filteredStudents.length}
                    color="#f43f5e"
                    icon={XCircle}
                    students={cancelled}
                    onMove={handleMoveStudent}
                />
                <StatusColumn
                    title="Transferred"
                    count={transferred.length}
                    total={filteredStudents.length}
                    color="#c084fc"
                    icon={FileText}
                    students={transferred}
                    onMove={handleMoveStudent}
                />
            </div>
        </div>
    );
};

export default AdmissionStatus;
