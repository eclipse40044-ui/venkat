import React, { useState, useMemo } from 'react';
import { TimeClockEntry, User } from '../types';
import TimeClockFormModal from './TimeClockFormModal';

interface TimeClockManagementProps {
    timeClockEntries: TimeClockEntry[];
    users: User[];
    onSave: (entry: TimeClockEntry) => void;
    onDelete: (entryId: string) => void;
}

const calculateDuration = (start: string, end?: string): string => {
    if (!end) return 'Clocked In';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    if (diff < 0) return 'Invalid';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
};

const TimeClockManagement: React.FC<TimeClockManagementProps> = ({ timeClockEntries, users, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeClockEntry | null>(null);
    const [userFilter, setUserFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

    const filteredEntries = useMemo(() => {
        return timeClockEntries
            .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime())
            .filter(entry => {
                if (userFilter !== 'all' && entry.userId !== userFilter) return false;
                if (dateFilter) {
                    const entryDate = new Date(entry.clockInTime).toISOString().split('T')[0];
                    if (entryDate !== dateFilter) return false;
                }
                return true;
            });
    }, [timeClockEntries, userFilter, dateFilter]);

    const handleEdit = (entry: TimeClockEntry) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingEntry(null);
        setIsModalOpen(true);
    };

    const handleDelete = (entryId: string) => {
        if (window.confirm('Are you sure you want to delete this time entry?')) {
            onDelete(entryId);
        }
    };

    return (
        <div>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-6 flex flex-wrap items-center gap-4">
                <button onClick={handleAddNew} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Add Entry</span>
                </button>
                <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className="w-full sm:w-auto border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="all">All Users</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full sm:w-auto border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-slate-500" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Clock In</th>
                            <th scope="col" className="px-6 py-3">Clock Out</th>
                            <th scope="col" className="px-6 py-3">Duration</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEntries.map(entry => (
                            <tr key={entry.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{userMap.get(entry.userId) || 'Unknown'}</th>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(entry.clockInTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{entry.clockOutTime ? new Date(entry.clockOutTime).toLocaleString() : '-'}</td>
                                <td className="px-6 py-4 font-semibold">{calculateDuration(entry.clockInTime, entry.clockOutTime)}</td>
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <button onClick={() => handleEdit(entry)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(entry.id)} className="font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredEntries.length === 0 && (
                     <div className="text-center py-10">
                        <p className="text-slate-500 dark:text-slate-400">No time entries found for the selected filters.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <TimeClockFormModal
                    entry={editingEntry}
                    users={users}
                    onClose={() => setIsModalOpen(false)}
                    onSave={onSave}
                />
            )}
        </div>
    );
};

export default TimeClockManagement;