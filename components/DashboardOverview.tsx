import React from 'react';
import type { Asset, Category } from '../types';

type DashboardFilterKey = 'all' | 'in_use' | 'in_storage' | 'for_repair';

interface DashboardOverviewProps {
    assets: Asset[];
    categories: Category[];
    activeFilter: DashboardFilterKey;
    onFilterChange: (filter: DashboardFilterKey) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    assets,
    categories,
    activeFilter,
    onFilterChange,
}) => {
    const totalAssets = assets.length;
    const totalQuantity = assets.reduce((sum, asset) => sum + (asset.quantity ?? 0), 0);
    const inUseCount = assets.filter(asset => asset.status?.toLowerCase() === 'in use').length;
    const inStorageCount = assets.filter(asset => asset.status?.toLowerCase() === 'in storage').length;
    const forRepairCount = assets.filter(asset => asset.status?.toLowerCase() === 'for repair').length;
    const categoryCount = categories.length;

    const cards: Array<{
        label: string;
        value: number;
        helper: string;
        filterKey: DashboardFilterKey;
        primary?: boolean;
    }> = [
        {
            label: 'Total Assets',
            value: totalAssets,
            helper: 'Individual asset records being tracked',
            filterKey: 'all',
            primary: true,
        },
        {
            label: 'Total Quantity',
            value: totalQuantity,
            helper: 'Sum of all asset quantities',
            filterKey: 'all',
        },
        {
            label: 'Active Categories',
            value: categoryCount,
            helper: 'Organizational groups for assets',
            filterKey: 'all',
        },
        {
            label: 'In Use',
            value: inUseCount,
            helper: 'Assets currently assigned or deployed',
            filterKey: 'in_use',
            primary: true,
        },
        {
            label: 'In Storage',
            value: inStorageCount,
            helper: 'Assets available but not in use',
            filterKey: 'in_storage',
            primary: true,
        },
        {
            label: 'For Repair',
            value: forRepairCount,
            helper: 'Assets flagged for maintenance',
            filterKey: 'for_repair',
            primary: true,
        },
    ];

    return (
        <section aria-label="Asset dashboard" className="mb-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {cards.map(card => {
                    const isActive = card.primary && activeFilter === card.filterKey;
                    const baseClasses =
                        'w-full text-left bg-white rounded-lg shadow-sm p-4 border flex flex-col justify-between transition-colors';
                    const activeClasses = ' border-red-500 ring-1 ring-red-500';
                    const inactiveClasses = ' border-gray-100 hover:border-gray-300 hover:bg-gray-50';

                    return (
                        <button
                            key={card.label}
                            type="button"
                            onClick={() => onFilterChange(card.filterKey)}
                            className={baseClasses + (isActive ? activeClasses : inactiveClasses)}
                        >
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    {card.label}
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#221F20]">
                                    {Number.isNaN(card.value) ? '-' : card.value}
                                </p>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {card.helper}
                            </p>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default DashboardOverview;
