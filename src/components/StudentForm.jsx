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
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#1f2937' }}>{initialData ? 'Edit Student' : 'Add New Student'}</h2>
                <button onClick={onCancel} className="btn" style={{ background: 'transparent', padding: '8px' }}>
                    <X size={24} color="#4b5563" />
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Personal Details */}
                <section>
                    <h3 style={{ color: '#4f46e5', marginBottom: '16px', fontSize: '18px' }}>Personal Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="glass-input"
                                placeholder="e.g. Rahul Kumar"
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label>Class</label>
                                <input
                                    type="text"
                                    name="class"
                                    value={formData.class}
                                    onChange={handleChange}
                                    className="glass-input"
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
                                    className="glass-input"
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
                                className="glass-input"
                                placeholder="e.g. 21"
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Fees Details */}
                <section>
                    <h3 style={{ color: '#4f46e5', marginBottom: '16px', fontSize: '18px' }}>Fees & Fine</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label>Fees Amount (₹)</label>
                            <input
                                type="number"
                                name="feesAmount"
                                value={formData.feesAmount}
                                onChange={handleChange}
                                className="glass-input"
                                placeholder="5000"
                            />
                        </div>

                        <div>
                            <label>Fees Status</label>
                            <select
                                name="feesStatus"
                                value={formData.feesStatus}
                                onChange={handleChange}
                                className="glass-input"
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
                                className="glass-input"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </section>

                {/* Admission Details */}
                <section>
                    <h3 style={{ color: '#4f46e5', marginBottom: '16px', fontSize: '18px' }}>Admission</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label>Admission Date</label>
                            <input
                                type="date"
                                name="admissionDate"
                                value={formData.admissionDate}
                                onChange={handleChange}
                                className="glass-input"
                            />
                        </div>

                        <div>
                            <label>Admission Status</label>
                            <select
                                name="admissionStatus"
                                value={formData.admissionStatus}
                                onChange={handleChange}
                                className="glass-input"
                            >
                                <option value="Confirmed">Confirmed</option>
                                <option value="Provisional">Provisional</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div style={{ marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px' }}>
                        <Save size={20} />
                        Save Student
                    </button>
                </div>

            </form>

            {initialData && initialData.feeHistory && initialData.feeHistory.length > 0 && (
                <div style={{ marginTop: '32px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '24px' }}>
                    <h3 style={{ color: '#4f46e5', marginBottom: '16px', fontSize: '18px' }}>Fee Payment History</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                                    <th style={{ padding: '8px' }}>Date</th>
                                    <th style={{ padding: '8px' }}>Month</th>
                                    <th style={{ padding: '8px' }}>Amount</th>
                                    <th style={{ padding: '8px' }}>Fine</th>
                                    <th style={{ padding: '8px' }}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {initialData.feeHistory.map((payment) => (
                                    <tr key={payment.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '8px' }}>{payment.date}</td>
                                        <td style={{ padding: '8px' }}>{payment.month}</td>
                                        <td style={{ padding: '8px' }}>₹{payment.amount}</td>
                                        <td style={{ padding: '8px', color: payment.fine > 0 ? '#dc2626' : 'inherit' }}>
                                            {payment.fine > 0 ? `₹${payment.fine}` : '-'}
                                        </td>
                                        <td style={{ padding: '8px', color: '#6b7280' }}>{payment.remarks || '-'}</td>
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
