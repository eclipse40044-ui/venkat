import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { PIN_LENGTH } from '../constants';

interface UserPinModalProps {
    user: User;
    onClose: () => void;
    onSave: (userId: string, newPin: string) => void;
}

const UserPinModal: React.FC<UserPinModalProps> = ({ user, onClose, onSave }) => {
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');

    const isSaveDisabled = useMemo(() => {
        return newPin.length !== PIN_LENGTH || newPin !== confirmPin;
    }, [newPin, confirmPin]);

    useEffect(() => {
        if (newPin.length > 0 && confirmPin.length > 0) {
            if (newPin.length !== PIN_LENGTH) {
                setError(`PIN must be ${PIN_LENGTH} digits.`);
            } else if (newPin !== confirmPin) {
                setError('PINs do not match.');
            } else {
                setError('');
            }
        } else {
             setError('');
        }
    }, [newPin, confirmPin]);

    const handlePinChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= PIN_LENGTH) {
            setter(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSaveDisabled) {
            onSave(user.id, newPin);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-8" role="dialog" aria-modal="true" aria-labelledby="pin-modal-title">
                <form onSubmit={handleSubmit}>
                    <h2 id="pin-modal-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        Change PIN
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">For user: <span className="font-semibold">{user.name}</span></p>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="newPin" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New {PIN_LENGTH}-Digit PIN</label>
                            <input
                                type="password"
                                id="newPin"
                                value={newPin}
                                onChange={handlePinChange(setNewPin)}
                                required
                                maxLength={PIN_LENGTH}
                                inputMode="numeric"
                                className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 tracking-widest text-center text-lg"
                                autoComplete="new-password"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPin" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New PIN</label>
                            <input
                                type="password"
                                id="confirmPin"
                                value={confirmPin}
                                onChange={handlePinChange(setConfirmPin)}
                                required
                                maxLength={PIN_LENGTH}
                                inputMode="numeric"
                                className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 tracking-widest text-center text-lg"
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaveDisabled} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed">Save PIN</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserPinModal;