import React from 'react';

/**
 * A sub-component for rendering form input fields consistently.
 */
const InputField = ({ label, name, type = "text", placeholder, required = false, icon: Icon, options = null, value, onChange, disabled = false, readOnly = false, min }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)] px-1 flex items-center gap-2">
            {Icon && <Icon size={14} />}
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {options ? (
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md px-3 py-2.5 text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)] text-base sm:text-sm"
                required={required}
                disabled={disabled}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md px-3 py-2.5 text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)] text-base sm:text-sm placeholder:text-[var(--text-muted)] ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
                min={min}
            />
        )}
    </div>
);

export default InputField;
