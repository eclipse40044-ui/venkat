
import React, { useState, useEffect, useRef } from 'react';
import { Supplier } from '../types';

interface SupplierFormModalProps {
    supplier: Supplier | null;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ supplier, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: supplier?.name || '',
        contactPerson: supplier?.contactPerson || '',
        phone: supplier?.phone || '',
    });
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: supplier?.id || `sup-${Date.now()}`,
            ...formData,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" role="dialog" aria-modal="true" aria-labelledby="supplier-modal-title">
                <form onSubmit={handleSubmit}>
                    <h2 id="supplier-modal-title" className="text-2xl font-bold text-slate-800 mb-6">
                        {supplier ? 'Edit Supplier' : 'Add New Supplier'}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
                            <input ref={inputRef} type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                            <input type="text" name="contactPerson" id="contactPerson" value={formData.contactPerson} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">Save Supplier</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierFormModal;
