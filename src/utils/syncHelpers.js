// Helper functions to transform data between UI (Nested) and DB (Normalized) formats

const safeJSONParse = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return { remarks: str }; // Fallback if it was just a plain string
  }
};

export const normalizeStudent = (student) => {
  const { feeHistory, ...studentData } = student;

  const fees = (feeHistory || []).map(fee => ({
    id: fee.id,
    student_id: student.id,
    amount: parseFloat(fee.amount),
    date: new Date(fee.date).toISOString(),
    type: 'Fee',
    // Pack extra fields into description
    description: JSON.stringify({
      remarks: fee.remarks,
      month: fee.month,
      fine: fee.fine
    })
  }));

  const cleanedStudent = {
    ...studentData,
    age: parseInt(studentData.age) || 0,
    admission_date: new Date(studentData.admission_date).toISOString(),
  };

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
      date: fee.date ? fee.date.split('T')[0] : '', // UI expects YYYY-MM-DD usually? Check StudentForm.
      ...extraDetails
    });
    return acc;
  }, {});

  return studentsData.map(student => ({
    ...student,
    feeHistory: feesMap[student.id] || []
  }));
};
