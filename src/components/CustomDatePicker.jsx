import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const CustomDatePicker = ({ value, onChange, label, required, className = '' }) => {
    // 1. Initialize State
    const [prevValue, setPrevValue] = useState(value);

    // Helper to parse safely
    const parse = (v) => {
        if (!v) return ['', '', ''];
        const parts = v.split('-');
        return [parts[0] || '', parts[1] || '', parts[2] || ''];
    };

    const [initY, initM, initD] = parse(value);

    const [day, setDay] = useState(initD);
    const [month, setMonth] = useState(initM);
    const [year, setYear] = useState(initY);

    // 2. Sync State with Props (Adjusting state during rendering)
    if (value !== prevValue) {
        setPrevValue(value);
        const [y, m, d] = parse(value);
        setYear(y);
        setMonth(m);
        setDay(d);
    }

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
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i + 5); // 5 years future, 95 past

    const getDaysInMonth = (m, y) => {
        return new Date(y, m, 0).getDate();
    };

    const handleChange = (type, val) => {
        let newDay = day;
        let newMonth = month;
        let newYear = year;

        if (type === 'day') newDay = val;
        if (type === 'month') newMonth = val;
        if (type === 'year') newYear = val;

        // Validate day if month/year changes
        if (newMonth && newYear) {
            const maxDays = getDaysInMonth(parseInt(newMonth), parseInt(newYear));
            if (newDay && parseInt(newDay) > maxDays) {
                newDay = maxDays.toString().padStart(2, '0');
            }
        }

        // Update local state
        if (type === 'day') setDay(val);
        if (type === 'month') setMonth(val);
        if (type === 'year') setYear(val);

        // Propagate change if all fields are filled
        if (newDay && newMonth && newYear) {
            onChange(`${newYear}-${newMonth}-${newDay}`);
        } else if (!newDay && !newMonth && !newYear) {
            onChange('');
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    return (
        <div className={className}>
            {label && <label className="block mb-2 text-slate-600 text-sm font-medium">{label}</label>}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <select
                        value={day}
                        onChange={(e) => handleChange('day', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        required={required}
                    >
                        <option value="">Day</option>
                        {days.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
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

export default CustomDatePicker;
