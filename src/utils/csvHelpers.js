/**
 * Converts an array of student objects to a CSV string.
 * Handles nested objects/arrays by serializing them to JSON strings.
 */
export const convertToCSV = (data) => {
    if (!data || !data.length) return '';

    // Get all unique keys from the first object to form headers
    // We assume all objects have similar structure, or at least the first one is representative
    const headers = Object.keys(data[0]);

    const csvRows = [];

    // Add Header Row
    csvRows.push(headers.join(','));

    // Add Data Rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];

            // Handle null/undefined
            if (val === null || val === undefined) {
                return '';
            }

            // Handle objects/arrays (like feeHistory, tcDetails)
            if (typeof val === 'object') {
                const jsonString = JSON.stringify(val);
                // Escape quotes by doubling them
                const escaped = jsonString.replace(/"/g, '""');
                return `"${escaped}"`;
            }

            // Handle strings/numbers
            const stringVal = String(val);

            // If value contains comma, newline or quotes, wrap in quotes and escape internal quotes
            if (stringVal.includes(',') || stringVal.includes('\n') || stringVal.includes('"')) {
                return `"${stringVal.replace(/"/g, '""')}"`;
            }

            return stringVal;
        });

        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

/**
 * Parses a CSV string back into an array of student objects.
 * Deserializes nested JSON strings back into objects/arrays.
 */
export const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].trim().split(',');
    const result = [];

    // Helper to split CSV line respecting quotes
    const splitCSVLine = (line) => {
        const values = [];
        let currentVal = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                // Check for escaped quote ("")
                if (inQuotes && line[i + 1] === '"') {
                    currentVal += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(currentVal);
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        values.push(currentVal);
        return values;
    };

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = splitCSVLine(line);
        const obj = {};

        headers.forEach((header, index) => {
            let val = values[index];

            // Try to parse JSON for complex fields (arrays/objects)
            // We look for typical JSON starts like [ or {
            if (val && (val.startsWith('[') || val.startsWith('{'))) {
                try {
                    val = JSON.parse(val);
                } catch (e) {
                    // Keep as string if parse fails
                }
            }

            obj[header] = val;
        });

        result.push(obj);
    }

    return result;
};
