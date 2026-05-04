import React, { useState, useMemo } from 'react';
import { Calendar, FileSpreadsheet, Download, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import useDebounce from '../hooks/useDebounce';
import Pagination from './Pagination';

const Reports = ({ students }) => {
    const [timeframe, setTimeframe] = useState('month'); // 'today', 'month', 'year', 'custom'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const allTransactions = useMemo(() => {
        const transactions = [];
        students.forEach(student => {
            if (student.feeHistory && Array.isArray(student.feeHistory)) {
                student.feeHistory.forEach(fee => {
                    let safeDate = '';
                    if (fee.date) {
                        const parsedDate = new Date(fee.date);
                        if (!isNaN(parsedDate.getTime())) {
                            safeDate = parsedDate.toISOString();
                        } else {
                            safeDate = String(fee.date); // fallback to raw string if valid string but not date
                        }
                    }

                    transactions.push({
                        id: fee.id,
                        date: safeDate,
                        studentId: student.id,
                        studentName: String(student.name || ''),
                        rollNumber: String(student.rollNo || 'N/A'),
                        studentClass: String(student.class || ''),
                        section: String(student.section || 'N/A'),
                        particulars: String(fee.remarks || 'Fee Payment'),
                        amount: parseFloat(fee.amount) || 0
                    });
                });
            }
        });
        // Sort descending by date
        return transactions.sort((a, b) => b.date.localeCompare(a.date));
    }, [students]);

    const filteredTransactions = useMemo(() => {
        let filtered = allTransactions;

        // Apply time filter using string comparisons to avoid timezone shifts
        const nowStr = new Date().toISOString();
        const todayStr = nowStr.slice(0, 10);
        const currentMonthStr = nowStr.slice(0, 7);
        const currentYearStr = nowStr.slice(0, 4);

        if (timeframe === 'today') {
            filtered = filtered.filter(t => t.date.slice(0, 10) === todayStr);
        } else if (timeframe === 'month') {
            filtered = filtered.filter(t => t.date.slice(0, 7) === currentMonthStr);
        } else if (timeframe === 'year') {
            filtered = filtered.filter(t => t.date.startsWith(currentYearStr));
        } else if (timeframe === 'custom' && customStartDate && customEndDate) {
            filtered = filtered.filter(t => {
                const tDate = t.date.slice(0, 10);
                return tDate >= customStartDate && tDate <= customEndDate;
            });
        }

        // Apply search filter
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            filtered = filtered.filter(t =>
                t.studentName.toLowerCase().includes(searchLower) ||
                t.rollNumber.toString().toLowerCase().includes(searchLower) ||
                t.particulars.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [allTransactions, timeframe, customStartDate, customEndDate, debouncedSearch]);

    const handleExport = () => {
        if (filteredTransactions.length === 0) return;

        const sanitizeCell = (value) => {
            const strVal = String(value || '');
            if (/^[=+\-@]/.test(strVal)) {
                return "'" + strVal;
            }
            return strVal;
        };

        const dataToExport = filteredTransactions.map(t => ({
            'Date': sanitizeCell(t.date.slice(0, 10)),
            'Student Name': sanitizeCell(t.studentName),
            'Roll No': sanitizeCell(t.rollNumber),
            'Class': sanitizeCell(t.studentClass),
            'Section': sanitizeCell(t.section),
            'Particulars': sanitizeCell(t.particulars),
            'Amount': t.amount // Numbers don't need CSV injection sanitation
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Auto-size columns
        const wscols = [
            { wch: 12 }, // Date
            { wch: 25 }, // Name
            { wch: 10 }, // Roll No
            { wch: 10 }, // Class
            { wch: 10 }, // Section
            { wch: 30 }, // Particulars
            { wch: 15 }  // Amount
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

        XLSX.writeFile(workbook, `Transactions_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    // Pagination logic

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    React.useEffect(() => {
        setCurrentPage(prev => Math.min(prev, Math.max(1, totalPages)));
    }, [filteredTransactions.length, itemsPerPage, totalPages]);

    const paginatedData = useMemo(() => {

        const start = (currentPage - 1) * itemsPerPage;
        return filteredTransactions.slice(start, start + itemsPerPage);
    }, [filteredTransactions, currentPage]);

    const totalAmount = useMemo(() => {
        return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    }, [filteredTransactions]);

    return (
        <div className="h-full flex flex-col p-4 md:p-8 pt-20 md:pt-8 min-h-full max-w-[1600px] mx-auto w-full">
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
                            <FileSpreadsheet className="text-[var(--accent-primary)]" size={32} />
                            Reports & Exports
                        </h1>
                        <p className="text-[var(--text-secondary)] text-lg">Export comprehensive transaction history.</p>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={filteredTransactions.length === 0}
                        className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] text-white px-5 py-2.5 rounded-[12px] font-semibold hover:bg-[var(--accent-hover)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} />
                        Export to Excel
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-[var(--bg-card)] rounded-[16px] p-4 border border-[var(--border-color)] flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="timeframe-select" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                            Timeframe
                        </label>
                        <select
                            id="timeframe-select"
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3 rounded-[12px] text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] appearance-none cursor-pointer w-full"
                        >
                            <option value="today">Today</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {timeframe === 'custom' && (
                        <>
                            <div className="flex-1">
                                <label htmlFor="from-date-input" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                                    From Date
                                </label>
                                <input
                                    id="from-date-input"
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3 rounded-[12px] text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] w-full"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="to-date-input" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                                    To Date
                                </label>
                                <input
                                    id="to-date-input"
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-3 rounded-[12px] text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] w-full"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex-1">
                        <label htmlFor="search-input" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input
                                id="search-input"
                                type="text"
                                placeholder="Name, Roll, Particulars..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] pl-10 pr-4 py-3 rounded-[12px] text-sm text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-primary)] transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary metrics */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Transactions</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{filteredTransactions.length}</p>
                    </div>
                 </div>
                 <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-green-500">₹{totalAmount.toLocaleString()}</p>
                    </div>
                 </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden bg-[var(--bg-card)] rounded-[16px] border border-[var(--border-color)] flex flex-col shadow-sm">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-[var(--bg-main)] text-[var(--text-secondary)] text-[10px] font-bold tracking-wider uppercase sticky top-0 z-10 border-b border-[var(--border-color)]">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Student</th>
                                <th className="p-4">Class</th>
                                <th className="p-4">Particulars</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-[var(--text-muted)]">
                                        No transactions found for the selected criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map(t => (
                                    <tr key={t.id} className="hover:bg-[var(--bg-main)] transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-[var(--text-primary)]">
                                                {t.date.slice(0, 10)}
                                            </div>
                                            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                                                {t.date.length > 10 ? t.date.slice(11, 16) : ''}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-[var(--text-primary)]">{t.studentName}</div>
                                            <div className="text-xs text-[var(--text-secondary)] mt-0.5">Roll: {t.rollNumber}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-[var(--text-primary)]">Class {t.studentClass}</div>
                                            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t.section}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-[var(--text-primary)]">{t.particulars}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-sm font-bold text-green-500">
                                                ₹{t.amount.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-card)]">
                         <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredTransactions.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
