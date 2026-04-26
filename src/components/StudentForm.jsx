import React, { useState } from 'react';
import { Save, X, User, GraduationCap, IndianRupee, Calendar, CheckCircle2 } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import { logActivity } from '../utils/storage';
import { CLASS_FEES } from '../utils/constants';

const InputField = ({ label, name, type = "text", placeholder, required = false, icon: Icon, options = null, value, onChange }) => (
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
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md px-3 py-2.5 text-[var(--text-primary)] outline-none transition-colors focus:border-white text-sm"
                required={required}
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
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md px-3 py-2.5 text-[var(--text-primary)] outline-none transition-colors focus:border-white text-sm placeholder:text-[var(--text-muted)]"
                placeholder={placeholder}
                required={required}
            />
        )}
    </div>
);

const StudentForm = ({ onSave, onCancel, initialData = null }) => {
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
        admissionStatus: 'Confirmed'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'class') {
            const fee = CLASS_FEES[value] || '';
            setFormData(prev => ({
                ...prev,
                [name]: value,
                feesAmount: fee
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let dataToSave = { ...formData };
        if (initialData && initialData.admissionStatus !== formData.admissionStatus) {
            dataToSave.lastStatusChangeDate = new Date().toISOString().split('T')[0];
            dataToSave.lastStatusChangedBy = 'form-edit';
        }

        if (initialData) {
            logActivity('student', `Updated details for student: ${formData.name}`);
        } else {
            logActivity('student', `Admitted new student: ${formData.name} (Class ${formData.class})`);
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
                        className="p-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-white transition-colors z-20 flex items-center justify-center"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-8 md:gap-10 bg-[var(--bg-main)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        {/* Personal Information Group */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-color)] mb-4">
                                <User size={18} className="text-blue-400" />
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

                        {/* Administrative Details Group */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-color)] mb-4">
                                <IndianRupee size={18} className="text-emerald-400" />
                                <h3 className="font-medium text-[var(--text-primary)] text-base">Fee Details</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField 
                                    label="Base Fee (₹)" 
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
                            <Calendar size={18} className="text-blue-400" />
                            <h3 className="font-medium text-[var(--text-primary)] text-base">Recent Payment History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-[var(--border-color)]">
                                <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)]">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Month</th>
                                        <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-medium text-[var(--text-secondary)] ">Fine</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10 bg-[var(--bg-card)]">
                                    {initialData.feeHistory.slice(-5).reverse().map((payment) => (
                                        <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium  text-sm">{payment.date}</td>
                                            <td className="px-6 py-4 text-white font-medium  text-sm">{payment.month}</td>
                                            <td className="px-6 py-4 text-emerald-400 font-medium  text-sm">₹{payment.amount}</td>
                                            <td className="px-6 py-4 text-rose-500 font-medium  text-sm">{payment.fine > 0 ? `₹${payment.fine}` : '—'}</td>
                                        </tr>
                                    ))}
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
