import React from 'react';
import { User } from 'lucide-react';
import InputField from './InputField';
import CustomDatePicker from '../../components/CustomDatePicker';
import { CLASS_FEES } from '../../../utils/constants';

const PersonalInfo = ({ formData, handleChange }) => {
    return (
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
                label="Father's Name" 
                name="guardianName" 
                placeholder="Rajesh Kumar" 
                value={formData.guardianName}
                onChange={handleChange}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 h-[62px]">
                    <CustomDatePicker
                        label="Date of Birth"
                        value={formData.dob}
                        onChange={(val) => handleChange({ target: { name: 'dob', value: val } })}
                    />
                </div>
                <InputField
                    label="Contact Number"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    );
};

export default PersonalInfo;
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
/home/engine/.bashrc: line 1: syntax error near unexpected token `('
/home/engine/.bashrc: line 1: `. /etc/profile.d/workload-containment.shn# ~/.bashrc: executed by bash(1) for non-login shells.'
