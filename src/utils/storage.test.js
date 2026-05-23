import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getStudents, 
  saveStudents, 
  addStudent, 
  updateStudent, 
  bulkUpdateStudents, 
  deleteStudent,
  addFeePayment,
  editFeePayment,
  getActivities,
  logActivity
} from './storage';
import * as syncHelpers from './syncHelpers';

// Mock syncHelpers
vi.mock('./syncHelpers', () => ({
  calculateFeesStatus: vi.fn((student, month) => 'Pending')
}));

describe('storage.js', () => {
  const STORAGE_KEY = 'student_management_session_v1';
  const ACTIVITIES_KEY = 'student_management_activities_session_v1';

  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    
    // Mock sessionStorage
    const storage = {};
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => { storage[key] = value; }),
      clear: vi.fn(() => { for (const key in storage) delete storage[key]; })
    });

    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7))
    });
  });

  describe('Student Management', () => {
    it('should return empty array if no students in storage', () => {
      expect(getStudents()).toEqual([]);
    });

    it('should save and retrieve students', () => {
      const students = [{ id: '1', name: 'John' }];
      saveStudents(students);
      expect(getStudents()).toEqual(students);
      expect(sessionStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(students));
    });

    it('should handle JSON parse error in getStudents', () => {
      sessionStorage.setItem(STORAGE_KEY, 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(getStudents()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should add a new student with a generated UUID', () => {
      const student = { name: 'Jane' };
      const result = addStudent(student);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Jane');
      expect(result[0].id).toMatch(/^test-uuid-/);
      expect(result[0].feeHistory).toEqual([]);
    });

    it('should update an existing student', () => {
      const students = [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }];
      saveStudents(students);
      
      const updatedStudent = { id: '1', name: 'John Updated' };
      const result = updateStudent(updatedStudent);
      
      expect(result.find(s => s.id === '1').name).toBe('John Updated');
      expect(result.find(s => s.id === '2').name).toBe('Jane');
    });

    it('should bulk update students', () => {
      const students = [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }];
      saveStudents(students);
      
      const updates = [{ id: '1', name: 'John II' }, { id: '2', name: 'Jane II' }];
      const result = bulkUpdateStudents(updates);
      
      expect(result[0].name).toBe('John II');
      expect(result[1].name).toBe('Jane II');
    });

    it('should delete a student', () => {
      const students = [{ id: '1', name: 'John' }];
      saveStudents(students);
      const result = deleteStudent('1');
      expect(result).toEqual([]);
    });

    it('should dispatch storage_quota_exceeded event on QuotaExceededError', () => {
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';
      sessionStorage.setItem.mockImplementationOnce(() => { throw error; });
      
      const dispatchSpy = vi.fn();
      vi.stubGlobal('window', { dispatchEvent: dispatchSpy });
      vi.stubGlobal('CustomEvent', class { constructor(name, detail) { this.name = name; this.detail = detail; } });
      
      saveStudents([]);
      
      expect(dispatchSpy).toHaveBeenCalled();
      const event = dispatchSpy.mock.calls[0][0];
      expect(event.name).toBe('storage_quota_exceeded');
      expect(event.detail.detail).toBe(error);
    });
  });

  describe('Fee Management', () => {
    it('should add a fee payment to a student', () => {
      const students = [{ id: '1', name: 'John', feeHistory: [] }];
      saveStudents(students);
      
      const payment = { amount: 500, month: '2024-01', type: 'Monthly' };
      const result = addFeePayment('1', payment);
      
      const student = result.find(s => s.id === '1');
      expect(student.feeHistory).toHaveLength(1);
      expect(student.feeHistory[0].amount).toBe(500);
      expect(student.feeHistory[0].id).toMatch(/^test-uuid-/);
    });

    it('should deduplicate monthly fee payments by month', () => {
        const students = [{ 
            id: '1', 
            name: 'John', 
            feeHistory: [{ id: 'old', amount: 400, month: '2024-01', type: 'Monthly' }] 
        }];
        saveStudents(students);
        
        const newPayment = { id: 'new', amount: 500, month: '2024-01', type: 'Monthly' };
        const result = addFeePayment('1', newPayment);
        
        const student = result.find(s => s.id === '1');
        expect(student.feeHistory).toHaveLength(1);
        expect(student.feeHistory[0].amount).toBe(500); // Updated to new payment
    });

    it('should edit an existing fee payment', () => {
        const students = [{ 
            id: '1', 
            name: 'John', 
            feeHistory: [{ id: 'fee-1', amount: 500 }] 
        }];
        saveStudents(students);
        
        const updatedFee = { id: 'fee-1', amount: 600 };
        const result = editFeePayment('1', '1', updatedFee);
        
        expect(result[0].feeHistory[0].amount).toBe(600);
    });

    it('should move a fee payment between students', () => {
        const students = [
            { id: '1', name: 'John', feeHistory: [{ id: 'fee-1', amount: 500 }] },
            { id: '2', name: 'Jane', feeHistory: [] }
        ];
        saveStudents(students);
        
        const updatedFee = { id: 'fee-1', amount: 500 };
        const result = editFeePayment('1', '2', updatedFee);
        
        const john = result.find(s => s.id === '1');
        const jane = result.find(s => s.id === '2');
        
        expect(john.feeHistory).toEqual([]);
        expect(jane.feeHistory).toHaveLength(1);
        expect(jane.feeHistory[0].id).toBe('fee-1');
    });
  });

  describe('Activity Logging', () => {
    it('should log an activity', () => {
      const result = logActivity('student', 'Added new student');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('student');
      expect(result[0].description).toBe('Added new student');
      expect(result[0].timestamp).toBeDefined();
    });

    it('should cap activities at 50', () => {
        for(let i = 0; i < 60; i++) {
            logActivity('system', `Activity ${i}`);
        }
        const result = getActivities();
        expect(result).toHaveLength(50);
        expect(result[0].description).toBe('Activity 59'); // Most recent first
    });
  });
});
