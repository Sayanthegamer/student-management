// Helper functions to transform data between UI (Nested) and DB (Normalized) formats

const safeJSONParse = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return { remarks: str }; // Fallback if it was just a plain string
  }
};

/**
 * Calculate fee status based on fee history and month
 * @param {Object} student - The student object with feeHistory
 * @param {string} month - The month to check (YYYY-MM format)
 * @returns {string} - 'Paid', 'Pending', or 'Overdue'
 */
export const calculateFeesStatus = (student, month) => {
  if (!student.feeHistory || !Array.isArray(student.feeHistory)) {
    return 'Pending';
  }

  const isPaid = student.feeHistory.some(p => p.month === month);
  if (isPaid) return 'Paid';

  const currentMonth = new Date().toISOString().slice(0, 7);
  return month < currentMonth ? 'Overdue' : 'Pending';
};

/**
 * Calculate fine for a payment based on payment date and month deadline
 * @param {string} month - The month being paid for (YYYY-MM format)
 * @param {string} payDate - The payment date (YYYY-MM-DD format)
 * @returns {number} - The calculated fine amount
 */
export const calculateFineForPayment = (month, payDate) => {
  if (!month || !payDate) return 0;

  const [year, monthNum] = month.split('-').map(Number);
  const paymentDate = new Date(payDate);

  // Deadline is the 20th of the month being paid for
  const deadline = new Date(year, monthNum - 1, 20);

  // If paid on or before deadline, no fine
  if (paymentDate <= deadline) return 0;

  // Calculate days late
  const daysLate = Math.floor((paymentDate - deadline) / (1000 * 60 * 60 * 24));

  // Fine calculation: ₹5 per day after deadline, capped at ₹100
  const fine = Math.min(daysLate * 5, 100);

  return fine;
};

/**
 * Get the standard fee amount for a class
 * @param {string} className - The class name
 * @returns {string} - The fee amount as a string
 */
export const getClassFeeAmount = (className) => {
  const classFees = {
    'Play School': '350',
    'Nursury': '440',
    'kg-1': '440',
    'kg-2': '440',
    '1': '480',
    '2': '490',
    '3': '510',
    '4': '520',
    '5': '540',
    '6': '560',
    '7': '580',
    '8': '600',
    '9': '650',
    '10': '700',
    '11': '800',
    '12': '900',
    'UG': '1500',
    'PG': '2000'
  };

  return classFees[className] || '';
};

export const normalizeStudent = (student) => {
  // Extract ONLY storage/sync fields, ignore calculated fields
  const {
    feeHistory,
    // eslint-disable-next-line no-unused-vars
    feesAmount,      // ✗ Calculated by getClassFeeAmount() - not stored
    // eslint-disable-next-line no-unused-vars
    feesStatus,      // ✗ Calculated by calculateFeesStatus() - not stored
    // eslint-disable-next-line no-unused-vars
    fine,            // ✗ Calculated per-payment in fee history - not stored
    // eslint-disable-next-line no-unused-vars
    tcDetails,       // ✓ Store as JSON string (packed separately below)
    // eslint-disable-next-line no-unused-vars
    ...rest          // ✓ All other fields (intentionally spread and ignored)
  } = student;

  // 1. Prepare Fees
  const fees = (feeHistory || []).map(fee => ({
    id: fee.id,
    student_id: student.id,
    amount: parseFloat(fee.amount),
    date: new Date(fee.date).toISOString(),
    month: fee.month, // Use dedicated column
    type: 'Fee',
    // Pack extra fields into description
    description: JSON.stringify({
      remarks: fee.remarks,
      fine: fee.fine
    })
  }));

  // 2. Prepare Student (Strict Allow-list & Mapping)

  // Safe Date Parsing - Store only YYYY-MM-DD, not full ISO
  let admissionDateVal;
  const rawDate = student.admissionDate || student.admission_date;
  if (rawDate) {
      try {
          admissionDateVal = new Date(rawDate).toISOString().split('T')[0];
      } catch {
          admissionDateVal = new Date().toISOString().split('T')[0]; // Fallback to now if invalid
      }
  }

  // Safe Date Parsing for status change date
  let statusChangeDateVal;
  const rawStatusDate = student.lastStatusChangeDate || student.last_status_change_date;
  if (rawStatusDate) {
      try {
          statusChangeDateVal = new Date(rawStatusDate).toISOString().split('T')[0];
      } catch {
          statusChangeDateVal = undefined;
      }
  }

  const cleanedStudent = {
    id: student.id,
    name: student.name,
    class: student.class,
    section: student.section,
    // Map camelCase to snake_case
    roll_no: student.rollNo,
    admission_date: admissionDateVal,
    // UI always uses admissionStatus, DB column is status
    status: student.admissionStatus || 'Confirmed',

    // Optional fields: Use undefined if missing so key is excluded from JSON
    // This prevents wiping existing data with NULLs during upsert
    guardian_name: student.guardianName || undefined,
    age: (student.age ? parseInt(student.age) : undefined),
    address: student.address || undefined,
    phone: student.phone || undefined,
    email: student.email || undefined,
    admission_number: (student.admissionNumber || student.admission_number) || undefined,

    // Status change metadata (Issue 4 fix)
    last_status_change_date: statusChangeDateVal,
    last_status_changed_by: student.lastStatusChangedBy || student.last_status_changed_by || undefined,
  };

  // Only include tc_details if it's present in the student object
  // This preserves existing tc_details during partial updates
  if ('tcDetails' in student && student.tcDetails) {
    cleanedStudent.tc_details = JSON.stringify(student.tcDetails);
  }

  // Filter out undefined keys explicitly (though JSON.stringify does this, Supabase client might check keys before stringifying)
  Object.keys(cleanedStudent).forEach(key =>
      cleanedStudent[key] === undefined && delete cleanedStudent[key]
  );

  return { student: cleanedStudent, fees };
};

export const denormalizeStudents = (studentsData, feesData) => {
  if (!studentsData) return [];

  const feesMap = (feesData || []).reduce((acc, fee) => {
    if (!acc[fee.student_id]) acc[fee.student_id] = [];

    // Unpack description JSON
    const extraDetails = safeJSONParse(fee.description);

    acc[fee.student_id].push({
      id: fee.id,
      amount: fee.amount,
      date: fee.date ? fee.date.split('T')[0] : '',
      month: fee.month || extraDetails.month, // Support legacy/migrated data if needed
      remarks: extraDetails.remarks || '', // ← Explicitly extract
      fine: extraDetails.fine || 0         // ← Explicitly extract (default 0)
    });
    return acc;
  }, {});

  const currentMonth = new Date().toISOString().slice(0, 7);

  return studentsData.map(s => {
    const feeHistory = feesMap[s.id] || [];

    // Parse tc_details if present (Issue 1 fix)
    let tcDetails = null;
    if (s.tc_details) {
      try {
        tcDetails = typeof s.tc_details === 'string' ? JSON.parse(s.tc_details) : s.tc_details;
      } catch {
        tcDetails = null;
      }
    }

    // Get the class fee amount
    const feesAmount = getClassFeeAmount(s.class);

    // Calculate fees status based on fee history
    const feesStatus = calculateFeesStatus({ feeHistory }, currentMonth);

    return {
      // Map snake_case DB columns back to UI camelCase
      id: s.id,
      name: s.name,
      class: s.class,
      section: s.section,
      rollNo: s.roll_no,
      admissionDate: s.admission_date ? s.admission_date.split('T')[0] : '',
      admissionStatus: s.status,

      guardianName: s.guardian_name,
      age: s.age,
      address: s.address,
      phone: s.phone,
      email: s.email,
      admissionNumber: s.admission_number,

      // TC Details (Issue 1 fix)
      tcDetails,

      // Status change metadata (Issue 4 fix)
      lastStatusChangeDate: s.last_status_change_date,
      lastStatusChangedBy: s.last_status_changed_by,

      // Calculated fields - recalculated from data, not stored (Issue 2 fix)
      feesAmount,
      feesStatus,
      fine: '', // Fine is calculated per-payment, not stored at student level

      feeHistory
    };
  });
};
