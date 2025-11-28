import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, Filter } from 'lucide-react';

const StatusColumn = ({ title, count, color, icon: Icon, students }) => (
    <div className="flex-1 min-w-[320px] flex flex-col h-full">
        <div
            className="flex items-center justify-between mb-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10"
            style={{ borderBottom: `3px solid ${color}` }}
        >
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg flex items-center justify-center bg-slate-50">
                    <Icon size={20} color={color} />
                </div>
                <h3 className="m-0 text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
            </div>
            <span
                className="text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm"
                style={{ background: color }}
            >
                {count}
            </span>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto pr-2 pb-2 flex-1">
            {students.map(student => (
                <div
                    key={student.id}
                    className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:shadow-md transition-shadow group"
                    style={{ borderLeft: `4px solid ${color}` }}
                >
                    <h4 className="m-0 mb-1 text-slate-800 font-bold text-base group-hover:text-indigo-600 transition-colors">{student.name}</h4>
                    <p className="m-0 text-sm text-slate-500 font-medium">
                        Class: {student.class}-{student.section}
                    </p>
                    <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        Admitted: {student.admissionDate || 'N/A'}
                    </p>
                </div>
            ))}
            {students.length === 0 && (
                <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    No students found
                </div>
            )}
        </div>
    </div>
);

const AdmissionStatus = ({ students }) => {
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');

    // Get unique classes and sections
    const classes = [...new Set(students.map(s => s.class))].sort();
    const sections = [...new Set(students.map(s => s.section))].sort();

    const filteredStudents = students.filter(student => {
        const matchesClass = filterClass ? student.class === filterClass : true;
        const matchesSection = filterSection ? student.section === filterSection : true;
        return matchesClass && matchesSection;
    });

    const confirmed = filteredStudents.filter(s => s.admissionStatus === 'Confirmed');
    const provisional = filteredStudents.filter(s => s.admissionStatus === 'Provisional');
    const cancelled = filteredStudents.filter(s => s.admissionStatus === 'Cancelled');

    return (
        <div className="p-6 max-w-[1600px] mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-slate-800 m-0 text-2xl font-bold tracking-tight">Admission Status Board</h2>

                <div className="flex gap-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 shadow-sm">
                        <Filter size={18} className="text-slate-400" />
                    </div>
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto min-w-[140px] shadow-sm font-medium"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-auto min-w-[140px] shadow-sm font-medium"
                    >
                        <option value="">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-5 h-[calc(100%-80px)] items-start">
                <StatusColumn
                    title="Confirmed"
                    count={confirmed.length}
                    color="#10b981"
                    icon={CheckCircle}
                    students={confirmed}
                />
                <StatusColumn
                    title="Provisional"
                    count={provisional.length}
                    color="#f59e0b"
                    icon={Clock}
                    students={provisional}
                />
                <StatusColumn
                    title="Cancelled"
                    count={cancelled.length}
                    color="#ef4444"
                    icon={XCircle}
                    students={cancelled}
                />
            </div>
        </div>
    );
};

export default AdmissionStatus;
