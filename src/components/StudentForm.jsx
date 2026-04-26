import React, { useState } from 'react';
import { Save, X, User, GraduationCap, IndianRupee, Calendar, CheckCircle2, Ticket } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import { logActivity } from '../utils/storage';
import { CLASS_FEES, ADMISSION_FEES } from '../utils/constants';

const InputField = ({ label, name, type = "text", placeholder, required = false, icon: Icon, options = null, value, onChange, disabled = false, readOnly = false }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)] px-1 flex items-center gap-2">
            {Icon && <Icon size={14} />}
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {options ? (
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md px-3 py-2.5 text-[var(--text-primary)] outline-none transition-colors focus:border-white text-sm"
                required={required}
                disabled={disabled}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md px-3 py-2.5 text-[var(--text-primary)] outline-none transition-colors focus:border-white text-sm placeholder:text-[var(--text-muted)] ${readOnly ? 'opacity-60 pointer-events-none' : ''}`}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                readOnly={readOnly}
            />
        )}
    </div>
);

const StudentForm = ({ onSave, onCancel, initialData = null }) => {
    const isNewStudent = !initialData;

    const [formData, setFormData] = useState(initialData || {
        name: '',
        class: '',
        section: '',
        rollNo: '',
        guardianName: '',
        feesAmount: '',
        feesStatus: 'Pending',
        fine: '',
        admissionDate: new Date().toISOString().split('T')[0],
        admissionStatus: 'Confirmed',
        admissionFee: '',
        concessionAmount: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'class') {
            const fee = CLASS_FEES[value] ?? '';
            const admFee = ADMISSION_FEES[value] ?? formData.admissionFee ?? '';
            setFormData(prev => ({
                ...prev,
                [name]: value,
                feesAmount: fee,
                // Only auto-fill admission fee if there's a configured value AND we're creating new student
                ...(isNewStudent && ADMISSION_FEES[value] != null ? { admissionFee: admFee } : {})
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Calculate net admission fee (clamped to prevent negatives or concession > gross)
    const grossAdmissionFee = Math.max(0, Number(formData.admissionFee) || 0);
    const concessionAmount = Math.max(0, Math.min(Number(formData.concessionAmount) || 0, grossAdmissionFee));
    const netAdmissionFee = grossAdmissionFee - concessionAmount;
    const hasConcession = concessionAmount > 0;

    const handleSubmit = (e) => {
        e.preventDefault();

        let dataToSave = { ...formData };

        // Ensure clamped numeric values are stored properly
        dataToSave.admissionFee = grossAdmissionFee;
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
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
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
                        {/* Personal Information Group */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-color)] mb-4">
                                <User size={18} className="text-[var(--accent-primary)]" />
                                <h3 className="font-medium text-[var(--text-primary)] text-base">Personal Info</h3>
                            </div>
                            
                            <InputField 
                                label="Full Name" 
                                name="name" 
                                placeholder="Rahul Kumar" 
                                required={true} 
                                value={formData.name}
                                onChange={handleChange}
                            />

                            <InputField 
                                label="Guardian Name" 
                                name="guardianName" 
                                placeholder="Rajesh Kumar" 
                                value={formData.guardianName}
                                onChange={handleChange}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <InputField 
                                    label="Class" 
                                    name="class" 
                                    required={true} 
                                    options={[
                                        { value: '', label: 'Select' },
                                        ...Object.keys(CLASS_FEES).map(c => ({ value: c, label: c }))
                                    ]}
                                    value={formData.class}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Section" 
                                    name="section" 
                                    placeholder="A" 
                                    required={true} 
                                    value={formData.section}
                                    onChange={handleChange}
                                />
                            </div>

                            <InputField 
                                label="Roll Number" 
                                name="rollNo" 
                                placeholder="01" 
                                required={true} 
                                value={formData.rollNo}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Fee Details Group */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-color)] mb-4">
                                <IndianRupee size={18} className="text-[var(--accent-primary)]" />
                                <h3 className="font-medium text-[var(--text-primary)] text-base">Fee Details</h3>
                            </div>

                            {/* Monthly Fee Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <InputField 
                                    label="Monthly Fee (₹)" 
                                    name="feesAmount" 
                                    type="number" 
                                    placeholder="500" 
                                    value={formData.feesAmount}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Late Fine (₹)" 
                                    name="fine" 
                                    type="number" 
                                    placeholder="0" 
                                    value={formData.fine}
                                    onChange={handleChange}
                                />
                            </div>

                            <InputField 
                                label="Fee Status" 
                                name="feesStatus" 
                                options={[
                                    { value: 'Paid', label: 'Paid' },
                                    { value: 'Pending', label: 'Pending' },
                                    { value: 'Overdue', label: 'Overdue' }
                                ]}
                                value={formData.feesStatus}
                                onChange={handleChange}
                            />

                            <div className="flex flex-col gap-1.5 h-[62px]">
                                <CustomDatePicker
                                    label="Admission Date"
                                    value={formData.admissionDate}
                                    onChange={(val) => handleChange({ target: { name: 'admissionDate', value: val } })}
                                    required
                                />
                            </div>

                            <InputField 
                                label="Admission Status" 
                                name="admissionStatus" 
                                options={[
                                    { value: 'Confirmed', label: 'Confirmed' },
                                    { value: 'Provisional', label: 'Provisional' },
                                    { value: 'Cancelled', label: 'Cancelled' }
                                ]}
                                value={formData.admissionStatus}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Admission Fee Section — full width below the 2-col grid */}
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] p-5 md:p-6 space-y-5">
                        <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-color)]">
                            <Ticket size={18} className="text-[var(--accent-primary)]" />
                            <h3 className="font-medium text-[var(--text-primary)] text-base">Admission Fee</h3>
                            {hasConcession && (
                                <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                                    Concession Applied
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-[var(--text-secondary)] px-1">
                                    Gross Admission Fee (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold text-sm">₹</span>
                                    <input
                                        type="number"
                                        name="admissionFee"
                                        value={formData.admissionFee}
                                        onChange={handleChange}
                                        className="w-full pl-8 pr-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)] text-sm font-semibold"
                                        placeholder="e.g. 40000"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-[var(--text-secondary)] px-1">
                                    Concession Amount (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm">−₹</span>
                                    <input
                                        type="number"
                                        name="concessionAmount"
                                        value={formData.concessionAmount}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md text-[var(--text-primary)] outline-none transition-colors focus:border-amber-400 text-sm font-semibold"
                                        placeholder="0"
                                        min="0"
                                        max={grossAdmissionFee || undefined}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-[var(--text-secondary)] px-1">
                                    Net Admission Fee
                                </label>
                                <div className={`px-4 py-2.5 rounded-custom-md border text-sm font-bold tabular-nums ${
                                    hasConcession 
                                        ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' 
                                        : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                }`}>
                                    ₹{netAdmissionFee.toLocaleString()}
                                    {hasConcession && (
                                        <span className="text-[10px] font-medium ml-2 text-amber-400/60">
                                            (saved ₹{concessionAmount.toLocaleString()})
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

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

                {initialData && initialData.feeHistory && initialData.feeHistory.length > 0 && (
                    <div className="bg-[var(--bg-card)] p-6 md:p-8 border-t border-[var(--border-color)]">
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar size={18} className="text-[var(--accent-primary)]" />
                            <h3 className="font-medium text-[var(--text-primary)] text-base">Recent Payment History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-[var(--border-color)]">
                                <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Type</th>
                                        <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Month</th>
                                        <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Fine</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
                                    {initialData.feeHistory.slice(-5).reverse().map((payment) => {
                                        const displayType = payment.type === 'Admission' ? 'Admission' : 'Monthly';
                                        return (
                                        <tr key={payment.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] border uppercase tracking-wider ${
                                                    displayType === 'Admission' 
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {displayType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[var(--text-primary)] font-medium text-sm">{payment.date}</td>
                                            <td className="px-6 py-4 text-[var(--text-primary)] font-medium text-sm">{payment.month || '—'}</td>
                                            <td className="px-6 py-4 text-[var(--color-positive)] font-bold text-sm">₹{payment.amount}</td>
                                            <td className={`px-6 py-4 text-sm ${payment.fine > 0 ? 'text-[var(--color-negative)] font-bold' : 'text-[var(--text-muted)] font-normal'}`}>{payment.fine > 0 ? `₹${payment.fine}` : '—'}</td>
                                        </tr>
                                    );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentForm;
