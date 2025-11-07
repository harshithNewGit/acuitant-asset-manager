import React from 'react';
import type { Asset, AssetSortConfig, AssetSortKey, SortDirection } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';
import { StatusPill } from './StatusPill';
import { TrashIcon } from './icons/TrashIcon';

type SortState = SortDirection | null;

const SortIcon: React.FC<{ state: SortState }> = ({ state }) => (
    <svg
        viewBox="0 0 20 20"
        fill="none"
        className="ml-1 h-3.5 w-3.5 flex-shrink-0"
        aria-hidden="true"
    >
        <path
            d="M10 5l-3.5 4h7L10 5z"
            className={state === 'asc' ? 'text-red-600' : 'text-gray-300'}
            fill="currentColor"
        />
        <path
            d="M10 15l3.5-4h-7L10 15z"
            className={state === 'desc' ? 'text-red-600' : 'text-gray-300'}
            fill="currentColor"
        />
    </svg>
);

interface AssetTableProps {
    assets: Asset[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onAddAssetClick: () => void;
    onSelectAsset: (asset: Asset) => void;
    onDeleteRequest: (assetId: number) => void;
    sortConfig: AssetSortConfig | null;
    onSort: (key: AssetSortKey) => void;
}

const sortableColumns: Array<{ key: AssetSortKey; label: string }> = [
    { key: 'asset_code', label: 'Asset Code' },
    { key: 'asset_name', label: 'Asset Name' },
    { key: 'status', label: 'Status' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'location', label: 'Location' },
    { key: 'assigned_to', label: 'Assigned To' },
];

const AssetTable: React.FC<AssetTableProps> = ({
    assets,
    searchTerm,
    setSearchTerm,
    onAddAssetClick,
    onSelectAsset,
    onDeleteRequest,
    sortConfig,
    onSort,
}) => {
    
    const handleDeleteClick = (e: React.MouseEvent, assetId: number) => {
        e.stopPropagation();
        onDeleteRequest(assetId);
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
                <div className="relative sm:w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, code, user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4">
                    <button
                        type="button"
                        onClick={onAddAssetClick}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#DA3832] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add Asset
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {sortableColumns.map(({ key, label }) => {
                                const state: SortState = sortConfig?.key === key ? sortConfig.direction : null;
                                return (
                                    <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <button
                                            type="button"
                                            onClick={() => onSort(key)}
                                            className="inline-flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
                                            aria-pressed={sortConfig?.key === key}
                                        >
                                            <span>{label}</span>
                                            <SortIcon state={state} />
                                        </button>
                                    </th>
                                );
                            })}
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {assets.length > 0 ? (
                            assets.map(asset => (
                                <tr key={asset.id} onClick={() => onSelectAsset(asset)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-red-600">{asset.asset_code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#221F20]">{asset.asset_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <StatusPill status={asset.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.assigned_to}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                        <button
                                            onClick={(e) => handleDeleteClick(e, asset.id)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                                            aria-label={`Delete asset ${asset.asset_name}`}
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-12 px-6">
                                    <div className="text-gray-500">
                                        <h3 className="text-lg font-medium">No assets found</h3>
                                        <p className="mt-1 text-sm">Try adjusting your search or category filter.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssetTable;
