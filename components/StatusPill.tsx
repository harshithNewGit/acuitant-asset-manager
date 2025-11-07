
import React from 'react';
import type { Asset } from '../types';

interface StatusPillProps {
    status: Asset['status'];
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
    const statusStyles: Record<Asset['status'], string> = {
        'In Use': 'bg-green-100 text-green-800',
        'In Storage': 'bg-blue-100 text-blue-800',
        'For Repair': 'bg-yellow-100 text-yellow-800',
    };

    const dotStyles: Record<Asset['status'], string> = {
        'In Use': 'bg-green-500',
        'In Storage': 'bg-blue-500',
        'For Repair': 'bg-yellow-500',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${dotStyles[status]}`} fill="currentColor" viewBox="0 0 8 8">
                <circle cx={4} cy={4} r={3} />
            </svg>
            {status}
        </span>
    );
};
