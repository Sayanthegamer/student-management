import React, { useEffect, useState } from 'react';

/**
 * A custom month picker component that provides separate dropdowns for year and month.
 *
 * @param {Object} props - The component props.
 * @param {string} props.value - The current month value in 'YYYY-MM' format.
 * @param {Function} props.onChange - Callback function called when the month changes.
 * @param {string} [props.label] - The label for the month picker.
 * @param {boolean} [props.required=false] - Whether the month field is required.
 * @param {string} [props.className=''] - Additional CSS classes.
 * @param {boolean} [props.compact=false] - Whether to render in a compact layout.
 * @returns {JSX.Element} The rendered custom month picker component.
 */
const CustomMonthPicker = ({ value, onChange, label, required, className = '', compact = false }) => {
    // 1. Initialize State

    const parse = (v) => {
        if (!v) return ['', ''];
        const parts = v.split('-');
        return [parts[0] || '', parts[1] || ''];
    };

    const [initY, initM] = parse(value);
    const [month, setMonth] = useState(initM);
    const [year, setYear] = useState(initY);

    // 2. Sync State with Props
    useEffect(() => {
        const [nextYear, nextMonth] = parse(value);
        setYear(nextYear);
        setMonth(nextMonth);
    }, [value]);

    const months = [
        { value: '01', label: compact ? 'Jan' : 'January' },
        { value: '02', label: compact ? 'Feb' : 'February' },
        { value: '03', label: compact ? 'Mar' : 'March' },
        { value: '04', label: compact ? 'Apr' : 'April' },
        { value: '05', label: compact ? 'May' : 'May' },
        { value: '06', label: compact ? 'Jun' : 'June' },
        { value: '07', label: compact ? 'Jul' : 'July' },
        { value: '08', label: compact ? 'Aug' : 'August' },
        { value: '09', label: compact ? 'Sep' : 'September' },
        { value: '10', label: compact ? 'Oct' : 'October' },
        { value: '11', label: compact ? 'Nov' : 'November' },
        { value: '12', label: compact ? 'Dec' : 'December' }
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

    const inputClasses = compact 
        ? "w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-3 py-2.5 rounded-[10px] text-[var(--text-primary)] font-medium outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-base sm:text-sm appearance-none cursor-pointer"
        : "w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3.5 rounded-[12px] text-[var(--text-primary)] font-medium outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-base sm:text-sm appearance-none cursor-pointer";

    return (
        <div className={className}>
            {label && <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">{label}</label>}
            <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
                <div className="relative flex-1">
                    <select
                        value={month}
                        onChange={(e) => handleChange('month', e.target.value)}
                        className={inputClasses}
                        required={required}
                    >
                        <option value="">{compact ? 'Mo' : 'Month'}</option>
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
                <div className="relative flex-1">
                    <select
                        value={year}
                        onChange={(e) => handleChange('year', e.target.value)}
                        className={inputClasses}
                        required={required}
                    >
                        <option value="">{compact ? 'Yr' : 'Year'}</option>
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
