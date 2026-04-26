import React, { useEffect, useState } from 'react';

const CustomDatePicker = ({ value, onChange, label, required, className = '' }) => {

    const parse = (v) => {
        if (!v) return ['', '', ''];
        const parts = v.split('-');
        return [parts[0] || '', parts[1] || '', parts[2] || ''];
    };

    const [initY, initM, initD] = parse(value);
    const [day, setDay] = useState(initD);
    const [month, setMonth] = useState(initM);
    const [year, setYear] = useState(initY);

    useEffect(() => {
        const [nextYear, nextMonth, nextDay] = parse(value);
        setYear(nextYear);
        setMonth(nextMonth);
        setDay(nextDay);
    }, [value]);

    const months = [
        { value: '01', label: 'Jan' },
        { value: '02', label: 'Feb' },
        { value: '03', label: 'Mar' },
        { value: '04', label: 'Apr' },
        { value: '05', label: 'May' },
        { value: '06', label: 'Jun' },
        { value: '07', label: 'Jul' },
        { value: '08', label: 'Aug' },
        { value: '09', label: 'Sep' },
        { value: '10', label: 'Oct' },
        { value: '11', label: 'Nov' },
        { value: '12', label: 'Dec' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i + 5);

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

        if (newMonth && newYear) {
            const maxDays = getDaysInMonth(parseInt(newMonth), parseInt(newYear));
            if (newDay && parseInt(newDay) > maxDays) {
                newDay = maxDays.toString().padStart(2, '0');
            }
        }

        if (type === 'day') setDay(val);
        if (type === 'month') setMonth(val);
        if (type === 'year') setYear(val);

        if (newDay && newMonth && newYear) {
            onChange(`${newYear}-${newMonth}-${newDay}`);
        } else if (!newDay && !newMonth && !newYear) {
            onChange('');
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const selectClasses = "w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3.5 rounded-[12px] text-[var(--text-primary)] font-medium outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-sm cursor-pointer appearance-none";

    return (
        <div className={className}>
            {label && (
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                    {label} {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}
            <div className="flex gap-2">
                <div className="flex-[0.7]">
                    <select
                        value={day}
                        onChange={(e) => handleChange('day', e.target.value)}
                        className={selectClasses}
                        required={required}
                    >
                        <option value="">DD</option>
                        {days.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <select
                        value={month}
                        onChange={(e) => handleChange('month', e.target.value)}
                        className={selectClasses}
                        required={required}
                    >
                        <option value="">Month</option>
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <select
                        value={year}
                        onChange={(e) => handleChange('year', e.target.value)}
                        className={selectClasses}
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
