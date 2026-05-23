import React from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import CustomMonthPicker from '../CustomMonthPicker';

const FilterPanel = ({ 
    filterClass, setFilterClass, 
    filterSection, setFilterSection, 
    filterFeeStatus, setFilterFeeStatus, 
    filterMonth, setFilterMonth, 
    sortBy, setSortBy, 
    sortOrder, setSortOrder, 
    classes, sections, 
    hasActiveFilters, handleClearFilters 
}) => {
    return (
        <div id="filter-panel" className="p-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] kinetic-slide">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="col-span-1">
                    <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Class</label>
                    <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="input-premium w-full text-sm py-2"
                    >
                        <option value="">All</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Section</label>
                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="input-premium w-full text-sm py-2"
                    >
                        <option value="">All</option>
                        {sections.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Fee Status</label>
                    <select
                        value={filterFeeStatus}
                        onChange={(e) => setFilterFeeStatus(e.target.value)}
                        className="input-premium w-full text-sm py-2"
                    >
                        <option value="">All</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Month</label>
                    <CustomMonthPicker
                        value={filterMonth}
                        onChange={setFilterMonth}
                        compact={true}
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Sort</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input-premium w-full text-sm py-2"
                    >
                        <option value="name">Name</option>
                        <option value="rollNo">Roll No</option>
                        <option value="class">Class</option>
                    </select>
                </div>
                <div className="col-span-1 flex items-end gap-2">
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-2 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--border-highlight)] transition-all touch-target"
                        title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    >
                        {sortOrder === 'asc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="p-2 text-[var(--text-muted)] hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all touch-target"
                            title="Clear filters"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
