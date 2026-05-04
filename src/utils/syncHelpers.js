// Helper functions to transform data between UI (Nested) and DB (Normalized) formats

import { CLASS_FEES, calculateFine } from './constants';

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
 * @param {string} [currentMonthOverride] - Optional pre-calculated current month (YYYY-MM format) to optimize loop performance
 * @returns {string} - 'Paid', 'Pending', or 'Overdue'
 */
// ⚡ Bolt Performance Optimization: Accept currentMonthOverride to avoid O(N) Date object creations in loops
export const calculateFeesStatus = (student, month, currentMonthOverride) => {
  if (!student.feeHistory || !Array.isArray(student.feeHistory)) {
    return 'Pending';
  }

  const isPaid = student.feeHistory.some(p => p.month === month);
  if (isPaid) return 'Paid';

  const currentMonth = currentMonthOverride || new Date().toISOString().slice(0, 7);
  return month < currentMonth ? 'Overdue' : 'Pending';
};

// Re-export for backward compatibility
export { calculateFine };

/**
 * Get the standard fee amount for a class
 * @param {string} className - The class name
 * @returns {string} - The fee amount as a string
 */
export const getClassFeeAmount = (className) => {
  return CLASS_FEES[className] || '';
};

/**
 * Normalizes a nested student object from the UI into flattened student and fees structures for DB storage.
 *
 * @param {Object} student - The student object from the UI.
 * @returns {{student: Object, fees: Object[]}} An object containing the normalized student and their fees.
 */
export const normalizeStudent = (student) => {
  // Extract ONLY storage/sync fields, ignore calculated fields
  const {
    feeHistory,

    feesAmount,      // ✗ Calculated by getClassFeeAmount() - not stored

    feesStatus,      // ✗ Calculated by calculateFeesStatus() - not stored

    fine,            // ✗ Calculated per-payment in fee history - not stored

    tcDetails,       // ✓ Store as JSON string (packed separately below)

    ...rest          // ✓ All other fields (intentionally spread and ignored)
  } = student;

  // 1. Prepare Fees
  const fees = (feeHistory || []).map(fee => ({
    id: fee.id,
    student_id: student.id,
    amount: parseFloat(fee.amount),
    date: new Date(fee.date).toISOString(),
    month: fee.month || null, // Admission fees have no month
    type: fee.type || 'Fee',
    // Pack extra fields into description
    description: JSON.stringify({
      remarks: fee.remarks,
      fine: fee.fine
    }),
    itemized_breakdown: fee.itemized_breakdown || {}
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
    dob: student.dob || undefined,
    enrollment_type: student.enrollmentType || undefined,
    address: student.address || undefined,
    phone: student.phone || undefined,
    email: student.email || undefined,
    admission_number: (student.admissionNumber || student.admission_number) || undefined,

    // Status change metadata (Issue 4 fix)
    last_status_change_date: statusChangeDateVal,
    last_status_changed_by: student.lastStatusChangedBy || student.last_status_changed_by || undefined,

    // Admission fee & concession
    admission_fee: student.admissionFee != null ? Number(student.admissionFee) : undefined,
    concession_amount: student.concessionAmount != null ? Number(student.concessionAmount) : undefined,
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

/**
 * Denormalizes raw DB student and fees data into a nested structure for the UI.
 *
 * @param {Object[]} studentsData - Array of student records from the DB.
 * @param {Object[]} feesData - Array of fee records from the DB.
 * @returns {Object[]} The array of denormalized, nested student objects.
 */
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
      month: fee.month || extraDetails.month || '', // Admission fees may have no month
      type: fee.type || 'Fee', // Preserve fee type (Admission/Fee)
      remarks: extraDetails.remarks || '', // ← Explicitly extract
      fine: extraDetails.fine || 0,         // ← Explicitly extract (default 0)
      itemized_breakdown: typeof fee.itemized_breakdown === 'string' ? safeJSONParse(fee.itemized_breakdown) : (fee.itemized_breakdown || {})
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
    // ⚡ Bolt Performance Optimization: Pass pre-computed currentMonth to avoid O(N) Date object creations
    const feesStatus = calculateFeesStatus({ feeHistory }, currentMonth, currentMonth);

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
      dob: s.dob,
      enrollmentType: s.enrollment_type || 'OLD',
      address: s.address,
      phone: s.phone,
      email: s.email,
      admissionNumber: s.admission_number,

      // TC Details (Issue 1 fix)
      tcDetails,

      // Status change metadata (Issue 4 fix)
      lastStatusChangeDate: s.last_status_change_date,
      lastStatusChangedBy: s.last_status_changed_by,

      // Admission fee & concession
      admissionFee: s.admission_fee || 0,
      concessionAmount: s.concession_amount || 0,

      // Calculated fields - recalculated from data, not stored (Issue 2 fix)
      feesAmount,
      feesStatus,
      fine: '', // Fine is calculated per-payment, not stored at student level

      feeHistory
    };
  });
};
