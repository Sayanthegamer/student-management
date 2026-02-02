/**
 * Converts an array of student objects to a CSV string.
 * Handles nested objects/arrays by serializing them to JSON strings.
 */
/**
 * Converts an array of student objects to a CSV string.
 * Handles nested objects/arrays by serializing them to a readable string format.
 */
export const convertToCSV = (data) => {
    if (!data || !data.length) return '';

    // Get all unique keys from the first object to form headers
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

            // Handle Fee History (Array of Objects)
            if (header === 'feeHistory' && Array.isArray(val)) {
                if (val.length === 0) return '';
                // Format: Date: 2023-10-27 (Month: 2023-10) - ₹500 | ...
                const formatted = val.map(payment => {
                    const parts = [];
                    if (payment.date) parts.push(`Date: ${payment.date}`);
                    if (payment.month) parts.push(`Month: ${payment.month}`);
                    if (payment.amount) parts.push(`Amt: ${payment.amount}`);
                    if (payment.fine) parts.push(`Fine: ${payment.fine}`);
                    if (payment.remarks) parts.push(`Rem: ${payment.remarks}`);
                    return parts.join(', ');
                }).join(' | ');

                return `"${formatted}"`;
            }

            // Handle TC Details (Object)
            if (header === 'tcDetails' && typeof val === 'object') {
                // Format: Issued: 2023-10-27, Reason: ...
                const parts = [];
                if (val.issueDate) parts.push(`Issued: ${val.issueDate}`);
                if (val.dateOfLeaving) parts.push(`Leaving: ${val.dateOfLeaving}`);
                if (val.reason) parts.push(`Reason: ${val.reason}`);
                if (val.conduct) parts.push(`Conduct: ${val.conduct}`);
                if (val.remarks) parts.push(`Rem: ${val.remarks}`);

                const formatted = parts.join(', ');
                return `"${formatted}"`;
            }

            // Handle other objects/arrays (Fallback to JSON)
            if (typeof val === 'object') {
                const jsonString = JSON.stringify(val);
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
 * Validates and coerces a student object to ensure correct types
 * @param {Object} obj - The raw student object from CSV parsing
 * @returns {Object} - The validated and coerced student object
 * @throws {Error} - If required fields are missing
 */
export const validateAndCoerceStudent = (obj) => {
    // Validate required fields
    const required = ['name', 'class', 'section', 'rollNo'];
    for (const field of required) {
        if (!obj[field] || String(obj[field]).trim() === '') {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Helper to safely parse date
    const safeParseDate = (dateStr) => {
        if (!dateStr) return undefined;
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return undefined;
            return date.toISOString().split('T')[0];
        } catch {
            return undefined;
        }
    };

    // Helper to safely parse number
    const safeParseNumber = (val) => {
        if (val === undefined || val === null || val === '') return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    };

    // Coerce types and return cleaned object
    const result = {
        // Required fields
        id: obj.id || crypto.randomUUID(),
        name: String(obj.name).trim(),
        class: String(obj.class).trim(),
        section: String(obj.section).trim(),
        rollNo: String(obj.rollNo).trim(),

        // Optional fields with type coercion
        age: safeParseNumber(obj.age),
        address: obj.address ? String(obj.address).trim() : undefined,
        phone: obj.phone ? String(obj.phone).trim() : undefined,
        email: obj.email ? String(obj.email).trim() : undefined,
        guardianName: obj.guardianName ? String(obj.guardianName).trim() :
                     (obj.guardian_name ? String(obj.guardian_name).trim() : undefined),
        admissionNumber: obj.admissionNumber ? String(obj.admissionNumber).trim() :
                        (obj.admission_number ? String(obj.admission_number).trim() : undefined),

        // Dates
        admissionDate: safeParseDate(obj.admissionDate || obj.admission_date),
        lastStatusChangeDate: safeParseDate(obj.lastStatusChangeDate || obj.last_status_change_date),
        lastStatusChangedBy: obj.lastStatusChangedBy ? String(obj.lastStatusChangedBy).trim() :
                            (obj.last_status_changed_by ? String(obj.last_status_changed_by).trim() : undefined),

        // Status
        admissionStatus: obj.admissionStatus || obj.status || 'Confirmed',

        // Fee fields (UI calculated - store as strings/numbers)
        feesAmount: obj.feesAmount ? String(obj.feesAmount) :
                   (obj.fees_amount ? String(obj.fees_amount) : ''),
        feesStatus: obj.feesStatus || obj.fees_status || 'Pending',
        fine: safeParseNumber(obj.fine) || '',

        // Arrays and Objects
        feeHistory: obj.feeHistory || [],
        tcDetails: obj.tcDetails || null,
    };

    // Remove undefined values for cleaner objects
    Object.keys(result).forEach(key => {
        if (result[key] === undefined) {
            delete result[key];
        }
    });

    return result;
};

/**
 * Parses a CSV string back into an array of student objects.
 * Deserializes nested custom formats back into objects/arrays.
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

    // Helper to parse Fee History string
    const parseFeeHistory = (str) => {
        if (!str) return [];
        // Try JSON first (backward compatibility)
        if (str.startsWith('[') || str.startsWith('{')) {
            try { return JSON.parse(str); } catch { /* ignore */ }
        }

        return str.split(' | ').map(paymentStr => {
            const payment = {};
            // Split by comma, but be careful about potential commas in values (though we control format)
            // Simple split by ", " should work for our generated format
            const parts = paymentStr.split(', ');
            parts.forEach(part => {
                const [key, ...valParts] = part.split(': ');
                const val = valParts.join(': '); // Rejoin in case value had ": "

                if (key === 'Date') payment.date = val;
                else if (key === 'Month') payment.month = val;
                else if (key === 'Amt') payment.amount = Number(val);
                else if (key === 'Fine') payment.fine = Number(val);
                else if (key === 'Rem') payment.remarks = val;
            });
            return payment;
        });
    };

    // Helper to parse TC Details string
    const parseTCDetails = (str) => {
        if (!str) return null;
        // Try JSON first
        if (str.startsWith('{')) {
            try { return JSON.parse(str); } catch { /* ignore */ }
        }

        const tc = {};
        const parts = str.split(', ');
        parts.forEach(part => {
            const [key, ...valParts] = part.split(': ');
            const val = valParts.join(': ');

            if (key === 'Issued') tc.issueDate = val;
            else if (key === 'Leaving') tc.dateOfLeaving = val;
            else if (key === 'Reason') tc.reason = val;
            else if (key === 'Conduct') tc.conduct = val;
            else if (key === 'Rem') tc.remarks = val;
        });
        return Object.keys(tc).length > 0 ? tc : null;
    };

    const errors = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = splitCSVLine(line);
        const obj = {};

        headers.forEach((header, index) => {
            let val = values[index];

            if (header === 'feeHistory') {
                obj[header] = parseFeeHistory(val);
            } else if (header === 'tcDetails') {
                obj[header] = parseTCDetails(val);
            } else {
                // Try to parse JSON for other complex fields if any
                if (val && (val.startsWith('[') || val.startsWith('{'))) {
                    try {
                        val = JSON.parse(val);
                    } catch {
                        // Keep as string if parse fails
                    }
                }
                obj[header] = val;
            }
        });

        try {
            // Validate and coerce the student object (Issue 5 fix)
            const validatedStudent = validateAndCoerceStudent(obj);
            result.push(validatedStudent);
        } catch (error) {
            errors.push(`Row ${i}: ${error.message}`);
        }
    }

    // If there were validation errors, throw with details
    if (errors.length > 0) {
        const errorMsg = `CSV Import Errors:\n${errors.join('\n')}`;
        console.error(errorMsg);
        // Still return successfully parsed rows, but log errors
        // Optionally, could throw here to stop import: throw new Error(errorMsg);
    }

    return result;
};
