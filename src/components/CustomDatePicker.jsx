import React from 'react';

/**
 * A custom date picker component that uses the native date input.
 *
 * @param {Object} props - The component props.
 * @param {string} props.value - The current date value in 'YYYY-MM-DD' format.
 * @param {Function} props.onChange - Callback function called when the date changes.
 * @param {string} props.label - The label for the date picker.
 * @param {boolean} [props.required=false] - Whether the date field is required.
 * @param {string} [props.className=''] - Additional CSS classes.
 * @returns {JSX.Element} The rendered custom date picker component.
 */
const CustomDatePicker = ({ value, onChange, label, required, className = '' }) => {
    return (
        <div className={className}>
            {label && (
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                    {label} {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}
            <div className="flex gap-2">
                <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3.5 rounded-[12px] text-[var(--text-primary)] font-medium outline-none transition-colors focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-base sm:text-sm cursor-pointer"
                />
            </div>
        </div>
    );
};

export default CustomDatePicker;
