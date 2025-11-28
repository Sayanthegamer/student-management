const STORAGE_KEY = 'student_management_data_v1';

export const getStudents = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return [];
  }
};

export const saveStudents = (students) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Error saving to localStorage", error);
  }
};

export const addStudent = (student) => {
  const students = getStudents();
  const newStudent = {
    ...student,
    id: Date.now().toString(),
    feeHistory: [] // Initialize empty fee history
  };
  const updatedStudents = [newStudent, ...students];
  saveStudents(updatedStudents);
  return updatedStudents;
};

export const updateStudent = (updatedStudent) => {
  const students = getStudents();
  const updatedStudents = students.map(s =>
    s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s
  );
  saveStudents(updatedStudents);
  return updatedStudents;
};

export const deleteStudent = (id) => {
  const students = getStudents();
  const updatedStudents = students.filter(s => s.id !== id);
  saveStudents(updatedStudents);
  return updatedStudents;
};

export const addFeePayment = (studentId, paymentDetails) => {
  const students = getStudents();
  const updatedStudents = students.map(student => {
    if (student.id === studentId) {
      const currentHistory = student.feeHistory || [];

      let newPayments = [];
      if (Array.isArray(paymentDetails)) {
        newPayments = paymentDetails.map(p => ({ ...p, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }));
      } else {
        newPayments = [{ ...paymentDetails, id: Date.now().toString() }];
      }

      return {
        ...student,
        feeHistory: [...currentHistory, ...newPayments]
      };
    }
    return student;
  });
  saveStudents(updatedStudents);
  return updatedStudents;
};
