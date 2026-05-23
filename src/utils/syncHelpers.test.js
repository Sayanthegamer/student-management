import { describe, it, expect, vi } from 'vitest';
import { calculateFeesStatus, normalizeStudent, denormalizeStudents } from './syncHelpers';

describe('syncHelpers', () => {
  describe('calculateFeesStatus', () => {
    it('should return "Paid" if the month exists in feeHistory', () => {
      const student = {
        feeHistory: [{ month: '2024-01' }, { month: '2024-02' }]
      };
      expect(calculateFeesStatus(student, '2024-01')).toBe('Paid');
    });

    it('should return "Overdue" if the month is in the past and not in feeHistory', () => {
      const student = {
        feeHistory: [{ month: '2024-01' }]
      };
      // Mocking current month as 2024-03
      expect(calculateFeesStatus(student, '2024-02', '2024-03')).toBe('Overdue');
    });

    it('should return "Pending" if the month is current or future and not in feeHistory', () => {
      const student = {
        feeHistory: []
      };
      const currentMonth = '2024-03';
      expect(calculateFeesStatus(student, '2024-03', currentMonth)).toBe('Pending');
      expect(calculateFeesStatus(student, '2024-04', currentMonth)).toBe('Pending');
    });

    it('should return "Pending" if feeHistory is missing or not an array', () => {
        expect(calculateFeesStatus({}, '2024-01')).toBe('Pending');
        expect(calculateFeesStatus({ feeHistory: null }, '2024-01')).toBe('Pending');
    });
  });

  describe('normalizeStudent', () => {
    const validStudent = {
      id: 'uuid-1',
      name: 'John Doe',
      class: '1',
      section: 'A',
      rollNo: '101',
      admissionDate: '2024-01-01',
      admissionStatus: 'Confirmed',
      feeHistory: [
        {
          id: 'fee-1',
          amount: '500.50',
          date: '2024-01-05',
          month: '2024-01',
          type: 'Monthly',
          remarks: 'First payment',
          fine: 30,
          itemized_breakdown: { tuition: 500 }
        }
      ]
    };

    it('should correctly normalize a student and their fees', () => {
      const { student, fees } = normalizeStudent(validStudent);

      // Student checks
      expect(student.id).toBe('uuid-1');
      expect(student.name).toBe('John Doe');
      expect(student.roll_no).toBe('101');
      expect(student.status).toBe('Confirmed');
      expect(student.admission_date).toBe('2024-01-01');

      // Fees checks
      expect(fees).toHaveLength(1);
      expect(fees[0].student_id).toBe('uuid-1');
      expect(fees[0].amount).toBe(500.5);
      expect(fees[0].month).toBe('2024-01');
      const description = JSON.parse(fees[0].description);
      expect(description.remarks).toBe('First payment');
      expect(description.fine).toBe(30);
    });

    it('should throw error if required fields are missing', () => {
      const incomplete = { id: '1', name: 'John' };
      expect(() => normalizeStudent(incomplete)).toThrow(/missing required fields/);
    });

    it('should handle optional fields and convert camelCase to snake_case', () => {
        const studentWithExtras = {
            ...validStudent,
            guardianName: 'Jane Doe',
            phone: '1234567890',
            enrollmentType: 'NEW'
        };
        const { student } = normalizeStudent(studentWithExtras);
        expect(student.guardian_name).toBe('Jane Doe');
        expect(student.phone).toBe('1234567890');
        expect(student.enrollment_type).toBe('NEW');
    });

    it('should strip calculated fields like feesAmount', () => {
        const studentWithCalculated = {
            ...validStudent,
            feesAmount: '500',
            feesStatus: 'Paid'
        };
        const { student } = normalizeStudent(studentWithCalculated);
        expect(student.feesAmount).toBeUndefined();
        expect(student.feesStatus).toBeUndefined();
    });
  });

  describe('denormalizeStudents', () => {
    it('should correctly denormalize flat DB data into nested UI structure', () => {
      const studentsData = [{
        id: 'uuid-1',
        name: 'John Doe',
        class: '1',
        section: 'A',
        roll_no: '101',
        admission_date: '2024-01-01T00:00:00Z',
        status: 'Confirmed',
        guardian_name: 'Jane Doe'
      }];

      const feesData = [{
        id: 'fee-1',
        student_id: 'uuid-1',
        amount: 500.5,
        date: '2024-01-05T00:00:00Z',
        month: '2024-01',
        type: 'Monthly',
        description: JSON.stringify({ remarks: 'First payment', fine: 30 }),
        itemized_breakdown: { tuition: 500 }
      }];

      const result = denormalizeStudents(studentsData, feesData);

      expect(result).toHaveLength(1);
      const student = result[0];
      expect(student.name).toBe('John Doe');
      expect(student.rollNo).toBe('101');
      expect(student.guardianName).toBe('Jane Doe');
      expect(student.feeHistory).toHaveLength(1);
      expect(student.feeHistory[0].amount).toBe(500.5);
      expect(student.feeHistory[0].remarks).toBe('First payment');
      expect(student.feeHistory[0].fine).toBe(30);
    });

    it('should handle students with no fee history', () => {
        const studentsData = [{ id: '1', name: 'John', class: '1', section: 'A', roll_no: '1' }];
        const result = denormalizeStudents(studentsData, []);
        expect(result[0].feeHistory).toEqual([]);
    });

    it('should return empty array if studentsData is null or undefined', () => {
        expect(denormalizeStudents(null, [])).toEqual([]);
        expect(denormalizeStudents(undefined, [])).toEqual([]);
    });
  });
});
