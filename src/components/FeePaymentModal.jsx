import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';

const FeePaymentModal = ({ student, onClose, onSave }) => {
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [isMultiMonth, setIsMultiMonth] = useState(false);
    const [endMonth, setEndMonth] = useState(new Date().toISOString().slice(0, 7));
    const [amount, setAmount] = useState(student.feesAmount || '');
    const [fine, setFine] = useState(0);
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');

    // Auto-calculate fine when date or month changes
    useEffect(() => {
        if (!paymentDate || !selectedMonth) return;

        // Validation: Check admission date
        if (student.admissionDate) {
            const admDate = new Date(student.admissionDate);
            const selDate = new Date(selectedMonth + '-01'); // First day of selected month
            // Compare YYYY-MM
            const admMonthStr = student.admissionDate.slice(0, 7);

            if (selectedMonth < admMonthStr) {
                // Warning only, don't block
                // setError(`Note: Payment is for ${selectedMonth}, before admission in ${admMonthStr}`);
                // Actually, user wants to allow this. Let's just clear error or show a non-blocking warning?
                // Let's show a warning in the UI but NOT set 'error' state which disables the button.
                // We'll use a separate 'warning' state if needed, or just allow it.
                // For now, let's just allow it silently or maybe add a remark?
                setError('');
            } else {
                setError('');
            }
        }

        const calculateFineForMonth = (monthStr) => {
            const payDate = new Date(paymentDate);
            const [year, month] = monthStr.split('-').map(Number);
            const deadline = new Date(year, month - 1, 10);

            if (payDate > deadline) {
                const diffTime = Math.abs(payDate - deadline);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays * 10;
            }
            return 0;
        };

        if (isMultiMonth && endMonth) {
            if (endMonth < selectedMonth) {
                setError('End month cannot be before start month');
                setFine(0);
                return;
            }

            let totalFine = 0;
            let current = new Date(selectedMonth + '-01');
            const end = new Date(endMonth + '-01');

            while (current <= end) {
                const monthStr = current.toISOString().slice(0, 7);
                totalFine += calculateFineForMonth(monthStr);
                current.setMonth(current.getMonth() + 1);
            }
            setFine(totalFine);
        } else {
            setFine(calculateFineForMonth(selectedMonth));
        }

    }, [paymentDate, selectedMonth, endMonth, isMultiMonth, student.admissionDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (error) return;

        if (isMultiMonth && endMonth) {
            const payments = [];
            let current = new Date(selectedMonth + '-01');
            const end = new Date(endMonth + '-01');

            // Calculate number of months to split amount if needed, or just use amount per month?
            // Assuming 'amount' entered is PER MONTH based on typical school flows, 
            // OR total amount? Let's assume Amount is PER MONTH for simplicity and clarity.
            // Actually, usually you pay a total. But if I enter 5000 and select 2 months, is it 2500 each or 5000 each?
            // Let's assume Amount is PER MONTH.

            while (current <= end) {
                const monthStr = current.toISOString().slice(0, 7);

                // Calculate fine for this specific month
                const [year, month] = monthStr.split('-').map(Number);
                const deadline = new Date(year, month - 1, 10);
                const payDate = new Date(paymentDate);
                let monthFine = 0;
                if (payDate > deadline) {
                    const diffTime = Math.abs(payDate - deadline);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    monthFine = diffDays * 10;
                }

                payments.push({
                    date: paymentDate,
                    month: monthStr,
                    amount: Number(amount),
                    fine: monthFine,
                    remarks: remarks + ` (Multi-month payment)`
                });
                current.setMonth(current.getMonth() + 1);
            }
            onSave(student.id, payments);
        } else {
            onSave(student.id, {
                date: paymentDate,
                month: selectedMonth,
                amount: Number(amount),
                fine: Number(fine),
                remarks
            });
        }
    };

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
            overflowY: 'auto', // Scrollable container
            display: 'flex',
            flexDirection: 'column', // Stack for margin: auto to work
            padding: '20px'
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.95)',
                margin: 'auto', // Centers vertically and horizontally if space allows
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#1f2937' }}>Record Fee Payment</h3>
                    <button onClick={onClose} className="btn" style={{ padding: '8px', background: 'transparent' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: '20px', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{student.name}</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Class: {student.class}-{student.section}</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div>
                        <label>Payment Date</label>
                        <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="glass-input"
                            required
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label>For Month</label>
                            <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={isMultiMonth}
                                    onChange={(e) => setIsMultiMonth(e.target.checked)}
                                />
                                Pay Multiple Months
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="glass-input"
                                required
                            />
                            {isMultiMonth && (
                                <>
                                    <span style={{ alignSelf: 'center' }}>to</span>
                                    <input
                                        type="month"
                                        value={endMonth}
                                        onChange={(e) => setEndMonth(e.target.value)}
                                        className="glass-input"
                                        required
                                    />
                                </>
                            )}
                        </div>
                        {error && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label>Amount (₹) {isMultiMonth ? '/ Month' : ''}</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="glass-input"
                                required
                            />
                        </div>
                        <div>
                            <label>Fine (₹)</label>
                            <input
                                type="number"
                                value={fine}
                                onChange={(e) => setFine(e.target.value)}
                                className="glass-input"
                                readOnly // Auto-calculated
                                style={{ background: '#f9fafb' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label>Remarks (Optional)</label>
                        <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="glass-input"
                            placeholder="e.g. Cash / UPI"
                        />
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', opacity: error ? 0.5 : 1, cursor: error ? 'not-allowed' : 'pointer' }}
                            disabled={!!error}
                        >
                            <Save size={18} />
                            Save Payment
                        </button>
                    </div>

                </form>
            </div>
        </div>,
        document.body
    );
};

export default FeePaymentModal;
