import React, { useState } from 'react';
import { TimeClockEntry, User } from '../types';

interface TimeClockFormModalProps {
    entry: TimeClockEntry | null;
    users: User[];
    onClose: () => void;
    onSave: (entry: TimeClockEntry) => void;
}

const TimeClockFormModal: React.FC<TimeClockFormModalProps> = ({ entry, users, onClose, onSave }) => {
    const toLocalISOString = (date: Date) => {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
        return localISOTime;
    };

    const [formData, setFormData] = useState({
        userId: entry?.userId || (users.length > 0 ? users[0].id : ''),
        clockInTime: entry ? toLocalISOString(new Date(entry.clockInTime)) : '',
        clockOutTime: entry?.clockOutTime ? toLocalISOString(new Date(entry.clockOutTime)) : '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clockInDate = new Date(formData.clockInTime);
        const clockOutDate = formData.clockOutTime ? new Date(formData.clockOutTime) : undefined;
        
        if (clockOutDate && clockInDate >= clockOutDate) {
            alert("Clock out time must be after clock in time.");
            return;
        }

        const entryToSave: TimeClockEntry = {
            id: entry?.id || `tc-${Date.now()}`,
            userId: formData.userId,
            clockInTime: clockInDate.toISOString(),
            clockOutTime: clockOutDate?.toISOString(),
        };
        onSave(entryToSave);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8" role="dialog" aria-modal="true" aria-labelledby="time-entry-modal-title">
                <form onSubmit={handleSubmit}>
                    <h2 id="time-entry-modal-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                        {entry ? 'Edit Time Entry' : 'Add Time Entry'}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User</label>
                            <select name="userId" id="userId" value={formData.userId} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="clockInTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clock In Time</label>
                            <input type="datetime-local" name="clockInTime" id="clockInTime" value={formData.clockInTime} onChange={handleChange} required className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="clockOutTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clock Out Time (optional)</label>
                            <input type="datetime-local" name="clockOutTime" id="clockOutTime" value={formData.clockOutTime} onChange={handleChange} className="w-full border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Save Entry</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimeClockFormModal;