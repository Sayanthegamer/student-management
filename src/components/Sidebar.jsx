import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, GraduationCap, Database, FileOutput } from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { path: '/overview', label: 'Overview', icon: LayoutDashboard },
        { path: '/students', label: 'Student Management', icon: Users },
        { path: '/admission', label: 'Admission Status', icon: ClipboardCheck },
        { path: '/tc', label: 'Transfer Certificate', icon: FileOutput },
        { path: '/data', label: 'Data Management', icon: Database },
    ];

    return (
        <div className="sidebar bg-white/10 backdrop-blur-md border-r border-white/20 shadow-lg h-full p-6 flex flex-col gap-8 rounded-r-2xl rounded-l-none border-y-0">
            <div className="flex items-center gap-3 px-3">
                <div className="bg-white/20 p-2 rounded-xl flex items-center justify-center">
                    <GraduationCap size={28} color="white" />
                </div>
                <h1 className="m-0 text-lg font-bold text-white leading-tight">
                    Student<br />Manager
                </h1>
            </div>

            <nav className="flex flex-col gap-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl text-white transition-all text-[15px]
                                ${isActive ? 'bg-white/20 font-semibold' : 'bg-transparent font-normal hover:bg-white/10'}
                            `}
                        >
                            <Icon size={20} className="opacity-90" />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="mt-auto p-4 bg-black/10 rounded-xl">
                <p className="m-0 text-xs text-white/60">
                    © 2025 Student Manager<br />v1.0.0
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
