export interface FeePayment {
    id: string;
    date?: string;
    month?: string;
    amount?: number;
    fine?: number;
    remarks?: string;
    type?: 'Monthly' | 'Promotion' | 'Admission' | string;
}

export interface Student {
    id: string;
    name: string;
    class: string;
    section: string;
    rollNo: string;
    age?: number;
    address?: string;
    phone?: string;
    email?: string;
    guardianName?: string;
    admissionNumber?: string;
    admissionDate?: string;
    lastStatusChangeDate?: string;
    lastStatusChangedBy?: string;
    admissionStatus?: string;
    feesAmount?: string | number;
    feesStatus?: string;
    fine?: string | number;
    admissionFee?: number;
    concessionAmount?: number;
    feeHistory: FeePayment[];
}

export interface Activity {
    id: string;
    type: 'student' | 'fee' | 'admission' | 'tc' | 'system';
    description: string;
    timestamp: string;
}
