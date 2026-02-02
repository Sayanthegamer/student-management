// Helper functions to transform data between UI (Nested) and DB (Normalized) formats

const safeJSONParse = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return { remarks: str }; // Fallback if it was just a plain string
  }
};

export const normalizeStudent = (student) => {
  // Extract feeHistory and other UI-only fields we don't want to send to DB as-is
  // eslint-disable-next-line no-unused-vars
  const {
    feeHistory,
    feesAmount,
    feesStatus,
    fine,
    ...rest
  } = student;

  // 1. Prepare Fees
  const fees = (feeHistory || []).map(fee => ({
    id: fee.id,
    student_id: student.id,
    amount: parseFloat(fee.amount),
    date: new Date(fee.date).toISOString(),
    month: fee.month,
    type: 'Fee',
    // Pack extra fields into description
    description: JSON.stringify({
      remarks: fee.remarks,
      fine: fee.fine
    })
  }));

  // 2. Prepare Student (Strict Allow-list & Mapping)

  // Safe Date Parsing
  let admissionDateVal;
  const rawDate = student.admissionDate || student.admission_date;
  if (rawDate) {
      try {
          admissionDateVal = new Date(rawDate).toISOString();
      } catch {
          admissionDateVal = new Date().toISOString(); // Fallback to now if invalid
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
    status: student.admissionStatus || student.status || 'Confirmed', // Map admissionStatus to status column

    // Optional fields: Use undefined if missing so key is excluded from JSON
    // This prevents wiping existing data with NULLs during upsert
    guardian_name: (student.guardianName || student.guardian_name) || undefined,
    age: (student.age ? parseInt(student.age) : undefined),
    address: student.address || undefined,
    phone: student.phone || undefined,
    email: student.email || undefined,
    admission_number: (student.admissionNumber || student.admission_number) || undefined,
  };

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

    // Unpack description
    const extraDetails = safeJSONParse(fee.description);

    acc[fee.student_id].push({
      id: fee.id,
      amount: fee.amount,
      date: fee.date ? fee.date.split('T')[0] : '',
      month: fee.month || extraDetails.month,
      ...extraDetails
    });
    return acc;
  }, {});

  return studentsData.map(s => ({
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

    // Reconstruct calculated fields (optional, but good for UI consistency)
    feesAmount: '',
    feesStatus: 'Pending',
    fine: '',

    feeHistory: feesMap[s.id] || []
  }));
};
