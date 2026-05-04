const fs = require('fs');
let code = fs.readFileSync('src/components/Reports.jsx', 'utf8');

const oldFilterLogic = `        // Apply time filter
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (timeframe === 'today') {
            filtered = filtered.filter(t => {
                const d = new Date(t.date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
            });
        } else if (timeframe === 'month') {
            const currentMonth = today.toISOString().slice(0, 7);
            filtered = filtered.filter(t => t.date.slice(0, 7) === currentMonth);
        } else if (timeframe === 'year') {
            const currentYear = today.getFullYear().toString();
            filtered = filtered.filter(t => t.date.startsWith(currentYear));
        } else if (timeframe === 'custom' && customStartDate && customEndDate) {
            filtered = filtered.filter(t => {
                // Ensure format YYYY-MM-DD
                const tDate = t.date.slice(0, 10);
                return tDate >= customStartDate && tDate <= customEndDate;
            });
        }`;

const newFilterLogic = `        // Apply time filter using string comparisons to avoid timezone shifts
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
        }`;

code = code.replace(oldFilterLogic, newFilterLogic);

// Fix export date string logic
code = code.replace(`'Date': new Date(t.date).toLocaleDateString(),`, `'Date': t.date.slice(0, 10),`);

// Fix table date string logic
const oldTableDate = `{new Date(t.date).toLocaleDateString()}`;
const newTableDate = `{t.date.slice(0, 10)}`;
code = code.replace(oldTableDate, newTableDate);

const oldTableTime = `{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
const newTableTime = `{t.date.length > 10 ? t.date.slice(11, 16) : ''}`;
code = code.replace(oldTableTime, newTableTime);

fs.writeFileSync('src/components/Reports.jsx', code);
