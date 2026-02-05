import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';
import { logActivity } from '../utils/storage';

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

        // Track status changes
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-8 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-slate-100 pb-4">
                <h2 className="m-0 text-slate-800 text-xl md:text-2xl font-bold tracking-tight">{initialData ? 'Edit Student' : 'Add New Student'}</h2>
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors touch-manipulation min-w-[44px] min-h-[44px]">
                    <X size={20} className="md:hidden" />
                    <X size={24} className="hidden md:block" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">

                {/* Personal Details */}
                <section>
                    <h3 className="text-indigo-600 mb-4 md:mb-5 text-base md:text-lg font-bold flex items-center gap-2">
                        <span className="w-1.5 h-5 md:h-6 bg-indigo-600 rounded-full"></span>
                        Personal Details
                    </h3>
                    <div className="flex flex-col gap-4 md:gap-5">
                        <div>
                            <label className="block mb-1.5 md:mb-2 text-slate-600 text-sm font-medium">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-base"
                                placeholder="e.g. Rahul Kumar"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-5">
                            <div>
                                <label className="block mb-1.5 md:mb-2 text-slate-600 text-sm font-medium">Class</label>
                                <select
                                    name="class"
                                    value={formData.class}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-base"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    <option value="Play School">Play School</option>
                                    <option value="Nursury">Nursury</option>
                                    <option value="kg-1">kg-1</option>
                                    <option value="kg-2">kg-2</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                    <option value="UG">UG</option>
                                    <option value="PG">PG</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1.5 md:mb-2 text-slate-600 text-sm font-medium">Section</label>
                                <input
                                    type="text"
                                    name="section"
                                    value={formData.section}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-base"
                                    placeholder="A"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1.5 md:mb-2 text-slate-600 text-sm font-medium">Roll No.</label>
                            <input
                                type="text"
                                name="rollNo"
                                value={formData.rollNo}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-base"
                                placeholder="e.g. 21"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1.5 md:mb-2 text-slate-600 text-sm font-medium">Guardian Name</label>
                            <input
                                type="text"
                                name="guardianName"
                                value={formData.guardianName}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-base"
                                placeholder="e.g. Rajesh Kumar"
                            />
                        </div>
                    </div>
                </section>

                {/* Fees Details */}
                <section>
                    <h3 className="text-emerald-600 mb-4 md:mb-5 text-base md:text-lg font-bold flex items-center gap-2">
                        <span className="w-1.5 h-5 md:h-6 bg-emerald-600 rounded-full"></span>
                        Fees & Fine
                    </h3>
                    <div className="flex flex-col gap-4 md:gap-5">
                        <div>
                            <label className="block mb-1.5 md:mb-2 text-slate-600 text-sm font-medium">Fees Amount (₹)</label>
                            <input
                                type="number"
                                name="feesAmount"
                                value={formData.feesAmount}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-base"
                                placeholder="5000"
                            />
                        </div>

                        <div>
                            <label className="block mb-1.5 md:mb-2 text-slate-600 text-sm font-medium">Fees Status</label>
                            <select
                                name="feesStatus"
                                value={formData.feesStatus}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-base"
                            >
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1.5 md:mb-2 text-slate-600 text-sm font-medium">Fine (₹)</label>
                            <input
                                type="number"
                                name="fine"
                                value={formData.fine}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-base"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </section>

                {/* Admission Details */}
                <section>
                    <h3 className="text-amber-600 mb-4 md:mb-5 text-base md:text-lg font-bold flex items-center gap-2">
                        <span className="w-1.5 h-5 md:h-6 bg-amber-600 rounded-full"></span>
                        Admission
                    </h3>
                    <div className="flex flex-col gap-4 md:gap-5">
                        <div>
                            <CustomDatePicker
                                label="Admission Date"
                                value={formData.admissionDate}
                                onChange={(val) => handleChange({ target: { name: 'admissionDate', value: val } })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1.5 md:mb-2 text-slate-600 text-sm font-medium">Admission Status</label>
                            <select
                                name="admissionStatus"
                                value={formData.admissionStatus}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-3 rounded-xl text-slate-800 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-base"
                            >
                                <option value="Confirmed">Confirmed</option>
                                <option value="Provisional">Provisional</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100">
                    <button type="submit" className="btn btn-primary w-full p-3 md:p-4 text-base md:text-lg font-bold shadow-indigo-200 min-h-[48px]">
                        <Save size={20} />
                        Save Student
                    </button>
                </div>

            </form>

            {initialData && initialData.feeHistory && initialData.feeHistory.length > 0 && (
                <div className="mt-8 md:mt-10 border-t border-slate-100 pt-6 md:pt-8">
                    <h3 className="text-slate-800 mb-4 md:mb-6 text-base md:text-lg font-bold flex items-center gap-2">
                        <span className="w-1.5 h-5 md:h-6 bg-slate-400 rounded-full"></span>
                        Fee Payment History
                    </h3>
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                        <div className="rounded-xl border border-slate-200 min-w-[500px] md:min-w-0">
                            <table className="w-full border-collapse text-sm text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-2 md:p-3 font-semibold text-slate-600 text-xs">Date</th>
                                        <th className="p-2 md:p-3 font-semibold text-slate-600 text-xs">Month</th>
                                        <th className="p-2 md:p-3 font-semibold text-slate-600 text-xs">Amount</th>
                                        <th className="p-2 md:p-3 font-semibold text-slate-600 text-xs">Fine</th>
                                        <th className="p-2 md:p-3 font-semibold text-slate-600 text-xs">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {initialData.feeHistory.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-slate-50/50">
                                            <td className="p-2 md:p-3 text-slate-700 text-xs">{payment.date}</td>
                                            <td className="p-2 md:p-3 text-slate-700 text-xs">{payment.month}</td>
                                            <td className="p-2 md:p-3 font-medium text-emerald-600 text-xs">₹{payment.amount}</td>
                                            <td className={`p-2 md:p-3 text-xs ${payment.fine > 0 ? 'text-rose-600 font-medium' : 'text-slate-400'}`}>
                                                {payment.fine > 0 ? `₹${payment.fine}` : '-'}
                                            </td>
                                            <td className="p-2 md:p-3 text-slate-500 italic text-xs truncate max-w-[100px]" title={payment.remarks}>{payment.remarks || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentForm;
