import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const StudentForm = ({ onSave, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        class: '',
        section: '',
        rollNo: '',
        feesAmount: '',
        feesStatus: 'Pending',
        fine: '',
        admissionDate: new Date().toISOString().split('T')[0],
        admissionStatus: 'Confirmed'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-white/75 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="m-0 text-gray-800 text-xl font-bold">{initialData ? 'Edit Student' : 'Add New Student'}</h2>
                <button onClick={onCancel} className="btn bg-transparent p-2 hover:bg-black/5">
                    <X size={24} className="text-gray-600" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Personal Details */}
                <section>
                    <h3 className="text-indigo-600 mb-4 text-lg font-medium">Personal Details</h3>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. Rahul Kumar"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label>Class</label>
                                <input
                                    type="text"
                                    name="class"
                                    value={formData.class}
                                    onChange={handleChange}
                                    className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="10"
                                    required
                                />
                            </div>
                            <div>
                                <label>Section</label>
                                <input
                                    type="text"
                                    name="section"
                                    value={formData.section}
                                    onChange={handleChange}
                                    className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="A"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label>Roll No.</label>
                            <input
                                type="text"
                                name="rollNo"
                                value={formData.rollNo}
                                onChange={handleChange}
                                className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. 21"
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Fees Details */}
                <section>
                    <h3 className="text-indigo-600 mb-4 text-lg font-medium">Fees & Fine</h3>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label>Fees Amount (₹)</label>
                            <input
                                type="number"
                                name="feesAmount"
                                value={formData.feesAmount}
                                onChange={handleChange}
                                className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                                placeholder="5000"
                            />
                        </div>

                        <div>
                            <label>Fees Status</label>
                            <select
                                name="feesStatus"
                                value={formData.feesStatus}
                                onChange={handleChange}
                                className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>

                        <div>
                            <label>Fine (₹)</label>
                            <input
                                type="number"
                                name="fine"
                                value={formData.fine}
                                onChange={handleChange}
                                className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </section>

                {/* Admission Details */}
                <section>
                    <h3 className="text-indigo-600 mb-4 text-lg font-medium">Admission</h3>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label>Admission Date</label>
                            <input
                                type="date"
                                name="admissionDate"
                                value={formData.admissionDate}
                                onChange={handleChange}
                                className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label>Admission Status</label>
                            <select
                                name="admissionStatus"
                                value={formData.admissionStatus}
                                onChange={handleChange}
                                className="w-full bg-white/50 border border-white/30 px-4 py-3 rounded-xl text-base outline-none transition-all focus:bg-white/80 focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Confirmed">Confirmed</option>
                                <option value="Provisional">Provisional</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="mt-6">
                    <button type="submit" className="btn btn-primary w-full p-4 text-lg">
                        <Save size={20} />
                        Save Student
                    </button>
                </div>

            </form>

            {initialData && initialData.feeHistory && initialData.feeHistory.length > 0 && (
                <div className="mt-8 border-t border-black/10 pt-6">
                    <h3 className="text-indigo-600 mb-4 text-lg font-medium">Fee Payment History</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-white/50 text-left">
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Month</th>
                                    <th className="p-2">Amount</th>
                                    <th className="p-2">Fine</th>
                                    <th className="p-2">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {initialData.feeHistory.map((payment) => (
                                    <tr key={payment.id} className="border-b border-black/5">
                                        <td className="p-2">{payment.date}</td>
                                        <td className="p-2">{payment.month}</td>
                                        <td className="p-2">₹{payment.amount}</td>
                                        <td className={`p-2 ${payment.fine > 0 ? 'text-red-600' : ''}`}>
                                            {payment.fine > 0 ? `₹${payment.fine}` : '-'}
                                        </td>
                                        <td className="p-2 text-gray-500">{payment.remarks || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentForm;
