import React, { useState } from 'react';
import { CheckCircle, Clock, XCircle, Filter } from 'lucide-react';

const StatusColumn = ({ title, count, color, icon: Icon, students }) => (
    <div style={{ flex: 1, minWidth: '300px' }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderBottom: `4px solid ${color}`,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    background: 'white',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <Icon size={20} color={color} />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'white', letterSpacing: '0.5px' }}>{title}</h3>
            </div>
            <span style={{
                background: color,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                {count}
            </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {students.map(student => (
                <div key={student.id} className="glass-panel" style={{ padding: '16px', borderLeft: `4px solid ${color}` }}>
                    <h4 style={{ margin: '0 0 4px', color: '#1f2937' }}>{student.name}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                        Class: {student.class}-{student.section}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                        Admitted: {student.admissionDate || 'N/A'}
                    </p>
                </div>
            ))}
            {students.length === 0 && (
                <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.5)',
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                }}>
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
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>Admission Status Board</h2>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0 8px' }}>
                        <Filter size={16} color="white" />
                    </div>
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="glass-input"
                        style={{ width: 'auto', minWidth: '120px', padding: '8px 12px' }}
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="glass-input"
                        style={{ width: 'auto', minWidth: '120px', padding: '8px 12px' }}
                    >
                        <option value="">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
                    </select>
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '24px',
                overflowX: 'auto',
                paddingBottom: '20px',
                height: 'calc(100% - 60px)'
            }}>
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
