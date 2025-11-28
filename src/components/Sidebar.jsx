import React from 'react';
import { LayoutDashboard, Users, ClipboardCheck, GraduationCap, Database, FileOutput } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange }) => {
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'students', label: 'Student Management', icon: Users },
        { id: 'admission', label: 'Admission Status', icon: ClipboardCheck },
        { id: 'tc', label: 'Transfer Certificate', icon: FileOutput },
        { id: 'data', label: 'Data Management', icon: Database },
    ];

    return (
        <div className="sidebar glass-panel" style={{
            height: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            borderRadius: '0 16px 16px 0', // Rounded corners on right side only
            borderLeft: 'none',
            borderTop: 'none',
            borderBottom: 'none',
            background: 'rgba(255, 255, 255, 0.1)' // Keep sidebar transparent for white text
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px' }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <GraduationCap size={28} color="white" />
                </div>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'white', lineHeight: 1.2 }}>
                    Student<br />Manager
                </h1>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                width: '100%',
                                fontSize: '15px',
                                fontWeight: isActive ? '600' : '400'
                            }}
                        >
                            <Icon size={20} style={{ opacity: isActive ? 1 : 0.8 }} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    © 2025 Student Manager<br />v1.0.0
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
