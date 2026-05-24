import React from 'react';
import { ANNUAL_CHARGE_CATEGORIES, SUBSIDIARY_CATEGORIES } from '../../utils/constants';

const ItemizedCharges = ({ formData, setFormData, subsidiaryInputs, setSubsidiaryInputs }) => {
    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[12px] p-5 md:p-6 space-y-5 mt-6">
            <h3 className="font-medium text-[var(--text-primary)] text-base mb-4 border-b border-[var(--border-color)] pb-3">Itemized Annual & Subsidiary Charges</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Annual Charges</h4>
                    <div className="space-y-3">
                        {ANNUAL_CHARGE_CATEGORIES.map(cat => (
                            <div key={cat} className="flex items-center justify-between">
                                <label className="text-xs text-[var(--text-primary)]">{cat}</label>
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">₹</span>
                                    <input 
                                        type="number" 
                                        value={formData.annualChargesBreakdown?.[cat] || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                annualChargesBreakdown: {
                                                    ...prev.annualChargesBreakdown,
                                                    [cat]: val ? Math.max(0, Number(val)) : 0
                                                }
                                            }));
                                        }}
                                        className="w-full pl-8 pr-2 py-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] text-xs outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div>
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Subsidiary Items</h4>
                    <div className="space-y-3">
                        {SUBSIDIARY_CATEGORIES.map(cat => {
                            const item = subsidiaryInputs[cat] || { qty: 0, price: 0 };
                            const subtotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
                            return (
                                <div key={cat} className="flex flex-col gap-1.5 mb-3">
                                    <label className="text-xs text-[var(--text-primary)]">{cat}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Qty"
                                            value={item.qty || ''}
                                            onChange={(e) => {
                                                const newQty = e.target.value;
                                                setSubsidiaryInputs(prev => ({ ...prev, [cat]: { ...item, qty: newQty } }));
                                                setFormData(prev => ({
                                                    ...prev,
                                                    subsidiaryChargesBreakdown: {
                                                        ...prev.subsidiaryChargesBreakdown,
                                                        [cat]: (Number(newQty) || 0) * (Number(item.price) || 0)
                                                    }
                                                }));
                                            }}
                                            className="w-16 px-2 py-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] text-xs outline-none"
                                        />
                                        <span className="text-xs text-[var(--text-muted)]">×</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Price"
                                                value={item.price || ''}
                                                onChange={(e) => {
                                                    const newPrice = e.target.value;
                                                    setSubsidiaryInputs(prev => ({ ...prev, [cat]: { ...item, price: newPrice } }));
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        subsidiaryChargesBreakdown: {
                                                            ...prev.subsidiaryChargesBreakdown,
                                                            [cat]: (Number(item.qty) || 0) * (Number(newPrice) || 0)
                                                        }
                                                    }));
                                                }}
                                                className="w-full pl-6 pr-2 py-1.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] text-xs outline-none"
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-[var(--text-primary)] min-w-[3rem] text-right">
                                            = ₹{subtotal}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemizedCharges;
