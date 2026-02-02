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
    id: student.id || crypto.randomUUID(),
    feeHistory: student.feeHistory || [] // Initialize empty fee history if not provided
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
        newPayments = paymentDetails.map(p => ({ ...p, id: p.id || crypto.randomUUID() }));
      } else {
        newPayments = [{ ...paymentDetails, id: paymentDetails.id || crypto.randomUUID() }];
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

// --- Activity Logging System ---

const ACTIVITIES_KEY = 'student_management_activities_v1';

export const getActivities = () => {
  try {
    const data = localStorage.getItem(ACTIVITIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading activities", error);
    return [];
  }
};

export const logActivity = (type, description) => {
  try {
    const activities = getActivities();
    const newActivity = {
      id: crypto.randomUUID(),
      type, // 'student', 'fee', 'admission', 'tc', 'system'
      description,
      timestamp: new Date().toISOString()
    };

    // Keep only last 50 activities
    const updatedActivities = [newActivity, ...activities].slice(0, 50);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updatedActivities));
    return updatedActivities;
  } catch (error) {
    console.error("Error logging activity", error);
    return [];
  }
};
