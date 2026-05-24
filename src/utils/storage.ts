import { calculateFeesStatus } from './syncHelpers';
import { Student, Activity, FeePayment } from '../types';

/**
 * Generates a stable numeric hash from a string.
 *
 * @param str - The input string.
 * @returns The numeric hash.
 */
const stableHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const STORAGE_KEY = 'student_management_session_v1';

/**
 * Retrieves the list of students from sessionStorage.
 *
 * @returns The array of student objects.
 */
export const getStudents = (): Student[] => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from sessionStorage", error);
    return [];
  }
};

/**
 * Saves the list of students to sessionStorage.
 *
 * @param students - The array of student objects to save.
 */
export const saveStudents = (students: Student[]): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error: any) {
    console.error("Error saving to sessionStorage", error);
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('storage_quota_exceeded', { detail: error }));
      }
    }
  }
};

/**
 * Adds a new student to the storage.
 *
 * @param student - The new student object.
 * @returns The updated array of student objects.
 */
export const addStudent = (student: Partial<Student> & { name: string }): Student[] => {
  const students = getStudents();
  const newStudent: Student = {
    ...student,
    id: student.id || crypto.randomUUID(),
    feeHistory: student.feeHistory || []
  } as Student;
  const updatedStudents = [newStudent, ...students];
  saveStudents(updatedStudents);
  return updatedStudents;
};

/**
 * Updates an existing student in the storage.
 *
 * @param updatedStudent - The student object with updated fields.
 * @returns The updated array of student objects.
 */
export const updateStudent = (updatedStudent: Partial<Student> & { id: string }): Student[] => {
  const students = getStudents();
  const updatedStudents = students.map(s =>
    s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s
  );
  saveStudents(updatedStudents);
  return updatedStudents;
};

/**
 * Bulk updates existing students in the storage.
 *
 * @param updatedStudentsList - Array of student objects with updated fields.
 * @returns The updated array of student objects.
 */
export const bulkUpdateStudents = (updatedStudentsList: (Partial<Student> & { id: string })[]): Student[] => {
  const students = getStudents();
  const updateMap = new Map(updatedStudentsList.map(us => [us.id, us]));
  const updatedStudents = students.map(s => {
    const update = updateMap.get(s.id);
    return update ? { ...s, ...update } : s;
  });
  saveStudents(updatedStudents);
  return updatedStudents;
};

/**
 * Deletes a student from the storage.
 *
 * @param id - The ID of the student to delete.
 * @returns The updated array of student objects.
 */
export const deleteStudent = (id: string): Student[] => {
  const students = getStudents();
  const updatedStudents = students.filter(s => s.id !== id);
  saveStudents(updatedStudents);
  return updatedStudents;
};

/**
 * Adds a fee payment record for a student.
 *
 * @param studentId - The ID of the student.
 * @param paymentDetails - The payment details to add.
 * @returns The updated array of student objects.
 */
export const addFeePayment = (studentId: string, paymentDetails: FeePayment | FeePayment[]): Student[] => {
  const students = getStudents();
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const updatedStudents = students.map(student => {
    if (student.id === studentId) {
      const currentHistory = student.feeHistory || [];

      let newPayments: FeePayment[] = [];
      if (Array.isArray(paymentDetails)) {
        newPayments = paymentDetails.map(p => ({ ...p, id: p.id || crypto.randomUUID() }));
      } else {
        newPayments = [{ ...paymentDetails, id: paymentDetails.id || crypto.randomUUID() }];
      }

      const historyMap = new Map<string, FeePayment>();
      [...currentHistory, ...newPayments].forEach(p => {
        let key: string;
        if (p.type === 'Monthly') {
          key = p.month || p.id;
        } else {
          key = `${p.type}:${p.id}`;
        }
        historyMap.set(key, p);
      });
      const updatedHistory = Array.from(historyMap.values());

      const hasMonthlyPayment = newPayments.some(p => p.type === 'Monthly' && p.month);

      const newFeesStatus = hasMonthlyPayment
        ? calculateFeesStatus({ feeHistory: updatedHistory }, currentMonth, currentMonth)
        : student.feesStatus;

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
 * @param oldStudentId - The ID of the student who currently owns the fee.
 * @param newStudentId - The ID of the student who should own the fee.
 * @param updatedFee - The updated fee object.
 * @returns The updated array of student objects.
 */
export const editFeePayment = (oldStudentId: string, newStudentId: string, updatedFee: FeePayment): Student[] => {
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

const ACTIVITIES_KEY = 'student_management_activities_session_v1';

/**
 * Retrieves the list of activities from sessionStorage.
 *
 * @returns The array of activity objects.
 */
export const getActivities = (): Activity[] => {
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
 * @param type - The type of activity ('student', 'fee', 'admission', 'tc', 'system').
 * @param description - The description of the activity.
 * @returns The updated array of activity objects.
 */
export const logActivity = (type: Activity['type'], description: string): Activity[] => {
  try {
    const activities = getActivities();
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      type,
      description,
      timestamp: new Date().toISOString()
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 50);
    sessionStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updatedActivities));
    return updatedActivities;
  } catch (error: any) {
    console.error("Error logging activity", error);
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('storage_quota_exceeded', { detail: error }));
      }
    }
    return [];
  }
};
