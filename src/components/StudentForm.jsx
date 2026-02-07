import React, { useState } from 'react';
import { Save, X, User, GraduationCap, IndianRupee, Calendar, CheckCircle2 } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import { logActivity } from '../utils/storage';

const InputField = ({ label, name, type = "text", placeholder, required = false, icon: Icon, options = null, value, onChange }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center gap-2">
            {Icon && <Icon size={12} />}
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {options ? (
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium"
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
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium"
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

    const classFees = {
        'Play School': '350',
        'Nursury': '440',
        'kg-1': '440',
        'kg-2': '440',
        '1': '480',
        '2': '490',
        '3': '510',
        '4': '520',
        '5': '540',
        '6': '560',
        '7': '580',
        '8': '600',
        '9': '650',
        '10': '700',
        '11': '800',
        '12': '900',
        'UG': '1500',
        'PG': '2000'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'class') {
            const fee = classFees[value] || '';
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
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden page-enter">
                <div className="bg-slate-900 px-6 py-6 md:px-10 md:py-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl md:text-3xl font-bold tracking-tight">{initialData ? 'Edit Student Record' : 'Register New Student'}</h2>
                        <p className="text-slate-400 mt-2 text-sm md:text-base font-medium">Please fill in the official details for the institutional record.</p>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <GraduationCap size={120} />
                    </div>
                    <button 
                        onClick={onCancel} 
                        className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-10 flex flex-col gap-8 md:gap-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        {/* Personal Information Group */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                                <User size={18} className="text-indigo-600" />
                                <h3 className="font-bold text-slate-800 tracking-tight">Personal Information</h3>
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
                                        ...Object.keys(classFees).map(c => ({ value: c, label: c }))
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
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                                <IndianRupee size={18} className="text-emerald-600" />
                                <h3 className="font-bold text-slate-800 tracking-tight">Fee & Admission Details</h3>
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

                            <div className="flex flex-col gap-1.5">
                                <CustomDatePicker
                                    label="ADMISSION DATE"
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

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-center"
                        >
                            Cancel Changes
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Save size={20} className="group-hover:scale-110 transition-transform" />
                            {initialData ? 'Update Record' : 'Complete Registration'}
                        </button>
                    </div>
                </form>

                {initialData && initialData.feeHistory && initialData.feeHistory.length > 0 && (
                    <div className="bg-slate-50/50 px-4 py-8 md:px-10 md:py-10 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Calendar size={18} className="text-slate-500" />
                            <h3 className="font-bold text-slate-800 tracking-tight">Recent Payment History</h3>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <table className="w-full border-collapse text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Month</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fine</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {initialData.feeHistory.slice(-5).reverse().map((payment) => (
                                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 text-slate-600 font-medium">{payment.date}</td>
                                            <td className="px-4 py-3 text-slate-600 font-medium">{payment.month}</td>
                                            <td className="px-4 py-3 text-emerald-600 font-bold">₹{payment.amount}</td>
                                            <td className="px-4 py-3 text-rose-500 font-semibold">{payment.fine > 0 ? `₹${payment.fine}` : '—'}</td>
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
