import React from 'react';
import { IndianRupee } from 'lucide-react';
import InputField from './InputField';
import CustomDatePicker from '../../components/CustomDatePicker';

const FeeDetails = ({ formData, handleChange }) => {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
                <div className="flex items-center gap-3">
                    <IndianRupee size={18} className="text-[var(--accent-primary)]" />
                    <h3 className="font-medium text-[var(--text-primary)] text-base">Fee Details</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Student Type:</span>
                    <select
                        name="enrollmentType"
                        value={formData.enrollmentType}
                        onChange={handleChange}
                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md px-2 py-1 text-xs text-[var(--text-primary)] outline-none"
                    >
                        <option value="OLD">Old</option>
                        <option value="NEW">New</option>
                    </select>
                </div>
            </div>

            {formData.enrollmentType === 'OLD' && (
                <div className="text-[11px] text-[var(--text-secondary)] bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-md mb-2 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Registering an old student counts as a promotion. Admission fees are not required.</span>
                </div>
            )}

            {/* Monthly Fees Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InputField 
                    label="Tuition Fee (₹)"
                    name="tuitionFee"
                    type="number" 
                    placeholder="500" 
                    value={formData.tuitionFee}
                    onChange={handleChange}
                    min={0}
                />
                <InputField
                    label="SmartBoard (₹)"
                    name="smartBoardFee"
                    type="number"
                    placeholder="0"
                    value={formData.smartBoardFee}
                    onChange={handleChange}
                    min={0}
                />
                <InputField
                    label="Computer (₹)"
                    name="computerFee"
                    type="number"
                    placeholder="0"
                    value={formData.computerFee}
                    onChange={handleChange}
                    min={0}
                />
                <InputField
                    label="Transport (₹)"
                    name="transportFee"
                    type="number"
                    placeholder="0"
                    value={formData.transportFee}
                    onChange={handleChange}
                    min={0}
                />

                <div className="col-span-2 sm:col-span-4 flex justify-end">
                    <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[8px] px-4 py-2 flex items-center gap-3 shadow-sm">
                        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Monthly:</span>
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                            ₹{(Number(formData.tuitionFee) || 0) + (Number(formData.smartBoardFee) || 0) + (Number(formData.computerFee) || 0) + (Number(formData.transportFee) || 0)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField 
                    label="Late Fine (₹)" 
                    name="fine" 
                    type="number" 
                    placeholder="0" 
                    value={formData.fine}
                    onChange={handleChange}
                    min={0}
                />

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
                    />
                </div>

                <InputField 
                    label="Admission Status" 
                    name="admissionStatus" 
                    options={[
                        { value: 'Confirmed', label: 'Confirmed' },
                        { value: 'Provisional', label: 'Provisional' },
                        { value: 'Cancelled', label: 'Cancelled' },
                        { value: 'Exited', label: 'Exited' }
                    ]}
                    value={formData.admissionStatus}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

export default FeeDetails;
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
