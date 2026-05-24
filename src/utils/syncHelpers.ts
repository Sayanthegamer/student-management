import { CLASS_FEES, calculateFine } from './constants';
import { Student, FeePayment } from '../types';

const safeJSONParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return { remarks: str };
  }
};

/**
 * Calculate fee status based on fee history and month
 * @param student - The student object with feeHistory
 * @param month - The month to check (YYYY-MM format)
 * @param currentMonthOverride - Optional pre-calculated current month (YYYY-MM format)
 * @returns - 'Paid', 'Pending', or 'Overdue'
 */
export const calculateFeesStatus = (
  student: Pick<Student, 'feeHistory'>, 
  month: string, 
  currentMonthOverride?: string
): string => {
  if (!student.feeHistory || !Array.isArray(student.feeHistory)) {
    return 'Pending';
  }

  const isPaid = student.feeHistory.some(p => p.month === month);
  if (isPaid) return 'Paid';

  const currentMonth = currentMonthOverride || new Date().toISOString().slice(0, 7);
  return month < currentMonth ? 'Overdue' : 'Pending';
};

export { calculateFine };

/**
 * Get the standard fee amount for a class
 * @param className - The class name
 * @returns - The fee amount as a string
 */
export const getClassFeeAmount = (className: string): string => {
  return CLASS_FEES[className] || '';
};

export interface NormalizedStudent {
    id: string;
    name: string;
    class: string;
    section: string;
    roll_no: string;
    admission_date?: string;
    status: string;
    guardian_name?: string;
    dob?: string;
    enrollment_type?: string;
    address?: string;
    phone?: string;
    email?: string;
    admission_number?: string;
    last_status_change_date?: string;
    last_status_changed_by?: string;
    admission_fee?: number;
    concession_amount?: number;
    tuition_fee?: number;
    smart_board_fee?: number;
    computer_fee?: number;
    [key: string]: any;
}

export interface NormalizedFee {
    id: string;
    student_id: string;
    amount: number;
    date: string;
    month: string | null;
    type: string;
    description: string;
    itemized_breakdown: any;
}

/**
 * Normalizes a nested student object from the UI into flattened student and fees structures for DB storage.
 *
 * @param student - The student object from the UI.
 * @returns An object containing the normalized student and their fees.
 */
export const normalizeStudent = (student: Student): { student: NormalizedStudent, fees: NormalizedFee[] } => {
  const missingFields = (['id', 'name', 'class', 'section', 'rollNo'] as (keyof Student)[]).filter(f => !student[f]);
  if (missingFields.length > 0) {
    throw new Error(`normalizeStudent: missing required fields: ${missingFields.join(', ')}`);
  }

  const {
    feeHistory,
    feesAmount,
    feesStatus,
    fine,
    ...rest
  } = student;

  const fees: NormalizedFee[] = (feeHistory || []).map(fee => ({
    id: fee.id,
    student_id: student.id,
    amount: Number(fee.amount),
    date: new Date(fee.date || '').toISOString(),
    month: fee.month || null,
    type: fee.type || 'Fee',
    description: JSON.stringify({
      remarks: fee.remarks,
      fine: fee.fine
    }),
    itemized_breakdown: (fee as any).itemized_breakdown || {}
  }));

  let admissionDateVal: string | undefined;
  const rawDate = student.admissionDate;
  if (rawDate) {
      try {
          admissionDateVal = new Date(rawDate).toISOString().split('T')[0];
      } catch {
          admissionDateVal = new Date().toISOString().split('T')[0];
      }
  }

  let statusChangeDateVal: string | undefined;
  const rawStatusDate = student.lastStatusChangeDate;
  if (rawStatusDate) {
      try {
          statusChangeDateVal = new Date(rawStatusDate).toISOString().split('T')[0];
      } catch {
          statusChangeDateVal = undefined;
      }
  }

  const cleanedStudent: NormalizedStudent = {
    id: student.id,
    name: student.name,
    class: student.class,
    section: student.section,
    roll_no: student.rollNo,
    admission_date: admissionDateVal,
    status: student.admissionStatus || 'Confirmed',
    guardian_name: student.guardianName || undefined,
    dob: (student as any).dob || undefined,
    enrollment_type: (student as any).enrollmentType || undefined,
    address: student.address || undefined,
    phone: student.phone || undefined,
    email: student.email || undefined,
    admission_number: student.admissionNumber || undefined,
    last_status_change_date: statusChangeDateVal,
    last_status_changed_by: student.lastStatusChangedBy || undefined,
    admission_fee: student.admissionFee != null ? Number(student.admissionFee) : undefined,
    concession_amount: student.concessionAmount != null ? Number(student.concessionAmount) : undefined,
    tuition_fee: (student as any).tuitionFee != null ? Number((student as any).tuitionFee) : undefined,
    smart_board_fee: (student as any).smartBoardFee != null ? Number((student as any).smartBoardFee) : undefined,
    computer_fee: (student as any).computerFee != null ? Number((student as any).computerFee) : undefined,
  };

  Object.keys(cleanedStudent).forEach(key =>
      cleanedStudent[key] === undefined && delete cleanedStudent[key]
  );

  return { student: cleanedStudent, fees };
};

/**
 * Denormalizes raw DB student and fees data into a nested structure for the UI.
 *
 * @param studentsData - Array of student records from the DB.
 * @param feesData - Array of fee records from the DB.
 * @returns The array of denormalized, nested student objects.
 */
export const denormalizeStudents = (studentsData: NormalizedStudent[], feesData: NormalizedFee[]): Student[] => {
  if (!studentsData) return [];

  const feesMap = (feesData || []).reduce((acc, fee) => {
    if (!acc[fee.student_id]) acc[fee.student_id] = [];
    const extraDetails = safeJSONParse(fee.description);
    acc[fee.student_id].push({
      id: fee.id,
      amount: fee.amount,
      date: fee.date ? fee.date.split('T')[0] : '',
      month: fee.month || extraDetails.month || '',
      type: fee.type || 'Fee',
      remarks: extraDetails.remarks || '',
      fine: extraDetails.fine || 0,
      itemized_breakdown: typeof fee.itemized_breakdown === 'string' ? safeJSONParse(fee.itemized_breakdown) : (fee.itemized_breakdown || {})
    } as FeePayment);
    return acc;
  }, {} as Record<string, FeePayment[]>);

  const currentMonth = new Date().toISOString().slice(0, 7);

  return studentsData.map(s => {
    const feeHistory = feesMap[s.id] || [];
    const feesAmount = getClassFeeAmount(s.class);
    const feesStatus = calculateFeesStatus({ feeHistory }, currentMonth, currentMonth);

    return {
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
      lastStatusChangeDate: s.last_status_change_date,
      lastStatusChangedBy: s.last_status_changed_by,
      admissionFee: s.admission_fee || 0,
      tuitionFee: s.tuition_fee || feesAmount,
      smartBoardFee: s.smart_board_fee || '',
      computerFee: s.computer_fee || '',
      concessionAmount: s.concession_amount || 0,
      feesAmount,
      feesStatus,
      fine: '',
      feeHistory
    } as any as Student;
  });
};
