import React, { useEffect, useState } from 'react';

const CustomMonthPicker = ({ value, onChange, label, required, className = '' }) => {
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    useEffect(() => {
        if (value) {
            const [y, m] = value.split('-');
            setYear(y);
            setMonth(m);
        }
    }, [value]);

    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear - i + 5); // 5 years future, 15 past

    const handleChange = (type, val) => {
        let newMonth = month;
        let newYear = year;

        if (type === 'month') newMonth = val;
        if (type === 'year') newYear = val;

        // Update local state
        if (type === 'month') setMonth(val);
        if (type === 'year') setYear(val);

        // Propagate change if all fields are filled
        if (newMonth && newYear) {
            onChange(`${newYear}-${newMonth}`);
        } else if (!newMonth && !newYear) {
            onChange('');
        }
    };

    return (
        <div className={className}>
            {label && <label className="block mb-2 text-slate-600 text-sm font-medium">{label}</label>}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <select
                        value={month}
                        onChange={(e) => handleChange('month', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        required={required}
                    >
                        <option value="">Month</option>
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
                <div className="relative flex-1">
                    <select
                        value={year}
                        onChange={(e) => handleChange('year', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        required={required}
                    >
                        <option value="">Year</option>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CustomMonthPicker;
