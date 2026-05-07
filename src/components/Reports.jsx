import React, { useState, useMemo } from 'react';
import { Calendar, FileSpreadsheet, Download, Search } from 'lucide-react';
import XLSX from 'xlsx-js-style';
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
                        amount: parseFloat(fee.amount) || 0,
                        fine: fee.fine || 0,
                        itemized: fee.itemized_breakdown || {}
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

        const titleRow = [`Transactions Report - ${new Date().toISOString().slice(0, 10)}`];
        const headerRow = ['Date', 'Student Name', 'Roll No', 'Class', 'Section', 'Particulars', 'Tuition Fee', 'SmartBoard Fee', 'Computer Fee', 'Admission Fee', 'Annual Charges', 'Subsidiary Charges', 'Fine', 'Total Amount'];

        // Setup rows for aoa_to_sheet
        const rows = [
            titleRow,
            [], // Empty row for spacing
            headerRow,
            ...filteredTransactions.map(t => {
                const itemized = t.itemized || {};

                // Calculate Annual total
                let annualTotal = 0;
                if (itemized.annual) {
                    annualTotal = Object.values(itemized.annual).reduce((sum, val) => sum + (Number(val) || 0), 0);
                }

                // Calculate Subsidiary total
                let subsidiaryTotal = 0;
                if (itemized.subsidiary) {
                    subsidiaryTotal = Object.values(itemized.subsidiary).reduce((sum, val) => sum + (Number(val) || 0), 0);
                }

                return [
                    sanitizeCell(t.date.slice(0, 10)),
                    sanitizeCell(t.studentName),
                    sanitizeCell(t.rollNumber),
                    sanitizeCell(t.studentClass),
                    sanitizeCell(t.section),
                    sanitizeCell(t.particulars),
                    itemized.tuition || 0,
                    itemized.smartBoard || 0,
                    itemized.computer || 0,
                    itemized.admission || 0,
                    annualTotal,
                    subsidiaryTotal,
                    t.fine || 0,
                    t.amount + (t.fine || 0)
                ];
            })
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(rows);

        // Merge cells for the title
        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } }
        ];

        // Column widths
        worksheet['!cols'] = [
            { wch: 15 }, // Date
            { wch: 30 }, // Name
            { wch: 10 }, // Roll No
            { wch: 10 }, // Class
            { wch: 10 }, // Section
            { wch: 25 }, // Particulars
            { wch: 12 }, // Tuition
            { wch: 15 }, // SmartBoard
            { wch: 15 }, // Computer
            { wch: 15 }, // Admission
            { wch: 15 }, // Annual
            { wch: 15 }, // Subsidiary
            { wch: 10 }, // Fine
            { wch: 15 }  // Total Amount
        ];

        // Apply Styles

        // 1. Title Style
        if (worksheet['A1']) {
            worksheet['A1'].s = {
                font: { name: "Arial", sz: 16, bold: true, color: { rgb: "333333" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }

        // Helper for borders
        const borderStyle = {
            top: { style: "thin", color: { rgb: "DDDDDD" } },
            bottom: { style: "thin", color: { rgb: "DDDDDD" } },
            left: { style: "thin", color: { rgb: "DDDDDD" } },
            right: { style: "thin", color: { rgb: "DDDDDD" } }
        };

        // 2. Header Style
        const headerStyle = {
            font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F46E5" } }, // Indigo-600
            alignment: { horizontal: "center", vertical: "center" },
            border: borderStyle
        };

        // Iterate through all cells to apply styles
        const range = XLSX.utils.decode_range(worksheet['!ref']);

        for (let R = 2; R <= range.e.r; ++R) { // Start from row index 2 (which is the header row)
            for (let C = 0; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[cellRef]) continue;

                if (R === 2) {
                    // It's a header
                    worksheet[cellRef].s = headerStyle;
                } else {
                    // Data rows

                    // Alternating background color
                    const isEvenRow = R % 2 === 0;
                    const rowStyle = {
                        font: { name: "Arial", sz: 10, color: { rgb: "333333" } },
                        fill: { fgColor: { rgb: isEvenRow ? "F9FAFB" : "FFFFFF" } }, // Gray-50 / White
                        alignment: { vertical: "center" },
                        border: borderStyle
                    };

                    // Format Amount column as currency
                    if (C >= 6 && C <= 13) { // Amount columns
                        rowStyle.numFmt = '"₹"#,##0.00';
                        rowStyle.alignment.horizontal = "right";
                    }

                    // Format Date
                    if (C === 0) {
                        rowStyle.alignment.horizontal = "center";
                    }

                    worksheet[cellRef].s = rowStyle;
                }
            }
        }

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
                    <table className="w-full text-left border-collapse hidden md:table">
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
                    {/* Mobile Card View for Reports */}
                    <div className="md:hidden flex flex-col gap-3 p-3">
                        {paginatedData.length === 0 ? (
                            <div className="p-8 text-center text-[var(--text-muted)] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[12px]">
                                No transactions found for the selected criteria.
                            </div>
                        ) : (
                            paginatedData.map(t => (
                                <div key={t.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] p-3 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[var(--text-primary)] font-bold text-sm">{t.studentName}</p>
                                            <p className="text-[var(--text-secondary)] text-xs">{t.class} - {t.section} (Roll: {t.rollNo})</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-400 font-bold text-sm flex items-center justify-end"><IndianRupee size={12} className="mr-0.5"/>{t.amount.toLocaleString()}</p>
                                            <p className="text-[var(--text-muted)] text-[10px]">{new Date(t.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-[var(--bg-main)] rounded-md p-2 mt-1">
                                        <p className="text-[var(--text-muted)] text-[10px] mb-0.5">Particulars</p>
                                        <div className="flex flex-wrap gap-1">
                                            {t.particulars.map((p, i) => (
                                                <span key={i} className="px-1.5 py-0.5 bg-[var(--accent-light)] text-[var(--accent-primary)] rounded text-[10px] font-medium">
                                                    {p.type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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
