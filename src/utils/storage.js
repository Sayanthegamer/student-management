import { calculateFeesStatus } from './syncHelpers';

/**
 * Storage key for session data.
 * @type {string}
 */
const STORAGE_KEY = 'student_management_session_v1';

/**
 * Retrieves the list of students from sessionStorage.
 *
 * @returns {Object[]} The array of student objects.
 */
export const getStudents = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from sessionStorage", error);
    // Issue 7: Return empty array on error - could notify user that cache was cleared
    // Future enhancement: Emit event for UI to show notification
    return [];
  }
};

/**
 * Saves the list of students to sessionStorage.
 *
 * @param {Object[]} students - The array of student objects to save.
 */
export const saveStudents = (students) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error("Error saving to sessionStorage", error);
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      window.dispatchEvent(new CustomEvent('storage_quota_exceeded'));
    }
  }
};

/**
 * Adds a new student to the storage.
 *
 * @param {Object} student - The new student object.
 * @returns {Object[]} The updated array of student objects.
 */
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

/**
 * Updates an existing student in the storage.
 *
 * @param {Object} updatedStudent - The student object with updated fields.
 * @returns {Object[]} The updated array of student objects.
 */
export const updateStudent = (updatedStudent) => {
  const students = getStudents();
  const updatedStudents = students.map(s =>
    s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s
  );
  saveStudents(updatedStudents);
  return updatedStudents;
};

/**
 * Deletes a student from the storage.
 *
 * @param {string} id - The ID of the student to delete.
 * @returns {Object[]} The updated array of student objects.
 */
export const deleteStudent = (id) => {
  const students = getStudents();
  const updatedStudents = students.filter(s => s.id !== id);
  saveStudents(updatedStudents);
  return updatedStudents;
};

/**
 * Adds a fee payment record for a student.
 *
 * @param {string} studentId - The ID of the student.
 * @param {Object|Object[]} paymentDetails - The payment details to add.
 * @returns {Object[]} The updated array of student objects.
 */
export const addFeePayment = (studentId, paymentDetails) => {
  const students = getStudents();
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const updatedStudents = students.map(student => {
    if (student.id === studentId) {
      const currentHistory = student.feeHistory || [];

      let newPayments = [];
      if (Array.isArray(paymentDetails)) {
        newPayments = paymentDetails.map(p => ({ ...p, id: p.id || crypto.randomUUID() }));
      } else {
        newPayments = [{ ...paymentDetails, id: paymentDetails.id || crypto.randomUUID() }];
      }

      const updatedHistory = [...currentHistory, ...newPayments];
      const newFeesStatus = calculateFeesStatus({ feeHistory: updatedHistory }, currentMonth, currentMonth);

      return {
        ...student,
        feeHistory: updatedHistory,
        feesStatus: newFeesStatus
      };
    }
    return student;
  });
  saveStudents(updatedStudents);
  return updatedStudents;
};

/**
 * Edits an existing fee payment.
 *
 * @param {string} oldStudentId - The ID of the student who currently owns the fee.
 * @param {string} newStudentId - The ID of the student who should own the fee.
 * @param {Object} updatedFee - The updated fee object.
 * @returns {Object[]} The updated array of student objects.
 */
export const editFeePayment = (oldStudentId, newStudentId, updatedFee) => {
  const students = getStudents();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const updatedStudents = students.map(student => {
    if (student.id !== oldStudentId && student.id !== newStudentId) {
      return student;
    }

    let currentHistory = student.feeHistory || [];

    if (oldStudentId === newStudentId) {
      currentHistory = currentHistory.map(f => f.id === updatedFee.id ? updatedFee : f);
    } else {
      if (student.id === oldStudentId) {
        currentHistory = currentHistory.filter(f => f.id !== updatedFee.id);
      } else if (student.id === newStudentId) {
        currentHistory = [...currentHistory, updatedFee];
      }
    }

    const newFeesStatus = calculateFeesStatus({ feeHistory: currentHistory }, currentMonth, currentMonth);

    return {
      ...student,
      feeHistory: currentHistory,
      feesStatus: newFeesStatus
    };
  });

  saveStudents(updatedStudents);
  return updatedStudents;
};

// --- Activity Logging System ---

/**
 * Storage key for session activities data.
 * @type {string}
 */
const ACTIVITIES_KEY = 'student_management_activities_session_v1';

/**
 * Retrieves the list of activities from sessionStorage.
 *
 * @returns {Object[]} The array of activity objects.
 */
export const getActivities = () => {
  try {
    const data = sessionStorage.getItem(ACTIVITIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading activities", error);
    return [];
  }
};

/**
 * Logs a new activity.
 *
 * @param {string} type - The type of activity ('student', 'fee', 'admission', 'tc', 'system').
 * @param {string} description - The description of the activity.
 * @returns {Object[]} The updated array of activity objects.
 */
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
    sessionStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updatedActivities));
    return updatedActivities;
  } catch (error) {
    console.error("Error logging activity", error);
    return [];
  }
};
