import React, { useState } from 'react';
import { Save, X, User, GraduationCap, IndianRupee, Calendar, CheckCircle2 } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import { logActivity } from '../utils/storage';
import { CLASS_FEES } from '../utils/constants';

const InputField = ({ label, name, type = "text", placeholder, required = false, icon: Icon, options = null, value, onChange }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-white/50 uppercase tracking-widest px-1 flex items-center gap-2">
            {Icon && <Icon size={12} className="stroke-[3px]" />}
            {label} {required && <span className="text-[#CCFF00]">*</span>}
        </label>
        {options ? (
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-[#050505] border border-white/20 px-4 py-4 rounded-none text-white outline-none transition-colors focus:border-[#CCFF00] text-sm font-black uppercase tracking-widest appearance-none"
                required={required}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
                ))}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-[#050505] border border-white/20 px-4 py-4 rounded-none text-white outline-none transition-colors focus:border-[#CCFF00] text-sm font-black uppercase tracking-widest placeholder:text-white/20"
                placeholder={placeholder?.toUpperCase()}
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
            <div className="bg-[#0a0a0a] border border-white/20 overflow-hidden page-enter flex flex-col">
                <div className="bg-[#050505] border-b border-white/20 px-6 py-6 md:px-10 md:py-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest">{initialData ? 'Edit Student Record' : 'Register New Student'}</h2>
                        <p className="text-[#CCFF00] mt-3 text-xs md:text-sm font-mono uppercase tracking-wide">Please fill in the official details for the institutional record.</p>
                    </div>
                    <div className="absolute -top-4 -right-4 p-8 opacity-5 text-white">
                        <GraduationCap size={160} className="stroke-[1px]" />
                    </div>
                    <button 
                        onClick={onCancel} 
                        className="absolute top-6 right-6 p-3 border border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-colors z-20"
                    >
                        <X size={20} className="stroke-[3px]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 md:p-10 flex flex-col gap-8 md:gap-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {/* Personal Information Group */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-4">
                                <User size={20} className="text-white stroke-[3px]" />
                                <h3 className="font-black text-white uppercase tracking-widest text-lg">Personal Info</h3>
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
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-4">
                                <IndianRupee size={20} className="text-emerald-400 stroke-[3px]" />
                                <h3 className="font-black text-white uppercase tracking-widest text-lg">Fee Details</h3>
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

                    <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-4 border-t border-white/20">
                    <button 
                            type="button" 
                            onClick={onCancel}
                            className="flex-1 px-6 py-5 border border-rose-500 text-rose-500 font-black uppercase tracking-widest hover:bg-rose-500 hover:text-black transition-colors rounded-none text-center"
                        >
                            Cancel Changes
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-6 py-5 bg-[#CCFF00] border border-[#CCFF00] text-black font-black uppercase tracking-widest hover:bg-white hover:border-white transition-colors flex items-center justify-center gap-3 rounded-none group"
                        >
                            <Save size={20} className="group-hover:scale-110 transition-transform stroke-[3px]" />
                            {initialData ? 'Update Record' : 'Complete Registration'}
                        </button>
                    </div>
                </form>

                {initialData && initialData.feeHistory && initialData.feeHistory.length > 0 && (
                    <div className="bg-[#050505] p-6 md:p-10 border-t border-white/20 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar size={20} className="text-[#CCFF00] stroke-[3px]" />
                            <h3 className="font-black uppercase tracking-widest text-lg">Recent Payment History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-white/20">
                                <thead className="bg-[#050505] border-b border-white/20">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest">Month</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-widest">Fine</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10 bg-[#0a0a0a]">
                                    {initialData.feeHistory.slice(-5).reverse().map((payment) => (
                                        <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-black uppercase tracking-widest text-sm">{payment.date}</td>
                                            <td className="px-6 py-4 text-white font-black uppercase tracking-widest text-sm">{payment.month}</td>
                                            <td className="px-6 py-4 text-emerald-400 font-black uppercase tracking-widest text-sm">₹{payment.amount}</td>
                                            <td className="px-6 py-4 text-rose-500 font-black uppercase tracking-widest text-sm">{payment.fine > 0 ? `₹${payment.fine}` : '—'}</td>
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
