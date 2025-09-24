
import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types';

interface CategoryFormModalProps {
    category: Category | null;
    onClose: () => void;
    onSave: (category: Category) => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ category, onClose, onSave }) => {
    const [name, setName] = useState(category?.name || '');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({
                id: category?.id || `cat-${Date.now()}`,
                name: name.trim(),
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
                <form onSubmit={handleSubmit}>
                    <h2 id="category-modal-title" className="text-2xl font-bold text-slate-800 mb-6">
                        {category ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                        <input
                            ref={inputRef}
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">Save Category</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;
