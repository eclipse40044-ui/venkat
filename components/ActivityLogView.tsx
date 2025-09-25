import React, { useState, useMemo } from 'react';
import { ActivityLog, User } from '../types';

interface ActivityLogViewProps {
    logs: ActivityLog[];
    users: User[];
}

const ITEMS_PER_PAGE = 15;

const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs, users }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return logs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [logs, currentPage]);

    const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
    
    const formatAction = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.map(log => (
                            <tr key={log.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{userMap.get(log.userId) || 'Unknown User'}</td>
                                <td className="px-6 py-4">{formatAction(log.action)}</td>
                                <td className="px-6 py-4">{log.details || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {paginatedLogs.length === 0 && (
                     <div className="text-center py-10">
                        <p className="text-slate-500 dark:text-slate-400">No activity logs recorded yet.</p>
                    </div>
                )}
            </div>
             {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                        Showing page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityLogView;