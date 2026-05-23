import React from 'react';
import { Ticket } from 'lucide-react';

const AdmissionFee = ({ formData, handleChange, grossAdmissionFee, concessionAmount, totalAdmissionPayable, hasConcession }) => {
    if (formData.enrollmentType !== 'NEW') return null;

    return (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
                            className="w-full pl-8 pr-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent-primary)] text-base sm:text-sm font-semibold"
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
                            className="w-full pl-10 pr-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md text-[var(--text-primary)] outline-none transition-colors focus:border-amber-400 text-base sm:text-sm font-semibold"
                            placeholder="0"
                            min="0"
                            max={grossAdmissionFee || undefined}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--text-secondary)] px-1">
                        Late Fine (₹)
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-sm">+₹</span>
                        <input
                            type="number"
                            name="admissionFine"
                            value={formData.admissionFine}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-custom-md text-[var(--text-primary)] outline-none transition-colors focus:border-rose-400 text-base sm:text-sm font-semibold"
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--text-secondary)] px-1">
                        Total Payable
                    </label>
                    <div className={`px-4 py-2.5 rounded-custom-md border text-sm font-bold tabular-nums ${
                        hasConcession 
                            ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' 
                            : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                    }`}>
                        ₹{totalAdmissionPayable.toLocaleString()}
                        {hasConcession && (
                            <span className="text-[10px] font-medium ml-2 text-amber-400/60">
                                (saved ₹{concessionAmount.toLocaleString()})
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionFee;
