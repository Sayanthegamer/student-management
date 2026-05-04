const fs = require('fs');
const code = fs.readFileSync('src/components/Reports.jsx', 'utf8');
const replacement = `
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    React.useEffect(() => {
        setCurrentPage(prev => Math.min(prev, Math.max(1, totalPages)));
    }, [filteredTransactions.length, itemsPerPage, totalPages]);

    const paginatedData = useMemo(() => {
`;
const newCode = code.replace('    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);\n    const paginatedData = useMemo(() => {', replacement);
fs.writeFileSync('src/components/Reports.jsx', newCode);
