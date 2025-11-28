import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, Filter } from 'lucide-react';

const StatusColumn = ({ title, count, color, icon: Icon, students }) => (
    <div className="flex-1 min-w-[300px]">
        <div
            className="flex items-center justify-between mb-4 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-sm"
            style={{ borderBottom: `4px solid ${color}` }}
        >
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full flex items-center justify-center shadow-sm">
                    <Icon size={20} color={color} />
                </div>
                <h3 className="m-0 text-lg font-semibold text-white tracking-wide">{title}</h3>
            </div>
            <span
                className="text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm"
                style={{ background: color }}
            >
                {count}
            </span>
        </div>

        <div className="flex flex-col gap-3">
            {students.map(student => (
                <div
                    key={student.id}
                    className="bg-white/75 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-4"
                    style={{ borderLeft: `4px solid ${color}` }}
                >
                    <h4 className="m-0 mb-1 text-gray-800 font-medium">{student.name}</h4>
                    <p className="m-0 text-xs text-gray-500">
                        Class: {student.class}-{student.section}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        Admitted: {student.admissionDate || 'N/A'}
                    </p>
                </div>
            ))}
            {students.length === 0 && (
                <div className="p-6 text-center text-white/50 border-2 border-dashed border-white/10 rounded-xl">
                    No students
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
        <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-white m-0 text-2xl font-bold">Admission Status Board</h2>

                <div className="flex gap-3">
                    <div className="flex items-center bg-white/20 rounded-lg px-2">
                        <Filter size={16} color="white" />
                    </div>
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 w-auto min-w-[120px] py-2 px-3"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 w-auto min-w-[120px] py-2 px-3"
                    >
                        <option value="">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-5 h-[calc(100%-60px)]">
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
