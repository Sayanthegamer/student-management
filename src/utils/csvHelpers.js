import Papa from 'papaparse';

export const convertToCSV = (data) => {
    if (!data || !data.length) return '';
    const processedData = data.map(row => {
        const newRow = { ...row };
        Object.keys(newRow).forEach(key => {
            const val = newRow[key];
            if (key === 'feeHistory' && Array.isArray(val)) {
                if (val.length === 0) {
                    newRow[key] = '';
                } else {
                    newRow[key] = val.map(payment => {
                        const parts = [];
                        if (payment.date) parts.push(`Date: ${payment.date}`);
                        if (payment.month) parts.push(`Month: ${payment.month}`);
                        if (payment.amount) parts.push(`Amt: ${payment.amount}`);
                        if (payment.fine) parts.push(`Fine: ${payment.fine}`);
                        if (payment.remarks) parts.push(`Rem: ${payment.remarks}`);
                        return parts.join(', ');
                    }).join(' | ');
                }
            } else if (val !== null && typeof val === 'object') {
                newRow[key] = JSON.stringify(val);
            }
        });
        return newRow;
    });
    return Papa.unparse(processedData, {
        header: true,
        skipEmptyLines: true,
        newline: '\n'
    });
};

export const validateAndCoerceStudent = (obj) => {
    const required = ['name', 'class', 'section', 'rollNo'];
    for (const field of required) {
        if (!obj[field] || String(obj[field]).trim() === '') {
            throw new Error(`Missing required field: ${field}`);
        }
    }
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
    const safeParseNumber = (val) => {
        if (val === undefined || val === null || val === '') return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    };
    const parsedAdmission = safeParseNumber(obj.admissionFee ?? obj.admission_fee) || 0;
    const parsedConcession = safeParseNumber(obj.concessionAmount ?? obj.concession_amount) || 0;
    const admissionFee = Math.max(0, parsedAdmission);
    const concessionAmount = Math.max(0, Math.min(parsedConcession, admissionFee));
    const result = {
        id: obj.id || crypto.randomUUID(),
        name: String(obj.name).trim(),
        class: String(obj.class).trim(),
        section: String(obj.section).trim(),
        rollNo: String(obj.rollNo).trim(),
        age: safeParseNumber(obj.age),
        address: obj.address ? String(obj.address).trim() : undefined,
        phone: obj.phone ? String(obj.phone).trim() : undefined,
        email: obj.email ? String(obj.email).trim() : undefined,
        guardianName: obj.guardianName ? String(obj.guardianName).trim() : undefined,
        admissionNumber: obj.admissionNumber ? String(obj.admissionNumber).trim() :
                        (obj.admission_number ? String(obj.admission_number).trim() : undefined),
        admissionDate: safeParseDate(obj.admissionDate || obj.admission_date),
        lastStatusChangeDate: safeParseDate(obj.lastStatusChangeDate || obj.last_status_change_date),
        lastStatusChangedBy: obj.lastStatusChangedBy ? String(obj.lastStatusChangedBy).trim() :
                            (obj.last_status_changed_by ? String(obj.last_status_changed_by).trim() : undefined),
        admissionStatus: obj.admissionStatus || 'Confirmed',
        feesAmount: obj.feesAmount ? String(obj.feesAmount) :
                   (obj.fees_amount ? String(obj.fees_amount) : ''),
        feesStatus: obj.feesStatus || obj.fees_status || 'Pending',
        fine: safeParseNumber(obj.fine) || '',
        admissionFee,
        concessionAmount,
        feeHistory: obj.feeHistory || [],
    };
    Object.keys(result).forEach(key => {
        if (result[key] === undefined) {
            delete result[key];
        }
    });
    return result;
};

export const parseCSV = (csvText) => {
    const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false
    });
    if (parsed.errors && parsed.errors.length > 0) {
        console.warn('PapaParse Errors:', parsed.errors);
    }
    const result = [];
    const errors = [];
    const parseFeeHistory = (str) => {
        if (!str) return [];
        if (typeof str === 'string' && (str.startsWith('[') || str.startsWith('{'))) {
            try {
                const parsed = JSON.parse(str);
                return parsed.map(p => ({ ...p, fine: p.fine || 0 }));
            } catch { }
        }
        if (typeof str !== 'string') return [];
        return str.split(' | ').map(paymentStr => {
            const payment = { fine: 0 };
            const parts = paymentStr.split(', ');
            parts.forEach(part => {
                const [key, ...valParts] = part.split(': ');
                const val = valParts.join(': ');
                if (key === 'Date') payment.date = val;
                else if (key === 'Month') payment.month = val;
                else if (key === 'Amt') payment.amount = Number(val);
                else if (key === 'Fine') payment.fine = Number(val) || 0;
                else if (key === 'Rem') payment.remarks = val;
            });
            payment.id = crypto.randomUUID();
            return payment;
        });
    };
    parsed.data.forEach((row, i) => {
        const obj = { ...row };
        if (obj.feeHistory) {
            obj.feeHistory = parseFeeHistory(obj.feeHistory);
        }
        Object.keys(obj).forEach(key => {
            let val = obj[key];
            if (key !== 'feeHistory' && typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
                try {
                    obj[key] = JSON.parse(val);
                } catch { }
            }
        });
        try {
            const validatedStudent = validateAndCoerceStudent(obj);
            result.push(validatedStudent);
        } catch (error) {
            errors.push(`Row ${i + 1}: ${error.message}`);
        }
    });
    if (errors.length > 0) {
        const errorMsg = `CSV Import Errors:\n${errors.join('\n')}`;
        console.error(errorMsg);
    }
    return result;
};
