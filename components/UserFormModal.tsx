import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { PIN_LENGTH } from '../constants';

interface UserFormModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (user: User) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        role: user?.role || 'Cashier',
        pin: user?.pin || '', // Pin is only for new users and not changed on edit
    });
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= PIN_LENGTH) {
            setFormData(prev => ({ ...prev, pin: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user && formData.pin.length !== PIN_LENGTH) {
            alert(`PIN must be ${PIN_LENGTH} digits for new users.`);
            return;
        }

        onSave({
            id: user?.id || `user-${Date.now()}`,
            name: formData.name,
            role: formData.role as User['role'],
            pin: formData.pin,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
                <form onSubmit={handleSubmit}>
                    <h2 id="user-modal-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                        {user ? 'Edit User' : 'Add New User'}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User Name</label>
                            <input ref={inputRef} type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                            <select name="role" id="role" value={formData.role} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="Cashier">Cashier</option>
                                <option value="Manager">Manager</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        {!user && (
                            <div>
                                <label htmlFor="pin" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial {PIN_LENGTH}-Digit PIN</label>
                                <input
                                    type="password"
                                    name="pin"
                                    id="pin"
                                    value={formData.pin}
                                    onChange={handlePinChange}
                                    required
                                    maxLength={PIN_LENGTH}
                                    inputMode="numeric"
                                    className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 tracking-widest text-center"
                                />
                            </div>
                        )}
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Save User</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;