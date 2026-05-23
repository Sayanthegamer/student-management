import React, { useState, useCallback } from 'react';
import { Save, X } from 'lucide-react';
import { logActivity } from '../utils/storage';
import { CLASS_FEES, ADMISSION_FEES, ANNUAL_CHARGES, SUBSIDIARY_CHARGES, SUBSIDIARY_CATEGORIES } from '../utils/constants';

// Sub-components
import PersonalInfo from './StudentForm/PersonalInfo';
import FeeDetails from './StudentForm/FeeDetails';
import AdmissionFee from './StudentForm/AdmissionFee';
import ItemizedCharges from './StudentForm/ItemizedCharges';
import PaymentHistoryTable from './StudentForm/PaymentHistoryTable';

/**
 * Component for adding or editing a student's details.
 */
const StudentForm = ({ onSave, onCancel, initialData = null }) => {
    const isNewStudent = !initialData;

    const defaults = {
        name: '',
        class: '',
        section: '',
        rollNo: '',
        guardianName: '',
        tuitionFee: '',
        smartBoardFee: '',
        computerFee: '',
        transportFee: '',
        feesStatus: 'Pending',
        fine: '',
        admissionDate: new Date().toISOString().split('T')[0],
        admissionStatus: 'Confirmed',
        admissionFee: 0,
        admissionFine: 0,
        concessionAmount: 0,
        dob: '',
        enrollmentType: 'OLD',
        phone: '',
        annualChargesBreakdown: {},
        subsidiaryChargesBreakdown: {},
    };

    const getInitialState = () => {
        let data = { ...defaults, ...(initialData || {}) };
        if (initialData && 'feesAmount' in initialData && !initialData.tuitionFee) {
            data.tuitionFee = String(initialData.feesAmount);
        }
        return data;
    };
    const [formData, setFormData] = useState(getInitialState());

    const [subsidiaryInputs, setSubsidiaryInputs] = useState(() => {
        const initial = {};
        const existing = getInitialState().subsidiaryChargesBreakdown || {};
        SUBSIDIARY_CATEGORIES.forEach(cat => {
            initial[cat] = { qty: existing[cat] > 0 ? 1 : 0, price: existing[cat] || 0 };
        });
        return initial;
    });

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        if (name === 'class') {
            const fee = CLASS_FEES[value] ?? '';
            const admFee = ADMISSION_FEES[value] ?? '';
            const annual = ANNUAL_CHARGES[value] || {};
            const subsidiary = SUBSIDIARY_CHARGES[value] || {};
            setFormData(prev => ({
                ...prev,
                [name]: value,
                tuitionFee: fee,
                ...(prev.enrollmentType === 'NEW' && ADMISSION_FEES[value] != null ? { admissionFee: admFee } : {}),
                ...(prev.enrollmentType === 'OLD' ? { admissionFee: 0, admissionFine: 0, concessionAmount: 0 } : {}),
                annualChargesBreakdown: {...annual},
                subsidiaryChargesBreakdown: {...subsidiary}
            }));
            
            setSubsidiaryInputs(prev => {
                const newSubsidiaryInputs = { ...prev };
                SUBSIDIARY_CATEGORIES.forEach(cat => {
                    const val = subsidiary[cat] || 0;
                    newSubsidiaryInputs[cat] = { qty: val > 0 ? 1 : 0, price: val };
                });
                return newSubsidiaryInputs;
            });
        } else if (name === 'enrollmentType') {
            const feeClass = formData.class || '';
            const admFee = feeClass ? (ADMISSION_FEES[feeClass] ?? '') : '';
            const annual = feeClass ? (ANNUAL_CHARGES[feeClass] || {}) : {};
            const subsidiary = feeClass ? (SUBSIDIARY_CHARGES[feeClass] || {}) : {};

            const currentAnnual = (formData.annualChargesBreakdown && Object.keys(formData.annualChargesBreakdown).length > 0)
                ? formData.annualChargesBreakdown
                : annual;
            const currentSubsidiary = (formData.subsidiaryChargesBreakdown && Object.keys(formData.subsidiaryChargesBreakdown).length > 0)
                ? formData.subsidiaryChargesBreakdown
                : subsidiary;

            setFormData(prev => ({
                ...prev,
                [name]: value,
                ...(value === 'NEW' && ADMISSION_FEES[feeClass] != null ? { admissionFee: admFee } : {}),
                ...(value === 'OLD' ? { admissionFee: 0, admissionFine: 0, concessionAmount: 0 } : {}),
                annualChargesBreakdown: currentAnnual,
                subsidiaryChargesBreakdown: currentSubsidiary
            }));

            setSubsidiaryInputs(prev => {
                const newSubsidiaryInputs = { ...prev };
                SUBSIDIARY_CATEGORIES.forEach(cat => {
                    const val = currentSubsidiary[cat] || 0;
                    newSubsidiaryInputs[cat] = { qty: val > 0 ? 1 : 0, price: val };
                });
                return newSubsidiaryInputs;
            });
        } else if (['tuitionFee', 'smartBoardFee', 'computerFee', 'transportFee', 'fine', 'admissionFine', 'admissionFee', 'concessionAmount'].includes(name)) {
            const parsedValue = value === '' ? '' : Number(value);
            const clampedValue = parsedValue === '' ? '' : (isNaN(parsedValue) ? 0 : Math.max(0, parsedValue));
            setFormData(prev => ({ ...prev, [name]: clampedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, [formData.class, formData.annualChargesBreakdown, formData.subsidiaryChargesBreakdown]);

    // Derived values
    const rawAdmission = Number(formData.admissionFee);
    const grossAdmissionFee = Math.max(0, isNaN(rawAdmission) ? 0 : rawAdmission);
    const rawConcession = Number(formData.concessionAmount);
    const concessionAmount = Math.max(0, Math.min(isNaN(rawConcession) ? 0 : rawConcession, grossAdmissionFee));
    const netAdmissionFee = grossAdmissionFee - concessionAmount;
    const admissionFineAmount = Math.max(0, Number(formData.admissionFine) || 0);
    const totalAdmissionPayable = netAdmissionFee + admissionFineAmount;
    const hasConcession = concessionAmount > 0;

    const handleSubmit = (e) => {
        e.preventDefault();

        let dataToSave = { ...formData };
        dataToSave.admissionFee = grossAdmissionFee;
        dataToSave.admissionFine = admissionFineAmount;
        dataToSave.concessionAmount = concessionAmount;

        if (initialData && initialData.admissionStatus !== formData.admissionStatus) {
            dataToSave.lastStatusChangeDate = new Date().toISOString().split('T')[0];
            dataToSave.lastStatusChangedBy = 'form-edit';
        }

        if (initialData) {
            logActivity('student', `Updated details for student: ${formData.name}`);
        } else {
            logActivity('student', `Admitted new student: ${formData.name} (Class ${formData.class})${hasConcession ? ' with concession' : ''}`);
        }

        onSave(dataToSave);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 min-h-full flex flex-col">
            <div className="card-base overflow-hidden page-enter flex flex-col">
                <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)] px-6 py-6 md:px-8 text-[var(--text-primary)] relative overflow-hidden flex items-start justify-between">
                    <div className="relative z-10">
                        <h2 className="text-xl md:text-2xl font-semibold">{initialData ? 'Edit Student Record' : 'Register New Student'}</h2>
                        <p className="text-[var(--text-secondary)] mt-1.5 text-sm">Please fill in the official details for the institutional record.</p>
                    </div>
                    <button 
                        onClick={onCancel} 
                        className="p-2 border border-[var(--border-color)] rounded-[12px] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-colors z-20 flex items-center justify-center"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-8 md:gap-10 bg-[var(--bg-main)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        <PersonalInfo formData={formData} handleChange={handleChange} />
                        <FeeDetails formData={formData} handleChange={handleChange} />
                    </div>

                    <AdmissionFee 
                        formData={formData} 
                        handleChange={handleChange}
                        grossAdmissionFee={grossAdmissionFee}
                        concessionAmount={concessionAmount}
                        totalAdmissionPayable={totalAdmissionPayable}
                        hasConcession={hasConcession}
                    />

                    <ItemizedCharges 
                        formData={formData}
                        setFormData={setFormData}
                        subsidiaryInputs={subsidiaryInputs}
                        setSubsidiaryInputs={setSubsidiaryInputs}
                    />

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-2 border-t border-[var(--border-color)]">
                        <button
                            type="button" 
                            onClick={onCancel}
                            className="btn btn-secondary flex-1"
                        >
                            <span>Cancel</span>
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary flex-1"
                        >
                            <Save size={16} />
                            <span>{initialData ? 'Update Record' : 'Complete Registration'}</span>
                        </button>
                    </div>
                </form>

                <PaymentHistoryTable initialData={initialData} />
            </div>
        </div>
    );
};

export default StudentForm;
